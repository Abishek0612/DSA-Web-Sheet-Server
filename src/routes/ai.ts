import express from "express";
import { auth } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { validateAIRequest } from "../middleware/validation";
import { AIController } from "../controllers/aiController";

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

export default router;
