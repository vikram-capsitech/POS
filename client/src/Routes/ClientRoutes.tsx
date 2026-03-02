import { Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/Dashboard/Index";
import { DEFAULT_PATH } from "../Config";
import InProgress from "../pages/InProgress";

const ClientRoutes: any = {
  path: "/",
  element: (
    // <RequireAuth>
    <DashboardLayout />
    // </RequireAuth>
  ),
  children: [
    { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
    { path: "client/:orgId" },
    {
      path: "client/:orgId/message/:clientId",
      element: <InProgress name="Chat" />,
    },
    {
      path: "client/:orgId/group/:clientId",
      element: <InProgress name="Group Chat" />,
    },
    { path: "client/:orgId/bug/:bugId", element: <InProgress name="Bugs" /> },
    { path: "*", element: <Navigate to="/client" replace /> },
  ],
};
export default ClientRoutes;
