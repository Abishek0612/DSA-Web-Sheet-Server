import express from "express";
import { auth } from "../middleware/auth";
import { rateLimiter } from "../middleware/rateLimiter";
import { CodeController } from "../controllers/codeController";

const router = express.Router();
const codeController = new CodeController();

router.post("/execute", auth, rateLimiter.general, codeController.executeCode);
router.post(
  "/submit/:problemId",
  auth,
  rateLimiter.general,
  codeController.submitSolution
);
router.get("/problem/:problemId", auth, codeController.getProblem);
router.get("/problems", auth, codeController.getProblems);

export default router;
