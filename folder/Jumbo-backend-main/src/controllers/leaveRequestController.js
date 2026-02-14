const LeaveRequest = require("../models/LeaveRequest");
const Employee = require("../models/Employee");
const { decodeToken } = require("../utils/decodeToken");
const { sendNotification } = require("../services/notificationService");

exports.createLeaveRequest = async (req, res) => {
  try {
    const { title, reason, startDate, endDate, createdBy } = req.body;

    // Validate employee exists using the authenticated user from protect middleware
    // Get employee and restaurantID from authenticated user
    // const employee = await Employee.findById(req.user.id);
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }

    if (!employee && !req.user.id) {
      // If decoded token is restaurantID (Admin) and no req.user (unlikely)?
      // Validating employee for 'createdBy'
      // If Admin creates leave (for themselves?), they are not in Employee table usually?
      // Leave requests are usually for Employees.
      // But req.user.id from protect is always set.
    }
    const empForCheck = await Employee.findById(req.user.id);
    if (!empForCheck) {
      // return res.status(404).json({
      //   success: false,
      //   message: "Invalid employee (createdBy)",
      // });
      // Logic for Admin creating leave? Admins don't usually create leave for themselves in this system logic.
      // But let's keep it safe.
    }

    // const restaurantID = employee.restaurantID;

    const voiceNoteFile = req.file ? req.file.path : null;

    // Check if the title or reason suggests an authorized leave
    const isAuthorized =
      title?.toLowerCase().includes("authorized") ||
      reason?.toLowerCase().includes("authorized");

    const leave = await LeaveRequest.create({
      title,
      reason,
      startDate,
      endDate,
      restaurantID,
      createdBy: createdBy || req.user.id, // Use authenticated user ID if createdBy not provided
      voiceNote: voiceNoteFile,
      isAuthorizedLeave: isAuthorized,
    });
     if ( leave) {
      const io = req.app.get("io");

      io.to(`ADMIN_${leave.restaurantID}`).emit("REQUEST_EVENT", {
        event: "REQUEST_CREATED",
        request: leave._id,
      });
    }

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating leave request",
      error: error.message,
    });
  }
};

exports.getAllLeaveRequests = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }
    const { status, employeeId, page = 1, limit = 10 } = req.query;

    const query = { restaurantID };

    if (status) query.status = status;
    if (employeeId) query.createdBy = employeeId;

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: "createdBy",
        select: "name ",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await LeaveRequest.countDocuments(query);
    res.status(200).json({
      success: true,
      count: total,

      page: Number(page),
      limit: Number(limit),
      // count: leaves.length,
      data: leaves,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

exports.getAllLeaveRequestsforEmployee = async (req, res) => {
  try {
    const employeeId = await decodeToken(req);
    //  if (!restaurantID) {
    //   return res.status(400).json({ error: "restaurantID is Required" });
    // }
    const { status, page = 1, limit = 20 } = req.query;

    const query = { createdBy: employeeId };

    if (status) query.status = status;
    // if (employeeId) query.createdBy = employeeId;

    const leaves = await LeaveRequest.find(query)
      .populate({
        path: "createdBy",
        select: "name ",
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
      error: error.message,
    });
  }
};

exports.getLeaveRequestByFilter = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    const query = { restaurantID };
    const { page = 1, limit = 10, status } = req.body;
    // const { status } = req.body;
    const orConditions = [];
    if (status && status.length) {
      orConditions.push({ status: { $in: status } });
    }
    let requests;
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    requests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "name ",
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await LeaveRequest.countDocuments(query);
    res
      .status(200)
      .json({
        requests,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

exports.getLeaveRequestById = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.findById(req.params.id).populate(
      "createdBy",
      "name position totalLeave leaveTaken "
    );
    // .populate("restaurantID");

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    // Extract employee details
    const employee = leaveRequest.createdBy;

    const totalLeave = employee.totalLeave;
    const leaveTaken = employee.leaveTaken;
    const leaveLeft = Math.max(totalLeave - leaveTaken);

    res.status(200).json({
      success: true,
      data: {
        ...leaveRequest._doc,
        totalLeave,
        leaveTaken,
        leaveLeft,
      },
    });
  } catch (error) {
    console.error("Get Leave Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch leave request",
      error: error.message,
    });
  }
};

exports.getLeaveHistory = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({
      createdBy: req.params.employeeId,
    }).populate("createdBy").sort({ createdAt: -1 });

    res.json({ success: true, data: leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.approveOrRejectLeave = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Completed", "Rejected"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    // 1. Find the leave request
    const leaveRequest = await LeaveRequest.findById(req.params.id);
    if (!leaveRequest) {
      return res
        .status(404)
        .json({ success: false, message: "Leave request not found" });
    }

    // 2. Update status
    leaveRequest.status = status;
    await leaveRequest.save();

    // 3. If approved → increase employee leave count (ONLY if not an authorized leave)
    if (status === "Completed") {
      const start = new Date(leaveRequest.startDate);
      const end = new Date(leaveRequest.endDate);

      // Calculate number of leave days
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      // Only increment leaveTaken for regular leaves
      if (!leaveRequest.isAuthorizedLeave) {
        await Employee.findByIdAndUpdate(leaveRequest.createdBy, {
          $inc: { leaveTaken: days },
        });
      }
    }

    // Send notification to employee
    const notificationType =
      status === "Completed"
        ? "success"
        : status === "Rejected"
        ? "error"
        : "info";
    const notificationTitle =
      status === "Completed" ? "Leave Approved" : "Leave Rejected";
    const startDate = new Date(leaveRequest.startDate).toLocaleDateString();
    const endDate = new Date(leaveRequest.endDate).toLocaleDateString();
    const notificationMessage =
      status === "Completed"
        ? `Your leave request from ${startDate} to ${endDate} has been approved.`
        : `Your leave request from ${startDate} to ${endDate} has been rejected.`;

    await sendNotification(
      leaveRequest.createdBy,
      notificationType,
      "leave",
      notificationTitle,
      notificationMessage,
      { leaveId: leaveRequest._id.toString(), status }
    );

    res.json({ success: true, message: "status Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
