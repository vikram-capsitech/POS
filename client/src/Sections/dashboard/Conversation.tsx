import React, { useCallback, useEffect, useMemo, useState } from "react";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import addNotification from "react-push-notification";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

import {
  Button,
  Avatar,
  Tooltip,
  Space,
  Row,
  Col,
  Typography,
  Input,
  Popover,
  Dropdown,
  Tag,
  Badge,
  Divider,
  Image,
  Modal
} from "antd";

import {
  CornerUpLeft,
  CornerUpRight,
  Pin,
  Plus,
  SquarePen,
  Trash2,
  UserRound,
  Smile,
  MoreHorizontal,
  PencilLine,
  FileText,
  Download,
  Eye,
  X,
} from "lucide-react";

import wings from "../../Assets/Images/wings.svg";
import { useSocket } from "../../Contexts/SocketContext";
import { ChatMessageInterface } from "../../Interfaces/chat";
import useClickOutside from "../../Hooks/useClickOutside";
import { useTheme } from "../../Contexts/ThemeContext";
import { iconPDF, requestHandler } from "../../Utils";
import {
  deleteMessage,
  forwardMessage,
  pinMessage,
  reactToMessage,
  updateMessage,
} from "../../Api";
import {
  DELETE_MESSAGE_EVENT,
  EDIT_MESSAGE_EVENT,
  REACTION_MESSAGE_EVENT,
} from "../../pages/Dashboard/Conversation";
import { SetChats, updateMessages } from "../../redux/slices/chat";
import CustomImage from "../../Components/Image/CustomImage";
import { dispatch } from "../../redux/store";
import { SearchUserChannelInput } from "../../Components/SearchUserChannelAsync";
import { showSnackbar } from "../../redux/slices/app";

// Attachment components you already use
// PDFAttachment, VideoAttachment, ImageAttachment, GenericFileAttachment

interface IAttachments {
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  localPath: string;
  _id: string;
}

const bubbleRadius = 12;

