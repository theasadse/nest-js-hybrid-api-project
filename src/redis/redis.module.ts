import { Module, Global } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Global()
@Module({
  imports: [
    NestRedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get<string>('redis.host', 'localhost')}:${configService.get<number>('redis.port', 6379)}/${configService.get<number>('redis.db', 0)}`,
        options: {
          password: configService.get<string>('redis.password') || undefined,
          keyPrefix: configService.get<string>('redis.keyPrefix', 'nestjs:'),
        },
      }),
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
