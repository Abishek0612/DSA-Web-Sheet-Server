const { uploadToCloudinary } = require("../config/cloudinary");
const { logger } = require("../utils/logger");

class UploadService {
  async uploadAvatar(file, userId) {
    try {
      const avatarUrl = await uploadToCloudinary(
        file.buffer,
        "avatars",
        `avatar-${userId}-${Date.now()}`
      );

      logger.info(`Avatar uploaded for user: ${userId}`);
      return avatarUrl;
    } catch (error) {
      logger.error("Upload avatar error:", error);
      throw new Error("Failed to upload avatar");
    }
  }

  async uploadFile(file, userId) {
    try {
      const fileUrl = await uploadToCloudinary(
        file.buffer,
        "files",
        `file-${userId}-${Date.now()}`
      );

      logger.info(`File uploaded: ${file.filename} by user: ${userId}`);
      return fileUrl;
    } catch (error) {
      logger.error("Upload file error:", error);
      throw new Error("Failed to upload file");
    }
  }

  async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      logger.error("Delete file error:", error);
      return false;
    }
  }
}

module.exports = { UploadService };
