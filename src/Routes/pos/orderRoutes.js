import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  addOrderItems,
  deleteOrder,
} from "../../Controller/operations/orderController.js";

const router = express.Router();

router.get("/", protect, getOrders);
router.post("/", protect, createOrder); // any staff can create an order

router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder); // update status, etc.
router.post("/:id/items", protect, addOrderItems); // add items to existing order
router.delete("/:id", protect, checkPermission("staff:write"), deleteOrder);

export default router;
