const dotenv = require("dotenv");
dotenv.config();

const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

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

module.exports = {  upload ,uploadPhoto};
