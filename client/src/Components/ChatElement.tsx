import { Avatar, Row, Col, Typography, List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { ChatListItemInterface } from "../Interfaces/chat";
import { getChatObjectMetadata } from "../Utils";
import { AuthInitialState } from "../redux/slices/auth";
import moment from "moment";
import { setCurrentChat } from "../redux/slices/chat";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";
import {
  ActiveIcon,
  DNDIcon,
  IdleIcon,
  OfflineIcon,
} from "../Assets/CustomAntIcons";
import React from "react";
import { useSocket } from "../Contexts/SocketContext";
import { useTheme } from "../Contexts/ThemeContext";
import { ToggleSidebar } from "../redux/slices/app";

const truncateText = (string: any, n: any) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

const ChatElement = (chat: ChatListItemInterface) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { user, currentOrganization } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );
  const { sideBar } = useSelector((state: any) => state.app);
  const { currentChat } = useSelector((state: any) => state.chat);
  const selectedChatId = currentChat?._id?.toString();
  const { Title, Text } = Typography;
  let isSelected = selectedChatId === chat._id;
  if (!selectedChatId) isSelected = false;
  const metadata = getChatObjectMetadata(chat, user!);
  const { chats } = useSelector((state: any) => state?.chat);
  const { socket } = useSocket();
  const TYPING_EVENT = "typing";
  const STOP_TYPING_EVENT = "stopTyping";
  const [typingChats, setTypingChats] = React.useState<{
    [key: string]: boolean;
  }>({});
  const isSelfChat =
    chat.participants?.length === 1 ||
    (chat.participants?.length === 2 &&
      chat.participants.every((p: any) => p._id === user?._id));
  const displayTitle = isSelfChat ? user?.userName : metadata.title;
  const displayAvatar = isSelfChat ? user?.pic : metadata.avatar;
  const allStatuses = chats?.map((chat: any) => {
    const otherParticipants =
      chat?.participants?.filter(
        (participant: any) =>
          participant._id !== chat?.admin && participant._id !== user?._id
      ) || [];
    return {
      chatId: chat?._id,
      statuses:
        otherParticipants.length > 0 ? otherParticipants[0].userStatus : null,
    };
  });

  const chatStatus = allStatuses?.find(
    (status: any) => status.chatId === chat?._id
  );

  React.useEffect(() => {
    if (!socket) return;
    const handleTyping = (chatId: string) => {
      setTypingChats((prev) => ({ ...prev, [chatId]: true }));
    };
    const handleStopTyping = (chatId: string) => {
      setTypingChats((prev) => ({ ...prev, [chatId]: false }));
    };
    socket.on(TYPING_EVENT, handleTyping);
    socket.on(STOP_TYPING_EVENT, handleStopTyping);
    return () => {
      socket.off(TYPING_EVENT, handleTyping);
      socket.off(STOP_TYPING_EVENT, handleStopTyping);
    };
  }, [socket]);

  React.useEffect(() => {}, [currentChat]);

  return (
    <List.Item
      onClick={() => {
        dispatch(setCurrentChat(chat) as any);
        dispatch(ToggleSidebar(sideBar.type, false) as any);
        navigate(`client/${currentOrganization.id}/message/${chat?._id}`);
      }}
      onDoubleClick={() => {
        navigate(`client/${currentOrganization.id}`);
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
      style={{
        width: "100%",
        padding: "8px",
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
      }}
    >
      <Row justify="space-between" align="middle" style={{ width: "100%" }}>
        <Col flex="auto">
          <Row gutter={12} align="middle">
            <Col>
              <div className="avatar-container">
                <Avatar
                  icon={<UserOutlined />}
                  src={displayAvatar ?? ""}
                  size={35}
                />
                {chatStatus?.statuses && (
                  <span>
                    {chatStatus.statuses === "Online" && (
                      <ActiveIcon className="active-icon" />
                    )}
                    {chatStatus.statuses === "Idle" && (
                      <IdleIcon className="idle-icon" />
                    )}
                    {chatStatus.statuses === "Do Not Disturb" && (
                      <DNDIcon className="dnd-icon" />
                    )}
                    {chatStatus.statuses === "Offline" && (
                      <OfflineIcon className="offline-icon" />
                    )}
                  </span>
                )}
              </div>
            </Col>

            <Col flex="auto">
              <Title
                level={5}
                style={{
                  color: isSelected
                    ? themeType === "light"
                      ? theme.light.primaryText
                      : theme.dark.primaryText
                    : themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                  lineHeight: "13.38px",
                  fontSize: fontSizes.body,
                  fontWeight: isSelected ? 500 : 400,
                  marginBottom: "4px",
                  fontFamily: fontFamily,
                }}
              >
                {truncateText(displayTitle, 16)}
              </Title>
              {metadata.lastMessage && (
                <Text
                  style={{
                    lineHeight: "13.38px",
                    fontSize: fontSizes.body,
                    fontWeight: 400,
                    color: isSelected
                      ? themeType === "light"
                        ? theme.light.primaryText
                        : theme.dark.primaryText
                      : themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                    fontFamily: fontFamily,
                  }}
                >
                  {typingChats[chat._id]
                    ? "Typing..."
                    : truncateText(metadata.lastMessage, 22)}
                </Text>
              )}
            </Col>
          </Row>
        </Col>

        <Col
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Text
            type="secondary"
            style={{
              fontSize: fontSizes.subheading,
              color: isSelected
                ? themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText
                : themeType === "light"
                ? theme.light.textLight
                : theme.dark.textLight,
              fontWeight: 400,
              lineHeight: "13.86px",
              fontFamily: fontFamily,
            }}
          >
            {moment(chat.updatedAt).calendar(null, {
              sameDay: "h:mm A",
              lastDay: "[Yesterday]",
              lastWeek: "dddd",
              sameElse: "MM/DD/YYYY",
            })}
          </Text>
        </Col>
      </Row>
    </List.Item>
  );
};

export default ChatElement;
