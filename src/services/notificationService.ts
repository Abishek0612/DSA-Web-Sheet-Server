import { EmailService } from "./emailService";
import User from "../models/User";
import { logger } from "../utils/logger";
import { io } from "../index";

export class NotificationService {
  private emailService = new EmailService();

  async sendWelcomeNotification(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await this.emailService.sendWelcomeEmail(user.email, user.name);

      // Send real-time notification
      io.to(`user-${userId}`).emit("notification", {
        type: "welcome",
        title: "Welcome to DSA Sheet!",
        message: "Start your coding journey today",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Send welcome notification error:", error);
    }
  }

  async sendStreakReminder(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const currentStreak = user.statistics.currentStreak;

      await this.emailService.sendStreakReminderEmail(
        user.email,
        user.name,
        currentStreak
      );

      io.to(`user-${userId}`).emit("notification", {
        type: "streak_reminder",
        title: `Don't break your ${currentStreak}-day streak!`,
        message: "Solve a problem today to maintain your streak",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Send streak reminder error:", error);
    }
  }

  async sendAchievementNotification(
    userId: string,
    achievement: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      await this.emailService.sendAchievementEmail(
        user.email,
        user.name,
        achievement
      );

      io.to(`user-${userId}`).emit("notification", {
        type: "achievement",
        title: "🎉 New Achievement Unlocked!",
        message: achievement,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Send achievement notification error:", error);
    }
  }

  async sendProgressMilestone(
    userId: string,
    milestone: { type: string; value: number }
  ): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      let message = "";
      switch (milestone.type) {
        case "problems_solved":
          message = `Congratulations! You've solved ${milestone.value} problems!`;
          break;
        case "streak_milestone":
          message = `Amazing! ${milestone.value} day streak achieved!`;
          break;
        case "topic_completed":
          message = `Great job! You've completed a new topic!`;
          break;
        default:
          message = "Keep up the great work!";
      }

      io.to(`user-${userId}`).emit("notification", {
        type: "milestone",
        title: "🎯 Milestone Reached!",
        message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Send progress milestone error:", error);
    }
  }

  async sendWeeklyReport(userId: string): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Calculate weekly stats (simplified)
      const weeklyStats = {
        problemsSolved: 15,
        timeSpent: 180,
        topicsStudied: 3,
        streakDays: 5,
      };

      await this.emailService.sendWeeklyProgressEmail(
        user.email,
        user.name,
        weeklyStats
      );

      io.to(`user-${userId}`).emit("notification", {
        type: "weekly_report",
        title: "📊 Your Weekly Report is Ready!",
        message: "Check your email for detailed progress insights",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Send weekly report error:", error);
    }
  }

  async broadcastSystemNotification(
    message: string,
    type: "info" | "warning" | "maintenance" = "info"
  ): Promise<void> {
    try {
      io.emit("system_notification", {
        type,
        title: "System Notification",
        message,
        timestamp: new Date().toISOString(),
      });

      logger.info(`System notification broadcasted: ${message}`);
    } catch (error) {
      logger.error("Broadcast system notification error:", error);
    }
  }
}
