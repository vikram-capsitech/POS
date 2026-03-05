import asyncHandler from "express-async-handler";
import { SOP } from "../../Models/index.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import { logUserAction } from "../../Utils/Logger.js";

const parseSteps = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      throw new ApiError(400, "Invalid JSON for steps");
    }
  }
  return [];
};

export const createSOP = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    difficultyLevel,
    estimatedTime,
    owner,
    status,
  } = req.body;
  const steps = parseSteps(req.body.steps);
  const sop = await SOP.create({
    title,
    description,
    category,
    difficultyLevel,
    estimatedTime,
    owner: owner || req.user._id,
    status,
    steps,
    voiceNote: req.file?.path ?? null,
    organizationID: req.organizationID,
  });

  await logUserAction(req, "SOP_CREATED", "SOP", sop._id, { title: sop.title });

  return res.status(201).json(new ApiResponse(201, sop, "SOP created"));
});

export const getAllSOPs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status } = req.query;
  const query = { ...req.orgFilter };
  if (category) query.category = category;
  if (status) query.status = status;
  const [sops, total] = await Promise.all([
    SOP.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    SOP.countDocuments(query),
  ]);
  return res.json(
    new ApiResponse(200, {
      sops,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});

export const getSOPById = asyncHandler(async (req, res) => {
  const sop = await SOP.findById(req.params.id);
  if (!sop) throw new ApiError(404, "SOP not found");
  return res.json(new ApiResponse(200, sop));
});

export const updateSOP = asyncHandler(async (req, res) => {
  const { steps: rawSteps, ...rest } = req.body;
  const update = { ...rest };
  if (rawSteps !== undefined) update.steps = parseSteps(rawSteps);
  if (req.file) update.voiceNote = req.file.path;
  const old = await SOP.findById(req.params.id);
  const sop = await SOP.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!sop) throw new ApiError(404, "SOP not found");

  const changes = {};
  ["title", "category"].forEach(field => {
    if (old && old[field] !== sop[field]) {
      changes[field] = { from: old[field], to: sop[field] };
    }
  });

  await logUserAction(req, "SOP_UPDATED", "SOP", sop._id, { title: sop.title, changes });

  return res.json(new ApiResponse(200, sop, "SOP updated"));
});

export const deleteSOP = asyncHandler(async (req, res) => {
  const sop = await SOP.findByIdAndDelete(req.params.id);
  if (!sop) throw new ApiError(404, "SOP not found");

  await logUserAction(req, "SOP_DELETED", "SOP", sop._id, { title: sop.title });

  return res.json(new ApiResponse(200, {}, "SOP deleted"));
});

export const getSOPByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status } = req.query;
  const query = { ...req.orgFilter };
  if (category) query.category = category;
  if (status) query.status = status;
  const [sops, total] = await Promise.all([
    SOP.find(query)
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    SOP.countDocuments(query),
  ]);
  return res.json(
    new ApiResponse(200, {
      sops,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});
