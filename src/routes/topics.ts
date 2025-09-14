import express from "express";
import Topic from "../models/Topic";
import Progress from "../models/Progress";
import { auth } from "../middleware/auth";
import { validateTopic } from "../middleware/validation";
import { logger } from "../utils/logger";
import { TopicController } from "../controllers/topicController";

const router = express.Router();
const topicController = new TopicController();

router.get("/", auth, topicController.getTopics);
router.get("/categories/list", auth, topicController.getCategories);
router.get("/search", auth, topicController.searchTopics);
router.get("/:id", auth, topicController.getTopicById);
router.post("/", auth, validateTopic, topicController.createTopic);
router.put("/:id", auth, validateTopic, topicController.updateTopic);
router.delete("/:id", auth, topicController.deleteTopic);
router.post("/:id/problems", auth, topicController.addProblem);
router.put(
  "/:topicId/problems/:problemId",
  auth,
  topicController.updateProblem
);
router.delete(
  "/:topicId/problems/:problemId",
  auth,
  topicController.deleteProblem
);

export default router;
