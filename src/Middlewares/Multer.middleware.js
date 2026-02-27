import multer from "multer";
import ApiError from "../Utils/ApiError.js";

// ─── Storage ──────────────────────────────────────────────────────────────────

const memoryStorage = multer.memoryStorage();

// ─── File Filter ──────────────────────────────────────────────────────────────

const imageFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only jpeg, jpg, png, and webp images are allowed"), false);
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only PDF, Word documents and images are allowed"), false);
  }
};

const audioFilter = (req, file, cb) => {
  const allowed = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only audio files are allowed for voice notes"), false);
  }
};

// ─── Multer Instances ─────────────────────────────────────────────────────────

// General upload — images only, 5MB max
export const upload = multer({
  storage: memoryStorage,
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Profile photo upload — images only, 2MB max
export const uploadPhoto = multer({
  storage: memoryStorage,
  limits:  { fileSize: 2 * 1024 * 1024 },
  fileFilter: imageFilter,
});

// Document upload — PDF/Word/images, 10MB max
export const uploadDocument = multer({
  storage: memoryStorage,
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: documentFilter,
});

// Voice note upload — audio only, 20MB max
export const uploadAudio = multer({
  storage: memoryStorage,
  limits:  { fileSize: 20 * 1024 * 1024 },
  fileFilter: audioFilter,
});

// AI review images — up to 5 images, 10MB each
export const uploadAiImages = multer({
  storage: memoryStorage,
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter,
});