const express = require("express");
const aiReviewRouter = express.Router();

const { upload } = require("../config/cloudinary");
const { protect } = require("../middleware/authMiddleware.js");

const {
  createAiReview,
  getAiReviewsbyFilter,
  getAllAiReviews,
  getAiReviewById,
  updateAiReview,
  deleteAiReview,
} = require("../controllers/aiReviewController");

aiReviewRouter.post("/", protect, upload.array("images", 3), createAiReview);
aiReviewRouter.post("/filter", protect, getAiReviewsbyFilter);
aiReviewRouter.get("/", protect, getAllAiReviews);
aiReviewRouter.get("/:id", getAiReviewById);
aiReviewRouter.put("/:id", upload.array("images", 3), updateAiReview);
aiReviewRouter.delete("/:id", deleteAiReview);

module.exports = aiReviewRouter;
