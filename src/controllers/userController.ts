import { Request, Response } from "express";
import User from "../models/User";
import Progress from "../models/Progress";
import { UploadService } from "../services/uploadService";
import { EmailService } from "../services/emailService";
import { logger } from "../utils/logger";
import bcrypt from "bcryptjs";

export class UserController {
  private uploadService = new UploadService();
  private emailService = new EmailService();

  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("-password");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      logger.error("Get profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (email !== user.email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: req.userId },
        });
        if (existingUser) {
          res.status(400).json({ message: "Email is already taken" });
          return;
        }
      }

      user.name = name || user.name;
      user.email = email || user.email;

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);
      res.json({
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
      logger.error("Update profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const avatarUrl = await this.uploadService.uploadAvatar(
        req.file,
        req.userId!
      );

      user.avatar = avatarUrl;
      await user.save();

      logger.info(`Avatar uploaded for user: ${user.email}`);
      res.json({ avatar: avatarUrl });
    } catch (error) {
      logger.error("Upload avatar error:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  };

  updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { preferences, notifications } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
      }

      await user.save();

      logger.info(`Settings updated for user: ${user.email}`);
      res.json({
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
      logger.error("Update settings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("preferences");
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user.preferences);
    } catch (error) {
      logger.error("Get settings error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }

      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      logger.error("Change password error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { password } = req.body;

      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(400).json({ message: "Password is incorrect" });
        return;
      }

      await Progress.deleteMany({ userId: req.userId });

      await User.findByIdAndDelete(req.userId);

      logger.info(`Account deleted for user: ${user.email}`);
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      logger.error("Delete account error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  exportUserData = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.userId).select("-password");
      const progress = await Progress.find({ userId: req.userId }).populate(
        "topicId",
        "name category"
      );

      const exportData = {
        user,
        progress,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="dsa-sheet-data-${Date.now()}.json"`
      );
      res.json(exportData);
    } catch (error) {
      logger.error("Export user data error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  };

  importUserData = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const fileContent = req.file.buffer.toString("utf8");
      const importData = JSON.parse(fileContent);

      if (!importData.progress || !Array.isArray(importData.progress)) {
        res.status(400).json({ message: "Invalid data format" });
        return;
      }

      const progressData = importData.progress.map((p: any) => ({
        ...p,
        userId: req.userId,
        _id: undefined,
      }));

      await Progress.deleteMany({ userId: req.userId });
      await Progress.insertMany(progressData);

      logger.info(`Data imported for user: ${req.userId}`);
      res.json({
        message: "Data imported successfully",
        imported: progressData.length,
      });
    } catch (error) {
      logger.error("Import user data error:", error);
      res.status(500).json({ message: "Failed to import data" });
    }
  };
}
