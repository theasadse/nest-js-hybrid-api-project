import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Customer, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/types';

@Injectable()
export class CustomerService {
  private readonly CACHE_PREFIX = 'customer';
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // ─── Cache Key Helpers ────────────────────────────────────

  private customerByIdKey(id: number): string {
    return `${this.CACHE_PREFIX}:id:${id}`;
  }

  private customerByEmailKey(email: string): string {
    return `${this.CACHE_PREFIX}:email:${email}`;
  }

  private customerListKey(query: QueryCustomerDto): string {
    return `${this.CACHE_PREFIX}:list:${JSON.stringify(query)}`;
  }

  /**
   * Invalidate all customer-related caches for a specific customer
   */
  private async invalidateCustomerCache(id: number, email?: string): Promise<void> {
    const keysToDelete = [this.customerByIdKey(id)];
    if (email) {
      keysToDelete.push(this.customerByEmailKey(email));
    }
    await this.redisService.del(...keysToDelete);
    // Also invalidate all list caches
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);
  }

  // ─── CRUD Operations ──────────────────────────────────────

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    const customer = await this.prisma.customer.create({
      data: {
        firstName: createCustomerDto.firstName,
        lastName: createCustomerDto.lastName,
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        company: createCustomerDto.company,
        address: createCustomerDto.address,
        city: createCustomerDto.city,
        country: createCustomerDto.country,
      },
    });

    // Invalidate list caches since a new customer was created
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);

    return customer;
  }

  async findAll(query: QueryCustomerDto): Promise<PaginatedResult<Customer>> {
    const cacheKey = this.customerListKey(query);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const { page = 1, limit = 10, search, isActive } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.CustomerWhereInput = {};

        // Search filter
        if (search) {
          where.OR = [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ];
        }

        // Active status filter
        if (isActive !== undefined) {
          where.isActive = isActive;
        }

        const [customers, total] = await Promise.all([
          this.prisma.customer.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              _count: {
                select: { subscriptions: true },
              },
            },
          }),
          this.prisma.customer.count({ where }),
        ]);

        return {
          data: customers as Customer[],
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number): Promise<Customer> {
    const cacheKey = this.customerByIdKey(id);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const customer = await this.prisma.customer.findUnique({
          where: { id },
          include: {
            subscriptions: {
              select: {
                id: true,
                plan: true,
                status: true,
                price: true,
                startDate: true,
                endDate: true,
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        if (!customer) {
          throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        return customer;
      },
      this.CACHE_TTL,
    );
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const cacheKey = this.customerByEmailKey(email);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.customer.findUnique({
          where: { email },
        });
      },
      this.CACHE_TTL,
    );
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // If email is being updated, check for duplicates
    if (updateCustomerDto.email) {
      const duplicateCustomer = await this.prisma.customer.findUnique({
        where: { email: updateCustomerDto.email },
      });

      if (duplicateCustomer && duplicateCustomer.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });

    // Invalidate caches for this customer
    await this.invalidateCustomerCache(id, existingCustomer.email);
    if (updateCustomerDto.email && updateCustomerDto.email !== existingCustomer.email) {
      await this.redisService.del(this.customerByEmailKey(updateCustomerDto.email));
    }

    return updatedCustomer;
  }

  async remove(id: number): Promise<void> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    // Invalidate all caches related to this customer
    await this.invalidateCustomerCache(id, customer.email);
  }
}
