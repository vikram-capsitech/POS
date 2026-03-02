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
    if (!req.user || !req.organizationID) return;

    await UserLog.create({
      organizationID: req.organizationID,
      userID: req.user._id,
      action,
      module,
      resourceID,
      details,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
    // We don't throw here to avoid breaking the main request flow
  }
};
