// src/routes/modules/pos.routes.tsx
import React, { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import LoadingScreen from "../../Components/LoadingScreen";
import RequireAuth from "../guards/RequireAuth";
import RequirePermission from "../guards/RequirePermission";
import PosLayout from "../../layouts/Pos/Index";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../Store/store";

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

function PosIndexRedirect() {
  const { orgId } = useParams();
  const session = useAuthStore((s) => s.session);
  const roleName = session.orgAccess?.[orgId || ""]?.roleName?.toLowerCase() || "";

  if (roleName === "waiter") {
    return <Navigate to="waiter" replace />;
  }
  if (roleName === "kitchen") {
    return <Navigate to="kitchen" replace />;
  }
  return <Navigate to="dashboard" replace />;
}

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
        { index: true, element: <PosIndexRedirect /> },

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
