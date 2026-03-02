import React from "react";
import { Layout, Typography, List, Divider } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { requestHandler } from "../../Utils";
import { createUserChat, getUserChats } from "../../Api";
import { ChatListItemInterface } from "../../Interfaces/chat";
import { FetchChats, SetChats, setCurrentChat } from "../../redux/slices/chat";
import { SearchUserInput } from "../../Components/SearchAsync";
import { useNavigate } from "react-router-dom";
import { showSnackbar } from "../../redux/slices/app";
import ChatElement from "../../Components/ChatElement";
import { useTheme } from "../../Contexts/ThemeContext";
import { MessageCircleMore } from "lucide-react";

const { Sider } = Layout;

const Chats = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme, themeType, fontSizes, fontFamily } = useTheme();
  const { chats } = useSelector((state: any) => state?.chat);
  const { user, currentOrganization } = useSelector(
    (state: any) => state?.auth
  );

  const getChats = async (userId: any) => {
    requestHandler(
      async () => await getUserChats(currentOrganization.id),
      null,
      (res) => {
        const { data } = res;
        const cht = data.filter((ch: ChatListItemInterface) => {
          if (ch.participants.find((p: any) => p._id === userId)) {
            return ch;
          }
        });
        dispatch(setCurrentChat(cht[0]) as any);
        dispatch(SetChats(data || []) as any);
      },
      (error: string) => {
        dispatch(showSnackbar({ severity: "error", message: error }) as any);
      }
    );
  };

  React.useEffect(() => {
    if (user) dispatch(FetchChats(currentOrganization.id) as any);
  }, [currentOrganization, user]);

  return (
    <Sider
      width="100%"
      style={{
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        height: "100%",
        // overflowY: "auto",
        borderTopLeftRadius: "6px",
        position: "relative",
        borderBottomLeftRadius: "6px",
        borderRadius: "6px",
        margin: "12px 0px",
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          margin: "4px 0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 12px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
          }}
        >
          <MessageCircleMore
            strokeWidth={1.25}
            style={{
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          />
          <Typography
            style={{
              margin: 0,
              fontSize: fontSizes.label,
              fontFamily: fontFamily,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Direct Message
          </Typography>
        </div>
      </div>
      <Divider
        style={{
          borderColor:
            themeType === "light" ? theme.light.border : theme.dark.border,
          margin: "12px 0px !important",
        }}
        className="custom-divider"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "12px",
        }}
      >
        <SearchUserInput
          onChange={async (newValue: any) => {
            if (!newValue?.value) return;
            await requestHandler(
              async () =>
                await createUserChat(currentOrganization.id, newValue.value),
              null,
              (res) => {
                const { data } = res;
                if (res.success) {
                  dispatch(setCurrentChat(data) as any);
                  const chatExists = chats.some(
                    (chat: ChatListItemInterface) => chat._id === data._id
                  );
                  if (!chatExists) {
                    dispatch(SetChats([data, ...chats]) as any);
                  }
                  navigate(
                    `client/${currentOrganization.id}/message/${data?._id}`
                  );
                  return;
                }
                getChats(newValue.value);
              },
              (error: string) => {
                dispatch(
                  showSnackbar({
                    severity: "error",
                    message: error,
                  }) as any
                );
              }
            );
          }}
          style={{ maxWidth: 210 }}
          background={
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground
          }
          border={`1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`}
          placeholder="Search"
        />
      </div>

      <div style={{ marginTop: "12px", height: "70%", overflow: "scroll" }}>
        {/* Added marginTop here */}
        <List
          dataSource={chats}
          renderItem={(chat: ChatListItemInterface) => (
            <List.Item
              style={{
                borderBottom: "none",
                padding: "0px",
              }}
            >
              <ChatElement {...chat} />
            </List.Item>
          )}
        />
      </div>
    </Sider>
  );
};

export default Chats;
