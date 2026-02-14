const express = require("express");
const router = express.Router();

const { upload } = require("../config/cloudinary");
const {
  createAllocatedItem,
  getAllAllocatedItems,
  getAllocatedItemById,
  updateAllocatedItem,
  deleteAllocatedItem,
  getItemsByEmployeeId,
} = require("../controllers/allotedItemsController");

// CREATE ITEM
router.post("/", upload.single("image"), createAllocatedItem);

// GET ALL ITEMS
router.get("/", getAllAllocatedItems);

// GEt by id
router.get("/:id", getAllocatedItemById);

// GET ITEMS BY EMPLOYEE
router.get("/employee/:employeeId", getItemsByEmployeeId);

// UPDATE ITEM
router.put("/:id", upload.single("image"), updateAllocatedItem);

// DELETE ITEM
router.delete("/:id", deleteAllocatedItem);

module.exports = router;
