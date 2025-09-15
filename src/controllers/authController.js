const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { AuthService } = require("../services/authService");
const { EmailService } = require("../services/emailService");
const { logger } = require("../utils/logger");

class AuthController {
  constructor() {
    this.authService = new AuthService();
    this.emailService = new EmailService();
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

  forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = Date.now() + 3600000;

      await user.save();
      await this.emailService.sendPasswordResetEmail(email, resetToken);

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      logger.error("Forgot password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      user.password = password;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save();
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      logger.error("Reset password error:", error);
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
