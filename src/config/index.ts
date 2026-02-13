import appConfig from './app.config';
import databaseConfig from './database.config';
import redisConfig from './redis.config';

export const configurations = [appConfig, databaseConfig, redisConfig];

export { appConfig, databaseConfig, redisConfig };
