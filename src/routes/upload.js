const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { UploadController } = require("../controllers/uploadController");

const router = express.Router();
const uploadController = new UploadController();

router.post(
  "/avatar",
  auth,
  upload.single("avatar"),
  uploadController.uploadAvatar
);
router.post("/file", auth, upload.single("file"), uploadController.uploadFile);
router.post(
  "/multiple",
  auth,
  upload.array("files", 10),
  uploadController.uploadMultipleFiles
);
router.delete("/file/:filename", auth, uploadController.deleteFile);
router.get("/file/:filename", uploadController.getFile);

module.exports = router;
