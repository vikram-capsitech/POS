import { Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/Dashboard/Index";
import { DEFAULT_PATH } from "../Config";
import ChatComponent from "../pages/Dashboard/Conversation";
import BugDashboard from "../Components/BugDashboard";

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
    { path: "client/:orgId/message/:clientId", element: <ChatComponent /> },
    { path: "client/:orgId/group/:clientId", element: <ChatComponent /> },
    { path: "client/:orgId/bug/:bugId", element: <BugDashboard /> },
    { path: "*", element: <Navigate to="/client" replace /> },
  ],
};
export default ClientRoutes;
