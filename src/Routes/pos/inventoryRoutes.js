import express from "express";
import { protect, checkPermission } from "../../middleware/authMiddleware.js";
import {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest,
} from "../../controllers/pos/inventoryController.js";

const router = express.Router();

// any staff can raise a request, only managers/admins can view all & approve
router.post("/",    protect, createRequest);
router.get( "/",    protect, checkPermission("staff:read"),  getRequests);

router.put(   "/:id", protect, checkPermission("staff:write"), updateRequest);
router.delete("/:id", protect, checkPermission("staff:write"), deleteRequest);

export default router;