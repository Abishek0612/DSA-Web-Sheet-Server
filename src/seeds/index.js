const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { seedTopics } = require("./seedTopics");
const { seedUsers } = require("./seedUsers");
const { logger } = require("../utils/logger");

dotenv.config();

const runSeeds = async () => {
  try {
    logger.info("Connecting to database...");
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/dsa-sheet"
    );
    logger.info("Database connected successfully");

    logger.info("Starting database seeding...");

    await seedUsers();
    await seedTopics();

    logger.info("Database seeding completed successfully");
  } catch (error) {
    logger.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info("Database connection closed");
    process.exit(0);
  }
};

if (require.main === module) {
  runSeeds();
}

module.exports = { runSeeds };
