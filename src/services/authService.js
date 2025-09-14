const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { logger } = require("../utils/logger");

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "fallback_secret", {
      expiresIn: "7d",
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET || "refresh_secret",
      { expiresIn: "30d" }
    );
  }

  async createUser(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );
      return decoded.userId;
    } catch (error) {
      logger.error("Token validation error:", error);
      return null;
    }
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId).select("-password");
      return user;
    } catch (error) {
      logger.error("Get user by ID error:", error);
      return null;
    }
  }

  async updateLastLogin(userId) {
    try {
      await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
    } catch (error) {
      logger.error("Update last login error:", error);
    }
  }

  async isEmailTaken(email, excludeUserId) {
    try {
      const query = { email };
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

module.exports = { AuthService };
