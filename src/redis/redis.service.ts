import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  // ─── Basic Operations ─────────────────────────────────────

  /**
   * Get a value by key */

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Set a value with optional TTL (in seconds)
   */
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.redis.set(key, value, 'EX', ttl);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Delete one or more keys
   */
  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }

  /**
   * Set expiration on a key (in seconds)
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const result = await this.redis.expire(key, ttl);
    return result === 1;
  }

  /**
   * Get remaining TTL of a key (in seconds)
   */
  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  // ─── JSON Helpers ──────────────────────────────────────────

  /**
   * Get and parse a JSON value
   */
  async getJSON<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.warn(`Failed to parse JSON for key: ${key}`);
      return null;
    }
  }

  /**
   * Stringify and set a JSON value with optional TTL
   */
  async setJSON<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.set(key, serialized, ttl);
  }

  // ─── Hash Operations ──────────────────────────────────────

  /**
   * Set a hash field
   */
  async hset(key: string, field: string, value: string): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  /**
   * Get a hash field
   */
  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  /**
   * Get all fields and values of a hash
   */
  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  /**
   * Delete one or more hash fields
   */
  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.redis.hdel(key, ...fields);
  }

  // ─── List Operations ──────────────────────────────────────

  /**
   * Push values to the end of a list
   */
  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.rpush(key, ...values);
  }

  /**
   * Push values to the beginning of a list
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  /**
   * Get a range of elements from a list
   */
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  // ─── Set Operations ───────────────────────────────────────

  /**
   * Add members to a set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.redis.sadd(key, ...members);
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    return this.redis.smembers(key);
  }

  /**
   * Check if a member exists in a set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.redis.sismember(key, member);
    return result === 1;
  }

  // ─── Counter Operations ───────────────────────────────────

  /**
   * Increment a key's value by 1
   */
  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  /**
   * Increment a key's value by a specific amount
   */
  async incrby(key: string, increment: number): Promise<number> {
    return this.redis.incrby(key, increment);
  }

  /**
   * Decrement a key's value by 1
   */
  async decr(key: string): Promise<number> {
    return this.redis.decr(key);
  }

  // ─── Pattern / Bulk Operations ────────────────────────────

  /**
   * Find all keys matching a pattern (use cautiously in production)
   */
  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  /**
   * Delete all keys matching a pattern
   *
   * IMPORTANT: ioredis does NOT automatically prefix the pattern in KEYS command,
   * but DOES return keys with prefix and DOES prefix keys in DEL command.
   * So we must: 1) Add prefix to pattern, 2) Get keys with prefix, 3) Strip prefix for DEL
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const prefix = this.redis.options.keyPrefix || '';

    // ioredis doesn't prefix the pattern, so we must do it manually
    const prefixedPattern = prefix + pattern;
    this.logger.log(`[deleteByPattern] Searching for pattern: ${prefixedPattern}`);

    const keys = await this.redis.keys(prefixedPattern);
    this.logger.log(`[deleteByPattern] Found ${keys.length} keys:`, keys);

    if (keys.length === 0) return 0;

    // Keys returned include the prefix, but del() will add it again, so strip it
    const unprefixedKeys = keys.map((key) =>
      key.startsWith(prefix) ? key.slice(prefix.length) : key,
    );
    this.logger.log(`[deleteByPattern] Deleting keys (unprefixed):`, unprefixedKeys);

    const deletedCount = await this.redis.del(...unprefixedKeys);
    this.logger.log(`[deleteByPattern] Deleted ${deletedCount} keys`);

    return deletedCount;
  }

  /**
   * Flush the current database (use with caution!)
   */
  async flushdb(): Promise<void> {
    await this.redis.flushdb();
    this.logger.warn('Redis database flushed');
  }

  // ─── Cache Helper ─────────────────────────────────────────

  /**
   * Get-or-set cache pattern: returns cached value if available,
   * otherwise executes the factory function, caches the result, and returns it.
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = await this.getJSON<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache MISS: ${key}`);
    const value = await factory();
    await this.setJSON(key, value, ttl);
    return value;
  }

  // ─── Lifecycle ────────────────────────────────────────────

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.redis.quit();
  }
}
