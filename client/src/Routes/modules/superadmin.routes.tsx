// src/routes/modules/superadmin.routes.tsx
import React, { Suspense, lazy } from "react";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import InProgress from "../../pages/InProgress";

export const superAdminRoutes = {
  path: "/superadmin",
  element: (
    <RequireAuth>
      <RequirePermission moduleKey="SUPERADMIN">
        <div style={{ minHeight: "100vh", padding: 24 }}>
          <InProgress name="Super Admin Layout" />
        </div>
      </RequirePermission>
    </RequireAuth>
  ),
  children: [
    { index: true, element: <InProgress name="SuperDashboard" /> },
    { path: "organizations", element: <InProgress name="OrgsManage" /> },
    { path: "users", element: <InProgress name="UsersManage" /> },
  ],
};
