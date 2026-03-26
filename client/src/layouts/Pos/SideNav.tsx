import React, { useMemo } from "react";
import { Menu, Layout, Space, Typography, ConfigProvider, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../Store/store";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  ChefHat,
  BarChart3,
  Wallet,
  Truck,
  Table2,
  Settings,
  LogOut,
  Menu as MenuIcon,
} from "lucide-react";

const { Sider } = Layout;
const { Text } = Typography;

const SideNav = () => {
  const { theme, themeType } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { orgId } = useParams();
  const session = useAuthStore((s) => s.session);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { role } = session;

  const base = `/pos/${orgId}`;

  // Use the app theme's primary color for the sidebar background
  const colors = themeType === "dark" ? theme.dark : theme.light;
  const sidebarBg = colors.primaryBackground;
  const activeItemBg = "rgba(255,255,255,0.18)";
  const iconColor = "rgba(255,255,255,0.75)";
  const activeIconColor = "#ffffff";
  const textColor = "rgba(255,255,255,0.75)";

  // Detect active key from path
  const activeKey = useMemo(() => {
    const path = location.pathname;
    if (path.includes("/kitchen")) return "kitchen";
    if (path.includes("/waiter")) return "waiter";
    if (path.includes("/menu")) return "menu";
    if (path.includes("/delivery")) return "delivery";
    if (path.includes("/expenses")) return "expenses";
    if (path.includes("/tables")) return "tables";
    return "dashboard";
  }, [location.pathname]);

  // ── Admin menu ─────────────────────────────────────────────────────────────
  const adminItems: MenuProps["items"] = [
    {
      key: "group-main",
      type: "group",
      label: (
        <Text
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Main
        </Text>
      ),
      children: [
        {
          key: "dashboard",
          icon: (
            <LayoutDashboard
              size={17}
              color={activeKey === "dashboard" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/dashboard`}>Dashboard</NavLink>,
        },
        {
          key: "waiter",
          icon: (
            <UtensilsCrossed
              size={17}
              color={activeKey === "waiter" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/waiter`}>Table & Orders</NavLink>,
        },
        {
          key: "kitchen",
          icon: (
            <ChefHat
              size={17}
              color={activeKey === "kitchen" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/kitchen`}>Kitchen Display</NavLink>,
        },
      ],
    },
    {
      key: "group-manage",
      type: "group",
      label: (
        <Text
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Manage
        </Text>
      ),
      children: [
        {
          key: "tables",
          icon: (
            <Table2
              size={17}
              color={activeKey === "tables" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/tables`}>Table Manager</NavLink>,
        },
        {
          key: "menu",
          icon: (
            <MenuIcon
              size={17}
              color={activeKey === "menu" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/menu`}>Menu Manager</NavLink>,
        },
        {
          key: "delivery",
          icon: (
            <Truck
              size={17}
              color={activeKey === "delivery" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/delivery`}>Delivery Hub</NavLink>,
        },
        {
          key: "expenses",
          icon: (
            <Wallet
              size={17}
              color={activeKey === "expenses" ? activeIconColor : iconColor}
            />
          ),
          label: <NavLink to={`${base}/expenses`}>Expenses</NavLink>,
        },
      ],
    },
  ];

  // ── Waiter menu ────────────────────────────────────────────────────────────
  const waiterItems: MenuProps["items"] = [
    {
      key: "waiter",
      icon: (
        <UtensilsCrossed
          size={17}
          color={activeKey === "waiter" ? activeIconColor : iconColor}
        />
      ),
      label: <NavLink to={`${base}/waiter`}>Take Orders</NavLink>,
    },
  ];

  // ── Kitchen menu ───────────────────────────────────────────────────────────
  const kitchenItems: MenuProps["items"] = [
    {
      key: "kitchen",
      icon: (
        <ChefHat
          size={17}
          color={activeKey === "kitchen" ? activeIconColor : iconColor}
        />
      ),
      label: <NavLink to={`${base}/kitchen`}>Kitchen Display</NavLink>,
    },
  ];

  const menuItems =
    role === "waiter" || role === "employee"
      ? waiterItems
      : role === "kitchen"
        ? kitchenItems
        : adminItems;

  const roleLabel =
    role === "waiter" || role === "employee"
      ? "Waiter"
      : role === "kitchen"
        ? "Kitchen Staff"
        : role === "admin"
          ? "Admin"
          : "Manager";

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: textColor,
            itemSelectedColor: "#ffffff",
            itemHoverColor: "#ffffff",
            itemSelectedBg: activeItemBg,
            itemActiveBg: activeItemBg,
            iconSize: 17,
            fontSize: 13,
            itemBorderRadius: 8,
            groupTitleColor: "rgba(255,255,255,0.35)",
          },
        },
      }}
    >
      <Sider
        width={220}
        style={{
          height: "100vh",
          background: sidebarBg,
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Logo / Brand */}
        <div
          style={{
            padding: "22px 20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Space>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingBag size={18} color="#fff" />
            </div>
            <div>
              <Text
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                POS System
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>
                {session.organization?.name ?? "Restaurant"}
              </Text>
            </div>
          </Space>
        </div>

        {/* Role badge */}
        <div style={{ padding: "10px 20px", marginBottom: 4 }}>
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              borderRadius: 6,
              padding: "4px 10px",
              display: "inline-block",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              👤 {roleLabel}
            </Text>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            style={{
              background: "transparent",
              borderRight: "none",
            }}
          />
        </div>

        {/* Bottom actions */}
        <div
          style={{
            padding: "12px 12px 20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Tooltip title="Go to main app" placement="right">
            <div
              onClick={() => navigate(`/client/${orgId}/dashboard`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <BarChart3 size={16} color={iconColor} />
              <Text style={{ color: textColor, fontSize: 13 }}>Main App</Text>
            </div>
          </Tooltip>
          <Tooltip title="Sign out" placement="right">
            <div
              onClick={() => {
                clearSession();
                navigate("/auth/login");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,77,79,0.15)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              <LogOut size={16} color="rgba(255,100,100,0.8)" />
              <Text style={{ color: "rgba(255,100,100,0.8)", fontSize: 13 }}>
                Sign Out
              </Text>
            </div>
          </Tooltip>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default SideNav;
