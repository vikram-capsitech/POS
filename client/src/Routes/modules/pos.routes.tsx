// src/routes/modules/pos.routes.tsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import PosLayout from "../../layouts/Pos/Index";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const PosDashboard = Loadable(
  lazy(() => import("../../pages/Pos/PosDashboard")),
);
const WaiterView = Loadable(lazy(() => import("../../pages/Pos/WaiterView")));
const KitchenDisplay = Loadable(
  lazy(() => import("../../pages/Pos/KitchenDisplay")),
);
const MenuManager = Loadable(lazy(() => import("../../pages/Pos/MenuManager")));
const ExpenseTracker = Loadable(
  lazy(() => import("../../pages/Pos/ExpenseTracker")),
);
const DeliveryHub = Loadable(lazy(() => import("../../pages/Pos/DeliveryHub")));

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

        // ── Core ──────────────────────────────────────────────
        { path: "dashboard", element: <PosDashboard /> },

        // ── Role-specific views ───────────────────────────────
        { path: "waiter", element: <WaiterView /> },
        { path: "kitchen", element: <KitchenDisplay /> },

        // ── Admin management ──────────────────────────────────
        { path: "menu", element: <MenuManager /> },
        { path: "delivery", element: <DeliveryHub /> },
        { path: "expenses", element: <ExpenseTracker /> },
      ],
    },
    { path: "", element: <Navigate to="/client" replace /> },
  ],
};
