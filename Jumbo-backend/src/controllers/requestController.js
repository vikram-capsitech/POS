const Request = require("../models/Request");
const Employee = require("../models/Employee");
const { decodeToken } = require("../utils/decodeToken");
const {
  sendNotification,
  sendBulkNotification,
} = require("../services/notificationService");

// CREATE Request
exports.createRequest = async (req, res) => {
  try {
    const requiredFields = ["title", "description", "raisedBy", "requestType"];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Get employee and restaurantID from authenticated user
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }

    const voiceNoteUrl = req.file
      ? req.file.path || req.file.url || req.file.secure_url
      : null;

    const requestData = {
      ...req.body,
      restaurantID,
      createdBy: req.user.id, // Save the ID of the employee creating the request
      voiceNote: voiceNoteUrl,
    };

    const request = await Request.create(requestData);
    if (request.raisedBy === "user") {
      const io = req.app.get("io");

      io.to(`ADMIN_${request.restaurantID}`).emit("ISSUE_EVENT", {
        event: "Issue_CREATED",
        request: request._id,
      });
    }

    // Send notification to assigned employee(s) if any
    if (request.assignTo.length && request.raisedBy === "admin") {
      const assignees = Array.isArray(request.assignTo)
        ? request.assignTo.map((a) => a).filter(Boolean)
        : [request.assignTo];

      if (assignees.length > 0) {
        await sendBulkNotification(
          assignees,
          "warning",
          "issue",
          "New Issue Assigned",
          `A new issue has been assigned to you: ${request.title}`,
          { issueId: request._id.toString(), priority: request.priority },
        );
      }
    }

    res.status(201).json({
      success: true,
      message: "Request created successfully",
      data: request,
    });
  } catch (error) {
    console.error("Create Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create request",
      error: error.message,
    });
  }
};

// GET All Requests
exports.getAllRequests = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const employee = await Employee.findById(restaurantID);
    if (employee) {
      restaurantID = employee.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Unavailable" });
    }

    const { page = 1, limit = 10, raisedBy } = req.query;
    const query = { restaurantID };

    if (raisedBy) {
      query.raisedBy = raisedBy;
    }

    const requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .populate("assignTo")
      .populate("createdBy")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    //   .populate("assignTo.adminId")
    // .populate("restaurantId");
    const total = await Request.countDocuments(query);

    res.status(200).json({
      success: true,

      count: total,
      data: requests,

      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

exports.getAllRequestsforEmployees = async (req, res) => {
  try {
    const id = await decodeToken(req); // Use common decode logic

    // Find requests that are either assigned to the employee OR created by the employee
    const requests = await Request.find({
      $or: [{ assignTo: id }, { createdBy: id }],
    })
      .populate("assignTo")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Get All Requests Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};

exports.getRequestbyFilter = async (req, res) => {
  try {
    const restaurantID = await decodeToken(req);
    const { raisedBy, priority, status } = req.body;
    const { page = 1, limit = 10 } = req.query;
    // const { page=1,limit=10,priority, status } = req.body;
    const query = { restaurantID };

    const orConditions = [];

    if (priority && priority.length) {
      orConditions.push({ priority: { $in: priority } });
    }

    if (status && status.length) {
      orConditions.push({ status: { $in: status } });
    }

    let requests;
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    if (raisedBy) {
      query.raisedBy = raisedBy;
    }
    requests = await Request.find(query)
      .sort({ createdAt: -1 })
      .populate("assignTo")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Request.countDocuments(query);
    // Matches any of the selected filters

    res.status(200).json({
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

// GET Request by ID
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("assignTo")
      .populate("createdBy")
      .populate("sop", "steps")
      .populate("taskId");
    //   .populate("assignTo.adminId")
    // .populate("restaurantId");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error("Get Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch request",
      error: error.message,
    });
  }
};

// UPDATE Request
exports.updateRequest = async (req, res) => {
  try {
    const oldRequest = await Request.findById(req.params.id);
    const dataToUpdate = { ...req.body };
    if (req.file) {
      dataToUpdate.voiceNote = req.file.path;
    }
    const updated = await Request.findByIdAndUpdate(
      req.params.id,
      dataToUpdate,
      { new: true, runValidators: true },
    ).populate("assignTo");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Send notification if status changed
    if (
      oldRequest &&
      req.body.status &&
      oldRequest.status !== req.body.status
    ) {
      if (updated.assignTo?.length) {
        const assignees = Array.isArray(updated.assignTo)
          ? updated.assignTo
          : [updated.assignTo];

        if (assignees.length > 0) {
          await sendBulkNotification(
            assignees,
            "info",
            "issue",
            "Issue Status Updated",
            `Issue "${updated.title}" status changed to ${req.body.status}`,
            { issueId: updated._id.toString(), status: req.body.status },
          );
        }
      }

      // Notify the employee who raised the issue when it's marked as Solved/Completed
      if (
        updated.createdBy &&
        (req.body.status === "Solved" || req.body.status === "Completed")
      ) {
        await sendNotification(
          updated.createdBy,
          "success",
          "issue",
          "Issue Resolved",
          `Your issue "${updated.title}" has been marked as ${req.body.status} by admin`,
          { issueId: updated._id.toString(), status: req.body.status },
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Request updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update request",
      error: error.message,
    });
  }
};

// DELETE Request
exports.deleteRequest = async (req, res) => {
  try {
    const deleted = await Request.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Request Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete request",
      error: error.message,
    });
  }
};

exports.markRequestSeen = async (req, res) => {
  try {
    const decodedId = await decodeToken(req); // get ID from token

    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      restaurantID = employee.restaurantID;
    } else {
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(400).json({ message: "restaurantID is required" });
    }

    await Request.updateMany(
      {
        restaurantID,
        isNew: true,
      },
      { $set: { isNew: false } },
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
