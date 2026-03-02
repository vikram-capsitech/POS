const SOP = require("../Models/Sop");
const Employee = require("../Models/Employee");
const { sendBulkNotification } = require("../Services/notificationService");
const asyncHandler = require("../Utils/asyncHandler");
const ApiError = require("../Utils/ApiError");

const parseSteps = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      throw new ApiError(400, "Invalid JSON format for steps field");
    }
  }
  return [];
};

// ─────────────────────────────────────────────
//  POST /api/sops
// ─────────────────────────────────────────────
const createSOP = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    difficultyLevel,
    estimatedTime,
    owner,
    status,
  } = req.body;
  const restaurantID = req.organizationID;
  const steps = parseSteps(req.body.steps);
  const voiceNote = req.file?.path ?? null;

  const sop = await SOP.create({
    title,
    description,
    category,
    difficultyLevel,
    estimatedTime,
    voiceNote,
    steps,
    owner,
    status,
    restaurantID,
  });

  // Notify all active employees
  const employees = await Employee.find({
    restaurantID,
    status: "active",
  }).select("_id");
  if (employees.length) {
    await sendBulkNotification(
      employees.map((e) => e._id),
      "info",
      "sop",
      "New SOP Created",
      `A new SOP has been created: ${title}`,
      { sopId: sop._id.toString(), category },
    );
  }

  res
    .status(201)
    .json({ success: true, message: "SOP created successfully", data: sop });
});

// ─────────────────────────────────────────────
//  GET /api/sops
// ─────────────────────────────────────────────
const getAllSOPs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status } = req.query;
  const query = { ...req.orgFilter };
  if (category) query.category = category;
  if (status) query.status = status;

  const [sops, total] = await Promise.all([
    SOP.find(query)
      .populate("owner", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    SOP.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: sops,
  });
});

// ─────────────────────────────────────────────
//  POST /api/sops/filter
// ─────────────────────────────────────────────
const getSOPsByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficultyLevel, category } = req.body;
  const query = { ...req.orgFilter, status: "Active" };
  if (category) query.category = category;

  if (difficultyLevel?.length) {
    query.$or = [{ difficultyLevel: { $in: difficultyLevel } }];
  }

  const [sops, total] = await Promise.all([
    SOP.find(query)
      .populate("owner", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    SOP.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: sops,
  });
});

// ─────────────────────────────────────────────
//  GET /api/sops/:id
// ─────────────────────────────────────────────
const getSOPById = asyncHandler(async (req, res) => {
  const sop = await SOP.findById(req.params.id).populate(
    "owner",
    "name position",
  );
  if (!sop) throw new ApiError(404, "SOP not found");
  res.json({ success: true, data: sop });
});

// ─────────────────────────────────────────────
//  PUT /api/sops/:id
// ─────────────────────────────────────────────
const updateSOP = asyncHandler(async (req, res) => {
  const sop = await SOP.findById(req.params.id);
  if (!sop) throw new ApiError(404, "SOP not found");

  const { steps: rawSteps, ...otherFields } = req.body;
  const steps = parseSteps(rawSteps);
  const voiceNote = req.file?.path ?? sop.voiceNote;

  const updated = await SOP.findByIdAndUpdate(
    req.params.id,
    { ...otherFields, steps, voiceNote },
    { new: true, runValidators: true },
  );

  // Notify employees about the update
  const employees = await Employee.find({
    restaurantID: sop.restaurantID,
    status: "active",
  }).select("_id");
  if (employees.length) {
    await sendBulkNotification(
      employees.map((e) => e._id),
      "info",
      "sop",
      "SOP Updated",
      `SOP "${updated.title}" has been updated`,
      { sopId: updated._id.toString(), category: updated.category },
    );
  }

  res.json({
    success: true,
    message: "SOP updated successfully",
    data: updated,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/sops/:id
// ─────────────────────────────────────────────
const deleteSOP = asyncHandler(async (req, res) => {
  const sop = await SOP.findByIdAndDelete(req.params.id);
  if (!sop) throw new ApiError(404, "SOP not found");
  res.json({ success: true, message: "SOP deleted successfully" });
});
