import multer from "multer";
import path from "path";
import fs from "fs";
import { logger } from "../utils/logger";

export class UploadService {
  private uploadDir = path.join(process.cwd(), "uploads");
  private avatarDir = path.join(this.uploadDir, "avatars");

  constructor() {
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
    if (!fs.existsSync(this.avatarDir)) {
      fs.mkdirSync(this.avatarDir, { recursive: true });
    }
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string
  ): Promise<string> {
    try {
      const filename = `avatar-${userId}-${Date.now()}${path.extname(
        file.originalname
      )}`;
      const filepath = path.join(this.avatarDir, filename);

      // Remove old avatar if exists
      await this.removeOldAvatar(userId);

      // Write new avatar
      fs.writeFileSync(filepath, file.buffer);

      const avatarUrl = `/uploads/avatars/${filename}`;
      logger.info(`Avatar uploaded: ${filename} for user: ${userId}`);
      return avatarUrl;
    } catch (error) {
      logger.error("Upload avatar error:", error);
      throw new Error("Failed to upload avatar");
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      const filename = `${userId}-${Date.now()}-${file.originalname}`;
      const filepath = path.join(this.uploadDir, filename);

      fs.writeFileSync(filepath, file.buffer);

      const fileUrl = `/uploads/${filename}`;
      logger.info(`File uploaded: ${filename} by user: ${userId}`);
      return fileUrl;
    } catch (error) {
      logger.error("Upload file error:", error);
      throw new Error("Failed to upload file");
    }
  }

  async deleteFile(filename: string, userId: string): Promise<boolean> {
    try {
      // Verify the file belongs to the user (basic security check)
      if (!filename.includes(userId)) {
        return false;
      }

      const filepath = path.join(this.uploadDir, filename);

      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        logger.info(`File deleted: ${filename} by user: ${userId}`);
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Delete file error:", error);
      return false;
    }
  }

  private async removeOldAvatar(userId: string): Promise<void> {
    try {
      const files = fs.readdirSync(this.avatarDir);
      const oldAvatars = files.filter((file) =>
        file.startsWith(`avatar-${userId}-`)
      );

      for (const file of oldAvatars) {
        const filepath = path.join(this.avatarDir, file);
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      logger.error("Remove old avatar error:", error);
    }
  }

  getFileInfo(filename: string): {
    exists: boolean;
    path?: string;
    size?: number;
  } {
    try {
      const filepath = path.join(this.uploadDir, filename);

      if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        return {
          exists: true,
          path: filepath,
          size: stats.size,
        };
      }

      return { exists: false };
    } catch (error) {
      logger.error("Get file info error:", error);
      return { exists: false };
    }
  }
}
