import { createClient } from "redis";
import { logger } from "../utils/logger";

const redisConfig = {
  url: process.env.REDIS_URL || "redis://localhost:6379",
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: "dsa-sheet:",
  db: 0,
};

export const createRedisClient = () => {
  const client = createClient(redisConfig);

  client.on("error", (error) => {
    logger.error("Redis Client Error:", error);
  });

  client.on("connect", () => {
    logger.info("Redis Client Connected");
  });

  client.on("disconnect", () => {
    logger.warn("Redis Client Disconnected");
  });

  return client;
};

export default redisConfig;
