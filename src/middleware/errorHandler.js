const { logger } = require("../utils/logger");

const errorHandler = (error, req, res, next) => {
  logger.error(error.stack);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if (error.code === 11000) {
    return res.status(400).json({ message: "Duplicate field value" });
  }

  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

module.exports = { errorHandler };
