const Employee = require("../models/Employee")
const AdvanceRequest = require("../models/AdvanceRequest")
const { decodeToken } = require("../utils/decodeToken");
const SalaryTransaction = require("../models/SalaryTransaction");
const { sendNotification } = require("../services/notificationService");


exports.getAdvanceRequestById = async (req, res) => {
  try {
    // const restaurantID = await decodeToken(req);
    const { id } = req.params;

    const request = await AdvanceRequest.findById(id)

      .populate({
        path: "employee",
        select: "name position salary monthlyAdvanceTaken monthlySalaryReceived"
      })
      .populate({
        path: "createdBy",
        select: "name role"
      });
    // if (!restaurantID) {
    //       return res.status(400).json({ error: "restaurantID is Required" });
    //     }
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // const employeeId = request.employee._id;

    // // Get salary credits
    // const salaryTransactions = await SalaryTransaction.find({
    //   employee: employeeId,
    //   type: "salary"
    // }).sort({ date: -1 });

    // // Get previous advance transactions
    // const advanceTransactions = await AdvanceRequest.find({
    //   employee: employeeId,
    //   status: "Completed"
    // }).sort({ createdAt: -1 });

    // Summary
    const summary = {
      monthlySalary: request.employee.salary,
      usedBalance: request.employee.monthlyAdvanceTaken,
      salaryReceived: request.employee.monthlySalaryReceived,
      remainingBalance: request.remainingBalance,
    };

    res.status(200).json({
      success: true,
      data: {
        ...request._doc,
        ...summary._doc
      }

      // salaryTransactions,
      // advanceTransactions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch request details",
      error: error.message,
    });
  }
};




exports.createAdvanceRequest = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const emp = await Employee.findById(restaurantID);
    if (emp) {
      restaurantID = emp.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is defined" });
    }
    const { employeeId, askedMoney, description, assignTo } = req.body;
    const voiceNoteUrl = req.file
      ? req.file.path || req.file.url || req.file.secure_url
      : null;

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    // Reset monthly advance if month changed
    // const currentMonth = new Date().getMonth();
    // if (employee.currentMonth !== currentMonth) {
    //   employee.monthlyAdvanceTaken = 0;
    //   employee.monthlySalaryReceived = 0; 
    //   employee.currentMonth = currentMonth;
    // }


    // Calculate remaining balance based on 60% quota
    const maxAllowed = (employee.salary || 0) * 0.6;
    const currentAdvance = employee.monthlyAdvanceTaken || 0;
    const remainingBalance = maxAllowed - currentAdvance;

    if (askedMoney > remainingBalance) {
      return res.status(400).json({
        success: false,
        message: `Advance exceeds available 60% salary limit. Max allowed: ₹${maxAllowed.toFixed(0)}, Already taken: ₹${currentAdvance.toFixed(0)}, Remaining: ₹${remainingBalance.toFixed(0)}`,
      });
    }

    // Save new request
    const request = await AdvanceRequest.create({
      employee: employeeId,
      restaurantID: restaurantID,
      askedMoney,
      description,
      remainingBalance,
      voiceNote: voiceNoteUrl,
      createdBy: employeeId,
      assignTo
    });
    if ( request) {
      const io = req.app.get("io");

      io.to(`ADMIN_${request.restaurantID}`).emit("REQUEST_EVENT", {
        event: "REQUEST_CREATED",
        request: request._id,
      });
    }
    res.status(201).json({ success: true, data: request });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating advance request",
      error: error.message,
    });
  }
};


exports.getAllAdvanceRequests = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const emp = await Employee.findById(restaurantID);
    if (emp) {
      restaurantID = emp.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required!!!" });
    }
    const { employeeId, page = 1, limit = 10 } = req.query;

    const query = { restaurantID };
    // if (status) query.status = status;
    if (employeeId) query.employee = employeeId;

    const requests = await AdvanceRequest.find(query)
      .populate({
        path: "employee",
        select: "name"
      })
      .populate({
        path: "createdBy",
        select: "name role"
      })

      .populate("assignTo", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await AdvanceRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: total,
      data: requests,
      count: total,
      page: Number(page),
      limit: Number(limit),

      totalPages: Math.ceil(total / limit),
    });


  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch advance requests",
      error: error.message,
    });
  }
};

