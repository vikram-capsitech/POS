import express from "express";
import { upload } from "../../Utils/cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
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
  checkPermission("sop:write"),
  upload.single("voiceNote"),
  createSOP,
);
router.post("/filter", protect, checkPermission("sop:read"), getSOPByFilter);
router.get("/", protect, checkPermission("sop:read"), getAllSOPs);

router.get("/:id", protect, getSOPById);
router.put(
  "/:id",
  protect,
  checkPermission("sop:write"),
  upload.single("voiceNote"),
  updateSOP,
);
router.delete("/:id", protect, checkPermission("sop:write"), deleteSOP);

export default router;
