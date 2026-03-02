import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  getRequests,
  createRequest,
  updateInventoryStatus,
  deleteInventoryRequest,
} from "../../Controller/operations/inventoryController.js";

const router = express.Router();

// any staff can raise a request, only managers/admins can view all & approve
router.post("/", protect, createRequest);
router.get("/", protect, checkPermission("staff:read"), getRequests);

router.put(
  "/:id",
  protect,
  checkPermission("staff:write"),
  updateInventoryStatus,
);
router.delete(
  "/:id",
  protect,
  checkPermission("staff:write"),
  deleteInventoryRequest,
);

export default router;
