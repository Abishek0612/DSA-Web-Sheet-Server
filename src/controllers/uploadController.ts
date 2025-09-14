import { Request, Response } from "express";
import { UploadService } from "../services/uploadService";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";

export class UploadController {
  private uploadService = new UploadService();

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const avatarUrl = await this.uploadService.uploadAvatar(
        req.file,
        req.userId!
      );

      logger.info(`Avatar uploaded for user: ${req.userId}`);
      res.json({
        url: avatarUrl,
        filename: req.file.filename,
        size: req.file.size,
      });
    } catch (error) {
      logger.error("Upload avatar error:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  };

  uploadFile = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const fileUrl = await this.uploadService.uploadFile(
        req.file,
        req.userId!
      );

      logger.info(`File uploaded: ${req.file.filename} by user: ${req.userId}`);
      res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error) {
      logger.error("Upload file error:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  };

  uploadMultipleFiles = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.files || !Array.isArray(req.files)) {
        res.status(400).json({ message: "No files uploaded" });
        return;
      }

      const uploadPromises = req.files.map((file) =>
        this.uploadService.uploadFile(file, req.userId!)
      );

      const fileUrls = await Promise.all(uploadPromises);

      const results = req.files.map((file, index) => ({
        url: fileUrls[index],
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
      }));

      logger.info(`Multiple files uploaded by user: ${req.userId}`);
      res.json({ files: results });
    } catch (error) {
      logger.error("Upload multiple files error:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  };

  deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;

      const success = await this.uploadService.deleteFile(
        filename,
        req.userId!
      );

      if (success) {
        logger.info(`File deleted: ${filename} by user: ${req.userId}`);
        res.json({ message: "File deleted successfully" });
      } else {
        res.status(404).json({ message: "File not found" });
      }
    } catch (error) {
      logger.error("Delete file error:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  };

  getFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), "uploads", filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ message: "File not found" });
        return;
      }

      res.sendFile(filePath);
    } catch (error) {
      logger.error("Get file error:", error);
      res.status(500).json({ message: "Failed to get file" });
    }
  };
}
