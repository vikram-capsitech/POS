// src/Layouts/Dashboard/SideNav.tsx
import React, { useEffect, useMemo } from "react";
import { Menu, Layout, Space, Typography, Badge, ConfigProvider } from "antd";
import type { MenuProps } from "antd";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useAuthStore } from "../../Store/store";
import { useTheme } from "../../Contexts/ThemeContext";
import { TabType, useAppStore } from "../../Store/app.store"; // ✅ update path if your file differs
import {
  Home,
  CheckSquare,
  AlertCircle,
  GitPullRequest,
  Fingerprint,
  Ticket,
  FileText,
  Bot,
  DollarSign,
  Hand,
  CreditCard,
  User,
  Settings,
  ShieldCheck,
  History,
  KeyRound,
} from "lucide-react";

const { Sider } = Layout;
const { Text } = Typography;

const SideNav: React.FC = () => {
  const { theme, themeType } = useTheme();
  const location = useLocation();
  const { orgId } = useParams();

  const session = useAuthStore((s) => s.session);
  const { role, modules, pages } = session;
  const organization = useAuthStore((s) => s.session.organization);

  // ✅ Update selected tab in your app store
  const updateTab = useAppStore((s) => s.updateTab);

  // hasPage: true if this page slug is in the role's allowed pages
  // null pages = admin/superadmin = full access
  const hasPage = (pageSlug: string) => {
    if (pages === null) return true; // no restriction
    return pages.includes(pageSlug);
  };

  // hasAccess: checks both module-level AND page-level access
  const hasAccess = (moduleKey: string) => {
    const MODULE_MAP: Record<string, string> = {
      pos: "POS",
      task: "MAIN",
      issueRaised: "MAIN",
      request: "MAIN",
      attendance: "HRM",
      voucher: "MAIN",
      sop: "MAIN",
      "ai-Review": "AI",
      salaryManagement: "PAYROLL",
      userProfile: "MAIN",
    };
    // Page slug map (moduleKey → page slug used by the role)
    const PAGE_MAP: Record<string, string> = {
      task: "task",
      issueRaised: "issue",
      request: "request",
      attendance: "attendance",
      voucher: "voucher",
      sop: "sop",
      "ai-Review": "ai-review",
      salaryManagement: "salary-management",
      userProfile: "user-profile",
    };

    const moduleNeeded = MODULE_MAP[moduleKey] || moduleKey.toUpperCase();
    const pageSlug = PAGE_MAP[moduleKey];

    // Must have the org module enabled
    if (!modules?.includes(moduleNeeded)) return false;

    // If there's a page restriction, check it
    if (pageSlug) return hasPage(pageSlug);

    return true;
  };

  const isPosVisible = modules?.includes("POS") && hasPage("pos");
  const userRole = role;

  const notifications = {
    task: 0,
    issue: 0,
    request: 0,
  };

  const base = orgId ? `/client/${orgId}` : "/client";

  // ✅ Robust active menu key resolver (fixes selection highlight)
  const activeKey = useMemo(() => {
    const p = location.pathname;

    // POS module route lives outside /client
    if (p.includes("/pos/")) return TabType.POS;

    // Superadmin routes
    if (p.startsWith("/superadmin/organizations")) return "sa-organizations";
    if (p.includes("/superadmin/checkin")) return "sa-checkin";
    if (p.includes("/superadmin/payments")) return "sa-payments";
    if (p.includes("/superadmin/settings")) return "sa-settings";

    if (p.includes("/dashboard")) return TabType.DEFAULT;
    if (p.includes("/task")) return TabType.TASK;
    if (p.includes("/issue")) return TabType.ISSUE;
    if (p.includes("/request")) return TabType.REQUEST;
    if (p.includes("/attendance")) return TabType.ATTENDANCE;
    if (p.includes("/voucher")) return TabType.VOUCHER;
    if (p.includes("/sop")) return TabType.SOP;
    if (p.includes("/ai-review")) return TabType.AI_REVIEW;
    if (p.includes("/salary-management")) return TabType.SALARY_MANAGEMENT;
    if (p.includes("/logs")) return TabType.ACTIVITY_LOGS;
    if (p.includes("/roles")) return "admin-roles";
    if (p.includes("/settings")) return TabType.SETTINGS;
    if (p.includes("/user-profile")) return TabType.USER_PROFILE;

    return TabType.DEFAULT;
  }, [location.pathname]);

  // ✅ Sync to app store (only for regular tab types, not superadmin keys)
  useEffect(() => {
    if (!activeKey.startsWith("sa-")) {
      updateTab?.(activeKey as any);
    }
  }, [activeKey, updateTab]);

  const items: MenuProps["items"] = [];

  // Home
  items.push({
    key: TabType.DEFAULT,
    icon: <Home size={18} />,
    label: <NavLink to={`${base}/dashboard`}>Home</NavLink>,
  });

  // POS
  if (userRole !== "superadmin" && isPosVisible) {
    items.push({
      key: TabType.POS,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      label: <NavLink to={`/pos/${orgId}/dashboard`}>POS</NavLink>,
    });
  }

  if (userRole !== "superadmin") {
    if (hasAccess("task")) {
      items.push({
        key: TabType.TASK,
        icon: (
          <Badge count={notifications.task} size="small" offset={[5, 0]}>
            <CheckSquare size={18} />
          </Badge>
        ),
        label: <NavLink to={`${base}/task`}>Task</NavLink>,
      });
    }
    if (hasAccess("issueRaised")) {
      items.push({
        key: TabType.ISSUE,
        icon: (
          <Badge count={notifications.issue} size="small" offset={[5, 0]}>
            <AlertCircle size={18} />
          </Badge>
        ),
        label: <NavLink to={`${base}/issue`}>Issue raised</NavLink>,
      });
    }
    if (hasAccess("request")) {
      items.push({
        key: TabType.REQUEST,
        icon: (
          <Badge count={notifications.request} size="small" offset={[5, 0]}>
            <GitPullRequest size={18} />
          </Badge>
        ),
        label: <NavLink to={`${base}/request`}>Request</NavLink>,
      });
    }
    if (hasAccess("attendance")) {
      items.push({
        key: TabType.ATTENDANCE,
        icon: <Fingerprint size={18} />,
        label: <NavLink to={`${base}/attendance`}>Attendance</NavLink>,
      });
    }
    if (hasAccess("voucher")) {
      items.push({
        key: TabType.VOUCHER,
        icon: <Ticket size={18} />,
        label: <NavLink to={`${base}/voucher`}>Vouchers</NavLink>,
      });
    }
    if (hasAccess("sop")) {
      items.push({
        key: TabType.SOP,
        icon: <FileText size={18} />,
        label: <NavLink to={`${base}/sop`}>SOP</NavLink>,
      });
    }
    if (hasAccess("ai-Review")) {
      items.push({
        key: TabType.AI_REVIEW,
        icon: <Bot size={18} />,
        label: <NavLink to={`${base}/ai-review`}>AI Review</NavLink>,
      });
    }
    if (hasAccess("salaryManagement")) {
      items.push({
        key: TabType.SALARY_MANAGEMENT,
        icon: <DollarSign size={18} />,
        label: <NavLink to={`${base}/salary-management`}>Salary Management</NavLink>,
      });
    }

    if (userRole === "admin") {
      items.push({
        key: TabType.ACTIVITY_LOGS,
        icon: <History size={18} />,
        label: <NavLink to={`${base}/logs`}>Activity Logs</NavLink>,
      });
    }
  } // end if (userRole !== "superadmin")

  // Superadmin specific menu
  if (userRole === "superadmin") {
    items.push({
      key: "sa-organizations",
      icon: <ShieldCheck size={18} />,
      label: <NavLink to="/superadmin/organizations">Organizations</NavLink>,
    });
    items.push({
      key: "sa-checkin",
      icon: <Hand size={18} />,
      label: <NavLink to="/superadmin/checkin">Check-ins</NavLink>,
    });
    items.push({
      key: "sa-payments",
      icon: <CreditCard size={18} />,
      label: <NavLink to="/superadmin/payments">Payments</NavLink>,
    });
    items.push({ type: "divider" });
    items.push({
      key: "sa-settings",
      icon: <Settings size={18} />,
      label: <NavLink to="/superadmin/settings">Settings & Roles</NavLink>,
    });
  }

  if (userRole !== "superadmin" && hasAccess("userProfile")) {
    items.push({
      key: TabType.USER_PROFILE,
      icon: <User size={18} />,
      label: (
        <NavLink to={`${base}/user-profile`}>
          User Profile
        </NavLink>
      ),
    });
    items.push({ type: "divider" });
  }

  if (userRole === "admin") {
    items.push({ type: "divider" });
    items.push({
      key: "admin-roles",
      icon: <KeyRound size={18} />,
      label: <NavLink to={`${base}/roles`}>Role Management</NavLink>,
    });
    items.push({
      key: TabType.SETTINGS,
      icon: <Settings size={18} />,
      label: <NavLink to={`${base}/settings`}>Settings</NavLink>,
    });
  }

  const getPortalText = () => {
    if (userRole === "superadmin") return "Super Admin Portal";
    if (userRole === "admin") return "Admin Portal";
    if (userRole === "employee") return "Manager Portal";
    return null;
  };

  const portalText = getPortalText();
  const sidebarBg =
    themeType === "light"
      ? theme.light.primaryBackground
      : theme.dark.primaryBackground;

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemColor: "rgba(255, 255, 255, 0.65)",
            itemSelectedColor: "#FFFFFF",
            itemHoverColor: "#FFFFFF",
            itemSelectedBg: "rgba(255, 255, 255, 0.10)",
            itemActiveBg: "rgba(255, 255, 255, 0.10)",
            iconSize: 18,
            fontSize: 14,
            itemPaddingInline: 12,
            itemMarginInline: 0,
            itemBorderRadius: 10,
            itemHeight: 40,
          },
        },
      }}
    >
      <Sider
        width={250}
        className="custom-sidebar"
        style={{
          height: "100vh",
          background: sidebarBg,
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "20px 16px 12px 16px", textAlign: "left" }}>
          {organization?.logo ? (
            <img
              src={organization.logo}
              alt={organization?.name || "Organization"}
              style={{
                height: 28,
                maxHeight: 34,
                width: "auto",
                objectFit: "contain",
                display: "block",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: 850,
                letterSpacing: "1.2px",
                lineHeight: 1.1,
                fontSize: "clamp(16px, 2.2vw, 22px)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "block",
              }}
            >
              {userRole === "superadmin" ? "Super Admin" : organization?.name || "Welcome"}
            </Text>
          )}
        </div>

        {/* Menu */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Menu
            mode="inline"
            theme="dark"
            inlineIndent={14}
            selectedKeys={[activeKey]}
            items={items}
            style={{
              background: "transparent",
              borderRight: "none",
              padding: 0,
            }}
          />
        </div>

        {/* Footer */}
        {portalText && (
          <div
            style={{
              padding: "16px 16px",
              marginTop: "auto",
              borderTop: "1px solid rgba(255, 255, 255, 0.10)",
              background: "rgba(0,0,0,0.10)",
            }}
          >
            <Space>
              <ShieldCheck size={18} color="#FFFFFF" />
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                {portalText}
              </Text>
            </Space>
          </div>
        )}
      </Sider>
    </ConfigProvider>
  );
};

export default SideNav;
