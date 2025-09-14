const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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
  fileSize: 10 * 1024 * 1024,
  files: 10,
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

const avatarUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for avatars"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const documentUpload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain", "application/json"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, text, and JSON files are allowed"), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = { upload, avatarUpload, documentUpload };
