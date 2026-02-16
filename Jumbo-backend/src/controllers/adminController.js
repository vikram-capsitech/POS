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
    }).select("-password").populate("restaurantID");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found or not an admin/superadmin",
      });
    }
    const restaurantObj = user.restaurantID;
    const restaurantID = restaurantObj?._id;

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
        restaurant: restaurantObj, // Ensure frontend can access via .restaurant
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

    const admin = await User.findOne({
      _id: adminId,
      role: { $in: ["admin", "superadmin"] },
    });

    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // email uniqueness
    const { email } = req.body;
    if (email && email !== admin.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
    }

    // ✅ only update user/admin fields here
    const userAllowed = ["name", "address", "phoneNumber", "email", "gender", "monthlyfee"];
    userAllowed.forEach((k) => {
      if (req.body[k] !== undefined) admin[k] = req.body[k];
    });

    // ✅ profile photo
    if (req.files?.profilePhoto?.[0]) {
      admin.profilePhoto = req.files.profilePhoto[0].path; // cloudinary url
    }

    await admin.save();

    // ✅ restaurant update
    let restaurantData = null;
    if (admin.restaurantID) {
      const restaurant = await Restaurant.findById(admin.restaurantID);

      if (restaurant) {
        // Map UI payload fields -> Restaurant schema
        if (req.body.organizationName !== undefined) restaurant.name = req.body.organizationName;
        if (req.body.gstIn !== undefined) restaurant.gstIn = req.body.gstIn;
        if (req.body.fssaiLicense !== undefined) restaurant.fssaiLicense = req.body.fssaiLicense;
        if (req.body.contactPhone !== undefined) restaurant.contactPhone = req.body.contactPhone;

        // ✅ restaurant logo
        if (req.files?.restaurantLogo?.[0]) {
          restaurant.logo = req.files.restaurantLogo[0].path; // cloudinary url
        }

        await restaurant.save();
        restaurantData = restaurant.toObject();
      }
    }

    const { password, ...safeAdmin } = admin.toObject();

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      data: {
        admin: safeAdmin,
        restaurant: restaurantData,
      },
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
    const { email, name, organizationName, restaurantName, restaurantAddress, gstIn, fssaiLicense, contactPhone } =
      req.body;

    // Handle files (profilePhoto and restaurantLogo)
    let profilePhoto = null;
    let restaurantLogo = null;

    if (req.files) {
        if (req.files.profilePhoto && req.files.profilePhoto.length > 0) {
            profilePhoto = req.files.profilePhoto[0].path;
        }
        if (req.files.restaurantLogo && req.files.restaurantLogo.length > 0) {
            restaurantLogo = req.files.restaurantLogo[0].path;
        }
    } else if (req.file) {
        // Fallback for single file upload if only profilePhoto sent via .single() (though route changed to .fields())
        profilePhoto = req.file.path;
    }

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
      contactEmail: email, // Admin email as default contact email
      logo: restaurantLogo,
      gstIn,
      fssaiLicense,
      contactPhone,
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

exports.updateRestaurantTheme = asyncHandler(async (req, res) => {
  const { theme, modules } = req.body;
  const user = req.user;

  let restaurantID = user.restaurant;

  // If superadmin and trying to update a specific restaurant via params
  if (user.role === "superadmin" && req.params.id) {
    restaurantID = req.params.id;
  }

  if (!restaurantID) {
    return res.status(400).json({
      success: false,
      message: "Restaurant ID required",
    });
  }

  const updateData = {};
  if (theme) updateData.theme = theme;
  if (modules) updateData.modules = modules;

  const updatedRestaurant = await Restaurant.findByIdAndUpdate(
    restaurantID,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedRestaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  res.status(200).json({
    success: true,
    data: updatedRestaurant,
  });
});
