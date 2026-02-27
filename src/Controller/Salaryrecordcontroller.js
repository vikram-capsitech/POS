import asyncHandler from "express-async-handler";
import SalaryRecord from "../../models/workforce/SalaryRecord.js";
import SalaryTransaction from "../../models/workforce/SalaryTransaction.js";
import EmployeeProfile from "../../models/core/EmployeeProfile.js";
import Coins from "../../models/finance/Coins.js";
import CoinsTransaction from "../../models/finance/CoinsTransaction.js";
import ApiError from "../../utils/ApiError.js";
import { sendBulkNotification } from "../../services/notificationService.js";

// ─── Process Salary (bulk) ────────────────────────────────────────────────────

export const createRecord = asyncHandler(async (req, res) => {
  const { employee: empIds, status } = req.body;
  const organizationID = req.user.organizationID;

  if (!empIds?.length) throw new ApiError(400, "At least one employee ID required");

  const now          = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  const profiles = await EmployeeProfile.find({
    userID: { $in: empIds }, organizationID,
  }).lean();

  const profileMap = {};
  profiles.forEach((p) => { profileMap[p.userID.toString()] = p; });

  const salaryRecords      = [];
  const salaryTransactions = [];
  const skippedEmployees   = [];

  for (const id of empIds) {
    const alreadyPaid = await SalaryRecord.findOne({
      employee: id, organizationID, currentMonth, currentYear,
    });
    if (alreadyPaid) { skippedEmployees.push(id); continue; }

    const p        = profileMap[id.toString()];
    const salary   = p?.salary        || 0;
    const coinsAmt = p?.coinsPerMonth || 0;
    const position = p?.position;

    const record = await SalaryRecord.create({
      employee: id, organizationID, status, currentMonth, currentYear,
    });
    salaryRecords.push(record);

    const txn = await SalaryTransaction.create({
      organizationID, employee: id, amount: salary,
      type: "salary", currentMonth, currentYear,
    });
    salaryTransactions.push(txn);

    // Coins for employees only (not managers)
    if (position === "employee" && coinsAmt > 0) {
      let wallet = await Coins.findOne({ employeeID: id, organizationID });
      if (!wallet) {
        wallet = await Coins.create({ employeeID: id, organizationID, totalEarned: 0, totalSpent: 0 });
      }

      await CoinsTransaction.create({
        organizationID, employeeID: id,
        amount: coinsAmt, type: "credit",
        description: "Monthly coins credited with salary",
      });

      wallet.totalEarned += coinsAmt;
      await wallet.save();
    }

    // Reset monthly advance tracker
    await EmployeeProfile.findOneAndUpdate(
      { userID: id },
      { $set: { monthlyAdvanceTaken: 0, monthlySalaryReceived: 0, lastPaidAt: now } }
    );
  }

  if (salaryRecords.length > 0) {
    await sendBulkNotification({
      recipientIDs:   salaryRecords.map((r) => r.employee),
      organizationID,
      type:           "success",
      category:       "salary",
      title:          "Salary Credited",
      message:        `Your salary for ${now.toLocaleString("default", { month: "long" })} ${currentYear} has been processed.`,
    });
  }

  res.status(201).json({
    success:          true,
    message:          "Salary processed",
    processed:        salaryRecords.length,
    skipped:          skippedEmployees.length,
    salaryRecords,
    salaryTransactions,
    skippedEmployees,
  });
});

// ─── Salary Summary ───────────────────────────────────────────────────────────

export const getSalarySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  if (month === undefined || year === undefined) {
    throw new ApiError(400, "month and year are required");
  }

  const organizationID = req.user.organizationID;
  const m = Number(month);
  const y = Number(year);

  const [profiles, salaryRecords, advances, previousPaid] = await Promise.all([
    EmployeeProfile.find({ organizationID })
      .populate("userID", "displayName profilePhoto")
      .lean(),
    SalaryRecord.find({ organizationID, currentMonth: m, currentYear: y }).lean(),
    SalaryTransaction.find({ organizationID, currentMonth: m, currentYear: y, type: "advance" }).lean(),
    SalaryRecord.find({
      organizationID, status: "Paid",
      $or: [
        { currentYear: { $lt: y } },
        { currentYear: y, currentMonth: { $lt: m } },
      ],
    }).sort({ updatedAt: -1 }).lean(),
  ]);

  const salaryMap  = {};
  salaryRecords.forEach((r) => { if (r.employee) salaryMap[r.employee.toString()] = r; });

  const advanceMap = {};
  advances.forEach((t) => {
    const k = t.employee.toString();
    advanceMap[k] = (advanceMap[k] || 0) + t.amount;
  });

  const lastPaidMap = {};
  previousPaid.forEach((r) => {
    const k = r.employee?.toString();
    if (k && !lastPaidMap[k]) lastPaidMap[k] = r.updatedAt;
  });

  const result = profiles
    .filter((p) => _wasHiredByMonth(p.hireDate, m, y))
    .map((p) => {
      const id           = p.userID?._id?.toString();
      const salary       = p.salary || 0;
      const advanceTaken = advanceMap[id] || 0;
      const remaining    = Math.max(salary - advanceTaken, 0);
      const rec          = salaryMap[id];

      return {
        employeeId:         id,
        name:               p.userID?.displayName,
        photo:              p.userID?.profilePhoto,
        position:           p.position,
        salary,
        advanceTaken,
        remainingSalary:    remaining,
        salaryStatus:       rec ? rec.status : "Pending",
        lastSalaryPaidDate: rec?.status === "Paid" ? rec.updatedAt : lastPaidMap[id] || null,
      };
    });

  res.status(200).json({
    success: true, month: m, year: y,
    count:        result.length,
    totalPayable: result.reduce((s, e) => s + e.remainingSalary, 0),
    data:         result,
  });
});

// ─── Get Single Record ────────────────────────────────────────────────────────
// Bug fix from original: SalaryRecord.findById.populate() — was missing the ID arg, always crashed

export const getRecord = asyncHandler(async (req, res) => {
  const record = await SalaryRecord.findById(req.params.id)
    .populate("employee", "displayName");
  if (!record) throw new ApiError(404, "Record not found");
  res.status(200).json({ success: true, data: record });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

export const deleteRecord = asyncHandler(async (req, res) => {
  const record = await SalaryRecord.findByIdAndDelete(req.params.id);
  if (!record) throw new ApiError(404, "Record not found");
  res.status(200).json({ success: true, message: "Salary record deleted" });
});

const _wasHiredByMonth = (hireDate, month, year) => {
  if (!hireDate) return true;
  const d = new Date(hireDate);
  return year > d.getFullYear() || (year === d.getFullYear() && month >= d.getMonth());
};