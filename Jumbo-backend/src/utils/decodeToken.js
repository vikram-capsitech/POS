const jwt = require("jsonwebtoken");
const User = require("../models/base/User");

const decodeToken = async (req) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // If admin, return restaurantID for web dashboard context
      if (decoded.role === "admin" || decoded.position === "manager") {
        // Return restaurantID if it exists, otherwise return null
        // This allows admins without restaurantID to still login
        return decoded.restaurantID || null;
      }

      // If employee (app), return employee ID
      return decoded.id;
    } catch (error) {
      console.error("Error decoding token:", error);
      throw error;
    }
  } else {
    console.log("no id");
  }
};
const decodeAdminUser = async (req) => {
  if (!req.headers.authorization?.startsWith("Bearer")) {
    return null;
  }

  try {
    const token = req.headers.authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sirf admin / manager allow
    if (decoded.role !== "admin") {
      throw new Error("Unauthorized access");
    }

    const adminUser = await User.findById(decoded.id).select("-password");

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    return adminUser;
  } catch (error) {
    console.error("Error decoding admin token:", error);
    throw error;
  }
};

module.exports = {
  decodeToken,
  decodeAdminUser,
};


