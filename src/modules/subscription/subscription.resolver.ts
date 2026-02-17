import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { SubscriptionService } from './subscription.service';
import {
  SubscriptionType,
  PaginatedSubscriptions,
  SubscriptionStatistics,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  QuerySubscriptionInput,
} from './graphql';

/**
 * ============================================================
 * SUBSCRIPTION RESOLVER - GRAPHQL ONLY
 * ============================================================
 *
 * This module demonstrates a GraphQL-only CRUD pattern.
 * No REST Controller is registered for this module.
 *
 * Test via:
 *   - GraphQL Playground: http://localhost:3000/graphql
 *   - NOT available via REST endpoints like /subscriptions
 *
 * ============================================================
 */
@Resolver(() => SubscriptionType)
export class SubscriptionResolver {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ============ QUERIES ============

  @Query(() => PaginatedSubscriptions, {
    name: 'subscriptions',
    description: 'Get all subscriptions with pagination and filters (GraphQL ONLY)',
  })
  async findAll(
    @Args('query', { type: () => QuerySubscriptionInput, nullable: true })
    query?: QuerySubscriptionInput,
  ): Promise<PaginatedSubscriptions> {
    return this.subscriptionService.findAll(query || {});
  }

  @Query(() => SubscriptionType, {
    name: 'subscription',
    description: 'Get a subscription by ID (GraphQL ONLY)',
  })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<SubscriptionType> {
    return this.subscriptionService.findOne(id);
  }

  @Query(() => SubscriptionStatistics, {
    name: 'subscriptionStatistics',
    description: '🔹 GRAPHQL ONLY: Get subscription statistics',
  })
  async getStatistics(): Promise<SubscriptionStatistics> {
    return this.subscriptionService.getStatistics();
  }

  // ============ MUTATIONS ============

  @Mutation(() => SubscriptionType, {
    description: 'Create a new subscription (GraphQL ONLY)',
  })
  async createSubscription(
    @Args('input') input: CreateSubscriptionInput,
  ): Promise<SubscriptionType> {
    return this.subscriptionService.create(input);
  }

  @Mutation(() => SubscriptionType, {
    description: 'Update an existing subscription (GraphQL ONLY)',
  })
  async updateSubscription(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateSubscriptionInput,
  ): Promise<SubscriptionType> {
    return this.subscriptionService.update(id, input);
  }

  @Mutation(() => Boolean, {
    description: 'Delete a subscription (GraphQL ONLY)',
  })
  async deleteSubscription(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.subscriptionService.remove(id);
    return true;
  }
}
