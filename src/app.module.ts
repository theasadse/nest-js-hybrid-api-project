import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configurations } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis';
import { HealthModule } from './health/health.module';
import { UserModule } from './modules/user/user.module';
import { PostModule } from './modules/post/post.module';
import { CategoryModule } from './modules/category/category.module';
import { CustomerModule } from './modules/customer/customer.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { GraphqlModule } from './graphql/graphql.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: configurations,
    }),
    // Database (🔑 SHARED by all modules - REST & GraphQL)
    PrismaModule,
    // Cache (🔑 GLOBAL - available to all modules)
    RedisModule,
    // GraphQL Configuration
    GraphqlModule,
    // Infrastructure
    HealthModule,
    // Feature Modules (REST + GraphQL)
    UserModule,
    PostModule,
    CategoryModule,
    // REST Only Module (Controller + Service, NO Resolver)
    CustomerModule,
    // GraphQL Only Module (Resolver + Service, NO Controller)
    SubscriptionModule,
  ],
})
export class AppModule {}
