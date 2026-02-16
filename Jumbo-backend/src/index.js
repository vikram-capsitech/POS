const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const sopRouter = require("./routes/sopRoutes");
const aiReviewRouter = require("./routes/aiReviewRoutes");
const requestRouter = require("./routes/requestRoutes");
const advanceRequestRouter = require("./routes/advanceRequestRoutes");
const leaveRequestRouter = require("./routes/leaveRequestRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRecordRoutes = require("./routes/salaryRecordRoutes");
const adminAttendanceRoutes = require("./routes/adminAttendanceRoutes");
const homeRouter = require("./routes/homeRoutes");
const { server, app } = require("./server");

dotenv.config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// CORS configuration
app.use(
  cors({
    origin: "*", // Allow all origins for CLI tools
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    maxAge: 600, // 10 minutes
  }),
);

// Test route
app.get("/test", (req, res) => {
  res.json({ message: "Test route is working!" });
});

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/home", homeRouter);
app.use("/api/payments", require("./routes/paymentsRoutes"));

app.use("/api/sop", sopRouter);
app.use("/api/ai-review", aiReviewRouter);
app.use("/api/issue-request", requestRouter);
app.use("/api/advance-request", advanceRequestRouter);
app.use("/api/leave-request", leaveRequestRouter);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/adminAttendance", adminAttendanceRoutes);
app.use("/api/salary-record", salaryRecordRoutes);
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/alloted-items", require("./routes/allotedItemsRoutes"));
app.use("/api/coins", require("./routes/coinsRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/task", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/voucher", require("./routes/voucherRoutes"));

require("./services/taskNotificationCron");
// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

const PORT = process.env.PORT || 5001; // Changed to 5001 to avoid conflicts

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
