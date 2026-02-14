const SalaryRecord = require("../models/SalaryRecord");
const { decodeToken } = require("../utils/decodeToken");
const Employee = require("../models/Employee");
const SalaryTransaction = require("../models/SalaryTransaction");
const Coins = require("../models/Coins");
const CoinsTransaction = require("../models/CoinsTransaction");

const createRecord = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);
    const employee = await Employee.findById(decodedId);
    let restaurantID;
    if (employee) {
      restaurantID = employee.restaurantID;
    } else {
      restaurantID = decodedId;
    }
    const { employee: empId, status, amount } = req.body;

    if (!restaurantID) {
      return res.status(400).json({ error: "restaurantID is Required" });
    }
    if (empId.length === 0) {
      return res.status(400).json({ error: "employee is Required" });
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1️ Fetch employees salary & coins
    const employees = await Employee.find(
      { _id: { $in: empId } },
      { salary: 1, CoinsPerMonth: 1, position: 1 },
    );

    const employeeMap = {};
    employees.forEach((emp) => {
      employeeMap[emp._id.toString()] = {
        salary: emp.salary || 0,
        coins: emp.CoinsPerMonth || 0,
        position: emp.position,
      };
    });

    const salaryRecords = [];
    const salaryTransactions = [];
    const skippedEmployees = [];

    // 2️⃣ Process each employee safely
    for (const id of empId) {
      //  Check if salary already credited
      const alreadyPaid = await SalaryRecord.findOne({
        employee: id,
        restaurantID,
        currentMonth,
        currentYear,
      });

      if (alreadyPaid) {
        skippedEmployees.push(id);
        continue; // skip this employee
      }

      //  SalaryRecord
      const salaryRecord = await SalaryRecord.create({
        employee: id,
        status,
        restaurantID,
        currentMonth,
        currentYear,
      });
      salaryRecords.push(salaryRecord);

      //  SalaryTransaction
      const salaryTxn = await SalaryTransaction.create({
        employee: id,
        type: "salary",
        amount: employeeMap[id]?.salary || 0,
        restaurantID,
        currentMonth,
        currentYear,
      });
      salaryTransactions.push(salaryTxn);

      //  Coins credit
      const empData = employeeMap[id];
      const coinsAmount = employeeMap[id]?.coins || 0;

      if (empData?.position === "employee" && coinsAmount > 0) {
        let coinsDoc = await Coins.findOne({
          employeeId: id,
          restaurantID,
        });

        if (!coinsDoc) {
          coinsDoc = await Coins.create({
            employeeId: id,
            restaurantID,
            totalEarned: 0,
            totalSpent: 0,
            coinsTransactions: [],
          });
        }

        const coinsTxn = await CoinsTransaction.create({
          employeeId: id,
          restaurantID,
          amount: coinsAmount,
          type: "credit",
          description: "Monthly coins credited with salary",
          currentMonth,
          currentYear,
        });

        coinsDoc.totalEarned += coinsAmount;
        coinsDoc.coinsTransactions.push(coinsTxn._id);
        await coinsDoc.save();
      }
    }

    res.status(201).json({
      salaryRecords,
      salaryTransactions,
      skippedEmployees,
      message: "Salary & coins processed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

const getRecord = async (req, res) => {
  try {
    const Record = await SalaryRecord.findById.populate("employee");
    res.status(200).json(Record);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const deleteRecord = async (req, res) => {
  try {
    const record = await SalaryRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.status(201).json({ message: "Record Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const getSalarySummary = async (req, res) => {
  try {
    const decodedId = await decodeToken(req);
    const { month, year } = req.query;

    if (month === undefined || year === undefined) {
      return res.status(400).json({
        success: false,
        message: "Month and year are required",
      });
    }

    // 🔹 Resolve restaurantID
    let restaurantID;
    const employeeUser = await Employee.findById(decodedId);
    restaurantID = employeeUser ? employeeUser.restaurantID : decodedId;

    // 🔹 1. Get employees
    const employees = await Employee.find({ restaurantID }).lean();

    // 🔹 2. Salary records for selected month
    const salaryRecords = await SalaryRecord.find({
      restaurantID,
      currentMonth: Number(month),
      currentYear: Number(year),
    }).lean();

    // 🔹 3. Advance transactions
    const salaryTransactions = await SalaryTransaction.find({
      restaurantID,
      currentMonth: Number(month),
      currentYear: Number(year),
      type: "advance",
    }).lean();

    // 🔹 4. PREVIOUS PAID SALARIES (🔴 MOVED INSIDE FUNCTION)
    const previousPaidSalaries = await SalaryRecord.find({
      restaurantID,
      status: "Paid",
      $or: [
        { currentYear: { $lt: Number(year) } },
        {
          currentYear: Number(year),
          currentMonth: { $lt: Number(month) },
        },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    // 🔹 Maps
    const salaryRecordMap = {};
    salaryRecords.forEach((rec) => {
      if (rec.employee) {
        salaryRecordMap[rec.employee.toString()] = rec;
      }
    });

    const advanceMap = {};
    salaryTransactions.forEach((txn) => {
      const empId = txn.employee.toString();
      advanceMap[empId] = (advanceMap[empId] || 0) + txn.amount;
    });

    const lastPaidMap = {};
    previousPaidSalaries.forEach((rec) => {
      const empId = rec.employee?.toString();
      if (empId && !lastPaidMap[empId]) {
        lastPaidMap[empId] = rec.updatedAt;
      }
    });

    // 🔹 Final response
    const result = employees
      .filter((emp) =>
        isEmployeeActiveInMonth(emp.createdAt, Number(month), Number(year)),
      )
      .map((emp) => {
        const empId = emp._id.toString();
        const salaryRec = salaryRecordMap[empId];
        const advanceTaken = advanceMap[empId] || 0;

        const salary = emp.salary || 0;
        const remainingSalary = Math.max(salary - advanceTaken, 0);

        return {
          employeeId: empId,
          name: emp.name,
          position: emp.position,
          salary,
          advanceTaken,
          remainingSalary,
          salaryStatus: salaryRec ? salaryRec.status : "Pending",
          lastSalaryPaidDate:
            salaryRec?.status === "Paid"
              ? salaryRec.updatedAt
              : lastPaidMap[empId] || null,
        };
      });

    res.status(200).json({
      success: true,
      month,
      year,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch salary summary",
      error: error.message,
    });
  }
};

const isEmployeeActiveInMonth = (createdAt, month, year) => {
  const createdDate = new Date(createdAt);
  const createdMonth = createdDate.getMonth();
  const createdYear = createdDate.getFullYear();

  return year > createdYear || (year === createdYear && month >= createdMonth);
};

module.exports = { createRecord, getSalarySummary, getRecord, deleteRecord };
