import asyncHandler from "express-async-handler";
import { Request } from "../../Models/index.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

export const createRequest = asyncHandler(async (req, res) => {
  const { title, description, requestType, assignTo, priority } = req.body;
  if (!title || !requestType)
    throw new ApiError(400, "title and requestType are required");
  const request = await Request.create({
    title,
    description,
    requestType,
    assignTo,
    priority,
    voiceNote: req.file?.path ?? null,
    organizationID: req.organizationID,
    createdBy: req.user._id,
  });
  return res.status(201).json(new ApiResponse(201, request, "Request created"));
});

export const getAllRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, requestType } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;
  if (requestType) query.requestType = requestType;
  const [requests, total] = await Promise.all([
    Request.find(query)
      .populate("assignTo", "displayName")
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    Request.countDocuments(query),
  ]);
  return res.json(
    new ApiResponse(200, {
      requests,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});

export const getAllRequestsForEmployees = asyncHandler(async (req, res) => {
  const requests = await Request.find({
    $or: [{ assignTo: req.user._id }, { createdBy: req.user._id }],
  }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, requests));
});

export const getRequestById = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate("assignTo")
    .populate("createdBy", "displayName");
  if (!request) throw new ApiError(404, "Request not found");
  return res.json(new ApiResponse(200, request));
});

export const updateRequest = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.voiceNote = req.file.path;
  const request = await Request.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!request) throw new ApiError(404, "Request not found");
  return res.json(new ApiResponse(200, request, "Request updated"));
});

export const deleteRequest = asyncHandler(async (req, res) => {
  const request = await Request.findByIdAndDelete(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  return res.json(new ApiResponse(200, {}, "Request deleted"));
});

export const markRequestSeen = asyncHandler(async (req, res) => {
  await Request.updateMany(
    { ...req.orgFilter, isNew: true },
    { $set: { isNew: false } },
  );
  return res.json(new ApiResponse(200, {}, "Requests marked as seen"));
});

export const getRequestByFilter = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, requestType } = req.query;
  const query = { ...req.orgFilter };
  if (status) query.status = status;
  if (requestType) query.requestType = requestType;
  const [requests, total] = await Promise.all([
    Request.find(query)
      .populate("assignTo", "displayName")
      .populate("createdBy", "displayName")
      .sort({ createdAt: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit),
    Request.countDocuments(query),
  ]);
  return res.json(
    new ApiResponse(200, {
      requests,
      total,
      page: +page,
      totalPages: Math.ceil(total / +limit),
    }),
  );
});
