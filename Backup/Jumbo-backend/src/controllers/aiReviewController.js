const AiReview = require("../models/AiReview");
const Employee = require("../models/Employee");
const { decodeToken } = require("../utils/decodeToken");
const { analyzeImagesByAi } = require("../services/openAiService");

exports.createAiReview = async (req, res) => {
  const {
    restaurantId: restaurantID,
    title,
    description,
    category,
    taskId,
    owner,
    timeTaken,
    attempts,
  } = req.body;
  if (!restaurantID) {
    return res.status(400).json({ error: "restaurantID is Required" });
  }
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Image is required" });
    }
    if (!taskId) {
      return res.status(400).json({ error: "Task Is Required" });
    }
    const imagePaths = req.files.map((f) => f.path);

    //  Default AI result
    let aiResult = {
      verdict: "Pending",
      confidence: 0,
      reasoning: "AI not applied",
    };

    aiResult = await analyzeImagesByAi({
      imagePath: imagePaths[0],
      title,
      description,
      category,
    });
    let finalStatus = aiResult.verdict;

    if (aiResult.confidence <= 60) {
      finalStatus = "Rejected";
    }

    if (aiResult.verdict === "Rejected" && aiResult.confidence > 60) {
      finalStatus = "Under Review";
    }

    if (aiResult.verdict === "Passed" && aiResult.confidence > 80) {
      finalStatus = "Passed";
    }

    const review = await AiReview.create({
      restaurantID,
      owner,
      task: taskId,
      images: imagePaths,
      recordedTime: timeTaken,
      attempts,
      status: finalStatus,
      severity: aiResult.severity || null,
      aiIssue: aiResult.issue || null,
      aiResponse: aiResult.reasoning || null,
      confidenceScore: aiResult.confidence || 0,
      aiRawResponse: aiResult,
    });
    res.status(201).json({
      success: true,
      message: "Ai Review created",
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ALL
exports.getAllAiReviews = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }
    const reviews = await AiReview.find({ restaurantID })
      .populate("task")
      .populate("owner", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAiReviewsbyFilter = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) restaurantID = employee.restaurantID;

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }

    const { category = [], status = [] } = req.body;

    const reviewQuery = { restaurantID };

    if (status.length > 0) {
      reviewQuery.status = { $in: status };
    }

    let aiReviews = await AiReview.find(reviewQuery)
      .populate({
        path: "task",
        match: category.length > 0
          ? { category: { $in: category } }
          : {},
      })
      .populate("owner", "name role")
      .sort({ createdAt: -1 });

    if (category.length > 0) {
      aiReviews = aiReviews.filter(review => review.task !== null);
    }

    res.status(200).json({
      success: true,
      count: aiReviews.length,
      data: aiReviews,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BY ID
exports.getAiReviewById = async (req, res) => {
  try {
    const review = await AiReview.findById(req.params.id)
      .populate("task")
      .populate("owner", "name role");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Ai Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
exports.updateAiReview = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map((file) => file.path);
    }

    const updatedReview = await AiReview.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true },
    );

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Ai Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ai Review updated",
      data: updatedReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE
exports.deleteAiReview = async (req, res) => {
  try {
    const deleted = await AiReview.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Ai Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ai Review deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
