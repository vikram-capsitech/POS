import SalaryRecord from "../../Models/workforce/SalaryRecord.js";
import Employee from "../../Models/core/EmployeeProfile.js";
import SalaryTransaction from "../../Models/workforce/SalaryTransaction.js";
import Coins from "../../Models/finance/Coins.js";
import CoinsTransaction from "../../Models/finance/Coinstransaction.js";
import asyncHandler from "../../Utils/AsyncHandler.js";
import ApiError from "../../Utils/ApiError.js";

// ─────────────────────────────────────────────
//  POST /api/salary-records  (bulk credit salary)
// ─────────────────────────────────────────────
const createRecord = asyncHandler(async (req, res) => {
  // FIX: was using req.restaurantID — must use req.organizationID to match DB model field
  const organizationID = req.organizationID;
  const { employee: empIds, status } = req.body;

  if (!empIds?.length)
    throw new ApiError(400, "At least one employee ID is required");

  // FIX: status must be "Paid" or "Pending" only — DB model enum does not include "Processing"
  if (status && !["Paid", "Pending"].includes(status)) {
    throw new ApiError(400, "Invalid status. Must be 'Paid' or 'Pending'");
  }

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Fetch all employees in one query
  const employees = await Employee.find(
    { _id: { $in: empIds } },
    "salary CoinsPerMonth position",
  );
  const empMap = Object.fromEntries(
    employees.map((e) => [
      e._id.toString(),
      {
        salary: e.salary ?? 0,
        coins: e.CoinsPerMonth ?? 0,
        position: e.position,
      },
    ]),
  );

  const salaryRecords = [];
  const salaryTransactions = [];
  const skippedEmployees = [];

  for (const id of empIds) {
    // FIX: was using restaurantID in query — must match DB model field organizationID
    const alreadyPaid = await SalaryRecord.findOne({
      employee: id,
      organizationID,
      currentMonth,
      currentYear,
    });
    if (alreadyPaid) {
      skippedEmployees.push(id);
      continue;
    }

    const empData = empMap[id];

    // FIX: added amount field to SalaryRecord.create — DB model has amount field (default 0, min 0)
    // FIX: was using restaurantID — must use organizationID to match DB model
    const [salaryRecord, salaryTxn] = await Promise.all([
      SalaryRecord.create({
        employee: id,
        status,
        organizationID,
        amount: empData?.salary ?? 0,
        currentMonth,
        currentYear,
      }),
      SalaryTransaction.create({
        employee: id,
        type: "salary",
        amount: empData?.salary ?? 0,
        organizationID,
        currentMonth,
        currentYear,
      }),
    ]);
    salaryRecords.push(salaryRecord);
    salaryTransactions.push(salaryTxn);

    // Credit coins for regular employees
    if (empData?.position === "employee" && empData.coins > 0) {
      let coinsDoc = await Coins.findOne({ employeeId: id, organizationID });
      if (!coinsDoc) {
        coinsDoc = await Coins.create({
          employeeId: id,
          organizationID,
          totalEarned: 0,
          totalSpent: 0,
          coinsTransactions: [],
        });
      }

      const coinsTxn = await CoinsTransaction.create({
        employeeId: id,
        organizationID,
        amount: empData.coins,
        type: "credit",
        description: "Monthly coins credited with salary",
        currentMonth,
        currentYear,
      });

      coinsDoc.totalEarned += empData.coins;
      coinsDoc.coinsTransactions.push(coinsTxn._id);
      await coinsDoc.save();
    }
  }

  res.status(201).json({
    success: true,
    message: "Salary & coins processed successfully",
    data: { salaryRecords, salaryTransactions, skippedEmployees },
  });
});

// ─────────────────────────────────────────────
//  GET /api/salary-records/summary
// ─────────────────────────────────────────────
const getSalarySummary = asyncHandler(async (req, res) => {
  // FIX: was using restaurantID — must use organizationID to match DB model
  const organizationID = req.organizationID;
  const { month, year } = req.query;

  if (month === undefined || year === undefined) {
    throw new ApiError(400, "month and year are required");
  }

  const m = Number(month),
    y = Number(year);

  // FIX: all occurrences of restaurantID replaced with organizationID
  const [employees, salaryRecords, advances, prevPaid] = await Promise.all([
    Employee.find({ organizationID }).lean(),
    SalaryRecord.find({ organizationID, currentMonth: m, currentYear: y }).lean(),
    SalaryTransaction.find({
      organizationID,
      currentMonth: m,
      currentYear: y,
      type: "advance",
    }).lean(),
    SalaryRecord.find({
      organizationID,
      status: "Paid",
      $or: [
        { currentYear: { $lt: y } },
        { currentYear: y, currentMonth: { $lt: m } },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  const salaryMap = Object.fromEntries(
    salaryRecords.map((r) => [r.employee?.toString(), r]),
  );
  const advanceMap = {};
  advances.forEach((t) => {
    const id = t.employee.toString();
    advanceMap[id] = (advanceMap[id] ?? 0) + t.amount;
  });
  const lastPaidMap = {};
  prevPaid.forEach((r) => {
    const id = r.employee?.toString();
    if (id && !lastPaidMap[id]) lastPaidMap[id] = r.updatedAt;
  });

  const data = employees
    .filter((e) => isActiveInMonth(e.createdAt, m, y))
    .map((e) => {
      const id = e._id.toString();
      const rec = salaryMap[id];
      const adv = advanceMap[id] ?? 0;
      const sal = e.salary ?? 0;

      return {
        employeeId: id,
        name: e.name,
        position: e.position,
        salary: sal,
        advanceTaken: adv,
        remainingSalary: Math.max(sal - adv, 0),
        salaryStatus: rec ? rec.status : "Pending",
        lastSalaryPaidDate:
          rec?.status === "Paid" ? rec.updatedAt : (lastPaidMap[id] ?? null),
      };
    });

  res.json({ success: true, month, year, count: data.length, data });
});

const isActiveInMonth = (createdAt, month, year) => {
  const d = new Date(createdAt);
  return (
    year > d.getFullYear() ||
    (year === d.getFullYear() && month >= d.getMonth())
  );
};

// ─────────────────────────────────────────────
//  GET /api/salary-records/:id
// ─────────────────────────────────────────────
const getRecord = asyncHandler(async (req, res) => {
  const record = await SalaryRecord.findById(req.params.id).populate(
    "employee",
    "name salary position",
  );
  if (!record) throw new ApiError(404, "Salary record not found");
  res.json({ success: true, data: record });
});

// ─────────────────────────────────────────────
//  DELETE /api/salary-records/:id
// ─────────────────────────────────────────────
const deleteRecord = asyncHandler(async (req, res) => {
  const record = await SalaryRecord.findByIdAndDelete(req.params.id);
  if (!record) throw new ApiError(404, "Salary record not found");
  res.json({ success: true, message: "Record deleted successfully" });
});

export { createRecord, getSalarySummary, getRecord, deleteRecord };