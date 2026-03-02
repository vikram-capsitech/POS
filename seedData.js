// seedData.js
// Run: node seedData.js

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



import Organization from "./src/Models/core/Organization.js";
import User from "./src/Models/core/User.js";
import Role from "./src/Models/core/Role.js";
import EmployeeProfile from "./src/Models/core/EmployeeProfile.js";
import Table from "./src/Models/pos/Table.js";
import MenuItem from "./src/Models/pos/MenuItem.js";
import Order from "./src/Models/pos/Order.js";
import Attendance from "./src/Models/workforce/Attendance.js";
import LeaveRequest from "./src/Models/workforce/LeaveRequest.js";
import SalaryTransaction from "./src/Models/workforce/SalaryTransaction.js";
import SalaryRecord from "./src/Models/workforce/SalaryRecord.js";
import AdvanceRequest from "./src/Models/workforce/AdvanceRequest.js";
import Voucher from "./src/Models/resources/Voucher.js";
import AllocatedItems from "./src/Models/resources/AllocatedItems.js";
import Document from "./src/Models/resources/Document.js";
import Report from "./src/Models/pos/Report.js";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // 0. Clear Existing Data
  console.log("Clearing existing data...");
  await Organization.deleteMany({});
  await User.deleteMany({});
  await Role.deleteMany({});
  await EmployeeProfile.deleteMany({});
  await Table.deleteMany({});
  await MenuItem.deleteMany({});
  await Order.deleteMany({});
  await Attendance.deleteMany({});
  await LeaveRequest.deleteMany({});
  await SalaryTransaction.deleteMany({});
  await SalaryRecord.deleteMany({});
  await AdvanceRequest.deleteMany({});
  await Voucher.deleteMany({});
  await AllocatedItems.deleteMany({});
  await Document.deleteMany({});
  await Report.deleteMany({});
  console.log("Cleanup complete.");



  // 1. Create Organization
  const org = await Organization.create({
    name: "Test Restaurant",
    type: "restaurant",
    slug: "test-restaurant",
    address: "123 Main St, City",
    contactEmail: "org@example.com",
    contactPhone: "9999999999",
    logo: "https://placehold.co/100x100",
    theme: { primary: "#5240d6" },
    meta: { gstIn: "GSTIN1234" },
    modules: { pos: true, hrm: true, inventory: true, payroll: true, ai: true },
    isActive: true,
  });

  // 2. Create Roles
  const roles = {};
  const roleNames = [
    { name: "manager", displayName: "Manager" },
    { name: "staff", displayName: "Staff" },
    { name: "kitchen", displayName: "Kitchen" },
    { name: "waiter", displayName: "Waiter" },
    { name: "cleaner", displayName: "Cleaner" },
    { name: "employee", displayName: "Employee" },
  ];
  for (const r of roleNames) {
    roles[r.name] = await Role.create({
      name: r.name,
      displayName: r.displayName,
      organizationID: org._id,
      permissions: [],
      isDefault: true,
      isActive: true,
    });
  }

  // 3. Create Users (superadmin, admin, and one for each role)
  const users = {};
  users.superadmin = await User.create({
    userName: "superadmin",
    email: "superadmin@example.com",
    displayName: "Super Admin",
    password: "SuperAdmin@1234",
    phoneNumber: "9000000000",
    systemRole: "superadmin",
    isEmailVerified: true,
    status: "Online",
  });
  users.admin = await User.create({
    userName: "adminuser",
    email: "admin@example.com",
    displayName: "Admin User",
    password: "Admin@1234",
    phoneNumber: "9876543210",
    systemRole: "admin",
    organizationID: org._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.manager = await User.create({
    userName: "manageruser",
    email: "manager@example.com",
    displayName: "Manager User",
    password: "Manager@1234",
    phoneNumber: "9111111111",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.manager._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.staff = await User.create({
    userName: "staffuser",
    email: "staff@example.com",
    displayName: "Staff User",
    password: "Staff@1234",
    phoneNumber: "9222222222",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.staff._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.kitchen = await User.create({
    userName: "kitchenuser",
    email: "kitchen@example.com",
    displayName: "Kitchen User",
    password: "Kitchen@1234",
    phoneNumber: "9333333333",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.kitchen._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.waiter = await User.create({
    userName: "waiteruser",
    email: "waiter@example.com",
    displayName: "Waiter User",
    password: "Waiter@1234",
    phoneNumber: "9444444444",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.waiter._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.cleaner = await User.create({
    userName: "cleaneruser",
    email: "cleaner@example.com",
    displayName: "Cleaner User",
    password: "Cleaner@1234",
    phoneNumber: "9555555555",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.cleaner._id,
    isEmailVerified: true,
    status: "Online",
  });
  users.employee = await User.create({
    userName: "employeeuser",
    email: "employee@example.com",
    displayName: "Employee User",
    password: "Employee@1234",
    phoneNumber: "9666666666",
    systemRole: null,
    organizationID: org._id,
    roleID: roles.employee._id,
    isEmailVerified: true,
    status: "Online",
  });

  // 3.1 Create Employee Profiles for Organization Users
  const orgUsers = [
    { user: users.admin, pos: "Admin" },
    { user: users.manager, pos: "Manager" },
    { user: users.staff, pos: "Staff" },
    { user: users.kitchen, pos: "Kitchen" },
    { user: users.waiter, pos: "Waiter" },
    { user: users.cleaner, pos: "Cleaner" },
    { user: users.employee, pos: "Employee" },
  ];

  for (const item of orgUsers) {
    if (!item.user) continue; // safety check
    await EmployeeProfile.create({
      userID: item.user._id,
      organizationID: org._id,
      position: item.pos,
      jobRole: item.pos.toLowerCase(),
      employeeStatus: "active",
      salary: item.pos === "Admin" ? 0 : 20000,
    });
  }
  console.log("Seeded EmployeeProfiles for users.");

  // 4. Seed at least one document for each major model type
  const table = await Table.create({
    organizationID: org._id,
    number: 1,
    seats: 4,
    status: "available",
    floor: "Ground",
    shape: "square",
    x: 0,
    y: 0,
  });
  const menuItem = await MenuItem.create({
    organizationID: org._id,
    name: "Margherita Pizza",
    category: "Pizza",
    price: 299,
    prepTime: 15,
    spiceLevel: 1,
    isVeg: true,
    ingredients: ["cheese", "tomato", "basil"],
    available: true,
    imageUrl: "https://placehold.co/200x200",
    description: "Classic cheese pizza",
    discount: 10,
  });
  const order = await Order.create({
    organizationID: org._id,
    tableID: table._id,
    items: [{ menuItem: menuItem._id, quantity: 2, price: 299 }],
    status: "pending",
    orderSource: "dine-in",
    total: 598,
    discount: 0,
    finalAmount: 598,
    waiterID: users.waiter._id,
    note: "No onions",
  });
  const attendance = await Attendance.create({
    organizationID: org._id,
    userID: users.staff._id,
    date: new Date(),
    checkIn: new Date(),
    checkOut: null,
    hoursWorked: 0,
    overtime: 0,
    status: "On time",
    selfie: null,
    location: { lat: 0, lng: 0 },
    dressCheck: true,
    dressReason: "",
  });
  const leaveRequest = await LeaveRequest.create({
    organizationID: org._id,
    title: "Sick Leave",
    reason: "Fever",
    createdBy: users.employee._id,
    startDate: new Date(),
    endDate: new Date(),
    status: "Pending",
    isAuthorizedLeave: false,
    approvedBy: users.manager._id,
    type: "leave",
  });
  const salaryTransaction = await SalaryTransaction.create({
    organizationID: org._id,
    employee: users.employee._id,
    amount: 20000,
    type: "salary",
    processedBy: users.admin._id,
    note: "Monthly salary",
  });
  const salaryRecord = await SalaryRecord.create({
    organizationID: org._id,
    employee: users.employee._id,
    amount: 20000,
    status: "Paid",
  });
  const advanceRequest = await AdvanceRequest.create({
    organizationID: org._id,
    employee: users.employee._id,
    askedMoney: 5000,
    remainingBalance: 15000,
    description: "Advance for medical",
    createdBy: users.employee._id,
    status: "Pending",
    type: "advance",
  });
  const voucher = await Voucher.create({
    organizationID: org._id,
    title: "Welcome Bonus",
    description: "Bonus for new joiners",
    coins: 100,
    createdBy: users.admin._id,
    assignType: "ALL",
    status: "Active",
    timeline: { startDate: new Date(), endDate: new Date(Date.now() + 7*24*60*60*1000) },
  });
  const allocatedItem = await AllocatedItems.create({
    organizationID: org._id,
    itemName: "Uniform",
    image: "https://placehold.co/100x100",
    issuedTo: users.staff._id,
    issuedBy: users.admin._id,
    status: "Pending",
  });
  const document = await Document.create({
    organizationID: org._id,
    employeeID: users.employee._id,
    docName: "ID Proof",
    doc: "https://placehold.co/100x100",
    docType: "id_proof",
    status: "Received",
  });
  const report = await Report.create({
    organizationID: org._id,
    type: "cleanliness",
    submittedBy: users.cleaner._id,
    reviewedBy: users.manager._id,
    score: 9,
    checklist: [{ item: "Floor cleaned", checked: true }],
    notes: "All good",
    status: "reviewed",
  });

  // Output credentials for all users
  console.log("Seeded organization:", org);
  Object.entries(users).forEach(([role, user]) => {
    let pass =
      role === "superadmin"
        ? "SuperAdmin@1234"
        : role.charAt(0).toUpperCase() + role.slice(1) + "@1234";
    console.log(
      `${role.charAt(0).toUpperCase() + role.slice(1)} credentials: ${user.email} / ${pass}`
    );
  });

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
