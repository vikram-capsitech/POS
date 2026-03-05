import AllocatedItems from "../../Models/resources/AllocatedItems.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/allocated-items
// ─────────────────────────────────────────────
const createAllocatedItem = asyncHandler(async (req, res) => {
  // FIX: was spreading req.body and setting restaurantID — model field is organizationID
  const { itemName, issuedTo, issuedBy, status, issuedOn, returnedOn } = req.body;

  if (!itemName) throw new ApiError(400, "itemName is required");

  const data = {
    organizationID: req.organizationID, // FIX: was restaurantID: req.organizationID
    itemName,
    issuedTo: issuedTo ?? null,
    issuedBy: issuedBy ?? req.user._id,
    status: status ?? "Pending",
    issuedOn: issuedOn ? new Date(issuedOn) : Date.now(),
    returnedOn: returnedOn ? new Date(returnedOn) : null,
  };

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
    .populate("issuedTo", "displayName userName profilePhoto")
    .populate("issuedBy", "displayName userName");

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
    .populate("issuedTo", "displayName userName profilePhoto")
    .populate("issuedBy", "displayName userName");

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
    .populate("issuedTo", "displayName userName")
    .populate("issuedBy", "displayName userName");

  res.json({ success: true, count: items.length, data: items });
});

// ─────────────────────────────────────────────
//  PUT /api/allocated-items/:id
// ─────────────────────────────────────────────
const updateAllocatedItem = asyncHandler(async (req, res) => {
  // FIX: scope update to org so an admin can't update another org's item
  const data = { ...req.body };
  if (req.file) data.image = req.file.path;

  // Set returnedOn automatically when status is Returned
  if (data.status === "Returned" && !data.returnedOn) {
    data.returnedOn = new Date();
  }

  const item = await AllocatedItems.findOneAndUpdate(
    { _id: req.params.id, ...req.orgFilter }, // FIX: was findByIdAndUpdate (no org scoping)
    data,
    { new: true },
  );
  if (!item) throw new ApiError(404, "Allocated item not found");

  res.json({ success: true, message: "Allocated item updated", data: item });
});

// ─────────────────────────────────────────────
//  DELETE /api/allocated-items/:id
// ─────────────────────────────────────────────
const deleteAllocatedItem = asyncHandler(async (req, res) => {
  // FIX: was findByIdAndDelete (no org scoping) — use findOneAndDelete with orgFilter
  const item = await AllocatedItems.findOneAndDelete({
    _id: req.params.id,
    ...req.orgFilter,
  });
  if (!item) throw new ApiError(404, "Allocated item not found");
  res.json({ success: true, message: "Item deleted successfully" });
});

// Alias — same as getItemsByEmployee, kept for route flexibility
const getItemsByEmployeeId = getItemsByEmployee;

export {
  createAllocatedItem,
  getAllAllocatedItems,
  getAllocatedItemById,
  getItemsByEmployee,
  updateAllocatedItem,
  deleteAllocatedItem,
  getItemsByEmployeeId,
};