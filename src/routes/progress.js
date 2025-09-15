const express = require("express");
const { auth } = require("../middleware/auth");
const { validateProgress } = require("../middleware/validation");
const { ProgressController } = require("../controllers/progressController");

module.exports = (io) => {
  const router = express.Router();
  const progressController = new ProgressController(io);

  router.get("/", auth, progressController.getUserProgress);
  router.get("/stats", auth, progressController.getProgressStats);
  router.get("/daily/:year", auth, progressController.getDailyProgress);
  router.post("/", auth, validateProgress, progressController.updateProgress);

  return router;
};
