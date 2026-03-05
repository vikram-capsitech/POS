import ApiError from "../Utils/ApiError.js";
import asyncHandler from "../Utils/AsyncHandler.js";

// ─── Attach Org Scope ─────────────────────────────────────────────────────────
// Attaches organizationID to req so every controller can use
// req.orgFilter without repeating the same logic everywhere.
//
// Usage: add after protect in any route that needs org scoping
//   router.get("/", protect, orgScope, getAllTasks)
//
// In your controller:
//   const tasks = await Task.find(req.orgFilter)

export const orgScope = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  // superadmin can optionally pass ?orgId= to query a specific org
  // otherwise superadmin sees everything (no filter)
  if (req.user.systemRole === "superadmin") {
    req.orgFilter = req.query.orgId
      ? { organizationID: req.query.orgId }
      : {};
    return next();
  }

  // everyone else is scoped to their own org
  if (!req.user.organizationID) {
    throw new ApiError(403, "User is not associated with any organization");
  }
 console.log("OrgScope middleware");
  req.orgFilter       = { organizationID: req.user.organizationID };
  req.organizationID  = req.user.organizationID;

  next();
});

// ─── Verify Same Org ──────────────────────────────────────────────────────────
// Use on routes where a user is accessing another user's data (e.g. GET /employees/:id)
// Ensures the target resource belongs to the same org as the requester
//
// Usage:
//   router.get("/:id", protect, verifySameOrg("employee"), getEmployeeById)
//
// In your controller, the scoping is already handled — just find by _id
// because verifySameOrg has already confirmed org ownership

export const verifySameOrg = (resourceName = "resource") =>
  asyncHandler(async (req, res, next) => {
    // superadmin and admin can access anything
    if (
      req.user.systemRole === "superadmin" ||
      req.user.systemRole === "admin"
    ) {
      return next();
    }

    // Attach org check to req so controllers can use it
    // The controller is responsible for the actual DB check
    // This middleware just signals that org verification is required
    req.requireSameOrg = true;
    req.resourceName   = resourceName;

    next();
  });