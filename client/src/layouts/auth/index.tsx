// src/layouts/auth/AuthLayout.tsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Layout, Space } from "antd";
import Background from "../../Assets/Images/Background.png";
import { useAuthStore } from "../../Store/store";

const { Content } = Layout;

const AuthLayout: React.FC = () => {
  const location = useLocation();

  // ✅ Zustand selectors (NO useStore from zustand)
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const token = useAuthStore((s) => s.session.token);

  // If your app has an org-selection store, plug it here.
  // For now, we infer "has any org access" from auth store.
  const hasAnyOrgAccess = useAuthStore((s) => Object.keys(s.session.orgAccess || {}).length > 0);

  // Treat token or isLoggedIn as logged-in
  const authed = Boolean(token) || Boolean(isLoggedIn);

  // ✅ Redirect logic
  // If logged in and no org access -> go to org selection page
  if (authed && !hasAnyOrgAccess) {
    return (
      <Navigate
        to="/client/organization"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // NOTE: Redirection to /client is handled by Login component or guards.
  // Removing early redirect to avoid conflict with specific orgId redirects.

  const layoutStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor doesn't accept gradients; use background instead
    background:
      "linear-gradient(180deg, #F4F9FF 0%, #FBFBFB 47.23%, #F4F9FF 101.21%)",
    paddingTop: 100,
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  };

  const spaceStyle: React.CSSProperties = {
    width: "100%",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
  };

  return (
    <Layout style={layoutStyle}>
      <Content style={contentStyle}>
        <Space direction="vertical" style={spaceStyle}>
          <Outlet />
        </Space>
      </Content>
    </Layout>
  );
};

export default AuthLayout;