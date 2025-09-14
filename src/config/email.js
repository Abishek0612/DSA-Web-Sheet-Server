const emailConfig = {
  smtp: {
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  from: {
    name: "DSA Sheet",
    address:
      process.env.EMAIL_FROM ||
      process.env.EMAIL_USER ||
      "noreply@dsasheet.com",
  },
  templates: {
    welcome: "welcome",
    passwordReset: "password-reset",
    streakReminder: "streak-reminder",
    achievement: "achievement",
    weeklyProgress: "weekly-progress",
  },
};

module.exports = emailConfig;
