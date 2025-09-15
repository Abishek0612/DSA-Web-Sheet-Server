const User = require("../models/User");
const { logger } = require("../utils/logger");

const sampleUsers = [
  {
    name: "Admin User",
    email: "admin@dsasheet.com",
    password: "Admin123!",
    role: "admin",
    preferences: {
      theme: "dark",
      language: "javascript",
      difficulty: "medium",
    },
    statistics: {
      totalSolved: 150,
      easySolved: 80,
      mediumSolved: 50,
      hardSolved: 20,
      currentStreak: 15,
      maxStreak: 30,
    },
  },
  {
    name: "Demo Student",
    email: "demo@dsasheet.com",
    password: "Demo123!",
    role: "admin",
    preferences: {
      theme: "light",
      language: "python",
      difficulty: "easy",
    },
    statistics: {
      totalSolved: 25,
      easySolved: 20,
      mediumSolved: 5,
      hardSolved: 0,
      currentStreak: 5,
      maxStreak: 7,
    },
  },
];

const seedUsers = async () => {
  try {
    logger.info("Starting user seeding...");

    for (const userData of sampleUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        logger.info(`Created user: ${userData.email}`);
      } else {
        if (existingUser.role !== userData.role) {
          existingUser.role = userData.role;
          await existingUser.save();
          logger.info(
            `Updated user role: ${userData.email} -> ${userData.role}`
          );
        } else {
          logger.info(`User already exists: ${userData.email}`);
        }
      }
    }

    logger.info("User seeding completed");
  } catch (error) {
    logger.error("Error seeding users:", error);
    throw error;
  }
};

module.exports = { seedUsers };
