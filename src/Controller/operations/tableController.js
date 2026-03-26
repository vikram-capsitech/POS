import Table from "../../Models/pos/Table.js";
import Order from "../../Models/pos/Order.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";
import { logUserAction } from "../../Utils/Logger.js";

// ─────────────────────────────────────────────
//  POST /api/tables
// ─────────────────────────────────────────────
const createTable = asyncHandler(async (req, res) => {
  const { number, seats, floor, shape, x, y } = req.body;
  if (!number || !seats)
    throw new ApiError(400, "number and seats are required");

  const exists = await Table.findOne({
    organizationID: req.user.organizationID,
    number,
  });
  if (exists) throw new ApiError(400, `Table number ${number} already exists`);

  const table = await Table.create({
    organizationID: req.user.organizationID,
    number,
    seats,
    floor,
    shape,
    x,
    y,
  });

  await logUserAction(req, "TABLE_CREATED", "POS", table._id, {
    tableNumber: number,
    seats,
    floor: floor || "Ground",
    shape: shape || "square",
  });

  res.status(201).json({ success: true, message: "Table created", data: table });
});

// ─────────────────────────────────────────────
//  GET /api/tables  (filtered for the org)
// ─────────────────────────────────────────────
const getAllTables = asyncHandler(async (req, res) => {
  const { status, floor } = req.query;
  const query = { organizationID: req.user.organizationID };
  if (status) query.status = status;
  if (floor) query.floor = floor;

  const tables = await Table.find(query)
    .populate("currentOrderID", "total status waiterName")
    .sort({ number: 1 });

  res.json({ success: true, count: tables.length, data: tables });
});

// ─────────────────────────────────────────────
//  GET /api/tables/:id
// ─────────────────────────────────────────────
const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id).populate({
    path: "currentOrderID",
    populate: { path: "items.menuItem", select: "name price" },
  });
  if (!table) throw new ApiError(404, "Table not found");
  res.json({ success: true, data: table });
});

// ─────────────────────────────────────────────
//  PUT /api/tables/:id   (general update)
// ─────────────────────────────────────────────
const updateTable = asyncHandler(async (req, res) => {
  const before = await Table.findById(req.params.id).lean();
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!table) throw new ApiError(404, "Table not found");

  await logUserAction(req, "TABLE_UPDATED", "POS", table._id, {
    tableNumber: table.number,
    changes: req.body,
    previousStatus: before?.status,
  });

  res.json({ success: true, message: "Table updated", data: table });
});

// ─────────────────────────────────────────────
//  PATCH /api/tables/:id/status
// ─────────────────────────────────────────────
const updateTableStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const VALID = ["available", "occupied", "reserved", "billing", "cleaning"];
  if (!VALID.includes(status))
    throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);

  const before = await Table.findById(req.params.id).lean();
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!table) throw new ApiError(404, "Table not found");

  await logUserAction(req, "TABLE_STATUS_CHANGED", "POS", table._id, {
    tableNumber: table.number,
    previousStatus: before?.status,
    newStatus: status,
  });

  // Emit to socket for real-time floor plan update
  req.app.get("io")?.to(`ADMIN_${req.organizationID}`).emit("TABLE_EVENT", {
    event: "TABLE_STATUS_CHANGED",
    tableId: table._id,
    tableNumber: table.number,
    status,
  });

  res.json({ success: true, message: "Table status updated", data: table });
});

// ─────────────────────────────────────────────
//  DELETE /api/tables/:id
// ─────────────────────────────────────────────
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) throw new ApiError(404, "Table not found");

  await logUserAction(req, "TABLE_DELETED", "POS", table._id, {
    tableNumber: table.number,
    seats: table.seats,
    floor: table.floor,
  });

  res.json({ success: true, message: "Table deleted" });
});

// ─────────────────────────────────────────────
//  POST /api/tables/bulk
// ─────────────────────────────────────────────
const createBulkTables = asyncHandler(async (req, res) => {
  const { tables } = req.body;
  if (!Array.isArray(tables) || !tables.length) {
    throw new ApiError(400, "tables array is required");
  }

  const numbers = tables.map((t) => t.number);
  const existingNums = await Table.distinct("number", {
    organizationID: req.user.organizationID,
    number: { $in: numbers },
  });
  if (existingNums.length) {
    throw new ApiError(400, `Table numbers already exist: ${existingNums.join(", ")}`);
  }

  const created = await Table.insertMany(
    tables.map((t) => ({ ...t, organizationID: req.user.organizationID })),
  );

  await logUserAction(req, "TABLES_BULK_CREATED", "POS", null, {
    count: created.length,
    tableNumbers: numbers,
  });

  res.status(201).json({ success: true, count: created.length, data: created });
});

// ─────────────────────────────────────────────
//  GET /api/tables  (simplified, no filters)
// ─────────────────────────────────────────────
const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ organizationID: req.user.organizationID })
    .sort({ number: 1 });
  res.json({ success: true, count: tables.length, data: tables });
});

// ─────────────────────────────────────────────
//  POST /api/tables/:id/clean
//  Waiter marks table cleaned (with optional photo)
//  Table must be in "cleaning" state first
// ─────────────────────────────────────────────
const cleanTable = asyncHandler(async (req, res) => {
  const { cleaningPhoto } = req.body;
  const table = await Table.findById(req.params.id);
  if (!table) throw new ApiError(404, "Table not found");
  if (table.status !== "cleaning")
    throw new ApiError(400, "Table is not in cleaning state");

  table.status = "available";
  table.cleaningPhoto = cleaningPhoto ?? null;
  table.lastCleanedAt = new Date();
  await table.save();

  await logUserAction(req, "TABLE_CLEANED", "POS", table._id, {
    tableNumber: table.number,
    floor: table.floor,
    photoProvided: !!cleaningPhoto,
    cleanedAt: table.lastCleanedAt,
  });

  res.json({ success: true, message: "Table marked clean & available", data: table });
});

export {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  updateTableStatus,
  deleteTable,
  createBulkTables,
  getTables,
  cleanTable,
};