exports.getAdvanceRequestforEmployee = async (req, res) => {
  try {
    const employeeId = await decodeToken(req);
    //  if (!restaurantID) {
    //   return res.status(400).json({ error: "restaurantID is Required!!!" });
    // }
    const { status, page = 1, limit = 20 } = req.query;

    const query = { employee: employeeId };
    if (status) query.status = status;
    // if (employeeId) query.employee = employeeId;

    const requests = await AdvanceRequest.find(query)
      .populate({
        path: "employee",
        select: "name"
      })
      .populate({
        path: "createdBy",
        select: "name role"
      })

      .populate("assignTo", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));


    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch advance requests",
      error: error.message,
    });
  }
};
exports.getAdvanceRequestByFilter = async (req, res) => {
  try {
    let restaurantID = await decodeToken(req);
    const emp = await Employee.findById(restaurantID);
    if (emp) {

      restaurantID = emp.restaurantID;
    }
    const query = { restaurantID }
    const { page = 1, limit = 10, status } = req.body;
    const orConditions = [];
    if (status && status.length) {
      orConditions.push({ status: { $in: status } });
    }
    let requests;
    if (orConditions.length > 0) {
      query.$or = orConditions;
      // requests = await AdvanceRequest.find({ $or: orConditions, restaurantID });
    }
    // else {
    //   requests = await AdvanceRequest.find({ restaurantID });
    // }
    requests = await AdvanceRequest.find(query).sort({ createdAt: -1 })
      .populate({
        path: "createdBy",
        select: "name role"
      })
      .skip((page - 1) * limit).limit(Number(limit));
    const total = await AdvanceRequest.countDocuments(query);
    res.status(200).json({
      requests, total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)

    });

  }
  catch (err) {
    res.status(500).json({ error: err });
  }
};


exports.approveAdvanceRequest = async (req, res) => {
  try {

    let restaurantID = await decodeToken(req);
    const emp = await Employee.findById(restaurantID);
    if (emp) {
      restaurantID = emp.restaurantID;
    }
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required!!!" });
    }
    const { id } = req.params;

    const request = await AdvanceRequest.findById(id);
    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }

    const employee = await Employee.findById(request.employee);

    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });


    employee.monthlyAdvanceTaken += request.askedMoney;

    await employee.save();

    // Set approvedBy to the current user (Admin)
    request.approvedBy = restaurantID;
    request.remainingBalance = (employee.salary * 0.6) - employee.monthlyAdvanceTaken;

    await SalaryTransaction.create({

      restaurantID,
      employee: request.employee,
      amount: request.askedMoney,
      type: "advance",
    });

    request.status = "Completed";
    await request.save();

    // Send notification to employee
    await sendNotification(
      request.employee,
      'success',
      'advance',
      'Advance Request Approved',
      `Your advance request of ₹${request.askedMoney} has been approved.`,
      { advanceId: request._id.toString(), amount: request.askedMoney }
    );

    res.status(200).json({
      success: true,
      message: "Advance request approved",
      data: request,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving advance request",
      error: error.message,
    });
  }
};


exports.rejectAdvanceRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await AdvanceRequest.findById(id);
    if (!request)
      return res.status(404).json({ success: false, message: "Request not found" });

    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Request already ${request.status}`,
      });
    }

    request.status = "Rejected";
    await request.save();

    // Send notification to employee
    await sendNotification(
      request.employee,
      'error',
      'advance',
      'Advance Request Rejected',
      `Your advance request of ₹${request.askedMoney} has been rejected.`,
      { advanceId: request._id.toString(), amount: request.askedMoney }
    );

    res.status(200).json({
      success: true,
      message: "Advance request rejected",
      data: request,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error rejecting advance request",
      error: error.message,
    });
  }
};

exports.creditSalary = async (req, res) => {
  try {
    const { employeeId, amount } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    // Add to monthly received
    employee.monthlySalaryReceived += Number(amount);

    // Update last paid time
    employee.lastPaidAt = new Date();

    // Update salary status
    if (employee.monthlySalaryReceived >= employee.salary) {
      employee.salaryStatus = "Paid";
    } else {
      employee.salaryStatus = "Pending";
    }
    await employee.save();

    // Add transaction entry
    await SalaryTransaction.create({
      restaurantId: employee.restaurant,
      employee: employeeId,
      amount,
      type: "salary", // salary credit
    });

    res.status(200).json({
      success: true,
      message: "Salary credited successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to credit salary",
      error: error.message,
    });
  }
};

exports.getEmployeeTransactionHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findById(employeeId)
      .select("name salary monthlyAdvanceTaken monthlySalaryReceived");
    if (!employee)
      return res.status(404).json({ success: false, message: "Employee not found" });

    const allTransactions = await SalaryTransaction.find({
      employee: employeeId,
    })
      .sort({ date: -1 })   // latest first
      .lean();

    res.status(200).json({
      success: true,
      data: allTransactions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cannot fetch transaction history",
      error: error.message,
    });
  }
};


exports.getTransactionHistory = async (req, res) => {
  try {
    // Decode token to get either employeeId or restaurantID

    const decodedId = await decodeToken(req);
    let restaurantID;

    // Check if it's an employee ID
    const employee = await Employee.findById(decodedId);
    if (employee) {
      // Employee request → get their restaurantID
      restaurantID = employee.restaurantID;
    } else {
      // Admin request → decodedId is restaurantID
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant/admin ID",
      });
    }
    // Fetch all salary transactions of employees in this restaurant
    const transactions = await SalaryTransaction.findById({ restaurantID })
      .sort({ date: -1 })
      .populate("employee", "name salary monthlyAdvanceTaken monthlySalaryReceived")
      .lean();

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};




