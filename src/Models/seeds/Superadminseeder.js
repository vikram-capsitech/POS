import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/core/User.js";

dotenv.config();

const seedSuperAdmin = async () => {
  await connectDB();

  try {
    const existing = await User.findOne({ email: "superadmin@platform.com" });

    if (existing) {
      console.log("✅ SuperAdmin already exists, skipping.");
      process.exit(0);
    }

    const user = new User({
      userName:    "superadmin",
      displayName: "Super Admin",
      email:       "superadmin@platform.com",
      password:    "SuperAdmin@123",   // pre-save hook will hash this
      phoneNumber: "0000000000",
      systemRole:  "superadmin",
      organizationID: null,            // superadmin has no org
      roleID:         null,
      isEmailVerified: true,
    });

    await user.save();

    console.log("🎉 SuperAdmin created successfully!");
    console.log("─────────────────────────────────────");
    console.log("Email    : superadmin@platform.com");
    console.log("Password : SuperAdmin@123");
    console.log("─────────────────────────────────────");
    console.log("⚠️  Change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding SuperAdmin:", error);
    process.exit(1);
  }
};

seedSuperAdmin();