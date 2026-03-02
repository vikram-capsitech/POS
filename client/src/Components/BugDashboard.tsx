import { Button, Input, Layout, Row, Space, Steps, Typography } from "antd";
import { useTheme } from "../Contexts/ThemeContext";
import { Paperclip, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { AuthInitialState, setDiscussionsList } from "../redux/slices/auth";
import { useParams } from "react-router-dom";
import { requestHandler } from "../Utils";
import { createDiscussion } from "../Api";
import { toast } from "react-toastify";
import { useEffect, useRef, useState } from "react";
import { dispatch } from "../redux/store";

const { Step } = Steps;
const { Text } = Typography;

const BugDashboard = () => {
  const { theme, themeType, fontSizes, fontFamily } = useTheme();
  const [message, setMessage] = useState("");
  const bugStatus = ["Reported", "Acknowledged", "In Progress", "Fixed"];
  const currentStatus = "In Progress";
  const currentStepIndex = bugStatus.indexOf(currentStatus);
  const { bugId } = useParams();
  const { currentOrganization, bugList, discussions, user } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );
  console.log("Discussion", discussions);
  const selectedBug = bugList.find((bug: any) => bug._id === bugId);

  const addDiscussion = async () => {
    if (!selectedBug) {
      toast.error("No bug selected", { position: "top-right" });
      return;
    }
    if (!message.trim()) {
      toast.error("Message cannot be empty", { position: "top-right" });
      return;
    }
    await requestHandler(
      async () =>
        await createDiscussion(
          currentOrganization.id,
          selectedBug._id,
          message
        ),
      () => {},
      (res: any) => {
        if (res.success) {
          const newDiscussion = res.data;
          dispatch(setDiscussionsList([newDiscussion, ...discussions]) as any);
          toast.success("Discussion added successfully", {
            position: "top-right",
          });
          setMessage("");
        } else {
          toast.error("Failed to add discussion", {
            position: "top-right",
          });
        }
      },
      (error: any) => {
        toast.error(error?.message || "Failed to add discussion", {
          position: "top-right",
        });
      }
    );
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [discussions]);

  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            width: "100%",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            padding: "8px 17px",
            borderBottom: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
            marginBottom: "40px",
          }}
        >
          <Space direction="vertical" size={0}>
            {selectedBug && (
              <div key={selectedBug._id}>
                <Text
                  strong
                  style={{
                    fontWeight: 500,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    paddingTop: "10px",
                    fontSize: fontSizes.header,
                    fontFamily,
                  }}
                >
                  {selectedBug.title}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    display: "block",
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    fontSize: fontSizes.subheading,
                    fontFamily,
                  }}
                >
                  {selectedBug.description}
                </Text>
              </div>
            )}
          </Space>
        </div>

        <Steps current={currentStepIndex} labelPlacement="vertical" responsive>
          {bugStatus.map((status, index) => (
            <Step key={index} title={status} />
          ))}
        </Steps>

        {/* Discussions */}
        <div
          style={{
            padding: "20px 50px",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {discussions.map((el: any, index: number) => {
            const isUser = el.sender?._id === user?._id;
            return (
              <Row
                key={index}
                justify={isUser ? "end" : "start"}
                style={{ marginBottom: "16px" }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    background: isUser
                      ? themeType === "light"
                        ? theme.light.primaryBackground
                        : theme.dark.primaryBackground
                      : theme.light.primaryLight,
                    padding: "10px 14px",
                    borderRadius: "8px",
                    color: isUser
                      ? themeType === "light"
                        ? theme.light.text
                        : theme.dark.text
                      : "#333333",
                    borderBottomLeftRadius: "12px",
                    borderBottomRightRadius: "12px",
                    wordBreak: "break-word",
                    fontWeight: 400,
                    fontSize: "13px",
                    display: "block",
                    flexDirection: isUser ? "row-reverse" : "row",
                  }}
                >
                  {el.message}
                </div>
              </Row>
            );
          })}

          {/* Invisible element to scroll into view */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Section */}
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
          margin: "20px 50px",
        }}
      >
        <Input
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{
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
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "8px",
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            <Paperclip
              strokeWidth={1}
              size={28}
              style={{
                padding: "5px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            />
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
            onClick={addDiscussion}
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
    </Layout>
  );
};

export default BugDashboard;
