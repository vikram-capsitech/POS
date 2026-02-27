import mongoose from "mongoose";
import ApiError from "../Utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Wrap non-ApiError instances into ApiError for consistent response shape
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
    const message = error.message || "Something went wrong";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle specific Mongoose errors with cleaner messages
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
    error = new ApiError(400, "Validation failed", messages);
  }

  if (err.code === 11000) {
    // Duplicate key error — e.g. unique email or username
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field} already exists`);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token has expired — please login again");
  }

  if (err.name === "CastError") {
    error = new ApiError(400, `Invalid ID format: ${err.value}`);
  }

  const response = {
    success:  false,
    message:  error.message,
    errors:   error.errors || [],
    // only expose stack trace in development
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  };

  return res.status(error.statusCode || 500).json(response);
};