const TextMsg = ({
  el,
  setChatMessages,
  onReply,
  key,
}: {
  el: ChatMessageInterface;
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onReply: (msg: any) => void;
  key: string;
}) => {
  const antDispatch = useDispatch();
  const { user, currentOrganization } = useSelector((s: any) => s.auth);
  const { currentChat, messages } = useSelector((s: any) => s.chat);

  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { socket } = useSocket();

  const [reactions, setReactions] = useState<any[]>(el.reactions || []);
  const [openPicker, setOpenPicker] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isedited, setIsEdited] = useState(!!el.edited);
  const [editedMessage, setEditedMessage] = useState(el.content);
  const [isDeleted, setIsDeleted] = useState(el.deleted || false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(el.isPinned || false);

  const pickerRef = useClickOutside(() => setOpenPicker(false));
  useEffect(() => setIsPinned(el.isPinned), [el.isPinned]);

  const isMine = el.sender?._id === user._id;

  const bubbleBG = isMine
    ? themeType === "light"
      ? theme.light.primaryBackground
      : theme.dark.primaryBackground
    : theme.light.primaryLight;

  const bubbleFG = isMine
    ? themeType === "light"
      ? theme.light.text
      : theme.dark.text
    : "#333333";

  // ------------ actions -------------
  const handlePinMessage = async () => {
    await requestHandler(
      async () => await pinMessage(currentOrganization.id, el.chatId, el._id),
      null,
      (res) => {
        if (res?.success && res?.data) {
          const updated = messages.map((m: any) =>
            m._id === el._id
              ? {
                  ...m,
                  isPinned: res.data.isPinned,
                  pinnedAt: res.data.pinnedAt,
                  pinnedBy: res.data.pinnedBy,
                }
              : m
          );
          setIsPinned(res.data.isPinned);
          antDispatch(updateMessages(updated) as any);
        }
      },
      (err) => console.error("Pin message error:", err)
    );
  };

  const handleReaction = useCallback(
    async (emoji: string) => {
      await requestHandler(
        () => reactToMessage(el._id, user._id, emoji),
        null,
        () => {
          setReactions((prev) => {
            const exists = prev.find(
              (r) => r.userId === user._id && r.emoji === emoji
            );
            return exists
              ? prev.filter(
                  (r) => !(r.userId === user._id && r.emoji === emoji)
                )
              : [...prev, { userId: user._id, emoji, userName: user.userName }];
          });
        },
        (err) => console.error("Reaction error:", err)
      );
    },
    [el._id, user]
  );

  const handleSaveMessage = async () => {
    if (editedMessage.trim() === el.content.trim()) {
      setIsEditing(false);
      return;
    }
    await requestHandler(
      () => updateMessage(el._id, editedMessage),
      null,
      () => {
        setIsEdited(true);
        setIsEditing(false);
      },
      (err) => console.error("Save message error:", err)
    );
  };

  const handleDeleteMessage = async () => {
    await requestHandler(
      async () => await deleteMessage(el._id),
      null,
      (res) => {
        if (res.success) {
          setIsDeleted(true);
          const updated = messages.map((m: any) =>
            m._id === el._id ? { ...m, deleted: true } : m
          );
          setChatMessages(updated);
          antDispatch(updateMessages(updated) as any);
        }
      },
      (err) => console.error("Delete message error:", err)
    );
  };

  // ---------- socket listeners ----------
  useEffect(() => {
    const onMessageDelete = (message: ChatMessageInterface) => {
      if (message._id === el._id) handleDeleteMessage();
    };

    const onMessageReaction = (message: any) => {
      if (message._id !== el._id) return;
      setReactions(message.reactions);

      const notify = () =>
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} reacted to your message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => window.focus(),
        });

      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((perm) => perm === "granted" && notify());
      } else {
        notify();
      }
    };

    const onMessageEdit = (message: ChatMessageInterface) => {
      if (message._id !== el._id) return;
      setEditedMessage(message.content);
      setIsEdited(true);

      const notify = () =>
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} edited a message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => window.focus(),
        });

      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((perm) => perm === "granted" && notify());
      } else {
        notify();
      }
    };

    socket?.on(DELETE_MESSAGE_EVENT, onMessageDelete);
    socket?.on(REACTION_MESSAGE_EVENT, onMessageReaction);
    socket?.on(EDIT_MESSAGE_EVENT, onMessageEdit);
    return () => {
      socket?.off(DELETE_MESSAGE_EVENT, onMessageDelete);
      socket?.off(REACTION_MESSAGE_EVENT, onMessageReaction);
      socket?.off(EDIT_MESSAGE_EVENT, onMessageEdit);
    };
  }, [socket, currentChat, el._id]);

  // ---------- helpers ----------
  const linkify = (text: string) => {
    if (!text) return text;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.split(urlPattern).map((part, i) =>
      urlPattern.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: isMine ? bubbleBG : theme.light.primaryLight,
            color: theme.dark.textHilight,
            textDecoration: "underline",
            fontSize: fontSizes.subheading,
            fontFamily,
          }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const renderAttachments = (attachments: IAttachments[] = []) =>
    attachments.map((file, i) => {
      if (file.fileType?.includes(".pdf")) return <PDFAttachment key={i} file={file} />;
      if ([".mp4", ".webm", ".ogg"].some((t) => file.fileType?.includes(t)))
        return <VideoAttachment key={i} file={file} />;
      if (file.fileType?.includes("image"))
        return <ImageAttachment key={i} file={file} sender={el.sender} user={user} />;
      return (
        <GenericFileAttachment
          key={i}
          file={file}
          sender={el.sender}
          user={user}
          themeType={themeType}
          theme={theme}
          fontFamily={fontFamily}
        />
      );
    });

  const hasReactions = reactions.length > 0;
  const hasAttachments = el?.attachments?.length > 0;

  const hasMedia = el?.attachments?.some((f) =>
    ["image", "video", ".mp4", ".webm", ".ogg"].some((t) =>
      f?.fileType?.toLowerCase()?.includes(t)
    )
  );
  const hasDocs = el?.attachments?.some((f) =>
    ["pdf", "doc", "xls", "ppt"].some((t) => f?.fileType?.toLowerCase()?.includes(t))
  );

  const topMargin = hasReactions || hasAttachments ? "14px" : "0px";
  const bottomMargin = isEditing
    ? "120px"
    : hasReactions
    ? hasMedia
      ? "88px"
      : hasDocs
      ? "72px"
      : "48px"
    : hasMedia
    ? "72px"
    : hasDocs
    ? "56px"
    : "28px";

  const menuItems = useMemo(
    () => [
      {
        key: "react-quick",
        label: (
          <Space size={8}>
            <Smile size={16} />
            Quick Reactions
            <Space size={4} style={{ marginLeft: "auto" }}>
              {["😀", "👍", "🤔"].map((e) => (
                <span
                  key={e}
                  role="img"
                  aria-label="emoji"
                  style={{ cursor: "pointer" }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleReaction(e);
                  }}
                >
                  {e}
                </span>
              ))}
            </Space>
          </Space>
        ),
      },
      {
        key: "emoji",
        label: (
          <Space size={8} onClick={(e) => { e.stopPropagation(); setOpenPicker((v) => !v); }}>
            <Plus size={16} />
            Add Reaction
          </Space>
        ),
      },
      {
        type: "divider",
      },
      {
        key: "reply",
        label: (
          <Space size={8} onClick={() => onReply(el)}>
            <CornerUpLeft size={16} />
            Reply
          </Space>
        ),
      },
      {
        key: "forward",
        label: (
          <Space size={8} onClick={() => setIsForwardModalOpen(true)}>
            <CornerUpRight size={16} />
            Forward
          </Space>
        ),
      },
      {
        key: "pin",
        label: (
          <Space size={8} onClick={handlePinMessage}>
            <Pin size={16} />
            {isPinned ? "Unpin" : "Pin"}
          </Space>
        ),
      },
      ...(isMine
        ? [
            { type: "divider" as const },
            {
              key: "edit",
              label: (
                <Space size={8} onClick={() => setIsEditing(true)}>
                  <PencilLine size={16} />
                  Edit
                </Space>
              ),
            },
            {
              key: "delete",
              danger: true,
              label: (
                <Space size={8} onClick={handleDeleteMessage}>
                  <Trash2 size={16} />
                  Delete
                </Space>
              ),
            },
          ]
        : []),
    ],
    [isPinned, isMine, el, handleReaction]
  );

  return (
    <>
      <Row
        key={key}
        justify={isMine ? "end" : "start"}
        style={{
          width: "100%",
          marginTop: topMargin,
          marginBottom: bottomMargin,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "fit-content", maxWidth: "min(680px, 84vw)" }}>
          {/* Header row (name • time • edited • pin) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: isMine ? "flex-end" : "flex-start",
              padding: "0 2px 6px",
            }}
          >
            {!isMine && (
              <>
                <Tooltip title={el.sender.userName} placement="top" arrow={false}>
                  <Avatar
                    icon={<UserRound strokeWidth={1.5} size={18} />}
                    alt={el.sender?.userName}
                    src={el.sender?.pic}
                    size={28}
                  />
                </Tooltip>
                <Typography.Text
                  style={{
                    color:
                      themeType === "light" ? theme.light.textHilight : theme.dark.textHilight,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {el.sender.userName}
                </Typography.Text>
              </>
            )}
            <Typography.Text
              style={{
                fontSize: 12,
                color: "#A3A3A3",
                fontFamily,
                marginInlineStart: 4,
              }}
            >
              {moment(el.createdAt).format("hh:mm A")}
            </Typography.Text>
            {isPinned && <Tag color="processing" style={{ marginInlineStart: 4 }}>Pinned</Tag>}
            {(el.edited || isedited) && (
              <Badge
                dot
                color="gold"
                style={{ marginInlineStart: 4 }}
                title="Edited"
              >
                <Typography.Text style={{ fontSize: 11, color: "#999" }}>Edited</Typography.Text>
              </Badge>
            )}
          </div>

          {/* Bubble + Actions */}
          <div style={{ display: "flex", flexDirection: isMine ? "row-reverse" : "row", gap: 6, alignItems: "flex-start" }}>
            {/* Action menu */}
            {!isDeleted && (
              <Dropdown
                trigger={["click"]}
                menu={{ items: menuItems as any }}
                placement={isMine ? "bottomRight" : "bottomLeft"}
              >
                <Button type="text" size="small" icon={<MoreHorizontal size={16} />} />
              </Dropdown>
            )}

            {/* Message bubble */}
            <div
              id={`message-${el._id}`}
              style={{
                backgroundColor: bubbleBG,
                color: bubbleFG,
                padding: hasMedia ? 6 : 12,
                borderRadius: bubbleRadius,
                borderTopLeftRadius: isMine ? bubbleRadius : 6,
                borderTopRightRadius: isMine ? 6 : bubbleRadius,
                maxWidth: "100%",
                wordBreak: "break-word",
                boxShadow: "0 1px 1px rgba(0,0,0,0.04)",
              }}
            >
              {/* Emoji picker (floating) */}
              {openPicker && (
                <div
                  ref={pickerRef}
                  style={{
                    position: "absolute",
                    zIndex: 1000,
                    marginTop: -10,
                    [isMine ? "right" : "left"]: 36,
                  } as React.CSSProperties}
                >
                  <Picker data={data} onEmojiSelect={(e: any) => { handleReaction(e.native); setOpenPicker(false); }} />
                </div>
              )}

              {/* Attachments */}
              {renderAttachments(el.attachments)}

              {/* Content / editor */}
              {isDeleted || el.deleted ? (
                <Typography.Text
                  italic
                  style={{
                    color: isMine
                      ? themeType === "light"
                        ? theme.light.text
                        : theme.dark.text
                      : "#868686",
                    fontSize: fontSizes.subheading,
                    fontFamily,
                  }}
                >
                  This message was deleted
                </Typography.Text>
              ) : isEditing ? (
                <div>
                  <Input.TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    style={{
                      background:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontSize: fontSizes.subheading,
                      fontFamily,
                      borderRadius: 8,
                    }}
                  />
                  <Space style={{ marginTop: 8 }}>
                    <Button type="primary" size="small" onClick={handleSaveMessage}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </Space>
                </div>
              ) : (
                <Typography.Text
                  style={{
                    color: isMine
                      ? theme.dark.textHilight
                      : themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                    fontSize: fontSizes.subheading,
                    fontFamily,
                  }}
                >
                  {linkify(editedMessage)}
                </Typography.Text>
              )}

              {/* Reactions row */}
              {reactions.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <Space size={[6, 4]} wrap>
                    {reactions.map((r, idx) => (
                      <Tooltip key={`${r.userId}-${idx}`} title={`Reacted by ${r.userName}`} placement="top">
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 6px",
                            borderRadius: 8,
                            border: `1px solid ${
                              themeType === "light" ? theme.light.border : theme.dark.border
                            }`,
                            fontSize: fontSizes.emoji,
                            cursor: "pointer",
                            background: "rgba(255,255,255,0.6)",
                          }}
                        >
                          {r.emoji}
                        </span>
                      </Tooltip>
                    ))}
                  </Space>
                </div>
              )}
            </div>
          </div>

          {/* Mine-only tail meta */}
          <div
            style={{
              display: "flex",
              justifyContent: isMine ? "flex-end" : "flex-start",
              marginTop: 6,
            }}
          >
            {isMine && (
              <Space size={8}>
                {(el.edited || isedited) && (
                  <Typography.Text style={{ fontSize: 11, color: "#999" }}>Edited</Typography.Text>
                )}
                <Typography.Text style={{ fontSize: 12, color: "#A3A3A3", fontFamily }}>
                  {moment(el.createdAt).format("hh:mm A")}
                </Typography.Text>
              </Space>
            )}
          </div>
        </div>
      </Row>

      {/* Forward Modal (your existing impl) */}
      <ForwardModal
        open={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        forwardedMessageId={el._id}
        setChatMessages={setChatMessages}
      />
    </>
  );
};

