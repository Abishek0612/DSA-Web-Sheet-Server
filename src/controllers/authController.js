const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AuthService } = require("../services/authService");
const { logger } = require("../utils/logger");

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ message: "User already exists" });
        return;
      }

      const user = await this.authService.createUser({ name, email, password });
      const token = this.authService.generateToken(user._id);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
          statistics: user.statistics,
        },
      });
    } catch (error) {
      logger.error("Registration error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
      }

      user.lastLogin = new Date();
      await user.save();

      const token = this.authService.generateToken(user._id);

      logger.info(`User logged in: ${email}`);

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences,
          statistics: user.statistics,
        },
      });
    } catch (error) {
      logger.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getCurrentUser = async (req, res) => {
    try {
      const user = await User.findById(req.userId).select("-password");
      res.json(user);
    } catch (error) {
      logger.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  refreshToken = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({ message: "Refresh token required" });
        return;
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || "refresh_secret"
      );
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({ message: "Invalid refresh token" });
        return;
      }

      const newToken = this.authService.generateToken(user._id);
      const newRefreshToken = this.authService.generateRefreshToken(user._id);

      res.json({
        token: newToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error("Refresh token error:", error);
      res.status(401).json({ message: "Invalid refresh token" });
    }
  };

  logout = async (req, res) => {
    try {
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      logger.error("Logout error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
}

module.exports = { AuthController };
