import express from "express";
import { upload } from "../../Utils/Cloudinary.js";
import { protect, checkPermission } from "../../Middlewares/Auth.middleware.js";
import {
  createDocument,
  getAllDocuments,
  getDocumentsByEmployee,
  updateDocument,
  deleteDocument,
} from "../../Controller/workforce/documentController.js";

const router = express.Router();

router.post(
  "/",
  protect,
  checkPermission("document:manage"),
  upload.single("doc"),
  createDocument,
);
router.get("/", protect, checkPermission("document:read"), getAllDocuments);
router.get(
  "/employee/:id",
  protect,
  checkPermission("document:read"),
  getDocumentsByEmployee,
);
router.put(
  "/:id",
  protect,
  checkPermission("document:manage"),
  upload.single("doc"),
  updateDocument,
);
router.delete(
  "/:id",
  protect,
  checkPermission("document:manage"),
  deleteDocument,
);

export default router;
