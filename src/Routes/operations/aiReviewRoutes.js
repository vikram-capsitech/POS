import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
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
  orgScope,
  checkPermission("ai:manage"),
  upload.array("images", 3),
  createAiReview,
);
router.post(
  "/filter",
  protect,
  orgScope,
  checkPermission("ai:read"),
  getAiReviewsByFilter,
);
router.get("/", protect, orgScope, checkPermission("ai:read"), getAllAiReviews);

router.get("/:id", protect, orgScope, getAiReviewById);
router.put(
  "/:id",
  protect,
  orgScope,
  checkPermission("ai:manage"),
  upload.array("images", 3),
  updateAiReview,
);
router.delete(
  "/:id",
  protect,
  orgScope,
  checkPermission("ai:manage"),
  deleteAiReview,
);

export default router;
