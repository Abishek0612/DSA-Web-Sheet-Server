import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
import { logger } from "../utils/logger";

export class AuthService {
  generateToken(userId: string): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
      { expiresIn: "30d" }
    );
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<IUser> {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async validateToken(token: string): Promise<string | null> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      ) as any;
      return decoded.userId;
    } catch (error) {
      logger.error("Token validation error:", error);
      return null;
    }
  }

  async getUserById(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findById(userId).select("-password");
      return user;
    } catch (error) {
      logger.error("Get user by ID error:", error);
      return null;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    } catch (error) {
      logger.error("Update last login error:", error);
    }
  }

  async isEmailTaken(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const query: any = { email };
      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }

      const user = await User.findOne(query);
      return !!user;
    } catch (error) {
      logger.error("Check email taken error:", error);
      return false;
    }
  }
}
