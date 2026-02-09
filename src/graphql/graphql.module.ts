import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.get<string>('app.nodeEnv') !== 'production';

        return {
          // Code-first approach - auto-generate schema from TypeScript classes
          autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
          sortSchema: true,

          // GraphQL Playground settings
          playground: isDevelopment,
          introspection: isDevelopment,

          // Context for request handling
          context: ({ req, res }: { req: Request; res: Response }) => ({ req, res }),

          // Format errors in development
          formatError: (error: GraphQLError): GraphQLFormattedError => {
            if (isDevelopment) {
              return {
                message: error.message,
                extensions: {
                  code: error.extensions?.code,
                },
                locations: error.locations,
                path: error.path,
              };
            }
            // In production, don't expose internal error details
            return {
              message: error.message,
              extensions: {
                code: error.extensions?.code,
              },
            };
          },
        };
      },
    }),
  ],
})
export class GraphqlModule {}
