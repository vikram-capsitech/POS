import express from "express";
import { protect, checkPermission } from "../../middleware/authMiddleware.js";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../controllers/pos/menuController.js";

const router = express.Router();

router.get( "/", protect, getMenuItems);
router.post("/", protect, checkPermission("staff:write"), createMenuItem);

router.put(   "/:id", protect, checkPermission("staff:write"), updateMenuItem);
router.delete("/:id", protect, checkPermission("staff:write"), deleteMenuItem);

export default router;