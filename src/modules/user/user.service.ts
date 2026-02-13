import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { User, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../common/types';

@Injectable()
export class UserService {
  private readonly CACHE_PREFIX = 'user';
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // ─── Cache Key Helpers ────────────────────────────────────

  private userByIdKey(id: number): string {
    return `${this.CACHE_PREFIX}:id:${id}`;
  }

  private userByEmailKey(email: string): string {
    return `${this.CACHE_PREFIX}:email:${email}`;
  }

  private userListKey(query: QueryUserDto): string {
    return `${this.CACHE_PREFIX}:list:${JSON.stringify(query)}`;
  }

  /**
   * Invalidate all user-related caches for a specific user
   */
  private async invalidateUserCache(id: number, email?: string): Promise<void> {
    const keysToDelete = [this.userByIdKey(id)];
    if (email) {
      keysToDelete.push(this.userByEmailKey(email));
    }
    await this.redisService.del(...keysToDelete);
    // Also invalidate all list caches
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);
  }

  // ─── CRUD Operations ──────────────────────────────────────

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // In production, hash the password before saving
    // const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: createUserDto.password, // Use hashedPassword in production
        role: createUserDto.role,
      },
    });

    // Invalidate list caches since a new user was created
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);

    return user;
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<User>> {
    const cacheKey = this.userListKey(query);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = search
          ? {
              OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {};

        const [users, total] = await Promise.all([
          this.prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
              _count: {
                select: { posts: true },
              },
            },
          }),
          this.prisma.user.count({ where }),
        ]);

        return {
          data: users as User[],
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

  async findOne(id: number): Promise<User> {
    const cacheKey = this.userByIdKey(id);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { id },
          include: {
            posts: {
              select: {
                id: true,
                title: true,
                published: true,
                createdAt: true,
              },
            },
          },
        });

        if (!user) {
          throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
      },
      this.CACHE_TTL,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const cacheKey = this.userByEmailKey(email);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        return this.prisma.user.findUnique({
          where: { email },
        });
      },
      this.CACHE_TTL,
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If email is being updated, check for duplicates
    if (updateUserDto.email) {
      const duplicateUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (duplicateUser && duplicateUser.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    // Invalidate caches for this user (old email + new email if changed)
    await this.invalidateUserCache(id, existingUser.email);
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      await this.redisService.del(this.userByEmailKey(updateUserDto.email));
    }

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({
      where: { id },
    });

    // Invalidate all caches related to this user
    await this.invalidateUserCache(id, user.email);
  }
}
