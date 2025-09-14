const express = require("express");
const { auth } = require("../middleware/auth");
const { rateLimiter, userRateLimiter } = require("../middleware/rateLimiter");
const { validateAIRequest } = require("../middleware/validation");
const { AIController } = require("../controllers/aiController");

const router = express.Router();
const aiController = new AIController();

router.post(
  "/research",
  auth,
  rateLimiter.ai,
  validateAIRequest,
  aiController.generateResearch
);
router.post(
  "/generate-problems",
  auth,
  rateLimiter.ai,
  validateAIRequest,
  aiController.generateProblems
);
router.post(
  "/chat",
  auth,
  rateLimiter.chat,
  validateAIRequest,
  aiController.chatWithAI
);
router.post(
  "/explain-solution",
  auth,
  rateLimiter.ai,
  aiController.explainSolution
);
router.post("/code-review", auth, rateLimiter.ai, aiController.reviewCode);
router.post("/hint", auth, rateLimiter.ai, aiController.generateHint);
router.get("/chat/history", auth, aiController.getChatHistory);
router.delete("/chat/history", auth, aiController.clearChatHistory);

module.exports = router;
