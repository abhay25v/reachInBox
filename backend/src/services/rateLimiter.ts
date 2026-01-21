import redisConnection from '../config/redis';
import logger from '../config/logger';

class RateLimiter {
  private hourlyLimit: number;
  private minDelayMs: number;

  constructor() {
    this.hourlyLimit = parseInt(process.env.EMAIL_HOURLY_LIMIT || '100');
    this.minDelayMs = parseInt(process.env.EMAIL_MIN_DELAY_MS || '1000');
  }

  /**
   * Get the Redis key for a user's hourly email count
   */
  private getHourlyKey(userId: string): string {
    const currentHour = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
    return `rate_limit:${userId}:${currentHour}`;
  }

  /**
   * Check if user can send an email and increment counter if yes
   * Returns true if under limit, false otherwise
   */
  async checkAndIncrement(userId: string): Promise<boolean> {
    const key = this.getHourlyKey(userId);
    
    try {
      const current = await redisConnection.get(key);
      const count = current ? parseInt(current) : 0;

      if (count >= this.hourlyLimit) {
        logger.warn(`Rate limit exceeded for user ${userId}`, {
          current: count,
          limit: this.hourlyLimit,
        });
        return false;
      }

      // Increment counter and set expiry for 1 hour
      await redisConnection.multi()
        .incr(key)
        .expire(key, 3600) // 1 hour TTL
        .exec();

      return true;
    } catch (error) {
      logger.error('Rate limiter error:', error);
      // On error, allow the email to be sent (fail open)
      return true;
    }
  }

  /**
   * Get current count for a user in this hour
   */
  async getCurrentCount(userId: string): Promise<number> {
    const key = this.getHourlyKey(userId);
    const count = await redisConnection.get(key);
    return count ? parseInt(count) : 0;
  }

  /**
   * Get remaining emails user can send this hour
   */
  async getRemainingCount(userId: string): Promise<number> {
    const current = await this.getCurrentCount(userId);
    return Math.max(0, this.hourlyLimit - current);
  }

  /**
   * Calculate delay until next hour (in milliseconds)
   */
  getNextHourDelay(): number {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    return nextHour.getTime() - now.getTime();
  }

  /**
   * Reset counter for a user (useful for testing)
   */
  async reset(userId: string): Promise<void> {
    const key = this.getHourlyKey(userId);
    await redisConnection.del(key);
  }

  /**
   * Get minimum delay between emails
   */
  getMinDelay(): number {
    return this.minDelayMs;
  }

  /**
   * Get hourly limit
   */
  getHourlyLimit(): number {
    return this.hourlyLimit;
  }
}

export const rateLimiter = new RateLimiter();
export default rateLimiter;
