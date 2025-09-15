const nodemailer = require("nodemailer");
const { logger } = require("../utils/logger");
const { emailTemplates } = require("../utils/emailTemplates");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isEnabled = false;

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "465"),
          secure: true,
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

  async sendEmail(options) {
    if (!this.isEnabled || !this.transporter) {
      logger.warn("Email service is disabled, skipping email send");
      return;
    }

    try {
      await this.transporter.sendMail({
        from: `"${process.env.APP_NAME || "DSA Sheet"}" <${
          process.env.EMAIL_FROM || process.env.EMAIL_USER
        }>`,
        ...options,
      });
      logger.info(`Email sent to: ${options.to}`);
    } catch (error) {
      logger.error("Send email error:", error);
    }
  }

  async sendWelcomeEmail(to, name) {
    const html = emailTemplates.welcome(name);
    await this.sendEmail({
      to,
      subject: "Welcome to DSA Sheet!",
      html,
    });
  }

  async sendPasswordResetEmail(to, resetToken) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = emailTemplates.passwordReset(resetUrl);
    await this.sendEmail({
      to,
      subject: "Reset Your Password - DSA Sheet",
      html,
    });
  }

  async sendStreakReminderEmail(to, name, currentStreak) {
    const html = emailTemplates.streakReminder(name, currentStreak);
    await this.sendEmail({
      to,
      subject: `Don't break your ${currentStreak}-day streak! - DSA Sheet`,
      html,
    });
  }

  async sendAchievementEmail(to, name, achievement) {
    const html = emailTemplates.achievement(name, achievement);
    await this.sendEmail({
      to,
      subject: `🎉 New Achievement Unlocked! - DSA Sheet`,
      html,
    });
  }

  async sendWeeklyProgressEmail(to, name, weeklyStats) {
    const html = emailTemplates.weeklyProgress(name, weeklyStats);
    await this.sendEmail({
      to,
      subject: "Your Weekly Progress Report - DSA Sheet",
      html,
    });
  }
}

module.exports = { EmailService };
