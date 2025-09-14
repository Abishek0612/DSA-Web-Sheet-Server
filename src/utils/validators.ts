import validator from "validator";

export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

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

export const validateName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
};

export const validateUrl = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ["http", "https"],
    require_protocol: true,
  });
};

export const validateObjectId = (id: string): boolean => {
  return validator.isMongoId(id);
};

export const sanitizeInput = (input: string): string => {
  return validator.escape(input.trim());
};

export const validateFileType = (
  filename: string,
  allowedTypes: string[]
): boolean => {
  const extension = filename.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

export const validateFileSize = (size: number, maxSize: number): boolean => {
  return size <= maxSize;
};

export const validateDifficulty = (difficulty: string): boolean => {
  return ["Easy", "Medium", "Hard"].includes(difficulty);
};

export const validateStatus = (status: string): boolean => {
  return ["pending", "attempted", "solved"].includes(status);
};

export const validateLanguage = (language: string): boolean => {
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

export const validateRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

export const validateTimeSpent = (timeSpent: number): boolean => {
  return Number.isInteger(timeSpent) && timeSpent >= 0 && timeSpent <= 24 * 60;
};
