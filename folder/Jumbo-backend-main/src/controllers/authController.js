const User = require("../models/base/User");
const { generateToken } = require("../utils/generateToken");
const asyncHandler = require("express-async-handler");
const { verifyGoogleToken } = require("../utils/verifyGoogleToken");

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = asyncHandler(async (req, res) => {
  // Support both 'email' and 'username' fields for login
  const { email, username, password, device } = req.body;

  // Use email if provided, otherwise use username
  const loginIdentifier = email || username;

  if (!loginIdentifier || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide both email/username and password",
    });
  }

  try {
    // Find user by email (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp("^" + loginIdentifier + "$", "i") },
    }).select("+password"); // Explicitly include password for comparison

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if password matches
    let isMatch = false;
    try {
      isMatch = await user.matchPassword(password);
    } catch (error) {
      console.error("Error comparing passwords:", error);
      return res.status(500).json({
        success: false,
        message: "Error during authentication",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    let employeeData = null;

    if (user.role === "employee") {
      employeeData = user; //await Employee.findById( user._id );

      if (!employeeData) {
        return res.status(403).json({
          success: false,
          message: "Employee record not found",
        });
      }
    }
    // DEVICE + ROLE + POSITION VALIDATION
    if (device === "web") {
      // WEB LOGIN RULES
      if (user.role === "employee") {
        if (employeeData.position !== "manager") {
          return res.status(403).json({
            success: false,
            message: "Employees can't Access Admin Panel",
          });
        }
      }

      // admin & superadmin are allowed directly on web
    } else {
      // MOBILE LOGIN RULES
      if (user.role !== "employee") {
        return res.status(403).json({
          success: false,
          message: "Only employees can login on mobile",
        });
      }

      if (employeeData.position !== "employee") {
        return res.status(403).json({
          success: false,
          message: "Managers are not allowed on mobile app",
        });
      }
    }

    const tokenPayload = {
      id: user._id,
      role: user.role,
      position: user.role === "employee" ? user.position : user.role,
      restaurantID: user.restaurantID,
    };

    // Build response object with basic user info
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantID : user.restaurantID,
      token: generateToken(tokenPayload),
    };

    // Add employee-specific fields if user is an employee
    if (user.role === "employee") {
      responseData.restaurantID = user.restaurantID;
      responseData.position = user.position;
      responseData.salary = user.salary;
      responseData.totalLeave = user.totalLeave || 4;
      responseData.leaveTaken = user.leaveTaken || 0;
      responseData.hireDate = user.hireDate;
      responseData.status = user.status;
      responseData.profilePhoto = user.profilePhoto;
      responseData.fcmToken = user?.fcmToken;
      responseData.access = user.access || [];
    }
    res.json(responseData);
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);

    // More specific error messages
    let errorMessage = "Server error during login";
    if (error.name === "MongoError") {
      errorMessage = "Database error occurred";
    } else if (error.name === "ValidationError") {
      errorMessage = "Validation error";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      errorType: error.name,
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");

  if (user) {
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      restaurantID: user.restaurantID,
      profilePhoto: user.profilePhoto,
      access: user.access,
      position: user.position,
    };

    // Add employee-specific fields if user is an employee
    if (user.role === "employee") {
      responseData.position = user.position;
      responseData.salary = user.salary;
      responseData.totalLeave = user.totalLeave || 4;
      responseData.leaveTaken = user.leaveTaken || 0;
      responseData.hireDate = user.hireDate;
      responseData.status = user.status;
      responseData.access = user.access || [];
    }

    res.json(responseData);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  // message("id get");
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken({
        id: updatedUser._id,
        role: updatedUser.role,
        // restaurantID: updatedUser.restaurantID,
      }),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Setup initial super admin (one-time use)
// @route   POST /api/auth/setup
// @access  Public
exports.setupSuperAdmin = asyncHandler(async (req, res) => {
  // Check if superadmin already exists
  const existingSuperAdmin = await User.findOne({ role: "superadmin" });

  if (existingSuperAdmin) {
    res.status(400);
    throw new Error("Super admin already exists");
  }

  const { name, email, password } = req.body;

  // Create super admin
  const superAdmin = await User.create({
    name: name || "Super Admin",
    email: email || "superadmin@jumbo.com",
    password: password || "SuperAdmin@jumbo",
    role: "superadmin",
  });

  if (superAdmin) {
    res.status(201).json({
      _id: superAdmin._id,
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role,
      token: generateToken({
        id: superAdmin._id,
        role: superAdmin.role,
      }),
    });
  } else {
    res.status(400);
    throw new Error("Invalid super admin data");
  }
});

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error("Please provide both current and new password");
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error("New password must be at least 6 characters long");
  }

  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Verify current password
  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error("Current password is incorrect");
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: "Password updated successfully",
  });
});

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body; // Google token from frontend

    if (!credential) {
      return res.status(400).json({ message: "Token is required" });
    }

    const payload = await verifyGoogleToken(credential);

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token" });
    }

    const { email } = payload;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "Access Denied. You are not allowed to use this system.",
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    const responseData = {
      success: true,
      token,
      ...user._doc,
    };

    // Ensure employee fields are included
    if (user.role === "employee") {
      responseData.totalLeave = user.totalLeave || 4;
      responseData.leaveTaken = user.leaveTaken || 0;
    }

    return res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update FCM token for push notifications
// @route   PUT /api/auth/fcm-token
// @access  Private
exports.updateFCMToken = asyncHandler(async (req, res) => {
  const { fcmToken } = req.body;

  if (!fcmToken) {
    res.status(400);
    throw new Error("FCM token is required");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update FCM token
  user.fcmToken = fcmToken;
  await user.save();


  res.json({
    success: true,
    message: "FCM token updated successfully",
  });
});
