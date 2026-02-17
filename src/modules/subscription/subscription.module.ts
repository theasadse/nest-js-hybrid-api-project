import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionResolver } from './subscription.resolver';

@Module({
  controllers: [],
  providers: [SubscriptionService, SubscriptionResolver],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
