const validator = require("validator");

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateName = (name) => {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
};

const validateUrl = (url) => {
  return validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
  });
};

const validateObjectId = (id) => {
  return validator.isMongoId(id);
};

const sanitizeInput = (input) => {
  return validator.escape(input.trim());
};

const validateFileType = (filename, allowedTypes) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

const validateFileSize = (size, maxSize) => {
  return size <= maxSize;
};

const validateDifficulty = (difficulty) => {
  return ["Easy", "Medium", "Hard"].includes(difficulty);
};

const validateStatus = (status) => {
  return ["pending", "attempted", "solved"].includes(status);
};

const validateLanguage = (language) => {
  const supportedLanguages = [
    "javascript",
    "python",
    "java",
    "cpp",
    "go",
    "rust",
    "typescript",
    "c",
    "csharp",
  ];
  return supportedLanguages.includes(language.toLowerCase());
};

const validateRating = (rating) => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

const validateTimeSpent = (timeSpent) => {
  return Number.isInteger(timeSpent) && timeSpent >= 0 && timeSpent <= 24 * 60;
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateUrl,
  validateObjectId,
  sanitizeInput,
  validateFileType,
  validateFileSize,
  validateDifficulty,
  validateStatus,
  validateLanguage,
  validateRating,
  validateTimeSpent,
};
