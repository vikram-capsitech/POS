import { validationResult } from "express-validator";
import ApiError from "../Utils/ApiError.js";

// Run after any validator array in a route.
// Collects all validation errors and throws a 422 with details.
//
// Usage in routes:
//   router.post("/", userRegisterValidator(), validate, createUser)

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  // Format errors into a clean array: [{ field: "email", message: "Email is invalid" }]
  const formattedErrors = errors.array().map((err) => ({
    field:   err.path,
    message: err.msg,
  }));

  throw new ApiError(422, "Validation failed", formattedErrors);
};