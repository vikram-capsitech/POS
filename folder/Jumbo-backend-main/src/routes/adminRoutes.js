const express = require("express");
const router = express.Router();
const {uploadPhoto} = require('../config/cloudinary.js');
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  addRestaurant,
  addAdmin,
  getRestaurants,
  getUsers,
  getUsersById,
  updateUserById,
  deleteAdminById,
} = require("../controllers/adminController");

// All routes are protected and require superadmin role
//router.use(protect, authorize("superadmin"));

// Restaurant routes
router.route("/restaurants").post(addRestaurant).get(getRestaurants);

// Admin user routes
router.post("/admins",protect,uploadPhoto.single("profilePhoto"),addAdmin);
router.get("/users",protect, getUsers);
router.get("/user/:id",protect, authorize("superadmin"), getUsersById);
router.put('/user/:id',protect, authorize("superadmin"),uploadPhoto.single("profilePhoto"),updateUserById);
router.delete('/user/:id',protect,deleteAdminById)

module.exports = router;
