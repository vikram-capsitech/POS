import React from "react";
import { Avatar, Divider, Menu, Popover, Typography } from "antd";
import { useSelector } from "react-redux";
import {
  ActiveIcon,
  DNDIcon,
  IdleIcon,
  OfflineIcon,
  ProfileStatusIcon,
} from "../../Assets/CustomAntIcons";
import { useTheme } from "../../Contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { dispatch } from "../../redux/store";
import { ChangeUserStatus, LogoutUser } from "../../redux/slices/auth";
import { SideBarType, ToggleSidebar } from "../../redux/slices/app";
import { LogOut, UserRound, UserRoundPen } from "lucide-react";

const { Text } = Typography;

const UserProfileCard: React.FC = () => {
  const navigate = useNavigate();
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const user = useSelector((state: any) => state?.auth?.user);
  const { sideBar } = useSelector((state: any) => state.app);
  const status = user?.userStatus;

  const statusMenu = (
    <Menu
      selectedKeys={[]}
      style={{
        minWidth: "160px",
        borderRadius: "6px",
        backgroundColor:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        padding: 0,
      }}
    >
      <Menu.Item
        key="1"
        onClick={() => {
          dispatch(ChangeUserStatus("Online"))
        }}
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <ActiveIcon
            style={{ marginRight: "10px", flexShrink: 0 }}
            width={16}
            height={16}
          />
          <span>Online</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => {
          dispatch(ChangeUserStatus("Idle"))
        }}
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <IdleIcon
            strokeWidth={1}
            size={20}
            style={{ marginRight: "10px", flexShrink: 0 }}
          />
          <span>Idle</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={() => {
          dispatch(ChangeUserStatus("Do Not Disturb"))
        }}
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <DNDIcon
            strokeWidth={1}
            size={20}
            style={{ marginRight: "10px", flexShrink: 0 }}
          />
          <span>Do not Disturb</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="4"
        onClick={() => {
          dispatch(ChangeUserStatus("Offline"))
        }}
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <OfflineIcon
            strokeWidth={1}
            size={20}
            style={{ marginRight: "10px", flexShrink: 0 }}
          />
          <span>Offline</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  const profileMenu = (
    <Menu
      selectedKeys={[]}
      style={{
        minWidth: "160px",
        borderRadius: "6px",
        backgroundColor:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        padding: 0,
      }}
    >
      <Menu.Item
        key="1"
        onClick={() => {
          navigate(`/client/${currentOrganization?.id}/settings`);
          dispatch(ToggleSidebar(SideBarType.PROFILE, false) as any);
        }}
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <UserRoundPen
            strokeWidth={1}
            size={20}
            style={{ marginRight: "10px", flexShrink: 0 }}
          />
          <span>Edit Profile</span>
        </div>
      </Menu.Item>

      <Menu.Item
        key="2"
        style={{
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px 16px",
        }}
      >
        <Popover
          overlayClassName="custom-popover"
          content={statusMenu}
          arrow={false}
          placement="bottomLeft"
          title=""
          trigger="click"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              height: "100%",
            }}
          >
            <ProfileStatusIcon
              strokeWidth={1}
              size={20}
              style={{ marginRight: "10px", flexShrink: 0 }}
            />
            <span>Profile Status</span>
          </div>
        </Popover>
      </Menu.Item>

      <Menu.Item
        key="3"
        onClick={() => {
          dispatch(LogoutUser() as any);
          dispatch(ToggleSidebar(sideBar.type, false) as any);
          navigate("/auth/login");
        }}
        style={{
          padding: "10px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            height: "100%",
          }}
        >
          <LogOut
            strokeWidth={1}
            size={20}
            style={{
              marginRight: "10px",
              stroke:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          />
          <span
            style={{
              fontWeight: 400,
              fontSize: "13px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Log Out
          </span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: "5px 11px" }}>
      <Divider
        style={{
          borderColor:
            themeType === "light" ? theme.light.border : theme.dark.border,
          margin: "11px 0px",
        }}
      />
      <Popover
        overlayClassName="custom-popover"
        content={profileMenu}
        arrow={false}
        placement="bottomLeft"
        title=""
        trigger="click"
      >
        <div
          style={{
            backgroundColor:
              themeType === "light" ? theme.light.hover : theme.dark.hover,
            padding: "10px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          {/* Avatar */}
          <div className="avatar-container" style={{ position: "relative" }}>
            <Avatar
              icon={<UserRound strokeWidth={1} size={20} />}
              src={user?.pic}
            />
            {status === "Online" && (
              <ActiveIcon
                className="active-icon"
                style={{ position: "absolute", bottom: "0", right: "0" }}
              />
            )}
            {status === "Idle" && (
              <IdleIcon
                className="idle-icon"
                style={{ position: "absolute", bottom: "0", right: "0" }}
              />
            )}
            {status === "Do Not Disturb" && (
              <DNDIcon
                className="dnd-icon"
                style={{ position: "absolute", bottom: "0", right: "0" }}
              />
            )}
            {status === "Offline" && (
              <OfflineIcon
                className="offline-icon"
                style={{ position: "absolute", bottom: "0", right: "0" }}
              />
            )}
          </div>

          {/* User Info */}
          <div style={{ marginLeft: "10px" }}>
            <Text
              style={{
                fontSize: fontSizes.label,
                fontWeight: 500,
                lineHeight: "20.16px",
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontFamily: fontFamily,
              }}
            >
              {user?.displayName || "User Name"}
            </Text>
            <br />
            <Text
              style={{
                fontSize: fontSizes.paragraph,
                fontFamily: fontFamily,

                fontWeight: 400,
                lineHeight: "13.86px",
                color:
                  themeType === "light"
                    ? theme.light.textLight
                    : theme.dark.textLight,
              }}
            >
              {user?.designation || "User Designation"}
            </Text>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default UserProfileCard;
