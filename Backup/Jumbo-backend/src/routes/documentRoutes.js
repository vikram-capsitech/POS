const express = require("express");
const router = express.Router();

const {
  createDocument,
  getAllDocuments,
  getDocumentsByEmployee,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController");
const { upload } = require("../config/cloudinary");

// CREATE DOCUMENT
router.post("/", upload.single("doc"), createDocument);

// GET ALL DOCUMENTS
router.get("/", getAllDocuments);

// GET DOCUMENTS BY EMPLOYEE
router.get("/employee/:id", getDocumentsByEmployee);

// UPDATE DOCUMENT (with or without file)
router.put("/:id", upload.single("doc"), updateDocument);

// DELETE DOCUMENT
router.delete("/:id", deleteDocument);

module.exports = router;
