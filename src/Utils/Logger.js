import { UserLog } from "../Models/index.js";

/**
 * Logs a user action to the database.
 * @param {Object} req - The express request object (must have req.user and req.organizationID)
 * @param {String} action - The action string (e.g., "TASK_CREATED")
 * @param {String} module - The module name (e.g., "TASK")
 * @param {String} resourceID - The ID of the primary resource affected
 * @param {Object} details - Any additional metadata
 */
export const logUserAction = async (req, action, module, resourceID = null, details = {}) => {
  try {
    // Guard: bail out if req or required fields are missing
    if (!req || !req.user || !req.organizationID || !req.headers) return;

    const ip =
      (req.headers["x-forwarded-for"]?.split(",")[0]?.trim()) ||
      req.ip ||
      req.socket?.remoteAddress ||
      null;

    await UserLog.create({
      organizationID: req.organizationID,
      userID: req.user._id,
      action,
      module,
      resourceID,
      details,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
};
