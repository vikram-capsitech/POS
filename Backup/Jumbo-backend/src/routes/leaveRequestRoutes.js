const express = require("express");
const router = express.Router();


const { upload } = require("../config/cloudinary");
const {
  createLeaveRequest,
  getLeaveRequestByFilter,
  getAllLeaveRequests,
  getAllLeaveRequestsforEmployee,
  getLeaveRequestById,
  getLeaveHistory,
  approveOrRejectLeave,
} = require("../controllers/leaveRequestController");
const { protect } = require('../middleware/authMiddleware.js');

// CREATE leave request (with optional voice note)
router.post(
  "/", protect,
  upload.single("voiceNote"),
  createLeaveRequest
);

// GET all leave requests (with filtering)
router.get("/", protect, getAllLeaveRequests);
router.get('/emp',protect,getAllLeaveRequestsforEmployee);
router.post("/filter",protect, getLeaveRequestByFilter);
router.get("/:id", getLeaveRequestById);

router.get("/history/:employeeId", getLeaveHistory);
router.put("/approve/:id", approveOrRejectLeave);
router.put("/reject/:id", approveOrRejectLeave);


module.exports = router;
