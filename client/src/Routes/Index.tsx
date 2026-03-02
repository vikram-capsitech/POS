import { Suspense, lazy } from "react";
import { Navigate, useRoutes } from "react-router-dom";
import DashboardLayout from "../layouts/Dashboard/Index";
import AuthLayout from "../layouts/auth/index";
import AnonymousLayout from "../layouts/Anonymous/index";
import { DEFAULT_PATH } from "../Config";
import LoadingScreen from "../Components/LoadingScreen";
import SettingPage from "../pages/Dashboard/Settings/Settings";
import BugDashboard from "../Components/BugDashboard";

const Loadable = (Component: any) => (props: any) => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pages
const ChatComponent = Loadable(
  lazy(() => import("../pages/Dashboard/Conversation"))
);
const NewLoginPage = Loadable(lazy(() => import("../pages/Auth/NewLogin")));
// const VerifyPage = Loadable(lazy(() => import("../pages/Auth/Verify")));
const RegisterPage = Loadable(lazy(() => import("../pages/Auth/Register")));
const Organization = Loadable(lazy(() => import("../pages/Organization")));

const GoogleAuthCallback = Loadable( lazy(() => import("../pages/Auth/GoogleAuthCallback")));
const GithubAuthCallback = Loadable( lazy(() => import("../pages/Auth/GithubAuthCallback")));
const VerifyPage = Loadable(lazy(() => import("../pages/Auth/VerifyEmail")));

// const ResetPasswordPage = Loadable(
//   lazy(() => import("../pages/Auth/ResetPassword"))
// );
// const NewPasswordPage = Loadable(
//   lazy(() => import("../pages/Auth/NewPassword"))
// );
// const NewMessage = Loadable(
//   lazy(() => import("../pages/Dashboard/NewMessage"))
// );
// const InvitationAcceptance = Loadable(
//   lazy(() => import("../pages/InvitationAcceptance"))
// );
const WelcomePage = Loadable(lazy(() => import("../pages/WelcomePage")));

export default function Router() {
  return useRoutes([
    // Authentication Routes
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        { path: "login", element: <NewLoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { path: "google/callback/verify", element: <GoogleAuthCallback /> },
        { path: "github/callback/verify", element: <GithubAuthCallback />},
        { path: "verify", element: <VerifyPage /> },

        // { path: "reset-password", element: <ResetPasswordPage /> },
        // { path: "new-password", element: <NewPasswordPage /> },
        // { path: "verify", element: <VerifyPage /> },
      ],
    },
    {
      path: "/client/organization",
      element: <Organization />,
    },
    // Authenticated User Routes
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to={DEFAULT_PATH} replace />, index: true },
        { path: "client/:orgId" },
        { path: "client/:orgId/message/:clientId", element: <ChatComponent /> },
        { path: "client/:orgId/group/:clientId", element: <ChatComponent /> },
        { path: "client/:orgId/bug/:bugId", element: <BugDashboard /> },
        { path: "*", element: <Navigate to="/client" replace /> },
      ],
    },
    // ClientRoutes,
    {
      path: "/client/:orgId/settings",
      element: <SettingPage />,
    },

    // Anonymous/Invitation Routes
    {
      path: "/anonymous",
      element: <AnonymousLayout />,
      children: [{ path: "welcome", element: <WelcomePage /> }],
    },
    // Catch-all Route
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
