import express from "express";
import { UserLog } from "../../Models/index.js";
import { protect } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// ── GET /api/logs/stats ───────────────────────────────────────────────────────
// Returns summary stats: total, today's count, per-module breakdown
router.get(
  "/stats",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const orgFilter = { organizationID: req.organizationID };

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [total, todayCount, moduleCounts] = await Promise.all([
      UserLog.countDocuments(orgFilter),
      UserLog.countDocuments({ ...orgFilter, createdAt: { $gte: todayStart } }),
      UserLog.aggregate([
        { $match: orgFilter },
        { $group: { _id: "$module", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Count distinct active users today
    const activeUsersToday = await UserLog.distinct("userID", {
      ...orgFilter,
      createdAt: { $gte: todayStart },
    });

    return res.json(
      new ApiResponse(
        200,
        {
          total,
          todayCount,
          activeUsersToday: activeUsersToday.length,
          moduleCounts,
        },
        "Log stats fetched",
      ),
    );
  }),
);

// ── GET /api/logs ─────────────────────────────────────────────────────────────
// Supports filtering by: module, resourceID, action, userID, startDate, endDate, search
router.get(
  "/",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const {
      module,
      resourceID,
      action,
      userID,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { organizationID: req.organizationID };

    if (module) filter.module = module;
    if (resourceID) filter.resourceID = resourceID;
    if (action) filter.action = action;
    if (userID) filter.userID = userID;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = e;
      }
    }

    // Free-text search on action field
    if (search) {
      filter.action = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      UserLog.find(filter)
        .populate("userID", "userName displayName profilePhoto")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      UserLog.countDocuments(filter),
    ]);

    return res.json(
      new ApiResponse(
        200,
        {
          logs,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
        },
        "Logs fetched successfully",
      ),
    );
  }),
);

export default router;
