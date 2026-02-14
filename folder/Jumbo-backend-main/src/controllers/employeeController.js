const AllocatedItems = require("../models/AllocatedItems");
const Coins = require("../models/Coins");
const Document = require("../models/Document");
const Employee = require("../models/Employee");
const LeaveRequest = require("../models/LeaveRequest");
const SalaryTransaction = require("../models/SalaryTransaction");
const { decodeToken } = require("../utils/decodeToken");

const addEmployee = async (req, res) => {
  try {
    const { email } = req.body;
    const restaurantID = await decodeToken(req);
    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }
    const profilePhoto = req.file ? req.file.path : null;

    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    let access = req.body.access;

    if (typeof access === "string") {
      try {
        access = JSON.parse(access); // handles JSON array correctly
      } catch {
        access = [access]; // fallback for random strings
      }
    }
    req.body.access = access;
    let allotedItems = req.body.allotedItems;
    if (typeof allotedItems === "string") {
      try {
        allotedItems = JSON.parse(allotedItems); // handles JSON array correctly
      } catch {
        allotedItems = [allotedItems]; // fallback for random strings
      }
    }
    if (!Array.isArray(allotedItems)) {
      allotedItems = [];
    }
    allotedItems = allotedItems.map((item) => {
      // Already object (new frontend)
      if (typeof item === "object" && item !== null) {
        return {
          name: item.name,
          isReceived: item.isReceived,
        };
      }
    });
    allotedItems = allotedItems.filter((item) => item.name && item.name.trim());
    req.body.allotedItems = allotedItems;

    const employee = await Employee.create({
      ...req.body,
      restaurantID,
      profilePhoto,
      password: req.body.password || "123456",
      role: "employee",
    });

    await Coins.create({
      restaurantID,
      employeeId: employee._id,
      totalEarned: req.body.CoinsPerMonth,
      totalSpent: 0,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error adding employee:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get single employee by ID
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    return res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee by id:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const profilePhoto = req.file ? req.file.path : null;
    let access = req.body.access;

    if (typeof access === "string") {
      try {
        access = JSON.parse(access); // handles JSON array correctly
      } catch {
        access = [access]; // fallback for random strings
      }
    }
    req.body.access = access;
    let allotedItems = req.body.allotedItems;
    if (typeof allotedItems === "string") {
      try {
        allotedItems = JSON.parse(allotedItems); // handles JSON array correctly
      } catch {
        allotedItems = [allotedItems]; // fallback for random strings
      }
    }
    if (!Array.isArray(allotedItems)) {
      allotedItems = [];
    }
    allotedItems = allotedItems.map((item) => {
      // Already object (new frontend)
      if (typeof item === "object" && item !== null) {
        return {
          name: item.name,
          isReceived: item.isReceived,
        };
      }
    });
    allotedItems = allotedItems.filter((item) => item.name && item.name.trim());
    req.body.allotedItems = allotedItems;

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        ...req.body,
        ...(profilePhoto && { profilePhoto }),
      },
      { new: true, runValidators: true },
    );

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const receiveAllotedItem = async (req, res) => {
  try {
    const { id } = req.params;
    let allotedItems = req.body.allotedItems;
    if (typeof allotedItems === "string") {
      try {
        allotedItems = JSON.parse(allotedItems); // handles JSON array correctly
      } catch {
        allotedItems = [allotedItems]; // fallback for random strings
      }
    }
    if (!Array.isArray(allotedItems)) {
      allotedItems = [];
    }
    req.body.allotedItems = allotedItems;
    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      {
        ...req.body,
      },
      { new: true, runValidators: true },
    );
    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const deleteEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Get current employee profile
// @route   GET /api/employees/profile
// @access  Private (Employee only)
const getCurrentEmployeeProfile = async (req, res) => {
  try {
    const employeeId = req.user.id;

    const employee = await Employee.findById(employeeId).select("-password");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    // Return employee profile data including salary
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Error fetching current employee profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
const getAllEmployees = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);

    // Check if it's an employee ID or restaurantID
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      // It was an employee ID (app request)
      restaurantID = employee.restaurantID;
    } else {
      // It was already a restaurantID (admin request)
      restaurantID = decodedId;
    }

    if (!restaurantID) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { month, page = 1, limit = 10 } = req.query;
    //  const{page=1,limit=2}= req.query;
    // const query ={ restaurantID };

    const filter = { restaurantID };
    if (month !== undefined) {
      filter.currentMonth = Number(month);
    }
    const employees = await Employee.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Employee.countDocuments(filter);

    const employeesWithDocCount = await Promise.all(
      employees.map(async (emp) => {
        const docCount = await Document.countDocuments({ EmployeeId: emp._id });
        return {
          ...emp.toObject(),
          documentCount: docCount, // 👈 EXTRA FIELD HERE
        };
      }),
    );

    res.status(200).json({
      success: true,
      count: total,
      data: employeesWithDocCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const getEmployeeOverview = async (req, res) => {
  try {
    const { employeeId } = req.params;


    let decodedId = await decodeToken(req);
    const loggedEmployee = await Employee.findById(decodedId);

    let restaurantID = loggedEmployee
      ? loggedEmployee.restaurantID
      : decodedId;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const [
      transactions,
      allocatedItems,
      wallet,
      leaves,
      documents,
    ] = await Promise.all([
      SalaryTransaction.find({ employee: employeeId })
        .sort({ date: -1 })
        .lean(),

      AllocatedItems.find({
        issuedTo: employeeId,
        restaurantID,
      })
        .populate("issuedTo", "name")
        .lean(),

      Coins.findOne({ employeeId })
        .populate({
          path: "coinsTransactions",
          options: { sort: { date: -1 } },
        })
        .populate("employeeId", "name position")
        .lean(),

      LeaveRequest.find({ createdBy: employeeId })
        .sort({ createdAt: -1 })
        .lean(),

      Document.find({
        EmployeeId: employeeId,
        restaurantID,
      })
        .populate("EmployeeId", "name position role")
        .lean(),
    ]);

    //  Final unified response
    res.status(200).json({
      success: true,
      data: {
        employee,
        transactions,
        allocatedItems,
        wallet,
        leaves,
        documents,
      },
    });

  } catch (error) {
    console.error("Employee overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee overview",
      error: error.message,
    });
  }
};
const getEmployeeOverviewForFutere = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { type, month, year } = req.query;

    // ---------------- AUTH ----------------
    const decodedId = await decodeToken(req);
    const loggedEmployee = await Employee.findById(decodedId);
    const restaurantID = loggedEmployee
      ? loggedEmployee.restaurantID
      : decodedId;

    // ---------------- EMPLOYEE ----------------
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // ---------------- DEFAULT (CURRENT MONTH) ----------------
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentStart = new Date(currentYear, currentMonth, 1);
    const currentEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    // ---------------- FILTERED DATE (ONLY FOR TYPE) ----------------
    const filterMonth = month !== undefined ? Number(month) : currentMonth;
    const filterYear = year !== undefined ? Number(year) : currentYear;

    const filterStart = new Date(filterYear, filterMonth, 1);
    const filterEnd = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59);

    // ---------------- PARALLEL FETCH ----------------
    const [salaryAll, leavesAll, wallet, allocatedItems, documents] =
      await Promise.all([
        SalaryTransaction.find({ employee: employeeId })
          .sort({ date: -1 })
          .lean(),
        LeaveRequest.find({ createdBy: employeeId })
          .sort({ startDate: -1 })
          .lean(),
        Coins.findOne({ employeeId })
          .populate({
            path: "coinsTransactions",
            options: { sort: { date: -1 } },
          })
          .lean(),
        AllocatedItems.find({ issuedTo: employeeId, restaurantID }).lean(),
        Document.find({ EmployeeId: employeeId, restaurantID })
          .populate("EmployeeId", "name position role")
          .lean(),
      ]);

    // ---------------- DEFAULT FILTER (CURRENT MONTH) ----------------
    let salary = salaryAll.filter(
      (t) => t.currentMonth === currentMonth && t.currentYear === currentYear,
    );

    let leave = leavesAll.filter(
      (l) =>
        new Date(l.startDate) >= currentStart &&
        new Date(l.startDate) <= currentEnd,
    );

    let coins = {
      transactions:
        wallet?.coinsTransactions?.filter(
          (c) =>
            new Date(c.date) >= currentStart && new Date(c.date) <= currentEnd,
        ) || [],
      totalEarned: wallet?.totalEarned || 0,
      totalSpent: wallet?.totalSpent || 0,
    };

    // ---------------- OVERRIDE ONLY REQUESTED TYPE ----------------
    if (type === "salary") {
      salary = salaryAll.filter(
        (t) => t.currentMonth === filterMonth && t.currentYear === filterYear,
      );
    }

    if (type === "leave") {
      leave = leavesAll.filter(
        (l) =>
          new Date(l.startDate) >= filterStart &&
          new Date(l.startDate) <= filterEnd,
      );
    }

    if (type === "coins") {
      coins.transactions =
        wallet?.coinsTransactions?.filter(
          (c) =>
            new Date(c.date) >= filterStart && new Date(c.date) <= filterEnd,
        ) || [];
    }

    // ---------------- RESPONSE ----------------
    res.status(200).json({
      success: true,
      appliedFilter: type || "default-current-month",
      data: {
        employee,
        salary,
        leave,
        coins: {
          ...coins,
          balance: coins.totalEarned - coins.totalSpent,
        },
        allocatedItems,
        documents,
      },
    });
  } catch (error) {
    console.error("Employee overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee overview",
      error: error.message,
    });
  }
};

module.exports = {
  addEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployeeById,
  deleteEmployeeById,
  getCurrentEmployeeProfile,
  receiveAllotedItem,
  getEmployeeOverview
};
