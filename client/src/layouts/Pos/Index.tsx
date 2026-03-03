import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { Layout, Dropdown, Avatar, Space, Typography, Button } from "antd";
import SideNav from "./SideNav";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuthStore } from "../../Store/store";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { Sun, Moon, ArrowLeft } from "lucide-react";
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;
const { Text } = Typography;

const PosLayout = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return <Navigate to={"/auth/login"} />;
  }

  const orgId = session?.restaurantId;
  const roleName = session?.orgAccess?.[orgId || ""]?.roleName?.toLowerCase() || "";
  const isWaitOrKitchen = roleName === "waiter" || roleName === "kitchen";

  const handleLogout = () => {
    clearSession();
    navigate("/auth/login");
  };

  const menuItems: MenuProps['items'] = [
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
    {
      type: "divider",
    },
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
      {/* Sidebar Navigation */}
      {!isWaitOrKitchen && <SideNav />}

      <Layout style={{ background: themeType === "light" ? "#fbfcfd" : "#0c0d0e" }}>
        {/* Header Section */}
        {!isWaitOrKitchen && (
          <Header
            style={{
              padding: "0 24px",
              background: themeType === "light" ? "#fff" : "#1f1f1f",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              zIndex: 1,
              height: 64
            }}
          >
            <Space>
              <Button
                icon={<ArrowLeft size={16} />}
                onClick={() => navigate(`/client/${orgId}/dashboard`)}
                style={{ borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}
              >
                Exit POS
              </Button>
              <Divider type="vertical" />
              <Text strong style={{ fontSize: 16 }}>Point of Sale Terminal</Text>
            </Space>

            <Space size="large">
              <Button
                type="text"
                icon={themeType === "light" ? <Moon size={18} /> : <Sun size={18} />}
                onClick={() => setThemeType(themeType === "light" ? "dark" : "light")}
              />

              <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                <Space style={{ cursor: "pointer" }}>
                  <Avatar icon={<UserOutlined />} />
                  <div style={{ display: "flex", flexDirection: "column", lineHeight: "1.2" }}>
                    <Text strong>{session?.name || "User"}</Text>
                    <Text type="secondary" style={{ fontSize: "12px", textTransform: "capitalize" }}>
                      {roleName || session?.role || "Member"}
                    </Text>
                  </div>
                </Space>
              </Dropdown>
            </Space>
          </Header>
        )}

        {/* Main Content Area */}
        <Content
          style={{
            margin: "0px",
            background: themeType === "light" ? "#fbfcfd" : "#0c0d0e",
            overflow: "auto",
            padding: "24px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

// Internal Divider import if missing or just use an inline div
import { Divider } from "antd";

export default PosLayout;
