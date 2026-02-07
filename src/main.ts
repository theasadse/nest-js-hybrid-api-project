import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters";
import { LoggingInterceptor } from "./common/interceptors";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>("app.port") || 3000;
  const nodeEnv = configService.get<string>("app.nodeEnv") || "development";

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>("app.corsOrigin") || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor (development only)
  if (nodeEnv === "development") {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  if (nodeEnv !== "production") {
    const config = new DocumentBuilder()
      .setTitle("NestJS REST API")
      .setDescription(
        "REST API with Prisma and PostgreSQL - Industry Standard Architecture",
      )
      .setVersion("1.0")
      .addTag("health", "Health check endpoints")
      .addTag("users", "User management")
      .addTag("posts", "Post management")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    logger.log(`📚 Swagger documentation: http://localhost:${port}/api`);
  }

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`🌍 Environment: ${nodeEnv}`);
}

bootstrap();
