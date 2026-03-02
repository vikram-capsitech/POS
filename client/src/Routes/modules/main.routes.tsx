// src/routes/modules/main.routes.tsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import MainLayout from "../../layouts/Dashboard/Index"; // your current main dashboard layout
import InProgress from "../../pages/InProgress";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const MainOrgSelect = Loadable(lazy(() => import("../../pages/Admin/OrganizationList")));
const MainDashboard = Loadable(lazy(() => import("../../pages/Admin/OrganizationDashboard")));

import { useAuthStore } from "../../Store/store";
import Task from "../../pages/Admin/Task/Task";
const CreateTask = Loadable(lazy(() => import("../../pages/Admin/Task/CreateTask")));
const Logs = Loadable(lazy(() => import("../../pages/Admin/Logs/Logs")));

function ClientIndexRedirect() {
  const orgId = useAuthStore((s) => s.session?.restaurantId);
  if (orgId) {
    return <Navigate to={`/client/${orgId}`} replace />;
  }
  return <MainOrgSelect />;
}

export const mainRoutes = {
  path: "/client",
  element: (
    <RequireAuth>
      <RequirePermission moduleKey="MAIN">
        <MainLayout />
      </RequirePermission>
    </RequireAuth>
  ),
  children: [
    { index: true, element: <ClientIndexRedirect /> },
    {
      path: ":orgId",
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <MainDashboard /> },

        // Modules from old side bar (showing InProgress for now)
        // { path: "pos", element: <InProgress name="POS" /> },
        { path: "task", element: <Task /> },
        { path: "task/new", element: <CreateTask /> },
        { path: "task/:id", element: <CreateTask /> },
        { path: "task/:id/edit", element: <CreateTask /> },
        { path: "issue", element: <InProgress name="Issue raised" /> },
        { path: "request", element: <InProgress name="Request" /> },
        { path: "attendance", element: <InProgress name="Attendance" /> },
        { path: "voucher", element: <InProgress name="Vouchers" /> },
        { path: "sop", element: <InProgress name="SOP" /> },
        { path: "ai-review", element: <InProgress name="AI Review" /> },
        { path: "salary-management", element: <InProgress name="Salary Management" /> },
        { path: "logs", element: <Logs /> },

        // Superadmin modules
        { path: "checkin", element: <InProgress name="Check-ins" /> },
        { path: "payments", element: <InProgress name="Payments" /> },

        // Profiles & Settings
        { path: "user-profile", element: <InProgress name="User Profile" /> },
        { path: "settings", element: <InProgress name="Settings" /> },
      ],
    },
  ],
};