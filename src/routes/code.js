const express = require("express");
const { auth } = require("../middleware/auth");
const { rateLimiter } = require("../middleware/rateLimiter");
const { CodeController } = require("../controllers/codeController");

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

module.exports = router;
