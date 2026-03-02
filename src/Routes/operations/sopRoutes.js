import express from "express";
import { upload } from "../../Utils/Cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import {
  createSOP,
  getAllSOPs,
  getSOPByFilter,
  getSOPById,
  updateSOP,
  deleteSOP,
} from "../../Controller/operations/sopController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  orgScope,
  checkPermission("sop:write"),
  upload.single("voiceNote"),
  createSOP,
);
router.post(
  "/filter",
  protect,
  orgScope,
  checkPermission("sop:read"),
  getSOPByFilter,
);
router.get("/", protect, orgScope, checkPermission("sop:read"), getAllSOPs);

router.get("/:id", protect, orgScope, getSOPById);
router.put(
  "/:id",
  protect,
  orgScope,
  checkPermission("sop:write"),
  upload.single("voiceNote"),
  updateSOP,
);
router.delete(
  "/:id",
  protect,
  orgScope,
  checkPermission("sop:write"),
  deleteSOP,
);

export default router;
