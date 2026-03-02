import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "voice_recording",
    resource_type: "auto",
  },
});

const photoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folderName = "employee_photos";
    if (file.fieldname === "restaurantLogo") {
      folderName = "restaurant_logos";
    }
    return {
      folder: folderName,
      resource_type: "image",
    };
  },
});
const uploadPhoto = multer({ storage: photoStorage });

const upload = multer({ storage: storage });

export { upload, uploadPhoto };
