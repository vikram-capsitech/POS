import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createAllocatedItem,
  getAllAllocatedItems,
  getAllocatedItemById,
  getItemsByEmployeeId,
  updateAllocatedItem,
  deleteAllocatedItem,
} from "../../Controller/workforce/Alloteditemscontroller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  checkPermission("staff:write"),
  upload.single("image"),
  createAllocatedItem,
);
router.get("/", protect, checkPermission("staff:read"), getAllAllocatedItems);
router.get(
  "/employee/:employeeId",
  protect,
  checkPermission("staff:read"),
  getItemsByEmployeeId,
);
router.get("/:id", protect, getAllocatedItemById);
router.put(
  "/:id",
  protect,
  checkPermission("staff:write"),
  upload.single("image"),
  updateAllocatedItem,
);
router.delete(
  "/:id",
  protect,
  checkPermission("staff:write"),
  deleteAllocatedItem,
);

export default router;
