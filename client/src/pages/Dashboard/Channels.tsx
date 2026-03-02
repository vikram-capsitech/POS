import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import GroupElement from "../../Components/GroupElement";
import { FetchChats, updateGroupChatDetails } from "../../redux/slices/chat";
import { addParticipantToGroup, removeParticipantFromGroup } from "../../Api";
import { requestHandler } from "../../Utils";
import { SearchUserInput } from "../../Components/SearchAsync";
import {
  Layout,
  Button,
  Typography,
  Modal,
  List,
  Divider,
  Menu,
  Avatar,
  Input,
} from "antd";
import {
  ActiveIcon,
  DNDIcon,
  IdleIcon,
  OfflineIcon,
} from "../../Assets/CustomAntIcons";
import { CreateChannel } from "./AllChats";
import { toast } from "react-toastify";
import { useTheme } from "../../Contexts/ThemeContext";
import {
  Hash,
  Plus,
  Search,
  Send,
  UserRound,
  UserRoundMinus,
} from "lucide-react";
import { useSocket } from "../../Contexts/SocketContext";
import { dispatch } from "../../redux/store";

export const CHAT_ADDED = "chatAdded";

const { Sider } = Layout;

const Channels = ({ onClose }: any) => {
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { groups } = useSelector((state: any) => state?.chat);
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
   const { socket } = useSocket();
   const { user, currentOrganization } = useSelector(
       (state: any) => state?.auth
     );
  const [showModal, setShowModal] = useState<{
    type: "channel" | "add" | undefined;
    params: any;
    onClose?: (v?: any) => void;
  }>({
    type: undefined,
    params: {},
  });

  const handleOpenModal = () => {
    setShowModal({
      type: "channel",
      params: {},
      onClose: handleCloseModal,
    });
  };
  const handleCloseModal = () => {
    setShowModal({ type: undefined, params: {} });
    if (onClose) {
      onClose();
    }
  };

  const onChannelAdd = async () => {
  console.log("Chat added:");
  if(user) await dispatch(FetchChats(currentOrganization.id) as any)
};

  useEffect(() => {
      socket?.on(CHAT_ADDED, onChannelAdd);
      return () => {
        socket?.off(CHAT_ADDED, onChannelAdd);
      };
    }, [socket]);

  const filteredGroups = useMemo(() => {
    return groups.filter((group: any) =>
      group.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, groups]);

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
          borderTopLeftRadius: "6px",
          position: "relative",
          borderBottomLeftRadius: "6px",
          borderRadius: "6px",
          margin: "16px 0px",
          padding: "8px 12px",
        }}
      >
        <div
          style={{
            margin: "-3px 0px",
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
            <Hash
              stroke={
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight
              }
              strokeWidth={1.25}
            />
            <Typography
              style={{
                margin: 0,
                fontSize: fontSizes.label,
                fontWeight: "medium",
                fontFamily: fontFamily,
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Channels
            </Typography>
          </div>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Plus
              size={30}
              strokeWidth={1.25}
              stroke={
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight
              }
              onClick={handleOpenModal}
              style={{
                borderRadius: "8px",
                padding: "6px",
                cursor: "pointer",
                background:
                  themeType === "light" ? theme.light.hover : theme.dark.hover,
              }}
            />
            {showModal.type === "channel" && (
              <CreateChannel handleClose={handleCloseModal} visible={true} />
            )}
            <MoreOptions
              visible={showOptions}
              onClose={() => setShowOptions(false)}
            />
          </div>
        </div>
        <Divider
          style={{
            borderColor:
              themeType === "light" ? theme.light.border : theme.dark.border,
          }}
          className="custom-divider"
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            styles={{
              input: {
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              },
            }}
            style={{
              borderRadius: 10,
              height: 35,
              fontSize: 14,
              marginBottom: 10,
              border: `1px solid ${
                themeType === "light" ? theme.light.border : theme.dark.border
              }`,
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
            suffix={
              <Search
                strokeWidth={1}
                size={20}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textLight
                      : theme.dark.textLight,
                }}
              />
            }
          />
          <div
            style={{
              margin: "2px",
              width: "auto",
              height: "70%",
              overflow: "scroll",
            }}
          >
            <Sider
              width="100%"
              style={{
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
              }}
            >
              <List
                dataSource={filteredGroups}
                renderItem={(el: any) => (
                  <List.Item
                    style={{
                      padding: "0px",
                      border: "none",
                      background:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
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
            </Sider>
          </div>
        </div>
      </Sider>
    </>
  );
};

interface MoreOptionsProps {
  visible: boolean;
  onClose: () => void;
}

const MoreOptions: React.FC<MoreOptionsProps> = ({ visible, onClose }) => {
  const [showModal, setShowModal] = useState<{
    type: "channel" | "add" | undefined;
    params: any;
    onClose?: (v?: any) => void;
  }>({
    type: undefined,
    params: {},
  });

  const handleOpenModal = () => {
    setShowModal({
      type: "channel",
      params: {},
      onClose: handleCloseModal,
    });
  };

  const handleOpenAddModal = () => {
    setShowModal({
      type: "add",
      params: {},
      onClose: handleCloseModal,
    });
  };

  const handleCloseModal = () => {
    setShowModal({ type: undefined, params: {} });
    if (onClose) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <>
      <Menu
        style={{
          position: "absolute",
          top: "30px",
          left: "0",
          borderRadius: "10px",
          padding: "8px",
          boxShadow: "0px 2px 6px 0px #0F1F2F0F",
          backgroundColor: "white",
          zIndex: 1000,
          whiteSpace: "nowrap",
        }}
      >
        <Menu.Item key="1" onClick={handleOpenAddModal}>
          Invite People
        </Menu.Item>
        <Menu.Item key="2" onClick={handleOpenModal}>
          Create Channels
        </Menu.Item>
      </Menu>

      {showModal.type === "channel" && (
        <CreateChannel handleClose={handleCloseModal} visible={true} />
      )}
      {showModal.type === "add" && (
        <InvitePeopleModal handleClose={handleCloseModal} visible={true} />
      )}
    </>
  );
};

export const InvitePeopleModal = ({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: (val?: any) => void;
}) => {
  const [searchTerm] = React.useState("");
  const { theme, themeType } = useTheme();
  const dispatch = useDispatch();
  const { user, currentOrganization } = useSelector((state: any) => state.auth);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const { currentChat } = useSelector((state: any) => state.chat);
  const filteredParticipants = currentChat?.participants?.filter(
    (participant: any) =>
      participant?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddParticipants = async () => {
    try {
      console.log("Adding Participants...");
      if (!currentChat || !currentOrganization) {
        toast.error("Chat or Organization not found", {
          position: "top-right",
        });
        return;
      }
      const selectedParticipants = selectedMembers.map(
        (member: any) => member.value
      );

      if (selectedParticipants.length === 0) {
        toast.warning("No participants selected", { position: "top-right" });
        return;
      }

      const response = await addParticipantToGroup(
        currentOrganization.id,
        currentChat._id,
        selectedParticipants
      );
      dispatch(updateGroupChatDetails(response?.data.data) as any);
      if (response.data.success) {
        toast.success("Participants added successfully", {
          position: "top-right",
        });
        setTimeout(() => {
          handleClose();
        }, 500);
      } else {
        throw new Error(response.data.message || "Failed to add participants");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong", {
        position: "top-right",
      });
    }
  };

  return (
    <Modal
      maskClosable={false}
      closable={true}
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
      width="800px"
      // bodyStyle={{ height: "55px" }}
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
          Invite People
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
    >
      {/* Email Input */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            fontWeight: 500,
            fontSize: "14px",
            display: "block",
            marginBottom: "6px",
          }}
        >
          Email
        </label>
        <SearchUserInput
          isMulti
          placeholder="Enter email or username"
          onChange={(selectedOptions: any) =>
            setSelectedMembers(selectedOptions || [])
          }
          inputProps={{ id: "workspace-select" }}
          style={{
            fontSize: "14px",
            minWidth: "100px",
          }}
          components={{ DropdownIndicator: () => null }}
          border={"1px solid #D2D8DE"}
        />
      </div>

      {/* Selected Members */}
      {/* <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "12px",
        }}
      >
        {selectedMembers.map((member: any) => (
          <Tag
            key={member.id}
            style={{
              borderRadius: "6px",
              boxShadow: "0px 2px 6px 0px #00000014",
              border: "none",
              padding: "10px",
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            closable
          >
            <Avatar
              style={{ backgroundColor: "#87d068" }}
              size="small"
              src={member.pic}
            />
            {member.label}
          </Tag>
        ))}
      </div> */}

      {/* Participants List */}
      <div
        style={{
          border: "none",
          borderRadius: "12px",
          overflow: "hidden",
          maxHeight: "350px",
          overflowY: "auto",
          backgroundColor: "#002E6908",
          padding: "10px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 12px",
            fontWeight: 500,
            fontSize: "14px",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 500,
            }}
          >
            <Hash strokeWidth={1} size={18} stroke="#A3A3A3" />
            {currentChat?.isGroupChat ? currentChat?.name : ""}
          </div>
          <span
            style={{
              fontSize: "12px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Total Members: {filteredParticipants.length}
          </span>
        </div>

        <Divider style={{ margin: "0" }} />

        {/* Participants */}
        {filteredParticipants.map((participant: any, index: number) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: participant.isSelected
                ? "#F3F4F6"
                : "transparent",
              cursor: "pointer",
              transition: "background 0.2s ease",
              justifyContent: "space-between",
            }}
          >
            {/* Left Side: Avatar + Username */}
            <div
              className="participant-container"
              style={{ display: "flex", alignItems: "center", gap: "12px" }}
            >
              {/* Avatar + Status Icons */}
              <div
                className="avatar-container"
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Avatar
                  src={participant?.pic}
                  alt={participant?.userName}
                  icon={<UserRound strokeWidth={1} size={18} />}
                  size={35}
                />
                {/* Status Icons */}
                {participant.userStatus === "Online" && (
                  <ActiveIcon className="active-icon" />
                )}
                {participant.userStatus === "Idle" && (
                  <IdleIcon className="idle-icon" />
                )}
                {participant.userStatus === "Do Not Disturb" && (
                  <DNDIcon className="dnd-icon" />
                )}
                {participant.userStatus === "Offline" && (
                  <OfflineIcon className="offline-icon" />
                )}
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: "13px",
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                  }}
                >
                  {participant.userName}
                </div>
                <div
                  style={{
                    fontWeight: 400,
                    fontSize: "13px",
                    color: "#A3A3A3",
                  }}
                >
                  {participant.designation}
                </div>
              </div>
            </div>

            {/* Right Side: Admin Label or Remove Button */}
            {currentChat?.admin === participant._id ? (
              <span
                style={{
                  padding: "4px 10px",
                  border:
                    themeType === "light"
                      ? `1px solid ${theme.light.border}`
                      : `1px solid ${theme.dark.border}`,
                  background:
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground,
                  borderRadius: "6px",
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                  fontSize: "13px",
                  fontWeight: 400,
                }}
              >
                Admin
              </span>
            ) : currentChat?.admin === user._id &&
              participant._id !== user._id ? (
              <Button
                type="text"
                size="small"
                danger
                icon={<UserRoundMinus strokeWidth={1} size={18} />}
                onClick={() => {
                  requestHandler(
                    async () =>
                      await removeParticipantFromGroup(
                        currentOrganization.id,
                        currentChat._id,
                        participant._id
                      ),
                    null,
                    (res) => {
                      if (res.statusCode === 200) {
                        dispatch(updateGroupChatDetails(res?.data) as any);
                        toast.success("Participant removed successfully", {
                          position: "top-right",
                        });
                      }
                    },
                    () => {
                      toast.error("Failed to remove participant", {
                        position: "top-right",
                      });
                    }
                  );
                }}
              ></Button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Divider */}
      <Divider
        style={{
          border: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
          width: "100%",
          margin: "20px 0",
        }}
      />

      {/* Send Button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          icon={
            <Send
              strokeWidth={1}
              stroke={
                themeType === "light" ? theme.light.text : theme.dark.text
              }
            />
          }
          onClick={handleAddParticipants}
          style={{
            background:
              themeType === "light"
                ? theme.light.primaryBackground
                : theme.dark.primaryBackground,
            color: themeType === "light" ? theme.light.text : theme.dark.text,
            borderRadius: "6px",
            padding: "6px 16px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Send
        </Button>
      </div>
    </Modal>
  );
};

export default Channels;
