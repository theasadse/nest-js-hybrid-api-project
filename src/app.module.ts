import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { configurations } from "./config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { UserModule } from "./modules/user/user.module";
import { PostModule } from "./modules/post/post.module";

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: configurations,
    }),

    // Database
    PrismaModule,

    // Infrastructure
    HealthModule,

    // Feature Modules
    UserModule,
    PostModule,
  ],
})
export class AppModule {}
