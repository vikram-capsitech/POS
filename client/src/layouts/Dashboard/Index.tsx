import React, { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Layout, Dropdown, Avatar, Space, Typography, Button } from "antd";
import SideNav from "./SideNav";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuthStore } from "../../Store/store";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import type { MenuProps } from "antd";
import NotificationBell from "../../Components/Notificationbell";
import NotificationsPage from "../../pages/Admin/notifications/Notificationspage";

const { Header, Content } = Layout;
const { Text } = Typography;

const DashboardLayout = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  // Show full notifications page inline (without a route change)
  const [showNotificationsPage, setShowNotificationsPage] = useState(false);

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  const orgId = session?.restaurantId;
  const roleName =
    session?.orgAccess?.[orgId || ""]?.roleName?.toLowerCase() || "";
  const isWaitOrKitchen = roleName === "waiter" || roleName === "kitchen";

  const handleLogout = () => {
    clearSession();
    navigate("/auth/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile Settings",
      onClick: () => navigate("/client/user-profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Account Settings",
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      {!isWaitOrKitchen && <SideNav />}

      <Layout
        style={{
          background: themeType === "light" ? "#f5f7fa" : "#141414",
        }}
      >
        {/* ── Header ── */}
        <Header
          style={{
            padding: "0 24px",
            background: themeType === "light" ? "#fff" : "#1f1f1f",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
            zIndex: 10,
          }}
        >
          <Space size="middle">
            {/* Theme toggle */}
            <Button
              type="text"
              icon={
                themeType === "light" ? (
                  <Moon size={18} />
                ) : (
                  <Sun size={18} />
                )
              }
              onClick={() =>
                setThemeType(themeType === "light" ? "dark" : "light")
              }
            />

            {/* ── Notification Bell ── 
                onViewAll opens the NotificationsPage inline;
                swap for navigate("/notifications") if you prefer a route */}
            <NotificationBell
              onViewAll={() => setShowNotificationsPage(true)}
            />

            {/* User dropdown */}
            <Dropdown
              menu={{ items: menuItems }}
              placement="bottomRight"
              arrow
            >
              {/*TODO: need to add profilephoto in store*/}
              <Space style={{ cursor: "pointer" }}>
                <Avatar
                  src={(session as any)?.profilePhoto}
                  icon={<UserOutlined />}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "1.2",
                  }}
                >
                  <Text strong>{session?.name || "User"}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {session?.role || "Member"}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* ── Content ── */}
        <Content
          style={{
            margin: 16,
            background: themeType === "light" ? "#fff" : "#1f1f1f",
            borderRadius: 12,
            overflow: "auto",
            padding: 16,
          }}
        >
          {/* Show notifications full page over content, or normal outlet */}
          {showNotificationsPage ? (
            <NotificationsPage
              onBack={() => setShowNotificationsPage(false)}
            />
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;