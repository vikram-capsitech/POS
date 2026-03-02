import Table from "../../Models/pos/Table.js";
import Order from "../../Models/pos/Order.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/tables
// ─────────────────────────────────────────────
const createTable = asyncHandler(async (req, res) => {
  const { number, seats, floor, shape, x, y } = req.body;
  if (!number || !seats)
    throw new ApiError(400, "number and seats are required");

  // Ensure table number is unique within the restaurant
  const exists = await Table.findOne({
    restaurantId: req.organizationID,
    number,
  });
  if (exists) throw new ApiError(400, `Table number ${number} already exists`);

  const table = await Table.create({
    restaurantId: req.organizationID,
    number,
    seats,
    floor,
    shape,
    x,
    y,
  });

  res
    .status(201)
    .json({ success: true, message: "Table created", data: table });
});

// ─────────────────────────────────────────────
//  GET /api/tables
// ─────────────────────────────────────────────
const getAllTables = asyncHandler(async (req, res) => {
  const { status, floor } = req.query;
  const query = { restaurantId: req.organizationID };
  if (status) query.status = status;
  if (floor) query.floor = floor;

  const tables = await Table.find(query)
    .populate("currentOrderId", "total status waiterName")
    .sort({ number: 1 });

  res.json({ success: true, count: tables.length, data: tables });
});

// ─────────────────────────────────────────────
//  GET /api/tables/:id
// ─────────────────────────────────────────────
const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id).populate({
    path: "currentOrderId",
    populate: { path: "items.menuItem", select: "name price" },
  });
  if (!table) throw new ApiError(404, "Table not found");
  res.json({ success: true, data: table });
});

// ─────────────────────────────────────────────
//  PUT /api/tables/:id
// ─────────────────────────────────────────────
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!table) throw new ApiError(404, "Table not found");
  res.json({ success: true, message: "Table updated", data: table });
});

// ─────────────────────────────────────────────
//  PATCH /api/tables/:id/status
// ─────────────────────────────────────────────
const updateTableStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const VALID = ["available", "occupied", "reserved", "billing"];
  if (!VALID.includes(status))
    throw new ApiError(400, `Status must be one of: ${VALID.join(", ")}`);

  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );
  if (!table) throw new ApiError(404, "Table not found");

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
  res.json({ success: true, message: "Table deleted" });
});

// ─────────────────────────────────────────────
//  POST /api/tables/bulk  (create multiple tables at once)
// ─────────────────────────────────────────────
const createBulkTables = asyncHandler(async (req, res) => {
  const { tables } = req.body;
  if (!Array.isArray(tables) || !tables.length) {
    throw new ApiError(400, "tables array is required");
  }

  // Check for duplicates within the batch and existing tables
  const numbers = tables.map((t) => t.number);
  const existingNums = await Table.distinct("number", {
    restaurantId: req.organizationID,
    number: { $in: numbers },
  });
  if (existingNums.length) {
    throw new ApiError(
      400,
      `Table numbers already exist: ${existingNums.join(", ")}`,
    );
  }

  const created = await Table.insertMany(
    tables.map((t) => ({ ...t, restaurantId: req.organizationID })),
  );

  res.status(201).json({ success: true, count: created.length, data: created });
});

const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ restaurantId: req.organizationID });
  res.json({ success: true, count: tables.length, data: tables });
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
};