export default TextMsg;

const ReplyMsg = ({
  el,
  setChatMessages,
  onReply,
}: {
  el: any;
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onReply: (msg: any) => void;
}) => {
  const { user, currentOrganization } = useSelector((state: any) => state.auth);
  const isSender = el.sender?._id === user?._id;
  const [reactions, setReactions] = useState<any[]>(el.reactions || []);
  const [openPicker, setOpenPicker] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isedited, setIsEdited] = useState(false);
  const [editedMessage, setEditedMessage] = useState(el.content);
  const [isDeleted, setIsDeleted] = useState(el.deleted || false);
  const pickerRef = useClickOutside(() => setOpenPicker(false));
  //const [previewIndex, setPreviewIndex] = useState(0);
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { currentChat, messages } = useSelector((state: any) => state.chat);
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const [isPinned, setIsPinned] = useState(el.isPinned || false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);

  const handlePinMessage = async () => {
    await requestHandler(
      async () => await pinMessage(currentOrganization.id, el.chatId, el._id),
      null,
      (res) => {
        if (res?.success && res?.data) {
          const updatedMessages = messages.map((msg: any) =>
            msg._id === el._id
              ? {
                  ...msg,
                  isPinned: res.data.isPinned,
                  pinnedAt: res.data.pinnedAt,
                  pinnedBy: res.data.pinnedBy,
                }
              : msg
          );
          setIsPinned(res.data.isPinned);
          //setChatMessages(updatedMessages);
          dispatch(updateMessages(updatedMessages) as any);
        }
      },
      (err) => {
        console.error("Pin message error:", err);
      }
    );
  };

  const handleReaction = useCallback(
    async (emoji: string) => {
      await requestHandler(
        () => reactToMessage(el._id, user._id, emoji),
        null,
        () => {
          setReactions((prevReactions) => {
            const exists = prevReactions.find(
              (reaction) =>
                reaction.userId === user._id && reaction.emoji === emoji
            );
            return exists
              ? prevReactions.filter(
                  (reaction) =>
                    reaction.userId !== user._id || reaction.emoji !== emoji
                )
              : [
                  ...prevReactions,
                  { userId: user._id, emoji, userName: user.userName },
                ];
          });
        },
        (err) => console.error("Reaction error:", err)
      );
    },
    [el._id, user]
  );

  const handleSaveMessage = async () => {
    if (editedMessage.trim() === el.content.trim()) {
      setIsEditing(false);
      return;
    }

    await requestHandler(
      () => updateMessage(el._id, editedMessage),
      null,
      () => {
        setEditedMessage(editedMessage);
        setIsEdited(true);
        setIsEditing(false);
      },
      (err) => console.error("Save message error:", err)
    );
  };

  const handleDeleteMessage = async () => {
    console.log(
      "Before Deletion - isDeleted:",
      isDeleted,
      "el.deleted:",
      el.deleted
    );

    await requestHandler(
      async () => await deleteMessage(el._id),
      null,
      (res) => {
        if (res.success) {
          console.log("Delete API Success:", res);
          setIsDeleted(true);
          setChatMessages(
            messages.map((msg: any) =>
              msg._id === el._id ? { ...msg, deleted: true } : msg
            )
          );
          dispatch(
            updateMessages(
              messages.map((msg: any) =>
                msg._id === el._id ? { ...msg, deleted: true } : msg
              )
            ) as any
          );
        }
      },
      (err) => console.error("Delete message error:", err)
    );
  };

  // Render reactions
  const renderReactions = () =>
    reactions.length > 0 && (
      <Row gutter={[8, 0]} style={{ marginTop: "4px", flexWrap: "wrap" }}>
        {reactions.map((reaction, index) => (
          <Col key={index}>
            <Tooltip title={`Reacted by ${reaction.userName}`} placement="top">
              <Typography
                style={{
                  fontSize: fontSizes.emoji,
                  cursor: "pointer",
                  padding: "8px 4px",
                  borderRadius: "4px",
                  lineHeight: "10px",
                  border: `1px solid ${
                    themeType === "light"
                      ? theme.light.border
                      : theme.dark.border
                  }`,
                  display: "inline-block",
                }}
              >
                {reaction.emoji}
              </Typography>
            </Tooltip>
          </Col>
        ))}
      </Row>
    );

  // Render message content
  const renderMessageContent = () => {
    if (isDeleted || el.deleted) {
      return (
        <div
          style={{
            borderRadius: "8px",
            // textAlign: "center"
          }}
        >
          <Typography.Text
            style={{
              fontStyle: "italic",
              color:
                el.sender._id === user._id
                  ? themeType === "light"
                    ? theme.light.text
                    : theme.dark.text
                  : "#868686",
              fontSize: fontSizes.subheading,
              fontFamily: fontFamily,
            }}
          >
            This message was deleted
          </Typography.Text>
        </div>
      );
    }
    const linkify = (text: any) => {
      if (!text) return text;
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      return text.split(urlPattern).map((part: any, index: any) =>
        urlPattern.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color:
                el.sender?._id === user._id
                  ? themeType === "light"
                    ? theme.light.text
                    : theme.dark.text
                  : "#333333",
              textDecoration: "underline",
              fontSize: fontSizes.subheading,
              fontFamily: fontFamily,
            }}
          >
            {part}
          </a>
        ) : (
          part
        )
      );
    };
    return isEditing ? (
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 5 }}
        value={editedMessage}
        onChange={(e) => setEditedMessage(e.target.value)}
        rows={3}
        styles={{
          textarea: {
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          },
        }}
        style={{
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          borderRadius: "8px",
          fontSize: fontSizes.subheading,
          fontFamily: fontFamily,
          width: "100%",
        }}
      />
    ) : (
      <Typography.Text
        style={{
          color:
            el.sender._id === user._id
              ? theme.dark.textHilight
              : themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          fontSize: fontSizes.subheading,
          fontFamily: fontFamily,
          wordWrap: "break-word",
        }}
      >
        {linkify(editedMessage)}
      </Typography.Text>
    );
  };

  const renderAttachments = (attachments: IAttachments[]) =>
    attachments.map((file, index) => {
      if (file.fileType?.includes(".pdf")) {
        return <PDFAttachment key={index} file={file} />;
      }
      if (
        [".mp4", ".webm", ".ogg"].some((type) => file.fileType?.includes(type))
      ) {
        return <VideoAttachment key={index} file={file} />;
      }
      if (file.fileType?.includes("image")) {
        return (
          <ImageAttachment
            key={index}
            file={file}
            sender={el.sender}
            user={user}
          />
        );
      }
      return (
        <GenericFileAttachment
          key={index}
          file={file}
          sender={el.sender}
          user={user}
          themeType={themeType}
          theme={theme}
          fontFamily={fontFamily}
        />
      );
    });

  const onMessageDelete = (message: ChatMessageInterface) => {
    if (message._id === el._id) {
      handleDeleteMessage();
    }
  };

  const renderPinnedIcon = () =>
    isPinned && (
      <Row gutter={[8, 0]} style={{ marginTop: "4px", flexWrap: "wrap" }}>
        <Col>
          <Tooltip title="Pinned" placement="top">
            <Pin
              fill={
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground
              }
              color={
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground
              }
              strokeWidth={1.5}
              size={25}
              style={{
                padding: "5px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    );

  const onMessageReaction = (message: any) => {
    if (message._id === el._id) {
      setReactions(message.reactions);
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            addNotification({
              title: "New Message from Scraawl",
              subtitle: `${el?.sender?.userName}`,
              message: `${el?.sender?.userName} reacted to your message`,
              duration: 4000,
              icon: wings,
              vibrate: 200,
              backgroundTop: "#1890FF",
              native: true,
              onClick: () => {
                window.focus();
              },
            });
          } else {
            console.warn("Notification permission denied");
          }
        });
      } else {
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} reacted to your message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => {
            window.focus();
          },
        });
      }
    }
  };

  const onMessageEdit = (message: ChatMessageInterface) => {
    if (message._id === el._id) {
      message.edited = true;
      setEditedMessage(message.content);
      setIsEdited(true);
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            addNotification({
              title: "New Message from Scraawl",
              subtitle: `${el?.sender?.userName}`,
              message: `${el?.sender?.userName} edited a message`,
              duration: 4000,
              icon: wings,
              vibrate: 200,
              backgroundTop: "#1890FF",
              native: true,
              onClick: () => {
                window.focus();
              },
            });
          } else {
            console.warn("Notification permission denied");
          }
        });
      } else {
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} edited a message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => {
            window.focus();
          },
        });
      }
    }
  };

  useEffect(() => {
    socket?.on(DELETE_MESSAGE_EVENT, onMessageDelete);
    socket?.on(REACTION_MESSAGE_EVENT, onMessageReaction);
    socket?.on(EDIT_MESSAGE_EVENT, onMessageEdit);
    return () => {
      socket?.off(DELETE_MESSAGE_EVENT, onMessageDelete);
      socket?.off(REACTION_MESSAGE_EVENT, onMessageReaction);
      socket?.off(EDIT_MESSAGE_EVENT, onMessageEdit);
    };
  }, [socket, currentChat]);

  return (
    <>
      <Row
        justify={isSender ? "end" : "start"}
        gutter={[0, 16]}
        style={{ gap: 6 }}
      >
        <Tooltip title={el.sender.userName} placement="top">
          {el.sender._id !== user._id && (
            <>
              <Avatar
                icon={<UserRound strokeWidth={1.5} size={20} />}
                alt={el.sender.userName}
                src={el.sender.pic}
              />
            </>
          )}
        </Tooltip>
        <Col>
          <Popover
            trigger={"hover"}
            placement="bottomRight"
            showArrow={false}
            content={
              !isDeleted && (
                <Space
                  direction="horizontal"
                  size={10}
                  style={{ padding: "0px" }}
                >
                  {["😀", "👍", "🤔"].map((emoji) => (
                    <Button
                      style={{
                        border: "none",
                        boxShadow: "none",
                      }}
                      key={emoji}
                      size="small"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                  <Plus
                    strokeWidth={1.5}
                    size={25}
                    cursor="pointer"
                    style={{
                      color: "#1677FF",
                      fontWeight: "bold",
                      padding: "5px",
                      marginTop: "5px",
                      borderRadius: "4px",
                      backgroundColor: "#0078EF0F",
                      fontSize: "16px",
                    }}
                    onClick={() => setOpenPicker(!openPicker)}
                  />
                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      onReply(el);
                    }}
                    icon={<CornerUpLeft strokeWidth={1.5} size={15} />}
                  />
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setIsForwardModalOpen(true)}
                    icon={<CornerUpRight strokeWidth={1.5} size={15} />}
                  />
                  {openPicker && (
                    <Popover placement="topLeft" trigger={"click"}>
                      <div
                        ref={pickerRef}
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "40px",
                          transform: "translateX(-10%)",
                        }}
                      >
                        <Picker
                          theme="light"
                          data={data}
                          onEmojiSelect={(emoji: any) =>
                            handleReaction(emoji.native)
                          }
                        />
                      </div>
                    </Popover>
                  )}
                  <Pin
                    strokeWidth={1.5}
                    size={25}
                    onClick={handlePinMessage}
                    style={{
                      padding: "5px",
                      marginTop: "5px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  {el.sender._id === user._id && (
                    <>
                      <Button
                        style={{
                          border: "none",
                          boxShadow: "none",
                          cursor: "pointer",
                        }}
                        size="small"
                        onClick={() => setIsEditing(true)}
                        icon={<SquarePen strokeWidth={1.5} size={15} />}
                      />
                      <Button
                        style={{
                          border: "none",
                          padding: "none",
                          boxShadow: "none",
                          cursor: "pointer",
                        }}
                        size="small"
                        onClick={handleDeleteMessage}
                        icon={<Trash2 strokeWidth={1.5} size={15} />}
                      />
                    </>
                  )}
                </Space>
              )
            }
            overlayInnerStyle={{
              border: "1px solid #EDEDED",
              boxShadow: "0px 4px 8px 0px #0926411C",
              borderRadius: "6px",
              padding: "2px",
            }}
          >
            <Typography.Text
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontSize: fontSizes.subheading,
                fontFamily: fontFamily,
                fontWeight: 500,
              }}
            >
              {el.sender._id === user._id ? null : el.sender.userName}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: fontSizes.subheading,
                fontFamily: fontFamily,
                paddingLeft: "10px",
                color: "#A3A3A3",
                fontWeight: 400,
                lineHeight: "13.86px",
              }}
            >
              {el.sender._id === user._id
                ? null
                : moment(el.createdAt).format("hh:mm A")}
              {renderPinnedIcon()}

              {el.sender._id === user._id
                ? null
                : (el.edited || isedited) && (
                    <Typography.Text
                      style={{
                        //color: "#0078EFB2",
                        color:
                          themeType === "light"
                            ? theme.light.textHilight
                            : theme.dark.textHilight,
                        fontSize: fontSizes.subheading,
                        fontFamily: fontFamily,
                        fontWeight: 400,
                        paddingLeft: 5,
                      }}
                    >
                      Edited
                    </Typography.Text>
                  )}
            </Typography.Text>
            <div
              id={`message-${el._id}`}
              style={{
                maxWidth: "400px",
                backgroundColor:
                  el.sender?._id === user._id
                    ? themeType === "light"
                      ? theme.light.primaryBackground
                      : theme.dark.primaryBackground
                    : theme.light.primaryLight,
                color:
                  el.sender?._id === user._id
                    ? themeType === "light"
                      ? theme.light.text
                      : theme.dark.text
                    : "#333333",
                padding: "12px 16px",
                borderRadius: "16px",
                position: "relative",
              }}
            >
              <div
                onClick={() => {
                  const originalMsgElement = document.getElementById(
                    `message-${el?.replyToMeta?._id}`
                  );
                  if (originalMsgElement) {
                    originalMsgElement.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                    // Optionally highlight it temporarily
                    originalMsgElement.classList.add("highlighted");
                    setTimeout(() => {
                      originalMsgElement.classList.remove("highlighted");
                    }, 1000);
                  }
                }}
                style={{
                  borderLeft: "3px solid rgba(255, 255, 255, 0.4)",
                  paddingLeft: "12px",
                  marginBottom: 8,
                  background:
                    themeType === "light" && !isSender
                      ? "#ffffff"
                      : "rgba(255,255,255,0.15)",
                  borderRadius: "8px",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: isSender ? "#f0f0f0" : "#666",
                  padding: 10,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Avatar
                    src={el?.replyToMeta?.pic}
                    size={28}
                    style={{ marginRight: 8 }}
                  />
                  <Typography.Text
                    style={{
                      fontWeight: 600,
                      color:
                        themeType === "light" && !isSender ? "#000" : "#fff",
                      marginRight: 8,
                    }}
                  >
                    {el?.replyToMeta?.userName}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: 12, color: "#d0d0d0" }}>
                    {moment(el?.replyToMeta?.timestamp).format("hh:mm A")}
                  </Typography.Text>
                </div>
                <Typography.Text
                  style={{
                    color: themeType === "light" && !isSender ? "#000" : "#fff",
                  }}
                >
                  {el?.replyToMeta?.attachments.length === 0
                    ? el?.replyToMeta?.content
                    : renderAttachments(el?.replyToMeta?.attachments)}
                </Typography.Text>
              </div>
              {el?.attachments?.length > 0 && renderAttachments(el.attachments)}

              {/* Main message */}
              {/* <Typography.Text
              style={{ fontSize: 15, color: isSender ? "#fff" : "#000" }}
            >
              {el.content}
            </Typography.Text> */}
              {renderMessageContent()}
              {renderReactions()}
            </div>
            {isEditing && (
              <Row gutter={8} style={{ marginTop: "4px" }}>
                <Col>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveMessage}
                  >
                    Save
                  </Button>
                </Col>
                <Col>
                  <Button size="small" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            )}
            <Row
              style={{
                display: "flex",
                justifyContent:
                  el.sender._id === user._id ? "flex-end" : "flex-start",
                marginTop: "4px",
                gap: "8px",
              }}
            >
              {/* <Typography.Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
            {el.sender._id === user._id ? "You" : el.sender.userName}
          </Typography.Text> */}
              <Typography.Text
                style={{
                  color: "#A3A3A3",
                  fontWeight: 400,
                  lineHeight: "13.86px",
                  fontSize: fontSizes.subheading,
                  fontFamily: fontFamily,
                  marginRight: "15px",
                }}
              >
                {el.sender._id === user._id
                  ? (el.edited || isedited) && (
                      <Typography.Text
                        style={{
                          color:
                            themeType === "light"
                              ? theme.light.textHilight
                              : theme.dark.textHilight,
                          fontSize: fontSizes.subheading,
                          fontFamily: fontFamily,
                          fontWeight: 400,
                          paddingRight: 5,
                        }}
                      >
                        Edited
                      </Typography.Text>
                    )
                  : null}
                {el.sender._id === user._id
                  ? moment(el.createdAt).format("hh:mm A")
                  : null}
              </Typography.Text>
            </Row>
            {/* <Typography.Text
            style={{
              color: "#A3A3A3",
              fontWeight: 400,
              lineHeight: "13.86px",
              fontSize: "11px",
              marginRight: "15px",
            }}
          >
            {el.sender._id === user._id
              ? moment(el.createdAt).format("hh:mm A")
              : null}
          </Typography.Text> */}
          </Popover>
        </Col>
      </Row>
      <ForwardModal
        open={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        forwardedMessageId={el._id}
        setChatMessages={setChatMessages}
      />
    </>
  );
};

