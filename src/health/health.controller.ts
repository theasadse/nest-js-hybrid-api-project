import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Service is healthy" })
  async healthCheck() {
    let dbStatus = "ok";

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "error";
    }

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
      },
    };
  }

  @Get("liveness")
  @ApiOperation({ summary: "Liveness probe" })
  @ApiResponse({ status: 200, description: "Service is alive" })
  liveness() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("readiness")
  @ApiOperation({ summary: "Readiness probe" })
  @ApiResponse({ status: 200, description: "Service is ready" })
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "error",
        message: "Database not ready",
        timestamp: new Date().toISOString(),
      };
    }
  }
}
