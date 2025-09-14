import { v2 as cloudinary } from "cloudinary";
import { logger } from "../utils/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (
  file: Buffer,
  folder: string,
  publicId?: string
): Promise<string> => {
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

    return (result as any).secure_url;
  } catch (error) {
    logger.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file");
  }
};

export default cloudinary;
