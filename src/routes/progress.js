const express = require("express");
const { auth } = require("../middleware/auth");
const { validateProgress } = require("../middleware/validation");
const { ProgressController } = require("../controllers/progressController");

const router = express.Router();
const progressController = new ProgressController();

router.get("/", auth, progressController.getUserProgress);
router.get("/stats", auth, progressController.getProgressStats);
router.get("/daily/:year", auth, progressController.getDailyProgress);
router.post("/", auth, validateProgress, progressController.updateProgress);

module.exports = router;
