import React from "react";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import {
  EditChannelIcon,
  KeybindsIcon,
  NotificationIcon,
  PermissionIcon,
  PrivacyIcon,
} from "../../../Assets/CustomAntIcons";
import { LeftOutlined } from "@ant-design/icons";
import { LogoutUser } from "../../../redux/slices/auth";
import { dispatch } from "../../../redux/store";
import { ProfileMain } from "../../../Sections/dashboard/Settings/Profile";
import { ThemeSwitcher } from "../../../Sections/dashboard/Settings/ThemeSwitcher";
import { useTheme } from "../../../Contexts/ThemeContext";
import {
  AudioLines,
  Building2,
  CircleUser,
  LogOut,
  Palette,
  ShieldUser,
} from "lucide-react";
import WorkspaceProfile from "../../../Sections/dashboard/Settings/WorkspaceProfile";
import { useSelector } from "react-redux";

const SettingPage = () => {
  const navigate = useNavigate();
  const { user, currentOrganization } = useSelector((state: any) => state.auth);
  const { theme, themeType } = useTheme();
  const [selectedKey, setSelectedKey] = React.useState("Account");
  const [isLogoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const { fontFamily, fontSizes } = useTheme();
  const showLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const handleLogout = () => {
    dispatch(LogoutUser());
    navigate("/auth/login");
  };

  const handleMenuClick = (e: any) => {
    setSelectedKey(e);
  };

  const isAdmin = currentOrganization?.admin[0] === user?._id;

  const menuData = [
    {
      title: "Workspace",
      children: [
        isAdmin && 
        {
          label: "Workspace Profile",
          icon: (
            <Building2
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
        },

        {
          label: "Edit Channel",
          icon: (
            <EditChannelIcon
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                stroke:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
        {
          label: "Roles",
          icon: (
            <ShieldUser
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
        {
          label: "Permissions",
          icon: (
            <PermissionIcon
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                stroke:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
      ].filter(Boolean),
    },
    {
      title: "Account Setting",
      children: [
        {
          label: "Account",
          icon: (
            <CircleUser
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: false,
        },
        {
          label: "Privacy",
          icon: (
            <PrivacyIcon
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                stroke:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
      ],
    },
    {
      title: "App Setting",
      children: [
        {
          label: "Appearance",
          icon: (
            <Palette
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: false,
        },
        {
          label: "Commands / Keybinds",
          icon: (
            <KeybindsIcon
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                stroke:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
        {
          label: "Notification",
          icon: (
            <NotificationIcon
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                stroke:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
        {
          label: "Voice & Video",
          icon: (
            <AudioLines
              size={30}
              strokeWidth={1.25}
              style={{
                padding: "6px",
                borderRadius: "50%",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
          ),
          disabled: true,
        },
      ],
    },
  ];

  const renderItem = (item: any) => (
    <div
      key={item.label}
      onClick={() => {
        handleMenuClick(item.label);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 12px",
        borderRadius: 8,
        cursor: item.disabled ? "not-allowed" : "pointer",
        opacity: item.disabled ? 0.5 : 1,
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        color:
          themeType === "light"
            ? theme.light.textHilight
            : theme.dark.textHilight,
        marginBottom: 4,
      }}
    >
      <div
        style={{
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          borderRadius: "12px",
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.icon}
      </div>
      <span>{item.label}</span>
    </div>
  );

  return (
    <div
      style={{
        height: "100dvh",
        width: "100%",
        display: "flex",
        overflow: "hidden",
        background:
          themeType === "light"
            ? theme.light.neutralbackground
            : theme.dark.neutralbackground,
      }}
    >
      {/* Left Sidebar */}
      <div
        style={{
          width: "20%",
          flexShrink: 0,
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          margin: "6px",
        }}
      >
        {/* Back Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            padding: "12px",
            borderBottom: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
          }}
          onClick={() => {
            navigate("/client");
          }}
        >
          <LeftOutlined
            style={{
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          />
          <div
            style={{
              margin: 0,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              fontFamily: fontFamily,
              fontSize: fontSizes.header,
            }}
          >
            Settings
          </div>
        </div>

        {/* Menu Wrapper */}
        <div style={{ flexGrow: 1, overflowX: "scroll" }}>
          <div
            style={{
              padding: 16,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
            }}
          >
            {menuData.map((section) => (
              <div key={section.title} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    cursor: "pointer",
                    marginBottom: 8,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    fontSize: fontSizes.label,
                    fontFamily: fontFamily,
                  }}
                >
                  {section.title}
                </div>
                <div
                  style={{ fontSize: fontSizes.label, fontFamily: fontFamily }}
                >
                  {section.children.map(renderItem)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: "10px 18px" }}>
          <Button
            key="logout"
            icon={<LogOut strokeWidth={1.5} size={20} />}
            style={{
              color: themeType === "light" ? theme.light.text : theme.dark.text,
              fontWeight: 400,
              fontFamily: fontFamily,
              fontSize: fontSizes.body,
              width: "100%",
              background: theme.light.primaryBackground,
              border: "none",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              textAlign: "left",
              paddingLeft: "20px",
              padding: "23px",
            }}
            onClick={showLogoutModal}
          >
            Log Out
          </Button>
        </div>
      </div>

      <Modal
        maskClosable={false}
        closable={true}
        title="Confirm Logout"
        centered
        open={isLogoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Logout"
        cancelText="Cancel"
        style={{ borderRadius: "12px" }}
        okButtonProps={{
          style: {
            borderRadius: "6px",
            background:
              themeType === "light"
                ? theme.light.primaryBackground
                : theme.dark.primaryBackground,
            color: themeType === "light" ? theme.light.text : theme.dark.text,
          },
        }}
        cancelButtonProps={{
          style: {
            borderRadius: "6px",
            background:
              themeType === "light"
                ? theme.light.primaryBackground
                : theme.dark.primaryBackground,
            color: themeType === "light" ? theme.light.text : theme.dark.text,
          },
        }}
      >
        <p>Are you sure you want to log out?</p>
      </Modal>

      {/* Right Content Section */}
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexGrow: 1,
          minWidth: 0,
          borderRadius: 10,
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          marginLeft: "10px",
          // overflow: selectedKey === "Account" ? "hidden" : "auto",
          margin: "6px",
        }}
      >
        {selectedKey === "Account" && <ProfileMain />}
        {selectedKey === "Appearance" && <ThemeSwitcher />}
        {selectedKey === "Workspace Profile" && isAdmin && <WorkspaceProfile />}
      </div>
    </div>
  );
};

export default SettingPage;
