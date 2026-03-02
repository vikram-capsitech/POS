import React, { useState, useCallback } from "react";
import { Input, Button, Upload, Typography } from "antd";
import { useSelector } from "react-redux";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import useClickOutside from "../../Hooks/useClickOutside";
import { FileIcon, FileUploadTwoIcon } from "../../Assets/CustomAntIcons";
import { useTheme } from "../../Contexts/ThemeContext";
import { Paperclip, Send, SmilePlus, X } from "lucide-react";

const { Dragger } = Upload;
const { Text } = Typography;

const Footer = ({
  handleSendMsg,
  value,
  onChange,
  handleFile,
  isTyping,
  replyingToMessage,
  setReplyingToMessage,
}: any) => {
  const [openPicker, setOpenPicker] = useState(false);
  const [msg, setMsg] = useState(value);
  const { theme, themeType } = useTheme();
  const [attachments, setAttachments] = useState<any[]>([]);
  const { currentChat } = useSelector((state: any) => state.chat);
  const { user } = useSelector((state: any) => state.auth);
  const [showDragger, setShowDragger] = React.useState(false);
  const pickerRef = useClickOutside(() => setOpenPicker(false));

  const getUserDetail = useCallback(() => {
    if (currentChat) {
      const rece = currentChat.participants.find(
        (u: any) => u._id !== user?._id
      );
      if (currentChat.isGroupChat) return `# ${currentChat.name}`;
      else return rece?.userName || "";
    }
    return "";
  }, [currentChat, user]);

  const name = getUserDetail();

  const handleEmojiClick = (e: any) => {
    const message = msg + e?.native;
    setMsg(message);
    setOpenPicker(false);
    onChange(e, message);
  };
  const sendChat = () => {
    if (msg.trim() || attachments.length > 0) {
      handleSendMsg(msg, attachments);
      setMsg("");
      setAttachments([]);
      setShowDragger(false);
    }
  };
  const handleFileChange = (file: any) => {
    setAttachments((prevAttachments) => [...(prevAttachments || []), file]);
    handleFile(file);
  };

  return (
    <div
      style={{
        position: "relative",
        padding: "10px",
        background:
          themeType === "light" ? theme.light.hover : theme.dark.hover,
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        border: `1px solid ${
          themeType === "light" ? theme.light.hover : theme.dark.hover
        }`,
        marginBottom: "20px",
        marginLeft: "50px",
        marginRight: "50px",
      }}
    >
      {/* Reply Preview */}
      {replyingToMessage && (
        <div
          style={{
            background:
              themeType === "light"
                ? theme.light.primaryLight
                : theme.dark.primaryLight,
            border: `1px solid ${
              themeType === "light" ? theme.light.hover : theme.dark.hover
            }`,
            borderRadius: "8px",
            padding: "8px 12px",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: `${
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText
              }`,
              fontWeight: 500,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>Replying to: {replyingToMessage?.sender?.userName || ""}</div>
            <div
              style={{
                cursor: "pointer",
              }}
              onClick={() => setReplyingToMessage(null)}
            >
              <X strokeWidth={1} size={18} style={{ color: "#8C8C8C" }} />
            </div>
          </div>
          <div
            style={{
              fontSize: "13px",
              color: `${
                themeType === "light"
                  ? theme.light.textLight
                  : theme.dark.textLight
              }`,
              marginTop: "8px",
              marginLeft: "8px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {replyingToMessage?.content || "Media message"}
          </div>
        </div>
      )}
      {/* Drag and Drop Upload */}
      {showDragger && (
        <Dragger
          multiple={true}
          showUploadList={false}
          beforeUpload={(file) => {
            handleFileChange(file);
            return false;
          }}
          style={{
            marginBottom: "10px",
            background:
              themeType === "light"
                ? theme.light.primaryLight
                : theme.dark.primaryLight,
            border:
              themeType === "light"
                ? `1px dashed ${theme.light.border}`
                : `1px dashed ${theme.dark.border}`,
          }}
        >
          <p className="ant-upload-drag-icon">
            <FileUploadTwoIcon
              fill={
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground
              }
            />
          </p>
          <p
            className="ant-upload-text"
            style={{
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Drag and drop some files here
          </p>
        </Dragger>
      )}
      {attachments.length > 0 && (
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {attachments.map((file, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                border:
                  themeType === "light"
                    ? `1px solid ${theme.light.border}`
                    : `1px solid ${theme.dark.border}`,
                borderRadius: "4px",
                width: "250px",
                background:
                  themeType === "light"
                    ? theme.light.primaryLight
                    : theme.dark.primaryLight,
                marginBottom: "10px",
              }}
            >
              {/* File Icon */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  marginRight: "12px",
                  overflow: "hidden",
                }}
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <FileIcon strokeWidth={1} size={20} />
                )}
              </div>
              {/* File Details */}
              <div style={{ flexGrow: 1, overflow: "hidden" }}>
                <Text
                  style={{
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    fontSize: "14px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "block",
                  }}
                >
                  {file.name}
                </Text>
                <Text
                  style={{
                    color:
                      themeType === "light"
                        ? theme.light.textLight
                        : theme.dark.textLight,
                    fontSize: "12px",
                  }}
                >
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </div>

              {/* Close Button */}
              <div
                style={{
                  cursor: "pointer",
                  padding: "5px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() =>
                  setAttachments((prevAttachments) =>
                    prevAttachments.filter((_, i) => i !== index)
                  )
                }
              >
                <X strokeWidth={1} size={18} style={{ color: "#8C8C8C" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Field */}
      <Input
        placeholder={isTyping ? `${name} is Typing...` : `Message ${name}`}
        value={msg}
        onChange={(e) => {
          setMsg(e.target.value);
          onChange(e, undefined);
        }}
        onPressEnter={sendChat}
        styles={{
          input: {
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          },
        }}
        style={{
          flex: 1,
          border:
            themeType === "light"
              ? `1px solid ${theme.light.border}`
              : `1px solid ${theme.dark.border}`,
          backgroundColor:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          padding: "10px",
          borderRadius: "4px",
        }}
        className="custom-input"
      />

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "8px",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            // alignItems: "center",
            gap: "8px",
            position: "relative",
          }}
        >
          <Paperclip
            strokeWidth={1}
            size={28}
            onClick={() => setShowDragger((prev) => !prev)}
            stroke={
              showDragger
                ? themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight
                : themeType === "light"
                ? theme.light.textLight
                : theme.dark.textLight
            }
            style={{
              padding: "5px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          />

          <div style={{ position: "relative" }}>
            <SmilePlus
              strokeWidth={1}
              size={28}
              stroke={
                openPicker
                  ? themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight
                  : themeType === "light"
                  ? theme.light.textLight
                  : theme.dark.textLight
              }
              style={{
                borderRadius: "6px",
                cursor: "pointer",
                padding: "5px",
              }}
              onClick={() => setOpenPicker(!openPicker)}
            />
            {openPicker && (
              <div
                ref={pickerRef}
                style={{
                  position: "absolute",
                  bottom: "40px",
                  left: "50%",
                  transform: "translateX(-10%)",
                }}
              >
                <Picker
                  theme="light"
                  data={data}
                  onEmojiSelect={handleEmojiClick}
                />
              </div>
            )}
          </div>
        </div>
        <Button
          shape="circle"
          icon={
            <Send
              strokeWidth={1}
              size={20}
              stroke={
                themeType === "light" ? theme.light.text : theme.dark.text
              }
            />
          }
          onClick={sendChat}
          style={{
            backgroundColor:
              themeType === "light"
                ? theme.light.primaryBackground
                : theme.dark.primaryBackground,
            border: "none",
            borderRadius: "6px",
          }}
        />
      </div>
    </div>
  );
};

export default Footer;
