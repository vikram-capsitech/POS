import React from "react";
import { Menu, Layout, Space, Typography, ConfigProvider } from "antd";
import type { MenuProps } from 'antd';
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useAuthStore } from "../../Store/store";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  LayoutDashboard,
  ShoppingCart,
  History,
  Users,
  BarChart3,
  LogOut,
  Settings,
  ShieldAlert
} from "lucide-react";

const { Sider } = Layout;
const { Text } = Typography;

const SideNav = () => {
  const { theme, themeType } = useTheme();
  const location = useLocation();
  const { orgId } = useParams();
  const session = useAuthStore((s) => s.session);
  const { role } = session;

  const base = `/pos/${orgId}`;

  const items: MenuProps['items'] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={18} />,
      label: <NavLink to={`${base}/dashboard`}>POS Home</NavLink>,
    },
    {
      key: "new-order",
      icon: <ShoppingCart size={18} />,
      label: <NavLink to={`${base}/new-order`}>New Sale</NavLink>,
    },
    {
      key: "history",
      icon: <History size={18} />,
      label: <NavLink to={`${base}/history`}>Order History</NavLink>,
    },
    {
      key: "customers",
      icon: <Users size={18} />,
      label: <NavLink to={`${base}/customers`}>Customers</NavLink>,
    },
    {
      key: "reports",
      icon: <BarChart3 size={18} />,
      label: <NavLink to={`${base}/reports`}>Analytics</NavLink>,
    },
    { type: "divider", style: { background: "rgba(255,255,255,0.06)" } },
    {
      key: "settings",
      icon: <Settings size={18} />,
      label: <NavLink to={`${base}/settings`}>POS Settings</NavLink>,
    }
  ];

  // Teal/Aqua theme for POS to distinguish from purple main app
  const sidebarBg = "#0D3B66"; // Deep Navy/Ocean blue for POS

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: "rgba(255, 255, 255, 0.7)",
            itemSelectedColor: "#FFFFFF",
            itemHoverColor: "#FFFFFF",
            itemSelectedBg: "rgba(255, 255, 255, 0.15)",
            itemActiveBg: "rgba(255, 255, 255, 0.15)",
            iconSize: 18,
            fontSize: 14,
            itemBorderRadius: 8,
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
          overflow: "hidden"
        }}
      >
        <div style={{ padding: "24px 24px 20px 24px", textAlign: "left" }}>
          <Space>
            <div style={{ background: "#4AD9E4", width: 8, height: 24, borderRadius: 2 }}></div>
            <Text style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 18, letterSpacing: "1px" }}>
              POS SYSTEM
            </Text>
          </Space>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={[location.pathname.split("/").pop() || "dashboard"]}
            items={items}
            style={{
              background: "transparent",
              borderRight: "none",
            }}
          />
        </div>

        <div style={{
          padding: "20px 24px",
          marginTop: "auto",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        }}>
          <Space>
            <ShieldAlert size={18} color="#FFBA08" />
            <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 12 }}>Terminal Mode</Text>
          </Space>
        </div>
      </Sider>
    </ConfigProvider>
  );
};

export default SideNav;
