import InventoryRequest from "../../Models/pos/InventoryRequest.js";
import { sendNotification } from "../../Services/Notificationservice.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/inventory
// ─────────────────────────────────────────────
const createInventoryRequest = asyncHandler(async (req, res) => {
  const { item, quantity, urgency, message } = req.body;
  if (!item || !quantity)
    throw new ApiError(400, "item and quantity are required");

  const request = await InventoryRequest.create({
    restaurantId: req.organizationID,
    requestedBy: req.user.id,
    item,
    quantity,
    urgency: urgency ?? "medium",
    message,
  });

  // Notify admins via socket
  req.app.get("io")?.to(`ADMIN_${req.organizationID}`).emit("INVENTORY_EVENT", {
    event: "INVENTORY_REQUEST_CREATED",
    requestId: request._id,
    item,
    urgency: request.urgency,
    requestedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Inventory request created",
    data: request,
  });
});

// ─────────────────────────────────────────────
//  GET /api/inventory
// ─────────────────────────────────────────────
const getAllInventoryRequests = asyncHandler(async (req, res) => {
  const { status, urgency, page = 1, limit = 10 } = req.query;
  const query = { restaurantId: req.organizationID };
  if (status) query.status = status;
  if (urgency) query.urgency = urgency;

  const [requests, total] = await Promise.all([
    InventoryRequest.find(query)
      .populate("requestedBy", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    InventoryRequest.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: requests,
  });
});

// ─────────────────────────────────────────────
//  GET /api/inventory/my  (employee's own requests)
// ─────────────────────────────────────────────
const getMyInventoryRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { requestedBy: req.user.id };
  if (status) query.status = status;

  const requests = await InventoryRequest.find(query).sort({ createdAt: -1 });
  res.json({ success: true, count: requests.length, data: requests });
});

// ─────────────────────────────────────────────
//  GET /api/inventory/:id
// ─────────────────────────────────────────────
const getInventoryRequestById = asyncHandler(async (req, res) => {
  const request = await InventoryRequest.findById(req.params.id).populate(
    "requestedBy",
    "name position",
  );
  if (!request) throw new ApiError(404, "Inventory request not found");
  res.json({ success: true, data: request });
});

// ─────────────────────────────────────────────
//  PATCH /api/inventory/:id/status
// ─────────────────────────────────────────────
const updateInventoryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const VALID = ["pending", "approved", "rejected", "fulfilled"];
  if (!VALID.includes(status))
    throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);

  const request = await InventoryRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!request) throw new ApiError(404, "Inventory request not found");

  // Notify the employee who raised the request
  if (["approved", "rejected", "fulfilled"].includes(status)) {
    await sendNotification(
      request.requestedBy,
      status === "approved" || status === "fulfilled" ? "success" : "error",
      "general",
      `Inventory Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your request for ${request.item} (${request.quantity}) has been ${status}.`,
      { requestId: request._id.toString(), status },
    );
  }

  res.json({
    success: true,
    message: `Request marked as ${status}`,
    data: request,
  });
});

// ─────────────────────────────────────────────
//  DELETE /api/inventory/:id
// ─────────────────────────────────────────────
const deleteInventoryRequest = asyncHandler(async (req, res) => {
  const request = await InventoryRequest.findByIdAndDelete(req.params.id);
  if (!request) throw new ApiError(404, "Inventory request not found");
  res.json({ success: true, message: "Inventory request deleted" });
});

const createRequest = asyncHandler(async (req, res) => {
  const { item, quantity, urgency, message } = req.body;
  if (!item || !quantity)
    throw new ApiError(400, "item and quantity are required");

  const request = await InventoryRequest.create({
    restaurantId: req.organizationID,
    requestedBy: req.user.id,
    item,
    quantity,
    urgency: urgency ?? "medium",
    message,
  });

  // Notify admins via socket
  req.app.get("io")?.to(`ADMIN_${req.organizationID}`).emit("INVENTORY_EVENT", {
    event: "INVENTORY_REQUEST_CREATED",
    requestId: request._id,
    item,
    urgency: request.urgency,
    requestedBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    message: "Inventory request created",
    data: request,
  });
});

const getRequests = asyncHandler(async (req, res) => {
  const { status, urgency, page = 1, limit = 10 } = req.query;
  const query = { restaurantId: req.organizationID };
  if (status) query.status = status;
  if (urgency) query.urgency = urgency;

  const [requests, total] = await Promise.all([
    InventoryRequest.find(query)
      .populate("requestedBy", "name position")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit)),
    InventoryRequest.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
    data: requests,
  });
});

export {
  createInventoryRequest,
  getAllInventoryRequests,
  getMyInventoryRequests,
  getInventoryRequestById,
  updateInventoryStatus,
  deleteInventoryRequest,
  createRequest,
  getRequests,
};
