import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedTopics } from "./seedTopics";
import { seedUsers } from "./seedUsers";
import { logger } from "../utils/logger";

dotenv.config();

const runSeeds = async (): Promise<void> => {
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

export { runSeeds };
