// src/routes/modules/pos.routes.tsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import PosLayout from "../../layouts/Pos/Index";
import InProgress from "../../pages/InProgress";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const PosDashboard = Loadable(lazy(() => import("../../pages/Pos/PosDashboard")));

export const posRoutes = {
  path: "/pos",
  element: (
    <RequireAuth>
      <RequirePermission moduleKey="POS">
        <PosLayout />
      </RequirePermission>
    </RequireAuth>
  ),
  children: [
    {
      path: ":orgId",
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: "dashboard", element: <PosDashboard /> },

        // POS Module Sub-routes (showing InProgress for now)
        { path: "new-order", element: <InProgress name="New sale terminal" /> },
        { path: "history", element: <InProgress name="Order history" /> },
        { path: "customers", element: <InProgress name="Customer management" /> },
        { path: "reports", element: <InProgress name="POS Analytics" /> },
        { path: "settings", element: <InProgress name="POS Settings" /> },
      ],
    },
    { path: "", element: <Navigate to="/client" replace /> },
  ],
};