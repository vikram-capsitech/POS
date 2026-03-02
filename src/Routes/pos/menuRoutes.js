import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { upload } from "../../Middlewares/Multer.middleware.js";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../Controller/operations/menuController.js";

const router = express.Router();

router.get("/", protect, getMenuItems);
router.post(
  "/",
  protect,
  checkPermission("menu:write"),
  upload.single("image"),
  createMenuItem,
);
router.put(
  "/:id",
  protect,
  checkPermission("menu:write"),
  upload.single("image"),
  updateMenuItem,
);
router.delete("/:id", protect, checkPermission("menu:delete"), deleteMenuItem);

export default router;
