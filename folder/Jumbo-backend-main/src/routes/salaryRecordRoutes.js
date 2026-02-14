const express = require("express");
const router = express.Router();

const {
  createRecord,
  getSalarySummary,
  getRecord,
  deleteRecord,
} = require("../controllers/salaryRecordController");
const { protect } = require("../middleware/authMiddleware.js");
router.post("/", protect, createRecord);
router.get("/", protect, getSalarySummary);
router.get("/:id", getRecord);
router.delete("/:id", deleteRecord);

module.exports = router;
