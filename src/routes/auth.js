const express = require("express");
const { AuthController } = require("../controllers/authController");
const {
  validateRegistration,
  validateLogin,
} = require("../middleware/validation");
const { auth } = require("../middleware/auth");

const router = express.Router();
const authController = new AuthController();

router.post("/register", validateRegistration, authController.register);
router.post("/login", validateLogin, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);
router.get("/me", auth, authController.getCurrentUser);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", auth, authController.logout);

module.exports = router;
