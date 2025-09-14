import Redis from "redis";
import { logger } from "./logger";

class RedisService {
  private client: Redis.RedisClientType | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      if (!process.env.REDIS_URL) {
        logger.warn("Redis URL not provided, caching will be disabled");
        return;
      }

      this.client = Redis.createClient({
        url: process.env.REDIS_URL,
        retry_unfulfilled_commands: true,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error("Redis connection failed after 10 retries");
              return new Error("Redis connection failed");
            }
            return Math.min(retries * 50, 2000);
          },
        },
      });

      this.client.on("error", (error) => {
        logger.error("Redis error:", error);
        this.isConnected = false;
      });

      this.client.on("connect", () => {
        logger.info("Redis connected");
        this.isConnected = true;
      });

      this.client.on("disconnect", () => {
        logger.warn("Redis disconnected");
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.error("Redis connection error:", error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;

    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error("Redis get error:", error);
      return null;
    }
  }

  async set(
    key: string,
    value: string,
    expireInSeconds?: number
  ): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      if (expireInSeconds) {
        await this.client.setEx(key, expireInSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error("Redis set error:", error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error("Redis del error:", error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Redis exists error:", error);
      return false;
    }
  }

  async setJson(
    key: string,
    value: any,
    expireInSeconds?: number
  ): Promise<boolean> {
    return this.set(key, JSON.stringify(value), expireInSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error("Redis JSON parse error:", error);
      return null;
    }
  }

  async increment(key: string, by: number = 1): Promise<number | null> {
    if (!this.isConnected || !this.client) return null;

    try {
      return await this.client.incrBy(key, by);
    } catch (error) {
      logger.error("Redis increment error:", error);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error("Redis expire error:", error);
      return false;
    }
  }

  async flushAll(): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error("Redis flush error:", error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }
}

export default new RedisService();
