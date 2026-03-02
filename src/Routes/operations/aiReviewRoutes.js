import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createAiReview,
  getAllAiReviews,
  getAiReviewsByFilter,
  getAiReviewById,
  updateAiReview,
  deleteAiReview,
} from "../../Controller/operations/aiReviewController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  checkPermission("ai:manage"),
  upload.array("images", 3),
  createAiReview,
);
router.post(
  "/filter",
  protect,
  checkPermission("ai:read"),
  getAiReviewsByFilter,
);
router.get("/", protect, checkPermission("ai:read"), getAllAiReviews);

router.get("/:id", protect, getAiReviewById);
router.put(
  "/:id",
  protect,
  checkPermission("ai:manage"),
  upload.array("images", 3),
  updateAiReview,
);
router.delete("/:id", protect, checkPermission("ai:manage"), deleteAiReview);

export default router;
