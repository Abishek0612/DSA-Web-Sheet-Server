const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { validateUserUpdate } = require("../middleware/validation");
const { UserController } = require("../controllers/userController");

const router = express.Router();
const userController = new UserController();

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, validateUserUpdate, userController.updateProfile);
router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  userController.uploadAvatar
);
router.put("/settings", auth, userController.updateSettings);
router.get("/settings", auth, userController.getSettings);
router.post("/change-password", auth, userController.changePassword);
router.delete("/account", auth, userController.deleteAccount);
router.get("/export-data", auth, userController.exportUserData);
router.post(
  "/import-data",
  auth,
  upload.single("data"),
  userController.importUserData
);

module.exports = router;
