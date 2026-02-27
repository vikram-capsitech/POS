require("../models/Employee");
const express = require("express");
const { uploadPhoto } = require("../config/cloudinary.js");
const {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getCurrentEmployeeProfile,
  getEmployeeOverview,
  receiveAllotedItem,
} = require("../controllers/employeeController");
const { protect, isEmployee } = require("../middleware/authMiddleware");

const router = express.Router();

// Employee routes
router
  .route("/")
  .post(protect, isEmployee, uploadPhoto.single("profilePhoto"), addEmployee) //protect, isAdmin,
  .get(protect, getAllEmployees); //protect,

// Get current employee profile
router.route("/profile").get(protect, getCurrentEmployeeProfile);
router.get("/overview/:employeeId", protect, getEmployeeOverview);
router.put("/received/:id", protect, receiveAllotedItem);

router
  .route("/:id")
  .get(protect, getEmployeeById)
  .put(
    protect,
    isEmployee,
    uploadPhoto.single("profilePhoto"),
    updateEmployeeById,
  )
  .delete(protect, isEmployee, deleteEmployeeById);

module.exports = router;
