import React, { useEffect, useRef, useState } from "react";
import { Layout, Space } from "antd";
import { ChatHeader, ChatFooter } from "../../Components/Chat";
import {
  ForwardMsg,
  ReplyMsg,
  TextMsg,
} from "../../Sections/dashboard/Conversation";
import { useDispatch, useSelector } from "react-redux";
import addNotification from "react-push-notification";
import {
  clearHighlight,
  SetChats,
  setCurrentChat,
  updateMessages,
  updateUnreadMessages,
} from "../../redux/slices/chat";
import { requestHandler } from "../../Utils";
import { getChatMessages, sendMessage } from "../../Api";
import { useSocket } from "../../Contexts/SocketContext";
import {
  ChatListItemInterface,
  ChatMessageInterface,
} from "../../Interfaces/chat";
import wings from "../../Assets/Images/wings.svg";
import _ from "lodash";
import { showSnackbar } from "../../redux/slices/app";
import { useTheme } from "../../Contexts/ThemeContext";
import ChatLoadingScreen from "../../Components/ChatLoader";
import { useNavigate } from "react-router-dom";

const JOIN_CHAT_EVENT = "joinChat";
const USER_LEFT_EVENT = "userLeft";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
export const DELETE_MESSAGE_EVENT = "deletedMessage";
export const REACTION_MESSAGE_EVENT = "reactionMessage";
export const EDIT_MESSAGE_EVENT = "editMessage";

