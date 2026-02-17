import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { PaginationMeta } from '../../../common/graphql';

// Register the Prisma enums with GraphQL
registerEnumType(SubscriptionPlan, {
  name: 'SubscriptionPlan',
  description: 'Available subscription plans',
});

registerEnumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
  description: 'Subscription status values',
});

// Simplified customer type for subscription's customer relation (to avoid circular dependency)
@ObjectType('SubscriptionCustomer')
export class SubscriptionCustomerType {
  @Field(() => Int)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;
}

@ObjectType()
export class SubscriptionType {
  @Field(() => Int)
  id: number;

  @Field(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Field(() => SubscriptionStatus)
  status: SubscriptionStatus;

  @Field(() => Float)
  price: number;

  @Field()
  startDate: Date;

  @Field(() => Date, { nullable: true })
  endDate: Date | null;

  @Field()
  autoRenew: boolean;

  @Field(() => Int)
  customerId: number;

  @Field(() => SubscriptionCustomerType, { nullable: true })
  customer?: SubscriptionCustomerType;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class PaginatedSubscriptions {
  @Field(() => [SubscriptionType])
  data: SubscriptionType[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}

@ObjectType({ description: '🔸 GRAPHQL ONLY: Subscription statistics' })
export class SubscriptionStatistics {
  @Field(() => Int, { description: 'Total number of subscriptions' })
  totalSubscriptions: number;

  @Field(() => Int, { description: 'Active subscriptions' })
  activeSubscriptions: number;

  @Field(() => Int, { description: 'Cancelled subscriptions' })
  cancelledSubscriptions: number;

  @Field(() => Float, { description: 'Total monthly revenue' })
  totalRevenue: number;
}
