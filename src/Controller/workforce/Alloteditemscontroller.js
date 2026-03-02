import AllocatedItems from "../../Models/resources/AllocatedItems.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/allocated-items
// ─────────────────────────────────────────────
const createAllocatedItem = asyncHandler(async (req, res) => {
  const data = { ...req.body, restaurantID: req.organizationID };
  if (req.file) data.image = req.file.path;

  const item = await AllocatedItems.create(data);
  res.status(201).json({
    success: true,
    message: "Allocated item created successfully",
    data: item,
  });
});

// ─────────────────────────────────────────────
//  GET /api/allocated-items
// ─────────────────────────────────────────────
const getAllAllocatedItems = asyncHandler(async (req, res) => {
  const items = await AllocatedItems.find(req.orgFilter)
    .populate("employeeId", "name position")
    .populate("issuedTo", "name position");

  res.json({ success: true, count: items.length, data: items });
});

// ─────────────────────────────────────────────
//  GET /api/allocated-items/:id
// ─────────────────────────────────────────────
const getAllocatedItemById = asyncHandler(async (req, res) => {
  const item = await AllocatedItems.findOne({
    _id: req.params.id,
    ...req.orgFilter,
  })
    .populate("employeeId", "name position")
    .populate("issuedTo", "name position");

  if (!item) throw new ApiError(404, "Allocated item not found");
  res.json({ success: true, data: item });
});

// ─────────────────────────────────────────────
//  GET /api/allocated-items/employee/:employeeId
// ─────────────────────────────────────────────
const getItemsByEmployee = asyncHandler(async (req, res) => {
  const items = await AllocatedItems.find({
    issuedTo: req.params.employeeId,
    ...req.orgFilter,
  })
    .populate("employeeId", "name")
    .populate("issuedTo", "name");

  res.json({ success: true, count: items.length, data: items });
});

// ─────────────────────────────────────────────
//  PUT /api/allocated-items/:id
// ─────────────────────────────────────────────
const updateAllocatedItem = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.image = req.file.path;

  const item = await AllocatedItems.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });
  if (!item) throw new ApiError(404, "Allocated item not found");

  res.json({ success: true, message: "Allocated item updated", data: item });
});

// ─────────────────────────────────────────────
//  DELETE /api/allocated-items/:id
// ─────────────────────────────────────────────
const deleteAllocatedItem = asyncHandler(async (req, res) => {
  const item = await AllocatedItems.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, "Allocated item not found");
  res.json({ success: true, message: "Item deleted successfully" });
});

const getItemsByEmployeeId = asyncHandler(async (req, res) => {
  const items = await AllocatedItems.find({
    issuedTo: req.params.employeeId,
    ...req.orgFilter,
  })
    .populate("employeeId", "name")
    .populate("issuedTo", "name");

  res.json({ success: true, count: items.length, data: items });
});

export {
  createAllocatedItem,
  getAllAllocatedItems,
  getAllocatedItemById,
  getItemsByEmployee,
  updateAllocatedItem,
  deleteAllocatedItem,
  getItemsByEmployeeId,
};
