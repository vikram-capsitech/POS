import express from "express";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} from "../../Controller/operations/tableController.js";

const router = express.Router();

router.get("/", protect, getTables);
router.post("/", protect, checkPermission("staff:write"), createTable);

router.get("/:id", protect, getTableById);
router.put("/:id", protect, updateTable); // any staff can update table status
router.delete("/:id", protect, checkPermission("staff:write"), deleteTable);

export default router;