const ForwardMsg = ({
  el,
  setChatMessages,
  onReply,
}: {
  el: any;
  setChatMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onReply: (msg: any) => void;
}) => {
  const { user, currentOrganization } = useSelector((state: any) => state.auth);
  const isSender = el.sender?._id === user?._id;
  const [reactions, setReactions] = useState<any[]>(el.reactions || []);
  const [openPicker, setOpenPicker] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isedited, setIsEdited] = useState(false);
  const [editedMessage, setEditedMessage] = useState(el.content);
  const [isDeleted, setIsDeleted] = useState(el.deleted || false);
  const pickerRef = useClickOutside(() => setOpenPicker(false));
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { currentChat, messages } = useSelector((state: any) => state.chat);
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(el.isPinned || false);

  const handlePinMessage = async () => {
    await requestHandler(
      async () => await pinMessage(currentOrganization.id, el.chatId, el._id),
      null,
      (res) => {
        if (res?.success && res?.data) {
          const updatedMessages = messages.map((msg: any) =>
            msg._id === el._id
              ? {
                  ...msg,
                  isPinned: res.data.isPinned,
                  pinnedAt: res.data.pinnedAt,
                  pinnedBy: res.data.pinnedBy,
                }
              : msg
          );

          setIsPinned(res.data.isPinned);
          //setChatMessages(updatedMessages);
          dispatch(updateMessages(updatedMessages) as any);
        }
      },
      (err) => {
        console.error("Pin message error:", err);
      }
    );
  };

  const handleReaction = useCallback(
    async (emoji: string) => {
      await requestHandler(
        () => reactToMessage(el._id, user._id, emoji),
        null,
        () => {
          setReactions((prevReactions) => {
            const exists = prevReactions.find(
              (reaction) =>
                reaction.userId === user._id && reaction.emoji === emoji
            );
            return exists
              ? prevReactions.filter(
                  (reaction) =>
                    reaction.userId !== user._id || reaction.emoji !== emoji
                )
              : [
                  ...prevReactions,
                  { userId: user._id, emoji, userName: user.userName },
                ];
          });
        },
        (err) => console.error("Reaction error:", err)
      );
    },
    [el._id, user]
  );

  const handleSaveMessage = async () => {
    if (editedMessage.trim() === el.content.trim()) {
      setIsEditing(false);
      return;
    }

    await requestHandler(
      () => updateMessage(el._id, editedMessage),
      null,
      () => {
        setEditedMessage(editedMessage);
        setIsEdited(true);
        setIsEditing(false);
      },
      (err) => console.error("Save message error:", err)
    );
  };

  const handleDeleteMessage = async () => {
    console.log(
      "Before Deletion - isDeleted:",
      isDeleted,
      "el.deleted:",
      el.deleted
    );

    await requestHandler(
      async () => await deleteMessage(el._id),
      null,
      (res) => {
        if (res.success) {
          console.log("Delete API Success:", res);
          setIsDeleted(true);
          setChatMessages(
            messages.map((msg: any) =>
              msg._id === el._id ? { ...msg, deleted: true } : msg
            )
          );
          dispatch(
            updateMessages(
              messages.map((msg: any) =>
                msg._id === el._id ? { ...msg, deleted: true } : msg
              )
            ) as any
          );
        }
      },
      (err) => console.error("Delete message error:", err)
    );
  };

  // Render reactions
  const renderReactions = () =>
    reactions.length > 0 && (
      <Row gutter={[8, 0]} style={{ marginTop: "4px", flexWrap: "wrap" }}>
        {reactions.map((reaction, index) => (
          <Col key={index}>
            <Tooltip title={`Reacted by ${reaction.userName}`} placement="top">
              <Typography
                style={{
                  fontSize: fontSizes.emoji,
                  cursor: "pointer",
                  padding: "8px 4px",
                  borderRadius: "4px",
                  lineHeight: "10px",
                  border: `1px solid ${
                    themeType === "light"
                      ? theme.light.border
                      : theme.dark.border
                  }`,
                  display: "inline-block",
                }}
              >
                {reaction.emoji}
              </Typography>
            </Tooltip>
          </Col>
        ))}
      </Row>
    );

  // Render message content
  const renderMessageContent = () => {
    if (isDeleted || el.deleted) {
      return (
        <div
          style={{
            borderRadius: "8px",
            // textAlign: "center"
          }}
        >
          <Typography.Text
            style={{
              fontStyle: "italic",
              color:
                el.sender._id === user._id
                  ? themeType === "light"
                    ? theme.light.text
                    : theme.dark.text
                  : "#868686",
              fontSize: fontSizes.subheading,
              fontFamily: fontFamily,
            }}
          >
            This message was deleted
          </Typography.Text>
        </div>
      );
    }
    const linkify = (text: any) => {
      if (!text) return text;
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      return text.split(urlPattern).map((part: any, index: any) =>
        urlPattern.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color:
                el.sender?._id === user._id
                  ? themeType === "light"
                    ? theme.light.text
                    : theme.dark.text
                  : "#333333",
              textDecoration: "underline",
              fontSize: fontSizes.subheading,
              fontFamily: fontFamily,
            }}
          >
            {part}
          </a>
        ) : (
          part
        )
      );
    };
    return isEditing ? (
      <Input.TextArea
        autoSize={{ minRows: 3, maxRows: 5 }}
        value={editedMessage}
        onChange={(e) => setEditedMessage(e.target.value)}
        rows={3}
        styles={{
          textarea: {
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          },
        }}
        style={{
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          borderRadius: "8px",
          fontSize: fontSizes.subheading,
          fontFamily: fontFamily,
          width: "100%",
        }}
      />
    ) : (
      <Typography.Text
        style={{
          color:
            el.sender._id === user._id
              ? theme.dark.textHilight
              : themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          fontSize: fontSizes.subheading,
          fontFamily: fontFamily,
          wordWrap: "break-word",
        }}
      >
        {linkify(editedMessage)}
      </Typography.Text>
    );
  };

  const renderAttachments = (attachments: IAttachments[]) =>
    attachments.map((file, index) => {
      if (file.fileType?.includes(".pdf")) {
        return <PDFAttachment key={index} file={file} />;
      }
      if (
        [".mp4", ".webm", ".ogg"].some((type) => file.fileType?.includes(type))
      ) {
        return <VideoAttachment key={index} file={file} />;
      }
      if (file.fileType?.includes("image")) {
        return (
          <ImageAttachment
            key={index}
            file={file}
            sender={el.sender}
            user={user}
          />
        );
      }
      return (
        <GenericFileAttachment
          key={index}
          file={file}
          sender={el.sender}
          user={user}
          themeType={themeType}
          theme={theme}
          fontFamily={fontFamily}
        />
      );
    });

  const onMessageDelete = (message: ChatMessageInterface) => {
    if (message._id === el._id) {
      handleDeleteMessage();
    }
  };

  const onMessageReaction = (message: any) => {
    if (message._id === el._id) {
      setReactions(message.reactions);
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            addNotification({
              title: "New Message from Scraawl",
              subtitle: `${el?.sender?.userName}`,
              message: `${el?.sender?.userName} reacted to your message`,
              duration: 4000,
              icon: wings,
              vibrate: 200,
              backgroundTop: "#1890FF",
              native: true,
              onClick: () => {
                window.focus();
              },
            });
          } else {
            console.warn("Notification permission denied");
          }
        });
      } else {
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} reacted to your message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => {
            window.focus();
          },
        });
      }
    }
  };

  const onMessageEdit = (message: ChatMessageInterface) => {
    if (message._id === el._id) {
      message.edited = true;
      setEditedMessage(message.content);
      setIsEdited(true);
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            addNotification({
              title: "New Message from Scraawl",
              subtitle: `${el?.sender?.userName}`,
              message: `${el?.sender?.userName} edited a message`,
              duration: 4000,
              icon: wings,
              vibrate: 200,
              backgroundTop: "#1890FF",
              native: true,
              onClick: () => {
                window.focus();
              },
            });
          } else {
            console.warn("Notification permission denied");
          }
        });
      } else {
        addNotification({
          title: "New Message from Scraawl",
          subtitle: `${el?.sender?.userName}`,
          message: `${el?.sender?.userName} edited a message`,
          duration: 4000,
          icon: wings,
          vibrate: 200,
          backgroundTop: "#1890FF",
          native: true,
          onClick: () => {
            window.focus();
          },
        });
      }
    }
  };

  const renderPinnedIcon = () =>
    isPinned && (
      <Row gutter={[8, 0]} style={{ marginTop: "4px", flexWrap: "wrap" }}>
        <Col>
          <Tooltip title="Pinned" placement="top">
            <Pin
              fill={
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground
              }
              color={
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground
              }
              strokeWidth={1.5}
              size={25}
              style={{
                padding: "5px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Col>
      </Row>
    );

  useEffect(() => {
    socket?.on(DELETE_MESSAGE_EVENT, onMessageDelete);
    socket?.on(REACTION_MESSAGE_EVENT, onMessageReaction);
    socket?.on(EDIT_MESSAGE_EVENT, onMessageEdit);
    return () => {
      socket?.off(DELETE_MESSAGE_EVENT, onMessageDelete);
      socket?.off(REACTION_MESSAGE_EVENT, onMessageReaction);
      socket?.off(EDIT_MESSAGE_EVENT, onMessageEdit);
    };
  }, [socket, currentChat]);

  return (
    <>
      <Row
        justify={isSender ? "end" : "start"}
        gutter={[0, 16]}
        style={{ gap: 6 }}
      >
        <Tooltip title={el.sender.userName} placement="top">
          {el.sender._id !== user._id && (
            <Avatar
              icon={<UserRound strokeWidth={1.5} size={20} />}
              alt={el.sender.userName}
              src={el.sender.pic}
            />
          )}
        </Tooltip>
        <Col>
          <Popover
            trigger={"hover"}
            placement="bottomRight"
            showArrow={false}
            content={
              !isDeleted && (
                <Space direction="horizontal" size={10} style={{ padding: 0 }}>
                  {["😀", "👍", "🤔"].map((emoji) => (
                    <Button
                      key={emoji}
                      size="small"
                      onClick={() => handleReaction(emoji)}
                      style={{ border: "none", boxShadow: "none" }}
                    >
                      {emoji}
                    </Button>
                  ))}
                  <Plus
                    strokeWidth={1.5}
                    size={25}
                    cursor="pointer"
                    style={{
                      color: "#1677FF",
                      fontWeight: "bold",
                      padding: "5px",
                      marginTop: "5px",
                      borderRadius: "4px",
                      backgroundColor: "#0078EF0F",
                      fontSize: "16px",
                    }}
                    onClick={() => setOpenPicker(!openPicker)}
                  />
                  <Button
                    type="text"
                    size="small"
                    onClick={() => onReply(el)}
                    icon={<CornerUpLeft strokeWidth={1.5} size={15} />}
                  />
                  <Button
                    type="text"
                    size="small"
                    onClick={() => setIsForwardModalOpen(true)}
                    icon={<CornerUpRight strokeWidth={1.5} size={15} />}
                  />
                  <Pin
                    strokeWidth={1.5}
                    size={25}
                    onClick={handlePinMessage}
                    style={{
                      padding: "5px",
                      marginTop: "5px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  />
                  <ForwardModal
                    open={isForwardModalOpen}
                    onClose={() => setIsForwardModalOpen(false)}
                    forwardedMessageId={el._id}
                    setChatMessages={setChatMessages}
                  />
                  {openPicker && (
                    <Popover placement="topLeft" trigger={"click"}>
                      <div
                        ref={pickerRef}
                        style={{
                          position: "absolute",
                          top: "40px",
                          right: "40px",
                          transform: "translateX(-10%)",
                        }}
                      >
                        <Picker
                          theme="light"
                          data={data}
                          onEmojiSelect={(emoji: any) =>
                            handleReaction(emoji.native)
                          }
                        />
                      </div>
                    </Popover>
                  )}
                  {el.sender._id === user._id && (
                    <>
                      <Button
                        style={{
                          border: "none",
                          boxShadow: "none",
                          cursor: "pointer",
                        }}
                        size="small"
                        onClick={() => setIsEditing(true)}
                        icon={<SquarePen strokeWidth={1.5} size={15} />}
                      />
                      <Button
                        style={{
                          border: "none",
                          padding: "none",
                          boxShadow: "none",
                          cursor: "pointer",
                        }}
                        size="small"
                        onClick={handleDeleteMessage}
                        icon={<Trash2 strokeWidth={1.5} size={15} />}
                      />
                    </>
                  )}
                </Space>
              )
            }
            overlayInnerStyle={{
              border: "1px solid #EDEDED",
              boxShadow: "0px 4px 8px 0px #0926411C",
              borderRadius: "6px",
              padding: "2px",
            }}
          >
            <Typography.Text
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontSize: fontSizes.subheading,
                fontFamily: fontFamily,
                fontWeight: 500,
              }}
            >
              {el.sender._id === user._id ? null : el.sender.userName}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: fontSizes.subheading,
                fontFamily: fontFamily,
                paddingLeft: "10px",
                color: "#A3A3A3",
                fontWeight: 400,
                lineHeight: "13.86px",
              }}
            >
              {el.sender._id === user._id
                ? null
                : moment(el.createdAt).format("hh:mm A")}
              {el.sender._id === user._id
                ? null
                : (el.edited || isedited) && (
                    <Typography.Text
                      style={{
                        color:
                          themeType === "light"
                            ? theme.light.textHilight
                            : theme.dark.textHilight,
                        fontSize: fontSizes.subheading,
                        fontFamily: fontFamily,
                        fontWeight: 400,
                        paddingLeft: 5,
                      }}
                    >
                      Edited
                    </Typography.Text>
                  )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8, // optional spacing between items
                }}
              >
                {renderPinnedIcon()}
                <CornerUpRight strokeWidth={1.5} size={15} />
                <Typography.Text
                  style={{
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    fontSize: fontSizes.subheading,
                    fontFamily: fontFamily,
                    fontWeight: 400,
                  }}
                >
                  Forward
                </Typography.Text>
              </div>
            </Typography.Text>
            <div
              id={`message-${el._id}`}
              style={{
                maxWidth: "400px",
                backgroundColor:
                  el.sender?._id === user._id
                    ? themeType === "light"
                      ? theme.light.primaryBackground
                      : theme.dark.primaryBackground
                    : theme.light.primaryLight,
                color:
                  el.sender?._id === user._id
                    ? themeType === "light"
                      ? theme.light.text
                      : theme.dark.text
                    : "#333333",
                padding: "12px 16px",
                borderRadius: "16px",
                position: "relative",
              }}
            >
              {/* Forwarded Message Block */}
              {el?.forwardToMeta && (
                <div
                  style={{
                    borderLeft: "3px solid rgba(255, 255, 255, 0.4)",
                    paddingLeft: "12px",
                    marginBottom: 8,
                    background:
                      themeType === "light" && !isSender
                        ? "#ffffff"
                        : "rgba(255,255,255,0.15)",
                    // background: isSender ? "rgba(255,255,255,0.15)" : "#ffffff",
                    borderRadius: "8px",
                    fontStyle: "italic",
                    fontSize: 14,
                    color: isSender ? "#f0f0f0" : "#666",
                    padding: 10,
                  }}
                >
                  {/* Forwarded label */}

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    {/* <Avatar
                  src={el?.forwardToMeta?.pic}
                  size={28}
                  style={{ marginRight: 8 }}
                /> */}
                    <Typography.Text
                      style={{
                        fontWeight: 600,
                        color:
                          themeType === "light" && !isSender ? "#000" : "#fff",
                        marginRight: 8,
                      }}
                    >
                      {el?.forwardToMeta?.userName}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: "#d0d0d0" }}>
                      {moment(el?.forwardToMeta?.timestamp).format("hh:mm A")}
                    </Typography.Text>
                  </div>
                  <Typography.Text
                    style={{
                      color:
                        themeType === "light" && !isSender ? "#000" : "#fff",
                    }}
                  >
                    {el?.forwardToMeta?.attachments.length === 0
                      ? el?.forwardToMeta?.content
                      : renderAttachments(el?.forwardToMeta?.attachments)}
                  </Typography.Text>
                </div>
              )}

              {/* Attachments */}
              {el?.attachments?.length > 0 && renderAttachments(el.attachments)}

              {/* Message Content */}
              {renderMessageContent()}
              {renderReactions()}
            </div>
            {isEditing && (
              <Row gutter={8} style={{ marginTop: "4px" }}>
                <Col>
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleSaveMessage}
                  >
                    Save
                  </Button>
                </Col>
                <Col>
                  <Button size="small" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            )}
            <Row
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                marginTop: "4px",
                gap: "8px",
              }}
            >
              <Typography.Text
                style={{
                  color: "#A3A3A3",
                  fontWeight: 400,
                  lineHeight: "13.86px",
                  fontSize: fontSizes.subheading,
                  fontFamily: fontFamily,
                  marginRight: "15px",
                }}
              >
                {isSender && (el.edited || isedited) && (
                  <Typography.Text
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontSize: fontSizes.subheading,
                      fontFamily: fontFamily,
                      fontWeight: 400,
                      paddingRight: 5,
                    }}
                  >
                    Edited
                  </Typography.Text>
                )}
                {isSender && moment(el.createdAt).format("hh:mm A")}
              </Typography.Text>
            </Row>
          </Popover>
        </Col>
      </Row>
      <ForwardModal
        open={isForwardModalOpen}
        onClose={() => setIsForwardModalOpen(false)}
        forwardedMessageId={el._id}
        setChatMessages={setChatMessages}
      />
    </>
  );
};

