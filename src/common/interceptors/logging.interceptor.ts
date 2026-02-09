import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Request');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const contextType = context.getType<string>();

    // Handle GraphQL requests
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      const operationType = info.parentType.name; // Query, Mutation, Subscription
      const fieldName = info.fieldName;

      return next.handle().pipe(
        tap(() => {
          const delay = Date.now() - now;
          this.logger.log(`GraphQL ${operationType} ${fieldName} - ${delay}ms`);
        }),
      );
    }

    // Handle HTTP requests
    const request = context.switchToHttp().getRequest();
    if (!request) {
      return next.handle();
    }

    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response?.statusCode || 200;
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${statusCode} - ${delay}ms`);
      }),
    );
  }
}
