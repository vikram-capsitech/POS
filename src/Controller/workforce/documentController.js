import asyncHandler from "express-async-handler";
import { Document } from "../../Models/index.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

export const createDocument = asyncHandler(async (req, res) => {
  const { employeeID, documentType, note } = req.body;
  if (!employeeID || !documentType)
    throw new ApiError(400, "employeeID and documentType are required");
  const doc = await Document.create({
    employeeID,
    documentType,
    note,
    fileUrl: req.file?.path ?? null,
    organizationID: req.organizationID,
  });
  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

export const getAllDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const query = { ...req.orgFilter };
  if (employeeId) query.employeeID = employeeId;
  const docs = await Document.find(query).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, docs));
});

export const getDocumentsByEmployee = asyncHandler(async (req, res) => {
  const docs = await Document.find({
    employeeID: req.params.id,
    ...req.orgFilter,
  }).sort({ createdAt: -1 });
  return res.json(new ApiResponse(200, docs));
});

export const updateDocument = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (req.file) update.fileUrl = req.file.path;
  const doc = await Document.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });
  if (!doc) throw new ApiError(404, "Document not found");
  return res.json(new ApiResponse(200, doc, "Document updated"));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, "Document not found");
  return res.json(new ApiResponse(200, {}, "Document deleted"));
});
