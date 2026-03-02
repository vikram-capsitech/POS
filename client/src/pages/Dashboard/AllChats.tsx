import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChatListItemInterface } from "../../Interfaces/chat";
import GroupElement from "../../Components/GroupElement";
import {
  createNewGroupChat,
  FetchChats,
  SetChats,
  setCurrentChat,
} from "../../redux/slices/chat";
import { createGroupChat, createUserChat, getUserChats } from "../../Api";
import { requestHandler } from "../../Utils";
import { showSnackbar } from "../../redux/slices/app";
import { SearchUserInput } from "../../Components/SearchAsync";
import {
  Layout,
  Button,
  Typography,
  Modal,
  List,
  Input,
  Avatar,
  Divider,
  Menu,
  Checkbox,
} from "antd";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AddMemberModal, ProfileMenuOrg } from "../Organization";
import { useNavigate } from "react-router-dom";
import ChatElement from "../../Components/ChatElement";
import { useTheme } from "../../Contexts/ThemeContext";
import { ChevronUp, UserRoundPlus, X } from "lucide-react";

const { Sider } = Layout;

const AllChats = () => {
  const dispatch = useDispatch();
  const { chats, groups } = useSelector((state: any) => state?.chat);
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { user, currentOrganization } = useSelector(
    (state: any) => state?.auth
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const [showModal] = useState<{
    type: "channel" | undefined;
    params: any;
    onClose?: (v?: any) => void;
  }>({
    type: undefined,
    params: {},
  });

  const getChats = async (userId: any) => {
    requestHandler(
      async () => await getUserChats(currentOrganization?.id),
      null,
      (res) => {
        const { data } = res || {};
        if (!Array.isArray(data)) {
          console.error("Error: data is not an array", data);
          return;
        }
        const cht = data.filter((ch: ChatListItemInterface) =>
          ch.participants?.some((p: any) => p._id === userId)
        );
        dispatch(setCurrentChat(cht[0] || null) as any);
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
    <>
      <Sider
        width="100%"
        style={{
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          height: "100%",
          borderRadius: "6px",
          marginTop: "4px",
          padding: "0px 12px",
          marginLeft: 0,
          marginRight: "0px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Workspace Selection */}
        <div
          style={{
            margin: "8px 0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              themeType === "light" ? theme.light.hover : theme.dark.hover,
            padding: "8px 10px",
            borderRadius: "8px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            <Avatar
              shape="square"
              src={currentOrganization.logo}
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                fontWeight: "bold",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {!currentOrganization.logo &&
                currentOrganization.name.charAt(0).toUpperCase()}
            </Avatar>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                fontFamily: fontFamily,
                fontSize: fontSizes.label,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              {currentOrganization.name}
            </Typography.Title>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            {isModalOpen && (
              <ChevronUp
                strokeWidth={1}
                size={20}
                stroke={
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight
                }
                style={{ transform: "rotate(180deg)" }}
              />
            )}
            {!isModalOpen && (
              <ChevronUp
                strokeWidth={1}
                size={20}
                stroke={
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight
                }
              />
            )}
          </div>
        </div>
        <div
          style={{
            margin: "4px 0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
              themeType === "light"
                ? theme.light.primaryLight
                : theme.dark.primaryLight,
            padding: "8px 12px",
            borderRadius: "8px",
            position: "relative",
            zIndex: 10,
            gap: "8px",
          }}
        >
          <UserRoundPlus
            size={28}
            stroke={
              themeType === "light"
                ? theme.light.primaryText
                : theme.dark.primaryText
            }
            style={{
              // background:
              //   themeType === "light"
              //     ? theme.light.primaryLight
              //     : theme.dark.primaryLight,
              borderRadius: "8px",
              padding: "6px",
              cursor: "pointer",
            }}
            onClick={() => setIsAddModalOpen(true)}
          />
          <span
            style={{
              color:
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: fontFamily,
              fontSize: fontSizes.body,
            }}
            onClick={() => setIsAddModalOpen(true)}
          >
            Invite People
          </span>

          <AddMemberModal
            open={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
          />
        </div>
        <Divider
          style={{
            borderColor:
              themeType === "light" ? theme.light.border : theme.dark.border,
          }}
          className="custom-divider"
        />

        {/* Search Input */}
        <SearchUserInput
          placeholder="Search"
          value={null}
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
          style={{ width: 210 }}
          background={
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground
          }
          border={`1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`}
        />

        {/* Menu Section */}
        <div style={{ height: "75%", overflow: "scroll", marginTop: 5 }}>
          <Sider
            width="100%"
            style={{
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              color: theme.light.text,
              maxHeight: "40vh",
            }}
          >
            <Menu
              mode="inline"
              style={{
                border: "none",
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
              }}
              className="custom-menu"
            >
              {/* Channels Section */}
              <Menu.SubMenu
                key="channels"
                title={
                  <Typography
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.body,
                    }}
                  >
                    Channel
                  </Typography>
                }
                style={{
                  background:
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground,
                  fontFamily: fontFamily,
                  fontSize: fontSizes.body,
                  fontWeight: 500,
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                <div
                  style={{
                    maxHeight: "40vh",
                    overflowY: "auto",
                  }}
                >
                  <Menu.ItemGroup
                    style={{
                      background:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
                      color: theme.light.textHilight,
                    }}
                  >
                    <List
                      dataSource={groups}
                      renderItem={(el: any) => (
                        <List.Item
                          style={{
                            padding: "2px",
                            border: "none",
                            background:
                              themeType === "light"
                                ? theme.light.secondaryBackground
                                : theme.dark.secondaryBackground,
                            color: theme.light.textHilight,
                          }}
                        >
                          <GroupElement
                            {...el}
                            style={{
                              background:
                                themeType === "light"
                                  ? theme.light.secondaryBackground
                                  : theme.dark.secondaryBackground,
                            }}
                          />
                        </List.Item>
                      )}
                    />
                  </Menu.ItemGroup>
                </div>
              </Menu.SubMenu>

              {/* Direct Messages Section */}
              <Menu.SubMenu
                key="directMessages"
                theme={themeType === "light" ? "light" : "dark"}
                title={
                  <Typography
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.body,
                    }}
                  >
                    Direct Message
                  </Typography>
                }
                style={{
                  background:
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground,
                  fontFamily: fontFamily,
                  fontSize: fontSizes.body,
                  fontWeight: 500,
                }}
              >
                <Menu.ItemGroup
                  className="custom-menu"
                  style={{
                    fontFamily: fontFamily,
                    fontSize: fontSizes.body,
                    background:
                      themeType === "light"
                        ? theme.light.secondaryBackground
                        : theme.dark.secondaryBackground,
                  }}
                >
                  <List
                    dataSource={chats}
                    renderItem={(chat: ChatListItemInterface) => (
                      <List.Item
                        style={{
                          borderBottom: "none",
                          padding: "0px",
                          fontFamily: fontFamily,
                          fontSize: fontSizes.body,
                          background:
                            themeType === "light"
                              ? theme.light.secondaryBackground
                              : theme.dark.secondaryBackground,
                        }}
                      >
                        <ChatElement {...chat} />
                      </List.Item>
                    )}
                  />
                </Menu.ItemGroup>
              </Menu.SubMenu>
            </Menu>
          </Sider>
        </div>

        {showModal.type === "channel" && (
          <CreateChannel
            handleClose={(val: any) => {
              if (showModal.onClose) showModal.onClose(val);
            }}
            visible={true}
          />
        )}

        {isModalOpen && (
          <div
            onPointerLeave={() => setIsModalOpen(!isModalOpen)}
            style={{
              position: "absolute",
              top: "70px",
              zIndex: 100,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          >
            <ProfileMenuOrg onClose={() => setIsModalOpen(false)} />
          </div>
        )}
      </Sider>
    </>
  );
};

export default AllChats;

export const CreateChannel = ({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: (val?: any) => void;
}) => {
  const [name, setName] = useState("");
  const { theme, themeType } = useTheme();
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isPrivateGroup, setIsPrivateGroup] = useState(false);
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const [selectAll, setSelectAll] = useState(false);

  interface GroupChatParams {
    name: string;
    participants: string[];
    isPrivateGroup?: boolean;
  }

  const handleCreateGroupChat = async () => {
    try {
      if (!name || selectedMembers.length < 3) {
        toast.warn("Please provide a group name and select at least 3 members");
        return;
      }

      const participants = selectedMembers.map((item: any) => item.value);
      const groupChatParams: GroupChatParams = {
        name,
        participants,
        isPrivateGroup,
      };

      await requestHandler(
        async () =>
          await createGroupChat(currentOrganization.id, groupChatParams),
        null,
        async (res) => {
          const { data } = res;
          if (res.success) {
            dispatch(createNewGroupChat(data) as any);
            dispatch(setCurrentChat(data) as any);
            await dispatch(FetchChats(currentOrganization.id) as any);
            toast.success("Group chat created successfully.", {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            handleClose();
          }
        },
        (error: any) => {
          toast.error(error || "Failed to create group chat.", {
            position: "top-right",
          });
        }
      );
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred.", {
        position: "top-right",
      });
    }
  };

  const handleManualDeselect = () => {
    if (selectAll) setSelectAll(false);
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
          }}
        >
          Create New Channel
        </div>
      }
      styles={{
        content: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
        },
        header: {
          background:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
          color:
            themeType === "light"
              ? theme.light.secondaryBackground
              : theme.dark.secondaryBackground,
        },
      }}
      closeIcon={
        <X
          strokeWidth={1}
          size={20}
          style={{
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        />
      }
      open={visible}
      onCancel={() => handleClose(undefined)}
      footer={null}
    >
      <div>
        <label
          style={{ fontWeight: "400", marginBottom: "8px", display: "block" }}
        >
          Channel Name
        </label>
        <Input
          placeholder="Enter channel name"
          className="custom-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          styles={{
            input: {
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            },
          }}
          style={{
            marginBottom: "16px",
            borderRadius: "6px",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        />
        <Checkbox
          checked={isPrivateGroup}
          onChange={(e) => setIsPrivateGroup(e.target.checked)}
          style={{
            marginBottom: "16px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            // flexDirection: "row-reverse",
            borderRadius: "10px",
          }}
        >
          Private Channel
        </Checkbox>
        <label
          style={{ fontWeight: "500", marginBottom: "8px", display: "block" }}
        >
          Add People
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label style={{ fontWeight: "400", marginBottom: "8px" }}>
            Email
          </label>
          <Checkbox
            checked={selectAll}
            onChange={(e) => {
              const checked = e.target.checked;
              setSelectAll(checked);
              if (!checked) {
                setSelectedMembers([]);
              }
            }}
            style={{
              marginBottom: "8px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Select All
          </Checkbox>
        </div>
        <div
          style={{
            display: selectAll ? "none" : "block",
            marginBottom: "16px",
          }}
        >
          <SearchUserInput
            isMulti
            placeholder="Enter email or username"
            onChange={(selectedOptions: any) =>
              setSelectedMembers(selectedOptions || [])
            }
            value={selectedMembers}
            selectAll={selectAll}
            onManualDeselect={handleManualDeselect}
            inputProps={{ id: "workspace-select" }}
            styles={{
              control: (baseStyles: any) => ({
                ...baseStyles,
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
              }),
            }}
            components={{ DropdownIndicator: () => null }}
            style={{
              marginBottom: "16px",
              fontSize: "14px",
              minWidth: "100px",
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
            }}
            border={"1px solid #D2D8DE"}
          />
        </div>
        {selectAll && (
          <div
            style={{ marginBottom: "16px", fontStyle: "italic", color: "#666" }}
          >
            All available users have been selected.
          </div>
        )}
        <label
          style={{
            fontWeight: "400",
            marginBottom: "8px",
            marginTop: "8px",
            display: "block",
          }}
        >
          Write Message
        </label>
        <Input.TextArea
          className="custom-input"
          autoSize={{ minRows: 3, maxRows: 5 }}
          placeholder="Enter message (optional)"
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
            marginBottom: "16px",
            borderRadius: "6px",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        />
        <Divider
          style={{
            border:
              themeType === "light" ? theme.light.border : theme.dark.border,
            width: "100%",
          }}
        />
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
        >
          <Button
            onClick={handleCreateGroupChat}
            style={{
              background:
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground,
              borderRadius: "6px",
              color: themeType === "light" ? theme.light.text : theme.dark.text,
            }}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
};
