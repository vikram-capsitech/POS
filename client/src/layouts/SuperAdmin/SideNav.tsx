import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Layout, Menu, Typography, Space, Badge, ConfigProvider } from "antd";
import type { MenuProps } from "antd";
import {
    LayoutDashboard,
    Building2,
    Globe,
    CreditCard,
    LogIn,
    Settings,
    ShieldCheck,
} from "lucide-react";
import { useTheme } from "../../Contexts/ThemeContext";
import { useMemo } from "react";

const { Sider } = Layout;
const { Text } = Typography;

const SA_PURPLE = "#5240d6";
const SA_PURPLE_LIGHT = "#6c5ce7";

const navItems = [
    {
        key: "/superadmin/dashboard",
        icon: <LayoutDashboard size={18} />,
        label: "Dashboard",
        to: "/superadmin/dashboard",
    },
    {
        key: "/superadmin/organizations",
        icon: <Building2 size={18} />,
        label: "Organizations",
        to: "/superadmin/organizations",
    },
    {
        key: "/superadmin/global-roles",
        icon: <Globe size={18} />,
        label: "Global Roles",
        to: "/superadmin/global-roles",
        badge: true,
    },
    { type: "divider" as const },
    {
        key: "/superadmin/checkin",
        icon: <LogIn size={18} />,
        label: "Check-ins",
        to: "/superadmin/checkin",
    },
    {
        key: "/superadmin/payments",
        icon: <CreditCard size={18} />,
        label: "Payments",
        to: "/superadmin/payments",
    },
    { type: "divider" as const },
    {
        key: "/superadmin/settings",
        icon: <Settings size={18} />,
        label: "Settings",
        to: "/superadmin/settings",
    },
];

const SuperAdminSideNav: React.FC = () => {
    const location = useLocation();
    const { themeType } = useTheme();

    const activeKey = useMemo(() => {
        const p = location.pathname;
        // Match /superadmin/organizations/:id as organizations
        if (p.startsWith("/superadmin/organizations")) return "/superadmin/organizations";
        if (p.startsWith("/superadmin/global-roles")) return "/superadmin/global-roles";
        if (p.startsWith("/superadmin/settings")) return "/superadmin/settings";
        if (p.startsWith("/superadmin/checkin")) return "/superadmin/checkin";
        if (p.startsWith("/superadmin/payments")) return "/superadmin/payments";
        return "/superadmin/dashboard";
    }, [location.pathname]);

    const menuItems: MenuProps["items"] = navItems.map((item) => {
        if (item.type === "divider") return { type: "divider" };
        return {
            key: item.key,
            icon: item.icon,
            label: (
                <NavLink to={item.to} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {item.label}
                    {item.badge && (
                        <Badge
                            count="NEW"
                            style={{
                                fontSize: 9,
                                height: 16,
                                lineHeight: "16px",
                                background: SA_PURPLE_LIGHT,
                                color: "white",
                                padding: "0 4px",
                                borderRadius: 3,
                            }}
                        />
                    )}
                </NavLink>
            ),
        };
    });

    const sidebarBg = themeType === "light"
        ? `linear-gradient(180deg, #1e1248 0%, #2d1e6b 50%, #1a1040 100%)`
        : `linear-gradient(180deg, #0d0a1e 0%, #1a1040 100%)`;

    return (
        <Sider
            width={250}
            style={{
                minHeight: "100vh",
                background: sidebarBg,
                position: "relative",
                borderRight: "none",
                flexShrink: 0,
            }}
        >
            {/* Brand Header */}
            <div
                style={{
                    padding: "22px 20px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    marginBottom: 8,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            background: `linear-gradient(135deg, ${SA_PURPLE}, ${SA_PURPLE_LIGHT})`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: "0 2px 8px rgba(82,64,214,0.5)",
                        }}
                    >
                        <ShieldCheck size={20} color="white" />
                    </div>
                    <div>
                        <Text
                            style={{
                                color: "#ffffff",
                                fontWeight: 800,
                                fontSize: 15,
                                letterSpacing: "0.3px",
                                display: "block",
                                lineHeight: 1.2,
                            }}
                        >
                            Super Admin
                        </Text>
                        <Text
                            style={{
                                color: "rgba(255,255,255,0.45)",
                                fontSize: 11,
                                letterSpacing: "0.5px",
                            }}
                        >
                            Platform Control
                        </Text>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <ConfigProvider
                theme={{
                    components: {
                        Menu: {
                            itemColor: "rgba(255,255,255,0.65)",
                            itemSelectedColor: "#ffffff",
                            itemHoverColor: "#ffffff",
                            itemSelectedBg: "rgba(255,255,255,0.12)",
                            itemActiveBg: "rgba(255,255,255,0.08)",
                            itemBorderRadius: 10,
                            itemHeight: 42,
                            fontSize: 14,
                            iconSize: 18,
                        },
                    },
                }}
            >
                <Menu
                    mode="inline"
                    theme="dark"
                    selectedKeys={[activeKey]}
                    items={menuItems}
                    inlineIndent={16}
                    style={{
                        background: "transparent",
                        borderRight: "none",
                        padding: "4px 8px",
                    }}
                />
            </ConfigProvider>

            {/* Bottom Badge */}
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "14px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(0,0,0,0.2)",
                }}
            >
                <Space>
                    <div
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#22c55e",
                            boxShadow: "0 0 6px #22c55e",
                        }}
                    />
                    <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                        Platform Online
                    </Text>
                </Space>
            </div>
        </Sider>
    );
};

export default SuperAdminSideNav;
