import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import {
    Layout, Dropdown, Avatar, Space, Typography, Button, Tag, App,
} from "antd";
import type { MenuProps } from "antd";
import {
    UserOutlined, LogoutOutlined, SettingOutlined,
} from "@ant-design/icons";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useAuthStore } from "../../Store/store";
import SuperAdminSideNav from "./SideNav";

const { Header, Content } = Layout;
const { Text } = Typography;

const SuperAdminLayout: React.FC = () => {
    const { themeType, setThemeType } = useTheme();
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
    const session = useAuthStore((s) => s.session);
    const clearSession = useAuthStore((s) => s.clearSession);
    const navigate = useNavigate();
    const { message } = App.useApp();

    // Guard: must be logged in
    if (!isLoggedIn) return <Navigate to="/auth/login" />;

    // Guard: must be superadmin
    const role = session?.role;
    if (role !== "superadmin") {
        message.error("Access denied. This area is for super admins only.");
        return <Navigate to="/auth/login" />;
    }

    const handleLogout = () => {
        clearSession();
        navigate("/auth/login");
    };

    const menuItems: MenuProps["items"] = [
        {
            key: "settings",
            icon: <SettingOutlined />,
            label: "SA Settings",
            onClick: () => navigate("/superadmin/settings"),
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
            {/* SuperAdmin-only Sidebar */}
            <SuperAdminSideNav />

            {/* Main Content Area */}
            <Layout
                style={{
                    background: themeType === "light" ? "#f5f7fa" : "#0f0f1a",
                    transition: "background 0.3s",
                }}
            >
                {/* Top Header */}
                <Header
                    style={{
                        padding: "0 24px",
                        background: themeType === "light"
                            ? "#ffffff"
                            : "#1a1040",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        boxShadow: themeType === "light"
                            ? "0 1px 4px rgba(0,0,0,0.08)"
                            : "0 1px 4px rgba(0,0,0,0.4)",
                        zIndex: 10,
                    }}
                >
                    {/* Left: Breadcrumb hint */}
                    <div>
                        <Tag
                            color="purple"
                            style={{
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: 12,
                                letterSpacing: "0.5px",
                                padding: "2px 10px",
                            }}
                        >
                            🛡️ SUPER ADMIN PANEL
                        </Tag>
                    </div>

                    {/* Right: Actions */}
                    <Space size="middle">
                        <Button
                            type="text"
                            icon={
                                themeType === "light"
                                    ? <Moon size={18} />
                                    : <Sun size={18} />
                            }
                            onClick={() =>
                                setThemeType(themeType === "light" ? "dark" : "light")
                            }
                            title="Toggle theme"
                        />

                        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                            <Space style={{ cursor: "pointer" }}>
                                <Avatar
                                    icon={<UserOutlined />}
                                    style={{ background: "#5240d6" }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        lineHeight: "1.2",
                                    }}
                                >
                                    <Text strong style={{ fontSize: 13 }}>
                                        {session?.name || "Super Admin"}
                                    </Text>
                                    <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                    >
                                        {session?.email || "superadmin"}
                                    </Text>
                                </div>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                {/* Page Content */}
                <Content
                    style={{
                        margin: "20px 24px",
                        background: themeType === "light" ? "#ffffff" : "#1a1040",
                        borderRadius: 14,
                        padding: "24px",
                        overflow: "auto",
                        boxShadow: themeType === "light"
                            ? "0 1px 6px rgba(0,0,0,0.06)"
                            : "0 1px 6px rgba(0,0,0,0.3)",
                        minHeight: "calc(100vh - 112px)",
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default SuperAdminLayout;
