import express from "express";
import { UserLog } from "../../Models/index.js";
import { protect } from "../../Middlewares/Auth.middleware.js";
import { orgScope } from "../../Middlewares/Orgscope.middleware.js";
import ApiResponse from "../../Utils/ApiResponse.js";
import asyncHandler from "express-async-handler";

const router = express.Router();

// GET /api/logs?module=TASK&resourceID=...
router.get(
  "/",
  protect,
  orgScope,
  asyncHandler(async (req, res) => {
    const { module, resourceID, action, page = 1, limit = 20 } = req.query;

    const filter = { organizationID: req.organizationID };

    if (module) filter.module = module;
    if (resourceID) filter.resourceID = resourceID;
    if (action) filter.action = action;

    const skip = (page - 1) * limit;

    const logs = await UserLog.find(filter)
      .populate("userID", "userName displayName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await UserLog.countDocuments(filter);

    return res.json(
      new ApiResponse(
        200,
        {
          logs,
          total,
          page: Number(page),
          totalPages: Math.ceil(total / limit),
        },
        "Logs fetched successfully"
      )
    );
  })
);

export default router;
