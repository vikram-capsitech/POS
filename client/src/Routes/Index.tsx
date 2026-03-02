// src/routes/index.tsx  (the only Router used in App.tsx)
import { useRoutes, Navigate } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import LoadingScreen from "../Components/LoadingScreen";
import AuthLayout from "../layouts/auth/index";
import AnonymousLayout from "../layouts/Anonymous/index";

import { mainRoutes } from "./modules/main.routes";
import { posRoutes } from "./modules/pos.routes";

const Loadable = (C: any) => (props: any) => (
  <Suspense fallback={<LoadingScreen />}>
    <C {...props} />
  </Suspense>
);

const NewLoginPage = Loadable(lazy(() => import("../pages/Auth/Login")));
const WelcomePage = Loadable(lazy(() => import("../pages/WelcomePage")));

export default function Router() {
  return useRoutes([
    // AUTH
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        { path: "login", element: <NewLoginPage /> },
        // { path: "register", element: <RegisterPage /> },
        // { path: "google/callback/verify", element: <GoogleAuthCallback /> },
        // { path: "github/callback/verify", element: <GithubAuthCallback /> },
        // { path: "verify", element: <VerifyPage /> },
      ],
    },

    // MODULES
    mainRoutes,
    posRoutes,
    // hrmRoutes,
    // crmRoutes,
    // inventoryRoutes,
    // financeRoutes,
    // superAdminRoutes,

    // ANONYMOUS
    {
      path: "/anonymous",
      element: <AnonymousLayout />,
      children: [{ path: "welcome", element: <WelcomePage /> }],
    },

    // ROOT REDIRECT
    { path: "/", element: <Navigate to="/client" replace /> },

    // ERRORS
    { path: "/403", element: <div>403 Forbidden</div> },
    { path: "/404", element: <div>404 Not Found</div> },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}
