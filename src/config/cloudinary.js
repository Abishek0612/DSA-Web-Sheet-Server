const { v2: cloudinary } = require("cloudinary");
const { logger } = require("../utils/logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder, publicId) => {
  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: publicId,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(file);
    });

    return result.secure_url;
  } catch (error) {
    logger.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file");
  }
};

module.exports = { uploadToCloudinary };
module.exports.default = cloudinary;
