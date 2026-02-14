const jwt = require("jsonwebtoken");
const User = require("../models/base/User");

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized, user not found",
        });
      }

      // Add user data to the request object
      req.user = {
        id: user._id,
        role: user.role,
        restaurant: user.restaurantID,
      };

      next();
    } catch (error) {
      console.error("JWT Error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    next();
  };
};

// Specific role checkers for better readability
const isSuperAdmin = authorize("superadmin");
const isAdmin = authorize("superadmin", "admin");
const isEmployee = authorize("superadmin", "admin", "employee");

module.exports = {
  protect,
  authorize,
  isSuperAdmin,

  isEmployee,
};
