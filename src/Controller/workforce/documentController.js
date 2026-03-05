import asyncHandler from "express-async-handler";
import Document from "../../Models/resources/Document.js";
import ApiError from "../../Utils/ApiError.js";
import ApiResponse from "../../Utils/ApiResponse.js";

// ─────────────────────────────────────────────
//  POST /api/documents
// ─────────────────────────────────────────────
export const createDocument = asyncHandler(async (req, res) => {
  const { employeeID, docName, docType, status } = req.body;

  if (!employeeID) throw new ApiError(400, "employeeID is required");

  // FIX: was using documentType + fileUrl — Document model fields are docType + doc
  const doc = await Document.create({
    organizationID: req.organizationID,
    employeeID,
    docName: docName ?? null,
    docType: docType ?? null,       // FIX: was documentType
    doc: req.file?.path ?? null,    // FIX: was fileUrl — model field is doc
    status: status ?? "Pending",
  });

  return res.status(201).json(new ApiResponse(201, doc, "Document uploaded"));
});

// ─────────────────────────────────────────────
//  GET /api/documents  (?employeeId=...)
// ─────────────────────────────────────────────
export const getAllDocuments = asyncHandler(async (req, res) => {
  const { employeeId } = req.query;
  const query = { ...req.orgFilter };
  if (employeeId) query.employeeID = employeeId;

  const docs = await Document.find(query)
    .populate("employeeID", "displayName userName profilePhoto")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, docs));
});

// ─────────────────────────────────────────────
//  GET /api/documents/employee/:id
// ─────────────────────────────────────────────
export const getDocumentsByEmployee = asyncHandler(async (req, res) => {
  const docs = await Document.find({
    employeeID: req.params.id,
    ...req.orgFilter,
  })
    .populate("employeeID", "displayName userName profilePhoto")
    .sort({ createdAt: -1 });

  return res.json(new ApiResponse(200, docs));
});

// ─────────────────────────────────────────────
//  PUT /api/documents/:id
// ─────────────────────────────────────────────
export const updateDocument = asyncHandler(async (req, res) => {
  const { docName, docType, status } = req.body;

  const update = {};
  if (docName !== undefined) update.docName = docName;
  if (docType !== undefined) update.docType = docType;   // FIX: was documentType
  if (status !== undefined) update.status = status;
  if (req.file) update.doc = req.file.path;              // FIX: was fileUrl

  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, ...req.orgFilter }, // FIX: added org scoping
    update,
    { new: true, runValidators: true },
  );
  if (!doc) throw new ApiError(404, "Document not found");

  return res.json(new ApiResponse(200, doc, "Document updated"));
});

// ─────────────────────────────────────────────
//  PATCH /api/documents/:id/status
// ─────────────────────────────────────────────
export const updateDocumentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["Pending", "Received"].includes(status)) {
    throw new ApiError(400, "status must be 'Pending' or 'Received'");
  }

  const doc = await Document.findOneAndUpdate(
    { _id: req.params.id, ...req.orgFilter },
    { status },
    { new: true },
  );
  if (!doc) throw new ApiError(404, "Document not found");

  return res.json(new ApiResponse(200, doc, "Document status updated"));
});

// ─────────────────────────────────────────────
//  DELETE /api/documents/:id
// ─────────────────────────────────────────────
export const deleteDocument = asyncHandler(async (req, res) => {
  const doc = await Document.findOneAndDelete({
    _id: req.params.id,
    ...req.orgFilter, // FIX: added org scoping
  });
  if (!doc) throw new ApiError(404, "Document not found");
  return res.json(new ApiResponse(200, {}, "Document deleted"));
});