const Conversation = ({ messages, setChatMessages, onReply }: any) => {
  const scrollRef = React.useRef<any>();
  const highlightedMessage = useSelector(
    (state: any) => state.chat.highlightedMessage
  );
  const [localHighlight, setLocalHighlight] = useState<string | null>(null);
  const { theme, themeType } = useTheme();
  const dispatch = useDispatch();
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightedMessage?.id && messageRefs.current[highlightedMessage.id]) {
      const el = messageRefs.current[highlightedMessage.id];
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      setLocalHighlight(highlightedMessage.id);
      const timeout = setTimeout(() => {
        setLocalHighlight(null);
        dispatch(clearHighlight());
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [highlightedMessage?.timestamp]);

  // React.useEffect(() => {
  //   const lastMessage = messages[messages.length - 1];
  //   if (lastMessage && lastMessage._id !== lastMessageId) {
  //     setLastMessageId(lastMessage._id);
  //     scrollRef?.current?.scrollIntoView({ behavior: "instant" });
  //   }
  // }, [messages]);

  React.useEffect(() => {
    if (scrollRef)
      (scrollRef.current as HTMLElement).scrollIntoView({
        behavior: "instant",
      });
  }, [scrollRef, messages]);

  const formatDateGroup = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDate = (d1: Date, d2: Date) =>
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();

    if (isSameDate(date, today)) return "Today";
    if (isSameDate(date, yesterday)) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupMessagesByDate = (messages: any[]) => {
    return messages.reduce((acc: any, msg) => {
      const group = formatDateGroup(msg.createdAt);
      if (!acc[group]) acc[group] = [];
      acc[group].push(msg);
      return acc;
    }, {});
  };

  const groupedMessages = groupMessagesByDate(messages.slice().reverse());

  return (
    <div style={{ padding: "50px", paddingTop: "0px" }}>
      <Space
        direction="vertical"
        style={{
          display: "flex",
          gap: 15,
        }}
      >
        {Object.entries(groupedMessages).map(([dateLabel, msgs]: any) => (
          <div key={dateLabel}>
            <div
              style={{
                textAlign: "center",
                margin: "10px 0",
                fontWeight: "bold",
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              {dateLabel}
            </div>
            {msgs.map((el: any) => (
              <div
                key={el._id}
                ref={(ref) => (messageRefs.current[el._id] = ref)}
                style={{
                  backgroundColor:
                    localHighlight === el._id
                      ? themeType === "light"
                        ? theme.light.neutralbackground
                        : theme.dark.neutralbackground
                      : "transparent",
                  transition: "background-color 0.5s ease",
                  borderRadius: "8px",
                  padding: "5px",
                }}
              >
                {(() => {
                  switch (el.type) {
                    case 1:
                      return (
                        <ReplyMsg
                          el={el}
                          onReply={onReply}
                          key={el._id}
                          setChatMessages={setChatMessages}
                        />
                      );
                    case 2:
                      return (
                        <ForwardMsg
                          el={el}
                          onReply={onReply}
                          key={el._id}
                          setChatMessages={setChatMessages}
                        />
                      );
                    default:
                      return (
                        <TextMsg
                          el={el}
                          onReply={onReply}
                          key={el._id}
                          setChatMessages={setChatMessages}
                        />
                      );
                  }
                })()}
              </div>
            ))}
          </div>
        ))}

        {/* Scroll reference if needed */}
        <div ref={scrollRef} />
      </Space>
    </div>
  );
};

const ChatComponent = () => {
  const { theme, themeType } = useTheme();
  const dispatch = useDispatch();
  const { Footer, Content } = Layout;
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const { currentChat, unreadMessages, messages, chats } = useSelector(
    (state: any) => state.chat
  );
  const [isTyping, setIsTyping] = useState(false);
  const [selfTyping, setSelfTyping] = useState(false);
  const typingTimeoutRef = useRef<any | null>(null);
  const [chatMessages, setChatMessages] = React.useState<any[]>([]);
  const [replyingToMessage, setReplyingToMessage] = useState<any>(null);
  const { socket } = useSocket();
  const { pauseNotification } = useSelector((state: any) => state.chat);
  const pauseNotificationRef = useRef(pauseNotification);
  const [loading, setLoading] = useState<boolean>(false);
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    pauseNotificationRef.current = pauseNotification;
  }, [pauseNotification]);

  useEffect(() => {}, [chatMessages]);

  const getMessages = async () => {
    if (!currentChat?._id) return alert("No chat is selected");
    if (!socket) return alert("Socket not available");
    setLoading(true);
    socket.emit(JOIN_CHAT_EVENT, currentChat?._id);
    dispatch(
      updateUnreadMessages(
        unreadMessages.filter((msg: any) => msg.chat !== currentChat?._id)
      ) as any
    );
    requestHandler(
      async () => await getChatMessages(currentChat?._id || ""),
      null,
      (res) => {
        const { data } = res;
        setChatMessages(data || []);
        dispatch(updateMessages(data || []) as any);
        setLoading(false);
      },
      (error: string) => {
        setLoading(false);
        navigate(`/client/${currentOrganization.id}`);
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };

  const updateChatLastMessage = (
    chatToUpdateId: string,
    message: ChatMessageInterface
  ) => {
    const chatToUpdate = _.cloneDeep(
      chats.find((chat: { _id: string }) => chat._id === chatToUpdateId)!
    );
    chatToUpdate.lastMessage = message;
    chatToUpdate.updatedAt = message?.updatedAt;
    dispatch(
      SetChats([
        chatToUpdate,
        ...chats.filter((chat: { _id: string }) => chat._id !== chatToUpdateId),
      ]) as any
    );
  };

  const sendChatMessage = async () => {
    if (!currentChat?._id || !socket) return;
    socket.emit(STOP_TYPING_EVENT, currentChat?._id);
    await requestHandler(
      async () =>
        await sendMessage(
          currentChat._id,
          message,
          attachedFiles,
          replyingToMessage?._id
        ),
      null,
      (res) => {
        setReplyingToMessage(null);
        setMessage("");
        setAttachedFiles([]);
        setChatMessages((prev) => [res.data, ...prev]);
        dispatch(updateMessages([res.data, ...messages]) as any);
        updateChatLastMessage(currentChat._id, res.data);
      },
      (error: string) => {
        setReplyingToMessage(null);
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };

  const handleOnMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target?.value ?? (e as any)?.native);
    if (!socket) return;
    if (!selfTyping) {
      setSelfTyping(true);
      socket.emit(TYPING_EVENT, currentChat?._id);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    const timerLength = 3000;
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(STOP_TYPING_EVENT, currentChat?._id);
      setSelfTyping(false);
    }, timerLength);
  };

  const onConnect = (user: any) => {
    console.log(user);
    // setIsConnected(true);
  };

  const onDisconnect = () => {
    // setIsConnected(false);
  };

  const handleOnSocketTyping = (chatId: string) => {
    if (chatId !== currentChat?._id) return;
    setIsTyping(true);
  };

  const handleOnSocketStopTyping = (chatId: string) => {
    if (chatId !== currentChat?._id) return;
    setIsTyping(false);
  };

  const onMessageReceived = (message: ChatMessageInterface) => {
    if (!pauseNotificationRef.current) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            sendNotification(message);
          } else {
            console.warn("Notification permission denied");
          }
        });
      } else {
        sendNotification(message);
      }
    }
    if (message?.chatId !== currentChat?._id) {
      dispatch(updateUnreadMessages([message, ...unreadMessages]) as any);
    } else {
      setChatMessages((prevChatMessages) => [message, ...prevChatMessages]);
      dispatch(updateMessages([message, ...messages]) as any);
    }
    updateChatLastMessage(message.chatId || "", message);
  };

  const sendNotification = (message: ChatMessageInterface) => {
    addNotification({
      title: `New Message from ${message.sender?.userName}`,
      subtitle: `${message.sender?.userName}`,
      message: `${message.content}`,
      duration: 4000,
      icon: wings,
      vibrate: 200,
      backgroundTop: "#1890FF",
      native: true,
      onClick: () => {
        window.focus();
      },
    });
  };

  const onNewChat = (chat: ChatListItemInterface) => {
    dispatch(SetChats((prev: any) => [chat, ...prev]) as any);
  };

  const onChatLeave = (chat: ChatListItemInterface) => {
    if (chat._id === currentChat?._id) {
      dispatch(setCurrentChat(null) as any);
    }
    dispatch(
      SetChats((prev: any[]) => prev.filter((c) => c._id !== chat._id)) as any
    );
  };

  const onGroupNameChange = (chat: ChatListItemInterface) => {
    if (chat._id === currentChat?._id) {
      dispatch(setCurrentChat(chat) as any);
    }
    dispatch(
      SetChats((prev: any[]) => [
        ...prev.map((c: any) => {
          if (c._id === chat._id) {
            return chat;
          }
          return c;
        }),
      ]) as any
    );
  };

  useEffect(() => {
    if (currentChat) {
      socket?.emit(JOIN_CHAT_EVENT, currentChat?._id);
      getMessages();
    }
  }, [currentChat._id]);

  useEffect(() => {
    socket?.on(JOIN_CHAT_EVENT, onConnect);
    socket?.on(USER_LEFT_EVENT, onDisconnect);
    socket?.on(TYPING_EVENT, handleOnSocketTyping);
    socket?.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
    socket?.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
    // socket?.on(DELETE_MESSAGE_EVENT, onMessageDelete);
    socket?.on(NEW_CHAT_EVENT, onNewChat);
    socket?.on(LEAVE_CHAT_EVENT, onChatLeave);
    socket?.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    return () => {
      socket?.off(JOIN_CHAT_EVENT, onConnect);
      socket?.off(USER_LEFT_EVENT, onDisconnect);
      socket?.off(TYPING_EVENT, handleOnSocketTyping);
      socket?.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
      socket?.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
      // socket?.off(DELETE_MESSAGE_EVENT, onMessageDelete);
      socket?.off(NEW_CHAT_EVENT, onNewChat);
      socket?.off(LEAVE_CHAT_EVENT, onChatLeave);
      socket?.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
    };
  }, [socket, currentChat._id]);

  return (
    <Layout
      style={{
        width: "100%",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        height: "100%",
        overflowY: "auto",
        position: "relative",
        borderRadius: "6px",
        // marginTop: "4px",
        // padding: "8px 12px",
        marginLeft: 0,
        marginRight: "2px",
      }}
    >
      {loading ? (
        <ChatLoadingScreen />
      ) : (
        <>
          <ChatHeader />
          <Content
            style={{
              overflowY: "scroll",
              margin: "8px 0",
              padding: "0",
            }}
          >
            <Conversation
              menu={true}
              messages={chatMessages}
              setChatMessages={setChatMessages}
              onReply={(message: any) => {
                setReplyingToMessage(message);
              }}
              replyingToMessage={replyingToMessage}
            />
          </Content>
          <Footer style={{ padding: 0, background: "transparent" }}>
            <ChatFooter
              value=""
              handleSendMsg={sendChatMessage}
              onChange={handleOnMessageChange}
              handleFile={(file: any) => {
                setAttachedFiles([...attachedFiles, file]);
              }}
              isTyping={isTyping}
              replyingToMessage={replyingToMessage}
              setReplyingToMessage={setReplyingToMessage}
            />
          </Footer>
        </>
      )}
    </Layout>
  );
};

export default ChatComponent;

export { Conversation };
