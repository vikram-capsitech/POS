const express = require("express");
const {
  createAdvanceRequest,
  getAdvanceRequestByFilter,
  getAllAdvanceRequests,
  getAdvanceRequestforEmployee,
  getAdvanceRequestById,
  getEmployeeTransactionHistory,
  rejectAdvanceRequest,
  approveAdvanceRequest,
  getTransactionHistory,
  creditSalary,
} = require("../controllers/advanceRequestController");
const { upload } = require("../config/cloudinary");
const { protect } = require('../middleware/authMiddleware.js');
const advanceRequestRouter = express.Router();

advanceRequestRouter.post("/", protect, upload.single('voiceNote'), createAdvanceRequest);
advanceRequestRouter.post("/filter", getAdvanceRequestByFilter);
advanceRequestRouter.get("/", protect, getAllAdvanceRequests);
advanceRequestRouter.get("/emp", protect, getAdvanceRequestforEmployee);
advanceRequestRouter.get("/:id", getAdvanceRequestById)
advanceRequestRouter.post("/approve/:id", approveAdvanceRequest)
advanceRequestRouter.post("/reject/:id", rejectAdvanceRequest)
advanceRequestRouter.get("/transactions/:employeeId", getEmployeeTransactionHistory)
advanceRequestRouter.get("/transactionAll", getTransactionHistory)
advanceRequestRouter.post("/salary/credit", creditSalary)

module.exports = advanceRequestRouter;
