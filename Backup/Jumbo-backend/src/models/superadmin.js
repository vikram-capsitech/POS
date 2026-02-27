const dotenv = require("dotenv");
const User = require("./base/User");
const connectDB = require("../config/db");

dotenv.config();
connectDB();

const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({ email: "SuperAdmin@jumbo.com" });
    if (existing) {
      console.log("✅ Super Admin already exists!");
      process.exit();
    }

    console.log("Creating superadmin user...");
    const user = new User({
      name: "Super Admin",
      email: "SuperAdmin@jumbo.com",
      password: "SuperAdmin@jumbo", // Let the User model handle hashing
      role: "superadmin",
      phoneNumber: "7014401520",
    });

    // This will trigger the pre-save hook to hash the password
    await user.save();

    console.log("User created:", {
      id: user._id,
      email: user.email,
      role: user.role,
      password: user.password ? "*** (hashed)" : "MISSING PASSWORD",
    });

    console.log("🎉 SuperAdmin created successfully!");
    console.log("Email: SuperAdmin@jumbo.com");
    console.log("Password: SuperAdmin@jumbo");
    console.log("To log in, use the email and password above.");
    process.exit();
  } catch (error) {
    console.error("Error seeding superadmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();
