import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis';
import { Subscription, Prisma, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PaginatedResult } from '../../common/types';

// Interfaces matching the GraphQL InputTypes
interface CreateSubscriptionData {
  customerId: number;
  plan?: SubscriptionPlan;
  price?: number;
  endDate?: Date;
  autoRenew?: boolean;
}

interface UpdateSubscriptionData {
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  price?: number;
  endDate?: Date;
  autoRenew?: boolean;
}

interface QuerySubscriptionData {
  page?: number;
  limit?: number;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  customerId?: number;
}

@Injectable()
export class SubscriptionService {
  private readonly CACHE_PREFIX = 'subscription';
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // ─── Cache Key Helpers ────────────────────────────────────

  private subscriptionByIdKey(id: number): string {
    return `${this.CACHE_PREFIX}:id:${id}`;
  }

  private subscriptionListKey(query: QuerySubscriptionData): string {
    return `${this.CACHE_PREFIX}:list:${JSON.stringify(query)}`;
  }

  /**
   * Invalidate all subscription-related caches for a specific subscription
   */
  private async invalidateSubscriptionCache(id: number): Promise<void> {
    await this.redisService.del(this.subscriptionByIdKey(id));
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:stats`);
  }

  // ─── CRUD Operations ──────────────────────────────────────

  async create(data: CreateSubscriptionData): Promise<Subscription> {
    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new BadRequestException(`Customer with ID ${data.customerId} not found`);
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        customerId: data.customerId,
        plan: data.plan || SubscriptionPlan.FREE,
        price: data.price || 0,
        endDate: data.endDate || null,
        autoRenew: data.autoRenew !== undefined ? data.autoRenew : true,
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate list caches
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:list:*`);
    await this.redisService.deleteByPattern(`${this.CACHE_PREFIX}:stats`);

    return subscription;
  }

  async findAll(query: QuerySubscriptionData): Promise<PaginatedResult<Subscription>> {
    const cacheKey = this.subscriptionListKey(query);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const { page = 1, limit = 10, plan, status, customerId } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.SubscriptionWhereInput = {};

        if (plan) {
          where.plan = plan;
        }

        if (status) {
          where.status = status;
        }

        if (customerId) {
          where.customerId = customerId;
        }

        const [subscriptions, total] = await Promise.all([
          this.prisma.subscription.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          }),
          this.prisma.subscription.count({ where }),
        ]);

        return {
          data: subscriptions as Subscription[],
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

  async findOne(id: number): Promise<Subscription> {
    const cacheKey = this.subscriptionByIdKey(id);

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const subscription = await this.prisma.subscription.findUnique({
          where: { id },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        if (!subscription) {
          throw new NotFoundException(`Subscription with ID ${id} not found`);
        }

        return subscription;
      },
      this.CACHE_TTL,
    );
  }

  async update(id: number, data: UpdateSubscriptionData): Promise<Subscription> {
    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!existingSubscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    const updatedSubscription = await this.prisma.subscription.update({
      where: { id },
      data,
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Invalidate caches
    await this.invalidateSubscriptionCache(id);

    return updatedSubscription;
  }

  async remove(id: number): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    await this.prisma.subscription.delete({
      where: { id },
    });

    // Invalidate all caches
    await this.invalidateSubscriptionCache(id);
  }

  // ─── Statistics (GraphQL Only) ─────────────────────────────

  async getStatistics() {
    const cacheKey = `${this.CACHE_PREFIX}:stats`;

    return this.redisService.getOrSet(
      cacheKey,
      async () => {
        const [totalSubscriptions, activeSubscriptions, cancelledSubscriptions, revenueResult] =
          await Promise.all([
            this.prisma.subscription.count(),
            this.prisma.subscription.count({
              where: { status: SubscriptionStatus.ACTIVE },
            }),
            this.prisma.subscription.count({
              where: { status: SubscriptionStatus.CANCELLED },
            }),
            this.prisma.subscription.aggregate({
              _sum: { price: true },
              where: { status: SubscriptionStatus.ACTIVE },
            }),
          ]);

        return {
          totalSubscriptions,
          activeSubscriptions,
          cancelledSubscriptions,
          totalRevenue: revenueResult._sum.price || 0,
        };
      },
      this.CACHE_TTL,
    );
  }
}
