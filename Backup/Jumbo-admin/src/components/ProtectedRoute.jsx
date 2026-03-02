import { Navigate, useParams } from "react-router-dom";

/**
 * ProtectedRoute component to restrict pages based on user role
 * @param {Component} Component - The page component to render
 * @param {string} userRole - The current user's role (admin, superadmin)
 * @param {string} requiredRole - The required role to access this route (optional)
 * @param {string[]} blockedRoles - Array of roles that are blocked from accessing (optional)
 */
export default function ProtectedRoute({
  Component,
  userRole,
  userAccess = [],
  requiredAccess = null,
  requiredRole = null,
  blockedRoles = [],
  allowedRoles = [],
  checkRoleParam,
}) {
  const params = useParams();
  // If user's role is in the blocked list, redirect to home
  if (blockedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // ADMIN-only check (skip for employee)
  if (requiredRole && userRole !== "employee" && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // EMPLOYEE ACCESS CHECK (MAIN LOGIC)
  if (userRole === "employee" && requiredAccess) {
    if (!userAccess.includes(requiredAccess)) {
      return <Navigate to="/" replace />;
    }
  }
  // Optional custom check based on params
  if (checkRoleParam && !checkRoleParam({ userRole, params })) {
    return <Navigate to="/" replace />;
  }

  // User is authorized, render the component
  return <Component />;
}
