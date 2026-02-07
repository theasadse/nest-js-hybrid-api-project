import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = configService.get<string>("app.nodeEnv") || "development";

    super({
      log:
        nodeEnv === "development"
          ? ["query", "info", "warn", "error"]
          : ["error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("✅ Database connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("🔌 Database disconnected");
  }

  async cleanDatabase() {
    if (this.configService.get<string>("app.nodeEnv") === "production") {
      throw new Error("cleanDatabase is not allowed in production");
    }

    // Delete in order to respect foreign key constraints
    await this.post.deleteMany();
    await this.user.deleteMany();
  }
}
