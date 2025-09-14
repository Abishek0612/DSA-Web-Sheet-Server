const express = require("express");
const Topic = require("../models/Topic");
const Progress = require("../models/Progress");
const { auth } = require("../middleware/auth");
const { validateTopic } = require("../middleware/validation");
const { logger } = require("../utils/logger");
const { TopicController } = require("../controllers/topicController");

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

module.exports = router;
