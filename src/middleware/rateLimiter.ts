import rateLimit from "express-rate-limit";
import { logger } from "../utils/logger";

const createLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: { message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, URL: ${req.url}`);
      res.status(429).json({ message });
    },
  });
};

export const rateLimiter = {
  general: createLimiter(
    15 * 60 * 1000,
    100,
    "Too many requests from this IP, please try again later"
  ),

  // Authentication rate limiting
  auth: createLimiter(
    15 * 60 * 1000,
    10,
    "Too many authentication attempts, please try again later"
  ),

  // Chat requests rate limiting
  chat: createLimiter(
    5 * 60 * 1000,
    30,
    "Too many chat messages, please slow down"
  ),

  // File upload rate limiting
  upload: createLimiter(
    15 * 60 * 1000,
    10,
    "Too many file uploads, please try again later"
  ),

  // Password reset
  passwordReset: createLimiter(
    60 * 60 * 1000,
    3,
    "Too many password reset attempts, please try again later"
  ),
};

export const createUserRateLimiter = (
  windowMs: number,
  max: number,
  message: string
) => {
  const userLimits = new Map();

  return (req: any, res: any, next: any) => {
    const userId = req.userId;
    if (!userId) {
      return next();
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!userLimits.has(userId)) {
      userLimits.set(userId, []);
    }

    const userRequests = userLimits.get(userId);
    const recentRequests = userRequests.filter(
      (timestamp: number) => timestamp > windowStart
    );

    if (recentRequests.length >= max) {
      logger.warn(`User rate limit exceeded for user: ${userId}`);
      return res.status(429).json({ message });
    }

    recentRequests.push(now);
    userLimits.set(userId, recentRequests);

    next();
  };
};

export const userRateLimiter = {
  ai: createUserRateLimiter(
    60 * 60 * 1000,
    50,
    "You have exceeded your AI request limit, please try again later"
  ),

  progress: createUserRateLimiter(
    60 * 1000,
    30,
    "Too many progress updates, please slow down"
  ),
};
