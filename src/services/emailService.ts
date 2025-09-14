import nodemailer from "nodemailer";
import { logger } from "../utils/logger";
import { emailTemplates } from "../utils/emailTemplates";

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isEnabled: boolean = false;

  constructor() {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "587"),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });
        this.isEnabled = true;
        logger.info("Email service initialized successfully");
      } else {
        logger.warn("Email credentials not provided, email service disabled");
      }
    } catch (error) {
      logger.error("Failed to initialize email service:", error);
    }
  }

  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    if (!this.isEnabled || !this.transporter) {
      logger.warn("Email service is disabled, skipping email send");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        ...options,
      });
      logger.info(`Email sent to: ${options.to}`);
    } catch (error) {
      logger.error("Send email error:", error);
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = emailTemplates.welcome(name);
    await this.sendEmail({
      to,
      subject: "Welcome to DSA Sheet!",
      html,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const html = emailTemplates.passwordReset(resetUrl);
    await this.sendEmail({
      to,
      subject: "Reset Your Password - DSA Sheet",
      html,
    });
  }

  async sendStreakReminderEmail(
    to: string,
    name: string,
    currentStreak: number
  ): Promise<void> {
    const html = emailTemplates.streakReminder(name, currentStreak);
    await this.sendEmail({
      to,
      subject: `Don't break your ${currentStreak}-day streak! - DSA Sheet`,
      html,
    });
  }

  async sendAchievementEmail(
    to: string,
    name: string,
    achievement: string
  ): Promise<void> {
    const html = emailTemplates.achievement(name, achievement);
    await this.sendEmail({
      to,
      subject: `🎉 New Achievement Unlocked! - DSA Sheet`,
      html,
    });
  }

  async sendWeeklyProgressEmail(
    to: string,
    name: string,
    weeklyStats: any
  ): Promise<void> {
    const html = emailTemplates.weeklyProgress(name, weeklyStats);
    await this.sendEmail({
      to,
      subject: "Your Weekly Progress Report - DSA Sheet",
      html,
    });
  }
}
