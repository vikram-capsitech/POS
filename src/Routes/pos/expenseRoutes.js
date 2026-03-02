import express from "express";
import { protect } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import asyncHandler from "express-async-handler";
import Expense from "../../Models/pos/Expense.js";
import ApiResponse from "../../Utils/ApiResponse.js";

const router = express.Router();

// GET /api/pos/expenses
router.get(
  "/",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const { startDate, endDate, category, page = 1, limit = 50 } = req.query;
    const filter = { organizationID: req.organizationID };

    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.date.$lte = e;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(filter)
        .populate("addedBy", "displayName userName")
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Expense.countDocuments(filter),
    ]);

    // Totals by category
    const byCategory = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    return res.json(
      new ApiResponse(200, { expenses, total, byCategory, page: Number(page) }),
    );
  }),
);

// POST /api/pos/expenses
router.post(
  "/",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const {
      category,
      amount,
      description,
      date,
      paymentMethod,
      vendor,
      receiptUrl,
      isRecurring,
    } = req.body;
    const expense = await Expense.create({
      organizationID: req.organizationID,
      category,
      amount,
      description,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || "cash",
      addedBy: req.user._id,
      vendor,
      receiptUrl,
      isRecurring: isRecurring || false,
    });
    return res.status(201).json(new ApiResponse(201, expense, "Expense added"));
  }),
);

// PUT /api/pos/expenses/:id
router.put(
  "/:id",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, organizationID: req.organizationID },
      { $set: req.body },
      { new: true },
    );
    if (!expense)
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Expense not found"));
    return res.json(new ApiResponse(200, expense, "Expense updated"));
  }),
);

// DELETE /api/pos/expenses/:id
router.delete(
  "/:id",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    await Expense.findOneAndDelete({
      _id: req.params.id,
      organizationID: req.organizationID,
    });
    return res.json(new ApiResponse(200, {}, "Expense deleted"));
  }),
);

export default router;
