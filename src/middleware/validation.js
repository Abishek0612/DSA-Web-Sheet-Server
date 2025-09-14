const Joi = require("joi");
const { logger } = require("../utils/logger");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const topicSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  description: Joi.string().min(10).max(1000).required(),
  icon: Joi.string().required(),
  category: Joi.string().required(),
  order: Joi.number().min(0).required(),
  estimatedTime: Joi.string().required(),
  prerequisites: Joi.array().items(Joi.string()),
  tags: Joi.array().items(Joi.string()),
  difficulty: Joi.string().valid("Beginner", "Intermediate", "Advanced"),
  problems: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      difficulty: Joi.string().valid("Easy", "Medium", "Hard").required(),
      links: Joi.object({
        leetcode: Joi.string().uri().allow(""),
        codeforces: Joi.string().uri().allow(""),
        youtube: Joi.string().uri().allow(""),
        article: Joi.string().uri().allow(""),
        editorial: Joi.string().uri().allow(""),
      }),
      tags: Joi.array().items(Joi.string()),
      companies: Joi.array().items(Joi.string()),
      timeComplexity: Joi.string().allow(""),
      spaceComplexity: Joi.string().allow(""),
      hints: Joi.array().items(Joi.string()),
      order: Joi.number().min(0).default(0),
    })
  ),
});

const progressSchema = Joi.object({
  topicId: Joi.string().hex().length(24).required(),
  problemId: Joi.string().required(),
  status: Joi.string().valid("pending", "attempted", "solved").required(),
  timeSpent: Joi.number().min(0).default(0),
  notes: Joi.string().max(1000).allow(""),
  rating: Joi.number().min(1).max(5),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().lowercase().trim(),
  preferences: Joi.object({
    theme: Joi.string().valid("light", "dark", "system"),
    language: Joi.string(),
    difficulty: Joi.string().valid("easy", "medium", "hard"),
  }),
});

const aiRequestSchema = Joi.object({
  topic: Joi.string().min(2).max(200),
  context: Joi.string().max(1000).allow(""),
  message: Joi.string().min(1).max(2000),
  language: Joi.string().valid(
    "javascript",
    "python",
    "java",
    "cpp",
    "go",
    "rust",
    "typescript"
  ),
  difficulty: Joi.string().valid("easy", "medium", "hard"),
  count: Joi.number().min(1).max(10),
  code: Joi.string().max(10000),
  problemDescription: Joi.string().max(5000),
  currentApproach: Joi.string().max(1000).allow(""),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const validateRegistration = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    logger.warn(`Registration validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    logger.warn(`Login validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateTopic = (req, res, next) => {
  const { error } = topicSchema.validate(req.body);
  if (error) {
    logger.warn(`Topic validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateProgress = (req, res, next) => {
  const { error } = progressSchema.validate(req.body);
  if (error) {
    logger.warn(`Progress validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateUserUpdate = (req, res, next) => {
  const { error } = userUpdateSchema.validate(req.body);
  if (error) {
    logger.warn(`User update validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateAIRequest = (req, res, next) => {
  const { error } = aiRequestSchema.validate(req.body);
  if (error) {
    logger.warn(`AI request validation error: ${error.details[0].message}`);
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateChangePassword = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error) {
    logger.warn(
      `Change password validation error: ${error.details[0].message}`
    );
    return res.status(400).json({
      message: "Validation error",
      details: error.details[0].message,
    });
  }
  next();
};

const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    if (!objectIdRegex.test(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }

    next();
  };
};

const validateQueryParams = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      logger.warn(`Query params validation error: ${error.details[0].message}`);
      return res.status(400).json({
        message: "Invalid query parameters",
        details: error.details[0].message,
      });
    }
    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateTopic,
  validateProgress,
  validateUserUpdate,
  validateAIRequest,
  validateChangePassword,
  validateObjectId,
  validateQueryParams,
};
