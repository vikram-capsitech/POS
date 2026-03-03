import authRoutes from "./core/authRoutes.js";
import homeRoutes from "./core/homeRoutes.js";
import userLogRoutes from "./core/userLogRoutes.js";

import attendanceRoutes from "./workforce/attendanceRoutes.js";
import employeeRoutes from "./workforce/employeeRoutes.js";
import leaveRequestRoutes from "./workforce/leaveRequestRoutes.js";
import advanceRequestRoutes from "./workforce/advanceRequestRoutes.js";
import salaryRecordRoutes from "./workforce/salaryRecordRoutes.js";

import taskRoutes from "./operations/taskRoutes.js";
import sopRoutes from "./operations/sopRoutes.js";
import requestRoutes from "./operations/requestRoutes.js";
import aiReviewRoutes from "./operations/aiReviewRoutes.js";

import documentRoutes from "./resources/documentRoutes.js";
import allotedItemsRoutes from "./resources/allotedItemsRoutes.js";
import voucherRoutes from "./resources/voucherRoutes.js";

import paymentsRoutes from "./finance/paymentsRoutes.js";
import coinsRoutes from "./finance/coinsRoutes.js";

import notificationRoutes from "./notifications/notificationRoutes.js";

import adminRoutes from "./admin/adminRoutes.js";

// POS routes
import posMenuRoutes from "./pos/menuRoutes.js";
import posOrderRoutes from "./pos/orderRoutes.js";
import posTableRoutes from "./pos/tableRoutes.js";
import posInventoryRoutes from "./pos/inventoryRoutes.js";
import posReportRoutes from "./pos/reportRoutes.js";
import posOrganizationRoutes from "./pos/organizationRoutes.js";
import posExpenseRoutes from "./pos/expenseRoutes.js";

// Public 
import chatRoutes from "./public/chatRoutes.js";

const registerRoutes = (app) => {
  // ── Core ───────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRoutes);
  app.use("/api/home", homeRoutes);
  app.use("/api/logs", userLogRoutes);

  // ── Workforce ───────────────────────────────────────────────────────────────
  app.use("/api/attendance", attendanceRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/leave-requests", leaveRequestRoutes);
  app.use("/api/advance-requests", advanceRequestRoutes);
  app.use("/api/salary-records", salaryRecordRoutes);

  // ── Operations ──────────────────────────────────────────────────────────────
  app.use("/api/tasks", taskRoutes);
  app.use("/api/sops", sopRoutes);
  app.use("/api/requests", requestRoutes);
  app.use("/api/ai-reviews", aiReviewRoutes);

  // ── Resources ───────────────────────────────────────────────────────────────
  app.use("/api/documents", documentRoutes);
  app.use("/api/alloted-items", allotedItemsRoutes);
  app.use("/api/vouchers", voucherRoutes);

  // ── Finance ─────────────────────────────────────────────────────────────────
  app.use("/api/payments", paymentsRoutes);
  app.use("/api/coins", coinsRoutes);

  // ── Notifications ────────────────────────────────────────────────────────────
  app.use("/api/notifications", notificationRoutes);

  // ── Admin ────────────────────────────────────────────────────────────────────
  app.use("/api/admin", adminRoutes);

  // ── POS ──────────────────────────────────────────────────────────────────────
  app.use("/api/pos/menu", posMenuRoutes);
  app.use("/api/pos/tables", posTableRoutes);
  app.use("/api/pos/orders", posOrderRoutes);
  app.use("/api/pos/inventory", posInventoryRoutes);
  app.use("/api/pos/reports", posReportRoutes);
  app.use("/api/pos/organization", posOrganizationRoutes);
  app.use("/api/pos/expenses", posExpenseRoutes);

  // ── Public ───────────────────────────────────────────────────────────────────
  app.use("/api/chat", chatRoutes);
};

export default registerRoutes;
