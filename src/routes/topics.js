const express = require("express");
const { auth } = require("../middleware/auth");
const { validateTopic } = require("../middleware/validation");
const { TopicController } = require("../controllers/topicController");

module.exports = (io) => {
  const router = express.Router();
  const topicController = new TopicController(io);

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

  return router;
};
