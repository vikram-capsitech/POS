import { Typography, List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentChat } from "../redux/slices/chat";
import { useNavigate } from "react-router-dom";
import {
  PrivateChannelSmallIcon,
  SmallChannelIcon,
} from "../Assets/CustomAntIcons";
import { useTheme } from "../Contexts/ThemeContext";
import { ToggleSidebar } from "../redux/slices/app";

const { Text } = Typography;

const truncateText = (string: any, n: any) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

const GroupElement = (chat: any) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const { currentChat } = useSelector((state: any) => state.chat);
  const selectedChatId = currentChat?._id?.toString();
  const { sideBar } = useSelector((state: any) => state.app);

  let isSelected = selectedChatId === chat._id;
  if (!selectedChatId) {
    isSelected = false;
  }
  const handleClick = () => {
    dispatch(setCurrentChat(chat) as any);
    dispatch(ToggleSidebar(sideBar.type, false) as any);
    navigate(`client/${currentOrganization.id}/group/${chat?._id}`);
  };

  return (
    <List.Item
      onClick={handleClick}
      style={{
        width: "100%",
        padding: "12px",
        background: isSelected
          ? themeType === "light"
            ? theme.light.primaryLight
            : theme.dark.primaryLight
          : themeType === "light"
          ? theme.light.secondaryBackground
          : theme.dark.secondaryBackground,
        cursor: "pointer",
        transition: "background 0.2s ease-in-out",
        borderRadius: "8px",
        marginBottom: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background =
          themeType === "light" ? theme.light.hover : theme.dark.hover)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.background = isSelected
          ? themeType === "light"
            ? theme.light.primaryLight
            : theme.dark.primaryLight
          : themeType === "light"
          ? theme.light.secondaryBackground
          : theme.dark.secondaryBackground)
      }
    >
      {/* Left section: Icon & Channel Name */}
      <div
        style={{ display: "flex", alignItems: "center", borderRadius: "8px" }}
      >
        {chat.isPrivateGroup ? (
          <PrivateChannelSmallIcon
            stroke={
              isSelected
                ? themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText
                : themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight
            }
            style={{ fontSize: fontSizes.emoji, marginRight: 8 }}
          />
        ) : (
          <SmallChannelIcon
            fill={
              isSelected
                ? themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText
                : themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight
            }
            style={{ fontSize: fontSizes.emoji, marginRight: 8 }}
          />
        )}
        <Text
          style={{
            fontFamily: fontFamily,
            fontSize: fontSizes.body,
            fontWeight: isSelected ? 500 : 400,
            color: isSelected
              ? themeType === "light"
                ? theme.light.primaryText
                : theme.dark.primaryText
              : themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
            letterSpacing: 0,
            textAlign: "center",
          }}
        >
          {truncateText(chat.name, 16)}
        </Text>
      </div>

      {/* Three Dots Icon (hidden by default, appears on hover) */}
      {/* <ThreedotsIcon
        style={{
          marginLeft: "auto",
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
        }}
      /> */}
    </List.Item>
  );
};

export default GroupElement;
