import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDate,
  IsPositive,
  Min,
  Max,
  IsString,
} from 'class-validator';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';

@InputType({ description: 'Input for creating a new subscription' })
export class CreateSubscriptionInput {
  @Field(() => Int, { description: 'Customer ID who owns the subscription' })
  @IsNumber()
  @IsPositive()
  customerId: number;

  @Field(() => SubscriptionPlan, {
    nullable: true,
    defaultValue: SubscriptionPlan.FREE,
    description: 'Subscription plan',
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @Field(() => Float, {
    nullable: true,
    defaultValue: 0,
    description: 'Monthly price',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Date, { nullable: true, description: 'Subscription end date' })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true, defaultValue: true, description: 'Auto-renew' })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

@InputType({ description: 'Input for updating a subscription' })
export class UpdateSubscriptionInput {
  @Field(() => SubscriptionPlan, {
    nullable: true,
    description: 'Subscription plan',
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @Field(() => SubscriptionStatus, {
    nullable: true,
    description: 'Subscription status',
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @Field(() => Float, { nullable: true, description: 'Monthly price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @Field(() => Date, { nullable: true, description: 'Subscription end date' })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true, description: 'Auto-renew' })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;
}

@InputType({ description: 'Query parameters for listing subscriptions' })
export class QuerySubscriptionInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => SubscriptionPlan, {
    nullable: true,
    description: 'Filter by plan',
  })
  @IsOptional()
  @IsEnum(SubscriptionPlan)
  plan?: SubscriptionPlan;

  @Field(() => SubscriptionStatus, {
    nullable: true,
    description: 'Filter by status',
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @Field(() => Int, {
    nullable: true,
    description: 'Filter by customer ID',
  })
  @IsOptional()
  @IsNumber()
  customerId?: number;
}
