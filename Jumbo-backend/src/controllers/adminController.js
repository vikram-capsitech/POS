require("../models/Admin");
const Restaurant = require("../models/Restaurant");
const User = require("../models/base/User");
const asyncHandler = require("express-async-handler");
const { decodeToken } = require("../utils/decodeToken");
const Employee = require("../models/Employee");

exports.getUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["admin"] },
    }).select("-password").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});
exports.getUsersById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["admin", "superadmin"] },
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or not an admin/superadmin",
      });
    }
    const restaurantID = user.restaurantID;

    const totalEmployee = await Employee.countDocuments({
      restaurantID,
      role: "employee",
    });

    const managerCount = await Employee.countDocuments({
      restaurantID,
      position: "manager",
    });

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        totalEmployee,
        managerCount,
      }

    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

exports.updateUserById = asyncHandler(async (req, res) => {
  try {
    const adminId = req.params.id;


    let admin = await User.findOne({
      _id: adminId,
      role: { $in: ["admin", "superadmin"] },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const { email } = req.body;

    if (email && email !== admin.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const disallowedFields = ["password"];

    Object.keys(req.body).forEach((key) => {
      if (!disallowedFields.includes(key)) {
        admin[key] = req.body[key];
      }
    });

    if (req.file) {
      admin.profilePhoto = req.file.path;
    }

    await admin.save();

    const { password, ...safeData } = admin.toObject();

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: safeData,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

exports.deleteAdminById = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Admin not found" });
    res.status(201).json({ message: "Admin Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.addRestaurant = asyncHandler(async (req, res) => {
  const { name, address, contactEmail } = req.body;

  // Create restaurant
  const restaurant = await Restaurant.create({
    name,
    address,
    contactEmail,
  });

  res.status(201).json({
    success: true,
    data: restaurant,
  });
});

exports.addAdmin = asyncHandler(async (req, res) => {
  
  try {
    const { email, name, organizationName, restaurantName, restaurantAddress } =
      req.body;
    const profilePhoto = req.file ? req.file.path : null;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // Create a new Restaurant for this admin
    const restaurant = await Restaurant.create({
      name: restaurantName || name,
      organizationName: organizationName,
      address: restaurantAddress || "Not specified",
      contactEmail: email,
    });

    // Create admin user with the new restaurant ID
    const admin = await User.create({
      ...req.body,
      password: req.body.password || "123456", // Default password
      profilePhoto,
      role: "admin",
      restaurantID: restaurant._id, // Use the newly created restaurant's ID
    });

    // Add admin to restaurant's admin list
    restaurant.admins.push(admin._id);
    await restaurant.save();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = admin.toObject();

    res.status(201).json({
      success: true,
      message: "Admin and restaurant created successfully",
      data: {
        admin: userWithoutPassword,
        restaurant: {
          id: restaurant._id,
          name: restaurant.name,
          address: restaurant.address,
        },
      },
    });

  } catch (error) {
    console.error("Error adding admin:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

exports.getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find().populate("admins", "name email");

  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants,
  });
});