const ForwardModal = ({
  open,
  onClose,
  forwardedMessageId,
  setChatMessages,
}: {
  open: boolean;
  onClose: () => void;
  forwardedMessageId: string;
  setChatMessages: (messages: any) => void;
}) => {
  const { theme, themeType } = useTheme();
  const [selectedTargets, setSelectedTargets] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const { currentChat, messages, chats } = useSelector(
    (state: any) => state.chat
  );

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

  return (
    <Modal
      maskClosable={false}
      closable={true}
      centered
      title={
        <div
          style={{
            fontWeight: "600",
            fontSize: "18px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        >
          Forward Message
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      closeIcon={
        <X
          strokeWidth={1}
          size={25}
          onClick={onClose}
          style={{
            cursor: "pointer",
            padding: 4,
            borderRadius: 6,
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        />
      }
      styles={{
        content: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
        },
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        >
          Search
        </label>
        <SearchUserChannelInput
          isMulti
          placeholder="Enter username or channel name"
          onChange={(selected: any) => setSelectedTargets(selected || [])}
          value={selectedTargets}
          inputProps={{ id: "forward-search" }}
          styles={{
            control: (base: any) => ({
              ...base,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              color:
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText,
            }),
          }}
          border={`1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`}
          components={{ DropdownIndicator: () => null }}
        />
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "500",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        >
          Write Message
        </label>
        <Input.TextArea
          autoSize={{ minRows: 3, maxRows: 5 }}
          className="custom-input"
          rows={4}
          placeholder="Enter Message (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          styles={{
            textarea: {
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            },
          }}
          style={{
            borderRadius: "6px",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            color:
              themeType === "light"
                ? theme.light.primaryText
                : theme.dark.primaryText,
            border: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
          }}
        />
      </div>

      <Divider
        style={{
          border:
            themeType === "light" ? theme.light.border : theme.dark.border,
        }}
      />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          style={{
            background:
              themeType === "light"
                ? theme.light.primaryBackground
                : theme.dark.primaryBackground,
            borderRadius: "6px",
            color: themeType === "light" ? theme.light.text : theme.dark.text,
          }}
          onClick={async () => {
            setAttachedFiles([]);
            await requestHandler(
              async () =>
                await forwardMessage(
                  currentChat._id,
                  selectedTargets,
                  message,
                  attachedFiles,
                  forwardedMessageId
                ),
              null,
              (res) => {
                if (res.success && res.data) {
                  onClose();
                  const forwardedMessages = Array.isArray(res.data)
                    ? res.data
                    : [res.data];
                  const currentChatMessages = forwardedMessages.filter(
                    (msg) => msg.chatId === currentChat._id
                  );
                  if (currentChatMessages.length > 0) {
                    setChatMessages((prev: any) => [
                      ...currentChatMessages,
                      ...prev,
                    ]);
                  }
                  dispatch(
                    updateMessages([...forwardedMessages, ...messages]) as any
                  );
                  forwardedMessages.forEach((msg: any) =>
                    updateChatLastMessage(msg.chatId, msg)
                  );
                  console.log("Forwarded successfully");
                }
              },
              (error: string) => {
                console.error("Error forwarding message:", error);
                dispatch(
                  showSnackbar({ severity: "error", message: error }) as any
                );
              }
            );
          }}
        >
          Forward
        </Button>
      </div>
    </Modal>
  );
};

const PDFAttachment = ({ file }: any) => {
  const openPDF = () => {
    const pdfWindow: any = window.open();
    pdfWindow.location.href = file.url;
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <img
        src={iconPDF}
        alt="pdf-icon"
        style={{ width: 80, cursor: "pointer" }}
        onClick={openPDF}
      />
    </div>
  );
};

const VideoAttachment = ({ file }: any) => {
  return (
    <div style={{ marginTop: "20px" }}>
      <video width={150} height={100} controls style={{ borderRadius: 8 }}>
        <source src={file.url} type={file.fileType} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

const ImageAttachment = ({ file, sender, user }: any) => {
  const [previewVisible, setPreviewVisible] = useState(false);

  const isSender = sender._id === user._id;

  return (
    <Row
      style={{
        display: "flex",
        flexDirection: isSender ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSender ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ position: "relative", width: 150, height: 100 }}>
            <Row
              justify="center"
              align="middle"
              style={{
                position: "absolute",
                zIndex: 1,
                background: "rgba(243, 244, 248, 0.37)",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
              }}
              onClick={() => setPreviewVisible(true)}
            >
              <Button
                icon={<Eye strokeWidth={1.25} size={20} />}
                shape="circle"
                size="large"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                }}
              />
            </Row>
            <Image
              src={file.url}
              height={100}
              width={150}
              style={{ borderRadius: 8 }}
              preview={false}
            />
          </div>
          {previewVisible && (
            <CustomImage file={file} onClose={() => setPreviewVisible(false)} />
          )}
        </div>
      </div>
    </Row>
  );
};

const GenericFileAttachment = ({
  file,
  sender,
  user,
  themeType,
  theme,
  fontFamily,
}: any) => {
  const isSender = sender._id === user._id;
  const bubbleBg = isSender
    ? themeType === "light"
      ? theme.light.primaryBackground
      : theme.dark.primaryBackground
    : themeType === "light"
    ? theme.light.primaryLight
    : theme.dark.primaryLight;

  const textColor = isSender
    ? themeType === "light"
      ? theme.light.text
      : theme.dark.text
    : themeType === "light"
    ? theme.light.textHilight
    : theme.dark.textHilight;

  const formatSizeToMB = (bytes: any) => {
    if (!bytes || isNaN(bytes)) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Row
      style={{
        display: "flex",
        flexDirection: isSender ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSender ? "flex-end" : "flex-start",
        }}
      >
        <div
          style={{
            backgroundColor: bubbleBg,
            color: textColor,
            fontSize: "14px",
            fontFamily: fontFamily,
            borderRadius: "10px",
            padding: "10px 16px",
            maxWidth: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
              <FileText
                strokeWidth={1.5}
                size={28}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: bubbleBg,
                  color: textColor,
                }}
              />
              <div>
                <div style={{ fontWeight: 400 }}>{file.fileName}</div>
                <div style={{ fontSize: "12px" }}>
                  {formatSizeToMB(file.size)}
                </div>
              </div>
            </div>

            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <Download
                strokeWidth={1.5}
                size={28}
                style={{
                  padding: "6px",
                  borderRadius: "8px",
                  backgroundColor: bubbleBg,
                  color: textColor,
                  cursor: "pointer",
                }}
              />
            </a>
          </div>
        </div>
      </div>
    </Row>
  );
};

export {
  TextMsg,
  ReplyMsg,
  ForwardModal,
  ForwardMsg,
  PDFAttachment,
  VideoAttachment,
  ImageAttachment,
  GenericFileAttachment,
};
