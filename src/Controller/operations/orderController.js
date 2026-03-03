import asyncHandler from "../../Utils/AsyncHandler.js";
import Order from "../../Models/pos/Order.js";
import Table from "../../Models/pos/Table.js";
import { logUserAction } from "../../Utils/Logger.js";

// ─────────────────────────────────────────────
//  GET /api/pos/orders
// ─────────────────────────────────────────────
const getOrders = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.restaurantId) {
    query.organizationID = req.query.restaurantId;
  } else if (req.organizationID) {
    query.organizationID = req.organizationID;
  }
  const orders = await Order.find(query)
    .populate("items.menuItem", "name price category isVeg")
    .populate("tableID", "number floor seats status")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// ─────────────────────────────────────────────
//  POST /api/pos/orders
// ─────────────────────────────────────────────
const createOrder = asyncHandler(async (req, res) => {
  const { tableID, tableId, items, total, waiterID, orderSource, organizationID, restaurantId } =
    req.body;

  const resolvedTableId = tableID || tableId;
  const resolvedOrgId = organizationID || restaurantId || req.organizationID;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const order = new Order({
    tableID: resolvedTableId,
    organizationID: resolvedOrgId,
    items,
    total,
    finalAmount: total,
    waiterID: waiterID || null,
    orderSource: orderSource || "dine-in",
  });

  const createdOrder = await order.save();

  // Update table to occupied and link order
  let tableNumber = null;
  if (resolvedTableId) {
    const table = await Table.findById(resolvedTableId);
    if (table) {
      table.status = "occupied";
      table.currentOrderID = createdOrder._id;
      await table.save();
      tableNumber = table.number;
    }
  }

  await logUserAction(req, "ORDER_CREATED", "POS", createdOrder._id, {
    tableID: resolvedTableId,
    tableNumber,
    itemCount: items.length,
    total,
    orderSource: orderSource || "dine-in",
  });

  res.status(201).json({ success: true, data: createdOrder });
});

// ─────────────────────────────────────────────
//  PUT /api/pos/orders/:id  — status / payment
// ─────────────────────────────────────────────
const updateOrder = asyncHandler(async (req, res) => {
  const { status, paymentMethod, discount } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  const oldStatus = order.status;

  // STRICT GUARD: Cannot request bill or pay if food is still in kitchen
  if (status === "billing" || status === "paid") {
    if (oldStatus === "pending" || oldStatus === "preparing") {
      res.status(400);
      throw new Error(`Cannot proceed to ${status} — food is still in the kitchen (${oldStatus})`);
    }
  }

  if (status) order.status = status;
  if (discount !== undefined) {
    order.discount = discount;
    order.finalAmount = Math.max(0, order.total - discount);
  }
  if (paymentMethod) order.paymentMethod = paymentMethod;
  if (status === "paid") order.paidAt = new Date();

  const updatedOrder = await order.save();

  // ── Specific action logs based on transition ──
  const actionMap = {
    approved:   "ORDER_APPROVED",
    preparing:  "ORDER_PREPARING",
    ready:      "ORDER_READY",
    served:     "ORDER_SERVED",
    billing:    "ORDER_BILLING_REQUESTED",
    paid:       "ORDER_PAID",
    cancelled:  "ORDER_CANCELLED",
  };

  const action = (status && actionMap[status]) || "ORDER_UPDATED";

  await logUserAction(req, action, "POS", order._id, {
    previousStatus: oldStatus,
    newStatus: status,
    paymentMethod: paymentMethod || null,
    discount: discount || 0,
    finalAmount: updatedOrder.finalAmount ?? updatedOrder.total,
    tableID: order.tableID,
  });

  // ── Table state machine ──
  const resolvedTableId = order.tableID || order.tableId;

  if (status === "paid") {
    // Table goes into cleaning — waiter must mark clean with photo
    const table = await Table.findById(resolvedTableId);
    if (table) {
      table.status = "cleaning";
      table.currentOrderID = null;
      await table.save();

      await logUserAction(req, "TABLE_SET_CLEANING", "POS", table._id, {
        tableNumber: table.number,
        linkedOrderID: order._id,
        paymentMethod,
      });
    }
  } else if (status === "billing") {
    const table = await Table.findById(resolvedTableId);
    if (table) {
      table.status = "billing";
      await table.save();

      await logUserAction(req, "TABLE_SET_BILLING", "POS", table._id, {
        tableNumber: table.number,
        linkedOrderID: order._id,
      });
    }
  }

  res.json({ success: true, data: updatedOrder });
});

// ─────────────────────────────────────────────
//  POST /api/pos/orders/:id/items
// ─────────────────────────────────────────────
const addOrderItems = asyncHandler(async (req, res) => {
  const { items, total } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const prevTotal = order.total || 0;
  order.items = order.items.concat(items);
  order.total = prevTotal + (total || 0);
  order.finalAmount = order.total - (order.discount || 0);

  const updatedOrder = await order.save();

  await logUserAction(req, "ORDER_ITEMS_ADDED", "POS", order._id, {
    addedItemCount: items.length,
    addedTotal: total,
    newTotal: order.total,
    tableID: order.tableID,
    items: items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity, price: i.price })),
  });

  res.json({ success: true, data: updatedOrder });
});

// ─────────────────────────────────────────────
//  GET /api/pos/orders/:id
// ─────────────────────────────────────────────
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("items.menuItem", "name price category isVeg")
    .populate("tableID", "number floor seats status");
  if (order) {
    res.json({ success: true, data: order });
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

// ─────────────────────────────────────────────
//  DELETE /api/pos/orders/:id
// ─────────────────────────────────────────────
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();

  await logUserAction(req, "ORDER_DELETED", "POS", order._id, {
    tableID: order.tableID,
    total: order.total,
    status: order.status,
  });

  res.json({ success: true, message: "Order removed" });
});

export {
  getOrders,
  createOrder,
  updateOrder,
  addOrderItems,
  getOrderById,
  deleteOrder,
};
