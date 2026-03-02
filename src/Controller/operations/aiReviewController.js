import asyncHandler from "express-async-handler";
import { AiReview } from "../../Models/index.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

export const createAiReview = asyncHandler(async (req, res) => {
  const { employeeId, context } = req.body;
  const images = req.files?.map((f) => f.path) ?? [];
  const review = await AiReview.create({
    employeeId,
    context,
    images,
    organizationID: req.organizationID,
    createdBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, review, "AI review created"));
});

export const getAllAiReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { ...req.orgFilter };
  const [reviews, total] = await Promise.all([
    AiReview.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    AiReview.countDocuments(query),
  ]);
  return res.json(new ApiResponse(200, { reviews, total }));
});

export const getAiReviewById = asyncHandler(async (req, res) => {
  const review = await AiReview.findById(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  return res.json(new ApiResponse(200, review));
});

export const updateAiReview = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.files?.length) update.images = req.files.map((f) => f.path);
  const review = await AiReview.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!review) throw new ApiError(404, "Review not found");
  return res.json(new ApiResponse(200, review, "Review updated"));
});

export const deleteAiReview = asyncHandler(async (req, res) => {
  const review = await AiReview.findByIdAndDelete(req.params.id);
  if (!review) throw new ApiError(404, "Review not found");
  return res.json(new ApiResponse(200, {}, "Review deleted"));
});

export const getAiReviewsByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { ...req.orgFilter };
  const [reviews, total] = await Promise.all([
    AiReview.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    AiReview.countDocuments(query),
  ]);
  return res.json(new ApiResponse(200, { reviews, total }));
});
