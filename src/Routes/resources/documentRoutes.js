import express from "express";
import { upload } from "../config/cloudinary.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import {
  createDocument,
  getAllDocuments,
  getDocumentsByEmployee,
  updateDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post("/",              protect, checkPermission("document:manage"), upload.single("doc"), createDocument);
router.get( "/",              protect, checkPermission("document:read"),   getAllDocuments);
router.get( "/employee/:id",  protect, checkPermission("document:read"),   getDocumentsByEmployee);
router.put( "/:id",           protect, checkPermission("document:manage"), upload.single("doc"), updateDocument);
router.delete("/:id",         protect, checkPermission("document:manage"), deleteDocument);

export default router;