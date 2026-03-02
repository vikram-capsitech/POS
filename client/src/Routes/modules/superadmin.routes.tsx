// src/routes/modules/superadmin.routes.tsx
import React, { Suspense, lazy } from "react";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import SuperAdminLayout from "../../modules/superadmin/layout/SuperAdminLayout";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const SuperDashboard = Loadable(lazy(() => import("../../modules/superadmin/pages/Dashboard")));
const OrgsManage = Loadable(lazy(() => import("../../modules/superadmin/pages/Organizations")));
const UsersManage = Loadable(lazy(() => import("../../modules/superadmin/pages/Users")));

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
    { index: true, element: <SuperDashboard /> },
    { path: "organizations", element: <OrgsManage /> },
    { path: "users", element: <UsersManage /> },
  ],
};