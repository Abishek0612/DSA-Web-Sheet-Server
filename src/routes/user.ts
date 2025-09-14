import express from "express";
import { auth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { validateUserUpdate } from "../middleware/validation";
import { UserController } from "../controllers/userController";

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

export default router;
