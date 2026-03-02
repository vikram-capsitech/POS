const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const User = require("./src/models/base/User");
const Restaurant = require("./src/models/Restaurant");
const Admin = require("./src/models/Admin");
const Employee = require("./src/models/Employee");

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log("🌱 Clearing existing data...");
    // clear all data
    await User.deleteMany({});
    await Restaurant.deleteMany({});

    console.log("🍽️  Creating Restaurant...");
    const restaurant = await Restaurant.create({
      name: "Jumbo Foods Test",
      address: "123 Test Street, Food City",
      contactEmail: "contact@jumbofoods.com",
    });

    console.log("👤 Creating Users...");

    // 1. Super Admin
    // Register SuperAdmin discriminator (required because User has other discriminators)
    const SuperAdminSchema = new mongoose.Schema({});
    let SuperAdmin;
    try {
      SuperAdmin = User.discriminator("superadmin", SuperAdminSchema);
    } catch (e) {
      SuperAdmin = mongoose.model("superadmin");
    }

    await SuperAdmin.create({
      name: "Super Admin",
      email: "superadmin@example.com",
      password: "SuperAdmin@123",
      role: "superadmin",
      phoneNumber: "1111111111",
      status: "active",
      organizationName: "Jumbo HQ",
    });

    // 2. Admin (Restaurant Owner/Manager)
    await Admin.create({
      name: "Test Admin",
      email: "admin@example.com",
      password: "Admin@123",
      role: "admin",
      phoneNumber: "2222222222",
      status: "active",
      restaurantID: restaurant._id,
      organizationName: "Jumbo Foods Test",
      monthlyfee: "1000",
    });

    // 3. Employee (Kitchen Staff)
    await Employee.create({
      name: "Kitchen Staff",
      email: "kitchen@example.com",
      password: "Employee@123",
      role: "employee",
      phoneNumber: "3333333333",
      status: "active",
      restaurantID: restaurant._id,
      jobRole: "kitchenStaff",
      position: "Chef",
      salary: 3000,
      salaryStatus: "Pending",
      joinDate: new Date(),
      leavesProvided: 4,
      CoinsPerMonth: 100,
    });

    // 4. Employee (Counter Staff)
    await Employee.create({
      name: "Counter Staff",
      email: "counter@example.com",
      password: "Employee@123",
      role: "employee",
      phoneNumber: "4444444444",
      status: "active",
      restaurantID: restaurant._id,
      jobRole: "counterStaff",
      position: "Cashier",
      salary: 2500,
      salaryStatus: "Pending",
      joinDate: new Date(),
      leavesProvided: 4,
      CoinsPerMonth: 100,
    });

    console.log("\n✅ Database Seeded Successfully!\n");
    console.log("==========================================");
    console.log("🔐 TEST CREDENTIALS");
    console.log("==========================================");
    console.log("1️⃣  SUPER ADMIN");
    console.log("   Email:    superadmin@example.com");
    console.log("   Password: SuperAdmin@123");
    console.log("------------------------------------------");
    console.log("2️⃣  RESTAURANT ADMIN");
    console.log("   Email:    admin@example.com");
    console.log("   Password: Admin@123");
    console.log("------------------------------------------");
    console.log("3️⃣  KITCHEN STAFF");
    console.log("   Email:    kitchen@example.com");
    console.log("   Password: Employee@123");
    console.log("------------------------------------------");
    console.log("4️⃣  COUNTER STAFF");
    console.log("   Email:    counter@example.com");
    console.log("   Password: Employee@123");
    console.log("==========================================");

    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
