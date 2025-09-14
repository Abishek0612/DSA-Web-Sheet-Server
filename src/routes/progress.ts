import express from "express";
import { auth } from "../middleware/auth";
import { validateProgress } from "../middleware/validation";
import { ProgressController } from "../controllers/progressController";

const router = express.Router();
const progressController = new ProgressController();

router.get("/", auth, progressController.getUserProgress);
router.get("/stats", auth, progressController.getProgressStats);
router.get("/daily/:year", auth, progressController.getDailyProgress);
router.get("/weekly", auth, progressController.getWeeklyProgress);
router.get("/monthly", auth, progressController.getMonthlyProgress);
router.post("/", auth, validateProgress, progressController.updateProgress);
router.get("/topic/:topicId", auth, progressController.getTopicProgress);
router.post(
  "/bookmark/:topicId/:problemId",
  auth,
  progressController.toggleBookmark
);
router.get("/bookmarks", auth, progressController.getBookmarks);
router.post(
  "/submit/:topicId/:problemId",
  auth,
  progressController.submitSolution
);
router.get(
  "/submissions/:topicId/:problemId",
  auth,
  progressController.getSubmissions
);

export default router;
