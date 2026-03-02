import ApiError from "../Utils/ApiError.js";

// Catches any request that didn't match a defined route
// Must be registered AFTER all routes in server.js

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};