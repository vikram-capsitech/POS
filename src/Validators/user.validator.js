import { body } from "express-validator";

// ─── Auth Validators ──────────────────────────────────────────────────────────

export const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("userName")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    body("phoneNumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),

    body("displayName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Display name must be at least 2 characters long"),

    body("gender")
      .optional()
      .isIn(["male", "female", "other"])
      .withMessage("Invalid gender value"),

    body("address")
      .optional()
      .trim(),

    body("dob")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date")
      .custom((value) => {
        if (new Date(value) >= new Date()) {
          throw new Error("Date of birth must be in the past");
        }
        return true;
      }),

    body("organizationID")
      .optional()
      .isMongoId()
      .withMessage("Invalid organization ID"),

    // block frontend from setting system-level roles
    body("systemRole")
      .not()
      .exists()
      .withMessage("systemRole cannot be set during registration"),

    body("roleID")
      .not()
      .exists()
      .withMessage("roleID cannot be set during registration"),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────

export const userLoginValidator = () => {
  return [
    body("loginEmail")
      .optional()
      .isEmail()
      .withMessage("Email is invalid"),

    body("userName")
      .optional(),

    body("loginPassword")
      .notEmpty()
      .withMessage("Password is required"),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────

export const userChangeCurrentPasswordValidator = () => {
  return [
    body("oldPassword")
      .notEmpty()
      .withMessage("Old password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .custom((value, { req }) => {
        if (value === req.body.oldPassword) {
          throw new Error("New password must be different from old password");
        }
        return true;
      }),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────

export const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────

export const userResetForgottenPasswordValidator = () => {
  return [
    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ];
};

// ─── Role & Org Validators ────────────────────────────────────────────────────

// used by admin when assigning a role to a user
export const userAssignRoleValidator = () => {
  return [
    body("roleID")
      .notEmpty()
      .withMessage("Role ID is required")
      .isMongoId()
      .withMessage("roleID must be a valid Mongo ID"),

    body("organizationID")
      .notEmpty()
      .withMessage("Organization ID is required")
      .isMongoId()
      .withMessage("organizationID must be a valid Mongo ID"),
  ];
};

// ─── Role CRUD Validators ─────────────────────────────────────────────────────

export const createRoleValidator = () => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Role name is required")
      .isLowercase()
      .withMessage("Role name must be lowercase")
      .isLength({ min: 2 })
      .withMessage("Role name must be at least 2 characters"),

    body("displayName")
      .trim()
      .notEmpty()
      .withMessage("Display name is required"),

    body("permissions")
      .isArray({ min: 1 })
      .withMessage("At least one permission is required"),

    body("permissions.*")
      .isMongoId()
      .withMessage("Each permission must be a valid Mongo ID"),

    body("organizationID")
      .notEmpty()
      .withMessage("Organization ID is required")
      .isMongoId()
      .withMessage("Invalid organization ID"),
  ];
};

// ─────────────────────────────────────────────────────────────────────────────

export const updateRoleValidator = () => {
  return [
    body("displayName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Display name must be at least 2 characters"),

    body("permissions")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Permissions must be a non-empty array"),

    body("permissions.*")
      .optional()
      .isMongoId()
      .withMessage("Each permission must be a valid Mongo ID"),
  ];
};

// ─── Profile Update Validator ─────────────────────────────────────────────────

export const updateUserProfileValidator = () => {
  return [
    body("displayName")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Display name must be at least 2 characters"),

    body("phoneNumber")
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),

    body("gender")
      .optional()
      .isIn(["male", "female", "other"])
      .withMessage("Invalid gender value"),

    body("address")
      .optional()
      .trim(),

    body("dob")
      .optional()
      .isISO8601()
      .withMessage("Date of birth must be a valid date")
      .custom((value) => {
        if (new Date(value) >= new Date()) {
          throw new Error("Date of birth must be in the past");
        }
        return true;
      }),

    body("designation")
      .optional()
      .trim(),

    body("about")
      .optional()
      .trim(),

    body("themeType")
      .optional()
      .isIn(["light", "dark"])
      .withMessage("Theme type must be light or dark"),

    body("sizeLevel")
      .optional()
      .isIn(["xs", "s", "m", "l", "xl"])
      .withMessage("Invalid size level"),

    body("status")
      .optional()
      .isIn(["Idle", "Online", "Offline", "Do Not Disturb"])
      .withMessage("Invalid status value"),

    body("fontFamily")
      .optional()
      .trim(),

    // these should never be updatable via profile route
    body("systemRole").not().exists().withMessage("Cannot update systemRole"),
    body("roleID").not().exists().withMessage("Cannot update roleID via profile"),
    body("organizationID").not().exists().withMessage("Cannot update organizationID via profile"),
    body("password").not().exists().withMessage("Use change password endpoint instead"),
  ];
};