// src/routes/modules/superadmin.routes.tsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
// ✅ Use the dedicated SuperAdmin layout — no shared code with main dashboard
import SuperAdminLayout from "../../layouts/SuperAdmin/Index";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const SuperAdminHome = Loadable(
  lazy(() => import("../../pages/SuperAdmin/SuperAdminHome")),
);
const OrganizationsTable = Loadable(
  lazy(() => import("../../pages/SuperAdmin/OrganizationsTable")),
);
const OrgDetailPage = Loadable(
  lazy(() => import("../../pages/SuperAdmin/OrgDetailPage")),
);
const SuperAdminSettings = Loadable(
  lazy(() => import("../../pages/SuperAdmin/SuperAdminSettings")),
);
const GlobalRolesPage = Loadable(
  lazy(() => import("../../pages/SuperAdmin/GlobalRolesPage")),
);
const SuperadminInvoices = Loadable(
  lazy(() => import("../../pages/SuperAdmin/SuperadminInvoices")),
);

const PlaceholderPage = ({ name }: { name: string }) => (
  <div style={{ padding: 48, textAlign: "center" }}>
    <h2 style={{ color: "#6b7280" }}>{name}</h2>
    <p style={{ color: "#9ca3af" }}>This section is coming soon.</p>
  </div>
);

export const superAdminRoutes = {
  path: "/superadmin",
  element: (
    <RequireAuth>
      <RequirePermission moduleKey="SUPERADMIN">
        <SuperAdminLayout />
      </RequirePermission>
    </RequireAuth>
  ),
  children: [
    // Default redirect to dashboard
    { index: true, element: <Navigate to="dashboard" replace /> },

    // Main pages
    { path: "dashboard", element: <SuperAdminHome /> },
    { path: "organizations", element: <OrganizationsTable /> },
    { path: "organizations/:id", element: <OrgDetailPage /> },

    // Global Roles management
    { path: "global-roles", element: <GlobalRolesPage /> },

    // Settings (Profile + Org Roles)
    { path: "settings", element: <SuperAdminSettings /> },

    // App pages
    {
      path: "checkin",
      element: <PlaceholderPage name="Check-ins (Coming Soon)" />,
    },
    { path: "payments", element: <SuperadminInvoices /> },
  ],
};
