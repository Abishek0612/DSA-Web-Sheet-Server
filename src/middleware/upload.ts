import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Define allowed file types
  const allowedTypes = {
    image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    document: ["application/pdf", "text/plain", "application/json"],
    code: ["text/plain", "application/javascript", "text/x-python"],
  };

  const allAllowedTypes = [
    ...allowedTypes.image,
    ...allowedTypes.document,
    ...allowedTypes.code,
  ];

  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const limits = {
  fileSize: 10 * 1024 * 1024, // 10MB
  files: 10,
};

export const upload = multer({
  storage,
  fileFilter,
  limits,
});

// Specific upload configurations
export const avatarUpload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatars"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for avatars
  },
});

export const documentUpload = multer({
  storage,
  fileFilter: (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedTypes = ["application/pdf", "text/plain", "application/json"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, text, and JSON files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
});
