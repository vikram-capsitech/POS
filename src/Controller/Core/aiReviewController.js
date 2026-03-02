const AiReview = require("../Models/AiReview");
const { analyzeImagesByAi } = require("../Services/openAiService");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

/** Derive final status from AI result */
const deriveStatus = (aiResult) => {
  const { verdict, confidence } = aiResult;
  if (confidence <= 60) return "Rejected";
  if (verdict === "Rejected" && confidence > 60) return "Under Review";
  if (verdict === "Passed" && confidence > 80) return "Passed";
  return "Under Review";
};

// ─────────────────────────────────────────────
//  POST /api/ai-reviews
// ─────────────────────────────────────────────
const createAiReview = asyncHandler(async (req, res) => {
  const { title, description, category, taskId, owner, timeTaken, attempts } =
    req.body;
  const restaurantID = req.organizationID;

  if (!req.files?.length)
    throw new ApiError(400, "At least one image is required");
  if (!taskId) throw new ApiError(400, "taskId is required");

  const imagePaths = req.files.map((f) => f.path);

  const aiResult = await analyzeImagesByAi({
    imagePath: imagePaths[0],
    title,
    description,
    category,
  });

  const review = await AiReview.create({
    restaurantID,
    owner,
    task: taskId,
    images: imagePaths,
    recordedTime: timeTaken,
    attempts,
    status: deriveStatus(aiResult),
    severity: aiResult.severity ?? null,
    aiIssue: aiResult.issue ?? null,
    aiResponse: aiResult.reasoning ?? null,
    confidenceScore: aiResult.confidence ?? 0,
    aiRawResponse: aiResult,
  });

  res
    .status(201)
    .json({ success: true, message: "AI Review created", data: review });
});

// ─────────────────────────────────────────────
//  GET /api/ai-reviews
// ─────────────────────────────────────────────
const getAllAiReviews = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;

  const [reviews, total] = await Promise.all([
    AiReview.find(query)
      .populate("task", "title category")
      .populate("owner", "name role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    AiReview.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: reviews,
  });
});

// ─────────────────────────────────────────────
//  POST /api/ai-reviews/filter
// ─────────────────────────────────────────────
const getAiReviewsByFilter = asyncHandler(async (req, res) => {
  const { category = [], status = [], page = 1, limit = 10 } = req.body;
  const query = { ...req.orgFilter };
  if (status.length) query.status = { $in: status };

  let reviews = await AiReview.find(query)
    .populate({
      path: "task",
      match: category.length ? { category: { $in: category } } : {},
      select: "title category",
    })
    .populate("owner", "name role")
    .sort({ createdAt: -1 });

  // Filter out reviews where task didn't match the category
  if (category.length) {
    reviews = reviews.filter((r) => r.task !== null);
  }

  // Manual pagination after category filter
  const total = reviews.length;
  const paginated = reviews.slice((page - 1) * limit, page * limit);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: paginated,
  });
});

// ─────────────────────────────────────────────
//  GET /api/ai-reviews/:id
// ─────────────────────────────────────────────
const getAiReviewById = asyncHandler(async (req, res) => {
  const review = await AiReview.findById(req.params.id)
    .populate("task")
    .populate("owner", "name role");
  if (!review) throw new ApiError(404, "AI Review not found");
  res.json({ success: true, data: review });
});

// ─────────────────────────────────────────────
//  PUT /api/ai-reviews/:id  (manual override by admin)
// ─────────────────────────────────────────────
const updateAiReview = asyncHandler(async (req, res) => {
  const updateData = { ...req.body };
  if (req.files?.length) updateData.images = req.files.map((f) => f.path);

  const updated = await AiReview.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });
  if (!updated) throw new ApiError(404, "AI Review not found");

  res.json({ success: true, message: "AI Review updated", data: updated });
});

// ─────────────────────────────────────────────
//  DELETE /api/ai-reviews/:id
// ─────────────────────────────────────────────
const deleteAiReview = asyncHandler(async (req, res) => {
  const deleted = await AiReview.findByIdAndDelete(req.params.id);
  if (!deleted) throw new ApiError(404, "AI Review not found");
  res.json({ success: true, message: "AI Review deleted" });
});

export default {
  createAiReview,
  getAllAiReviews,
  getAiReviewsByFilter,
  getAiReviewById,
  updateAiReview,
  deleteAiReview,
};
