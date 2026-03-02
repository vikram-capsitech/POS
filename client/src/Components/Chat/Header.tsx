import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Input,
  List,
  Avatar,
  Space,
  Divider,
  Tooltip,
  Select,
  Menu,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { requestHandler } from "../../Utils";
import {
  getAttachments,
  leaveGroup,
  removeParticipantFromGroup,
  updateGroupName,
} from "../../Api";
import {
  FetchChats,
  // highlightMessage,
  setCurrentChat,
  setPauseNotification,
  updateGroupChatDetails,
} from "../../redux/slices/chat";
import {
  ActiveIcon,
  DNDIcon,
  IdleIcon,
  OfflineIcon,
  PrivateChannelIcon,
} from "../../Assets/CustomAntIcons";
import { InvitePeopleModal } from "../../pages/Dashboard/Channels";
import { toast } from "react-toastify";
import {
  detectSocialPlatform,
  GetSocialMediaIcon,
} from "../../Utils/socialUtils";
import { SideBarType, ToggleSidebar } from "../../redux/slices/app";
import { dispatch } from "../../redux/store";
import { useTheme } from "../../Contexts/ThemeContext";
import Sider from "antd/es/layout/Sider";
import { SearchMessageModal } from "../SearchMessage";
import { AttachmentViewer } from "../../Utils/attachmentUtils";
import {
  BellOff,
  BellRing,
  Download,
  FileText,
  Hash,
  Pin,
  Search,
  UserRound,
  UserRoundMinus,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";

const ChatHeader = (onClose: any) => {
  const { Text } = Typography;
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { pauseNotification } = useSelector((state: any) => state.chat);
  const dispatch = useDispatch();
  const { currentChat } = useSelector((state: any) => state.chat);
  const { user } = useSelector((state: any) => state.auth);
  const { sideBar } = useSelector((state: any) => state.app);
  const [receiver, setReceiver] = React.useState<{
    id: any;
    name: string;
    email: string;
    pic: any;
    designation: string;
    about: string;
    phone: number;
    social: string;
  }>({
    id: "",
    email: "",
    name: "",
    pic: "",
    designation: "",
    about: "",
    phone: +91,
    social: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [fileResults, setFileResults] = useState<any[]>([]);
  const filteredParticipants = currentChat?.participants?.filter(
    (participant: any) =>
      participant?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const memberCount = filteredParticipants?.length;
  const [showModal, setShowModal] = useState<{
    type: "channel" | "add" | undefined;
    params: any;
    onClose?: (v?: any) => void;
  }>({
    type: undefined,
    params: {},
  });

  const handleOpenProfile = (val: boolean) => {
    dispatch(ToggleSidebar(SideBarType.PROFILE, val) as any);
  };

  const handleOpenPin = (val: boolean) => {
    dispatch(ToggleSidebar(SideBarType.PIN, val) as any);
  };
  const handleOpenDetail = (val: boolean) => {
    dispatch(ToggleSidebar(SideBarType.GROUP, val) as any);
  };

  const otherParticipant = currentChat?.participants?.find(
    (participant: any) =>
      participant._id !== currentChat.admin && participant._id !== user?._id
  );
  const chatStatus = otherParticipant?.userStatus;
  const handleToggleNotification = () => {
    dispatch(setPauseNotification(!pauseNotification) as any);
  };
  const userStatuses = filteredParticipants?.map(
    (participant: any) => participant.userStatus
  );
  const onlineCount = userStatuses?.filter(
    (status: any) => status === "Online"
  ).length;
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSearchResults([]);
    setFileResults([]);
    setSearchTerm("");
  };
  const handleOpenAddModal = () => {
    setShowModal({
      type: "add",
      params: {},
      onClose: handleCloseModal,
    });
  };
  const handleCloseAddModal = () => {
    setShowModal({ type: undefined, params: {} });
    if (onClose) {
      onClose();
    }
  };

  React.useEffect(() => {
    const getUserDetail = () => {
      if (currentChat) {
        const rece = currentChat?.participants?.filter((u: any) => {
          if (u._id !== user?._id) return u;
        });
        if (rece?.length > 0) {
          setReceiver(() => ({
            email: rece[0].email,
            id: rece[0]._id,
            name: rece[0].userName,
            pic: rece[0].pic,
            designation: rece[0].designation,
            about: rece[0].about,
            phone: rece[0].phone,
            social: rece[0].social,
          }));
        }
      }
    };
    getUserDetail();
  }, [currentChat, user?._id]);

  return (
    <div
      style={{
        width: "100%",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        padding: currentChat?.isGroupChat ? "8px 17px" : "8px 17px",
        borderBottom: `1px solid ${
          themeType === "light" ? theme.light.border : theme.dark.border
        }`,
      }}
    >
      <Row justify="space-between" align="middle">
        {/* Left Section - User Info Button */}
        {!currentChat?.isGroupChat ? (
          <div
            onClick={() => {
              if (sideBar.open && sideBar.type === SideBarType.PROFILE)
                handleOpenProfile(false);
              else {
                handleOpenProfile(true);
              }
            }}
            style={{
              padding: 0,
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <Space size={10} align="center">
              <Col>
                <div className="avatar-container">
                  <Avatar
                    src={currentChat?.isSelfChat ? user?.pic : receiver?.pic}
                    alt={
                      currentChat?.isSelfChat ? user?.userName : receiver?.name
                    }
                    icon={<UserRound />}
                    size={35}
                  />
                  {chatStatus === "Online" && (
                    <ActiveIcon className="active-icon" />
                  )}
                  {chatStatus === "Idle" && <IdleIcon className="idle-icon" />}
                  {chatStatus === "Do Not Disturb" && (
                    <DNDIcon className="dnd-icon" />
                  )}
                  {chatStatus === "Offline" && (
                    <OfflineIcon className="offline-icon" />
                  )}
                </div>
              </Col>
              <Space direction="vertical" size={0}>
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
                    fontFamily: fontFamily,
                  }}
                >
                  {currentChat?.isSelfChat ? user?.userName : receiver?.name}
                </Text>
                <Text
                  type="secondary"
                  style={{
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    fontSize: fontSizes.subheading,
                    fontFamily: fontFamily,
                  }}
                >
                  {currentChat?.isSelfChat
                    ? user?.designation
                    : receiver?.designation}
                </Text>
              </Space>
            </Space>
          </div>
        ) : (
          <>
            <Space
              size={0}
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
              onClick={() => {
                if (sideBar.open && sideBar.type === SideBarType.GROUP)
                  handleOpenDetail(false);
                else {
                  handleOpenDetail(true);
                }
              }}
            >
              {currentChat?.isGroupChat &&
                (currentChat.isPrivateGroup ? (
                  <PrivateChannelIcon
                    style={{ fontSize: fontSizes.label, marginRight: 5 }}
                  />
                ) : (
                  <Hash
                    strokeWidth={1}
                    stroke={
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    }
                    style={{ fontSize: fontSizes.label, marginRight: 5 }}
                  />
                ))}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Text
                  strong
                  style={{
                    fontWeight: 500,
                    fontFamily: fontFamily,
                    fontSize: fontSizes.header,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                  }}
                >
                  {currentChat?.name}
                </Text>
                <Text
                  style={{
                    fontSize: fontSizes.subheading,
                    fontFamily: fontFamily,
                    color: "#A3A3A3",
                  }}
                >
                  {`Total Members ${memberCount}, `}
                  <span
                    style={{ color: "#00BC6B" }}
                  >{`Online ${onlineCount}`}</span>
                </Text>
              </div>
            </Space>
          </>
        )}
        {/* Right Section - Icons */}
        <Space size={26}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              type="text"
              onClick={() => setIsModalOpen(true)}
              icon={
                <Search
                  size={20}
                  strokeWidth={1}
                  stroke={
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  }
                />
              }
            />
          </div>

          {/* Search Results Modal */}
          <SearchMessageModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            searchResults={searchResults}
            fileResults={fileResults}
            initialSearchTerm={searchTerm}
          />
          {currentChat?.isGroupChat &&
            (currentChat.admin === user?._id ||
              currentChat.isPrivateGroup === false) && (
              <>
                <UserRoundPlus
                  size={20}
                  strokeWidth={1}
                  stroke={
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight
                  }
                  style={{ cursor: "pointer" }}
                  onClick={handleOpenAddModal}
                />
                {showModal?.type === "add" && (
                  <InvitePeopleModal
                    handleClose={handleCloseAddModal}
                    visible={true}
                  />
                )}
              </>
            )}
          {currentChat?.isGroupChat && (
            <UsersRound
              size={20}
              strokeWidth={1}
              stroke={
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight
              }
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (sideBar.open && sideBar.type === SideBarType.GROUP)
                  handleOpenDetail(false);
                else {
                  handleOpenDetail(true);
                }
              }}
            />
          )}
          {!currentChat?.isSelfChat && (
            <Tooltip
              placement="leftTop"
              title={pauseNotification ? "Unmute" : "Mute"}
            >
              <span
                onClick={handleToggleNotification}
                style={{ cursor: "pointer" }}
              >
                {pauseNotification ? (
                  <BellOff
                    size={18}
                    strokeWidth={1}
                    stroke={
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    }
                  />
                ) : currentChat?.isSelfChat ? null : (
                  <BellRing
                    size={18}
                    strokeWidth={1}
                    stroke={
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    }
                  />
                )}
              </span>
            </Tooltip>
          )}
          <Tooltip placement="leftTop" title="Pin">
            <Pin
              size={18}
              strokeWidth={1}
              stroke={
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight
              }
              style={{ cursor: "pointer" }}
              onClick={() => {
                if (sideBar.open && sideBar.type === SideBarType.PIN)
                  handleOpenPin(false);
                else {
                  handleOpenPin(true);
                }
              }}
            />
          </Tooltip>
        </Space>
      </Row>
    </div>
  );
};

export const GroupDetailModel = ({ onClose }: any) => {
  const [searchTerm] = React.useState("");
  const { currentChat, messages } = useSelector((state: any) => state.chat);
  const filteredParticipants = currentChat?.participants?.filter(
    (participant: any) =>
      participant?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Messages", messages);
  const { currentOrganization, user } = useSelector((state: any) => state.auth);
  const memberCount = filteredParticipants?.length;
  const [activeTab, setActiveTab] = React.useState("Members");
  const [editableName, setEditableName] = React.useState(
    currentChat?.name || ""
  );
  const [editableStatus, setEditableStatus] = React.useState(
    currentChat?.isPrivateGroup ? "Private" : "Public"
  );
  // const userStatuses = filteredParticipants?.map(
  //   (participant: any) => participant.userStatus
  // );
  const adminUser = currentChat?.participants?.find(
    (participant: any) => participant._id === currentChat?.admin
  );
  const adminName = adminUser?.userName;
  const adminPic = adminUser?.pic;
  const { theme, themeType } = useTheme();
  const { Option } = Select;
  const { Title } = Typography;
  const [showCategorized, setShowCategorized] = useState(false);
  const [attachments, setAttachments] = React.useState<any[]>([]);

  React.useEffect(() => {
    //let interval: NodeJS.Timeout;
    const fetchAttachments = async () => {
      try {
        await requestHandler(
          async () => await getAttachments(currentChat._id),
          null,
          (res: any) => {
            setAttachments(res.data);
          },
          () => {
            toast.error("Error fetching attachments");
          }
        );
      } catch (error) {
        console.error("Error in fetching attachments", error);
      }
    };
    fetchAttachments();
  }, [currentChat?._id, messages]);

  const handleRenameClick = async () => {
    try {
      const isPrivateGroup = editableStatus === "Private";
      await requestHandler(
        async () =>
          await updateGroupName(
            currentOrganization?.id,
            currentChat?._id,
            editableName,
            isPrivateGroup
          ),
        null,
        (res: any) => {
          dispatch(updateGroupChatDetails(res?.data) as any);
          dispatch(ToggleSidebar(SideBarType.PROFILE, false));
          toast.success("Channel updated successfully!");
        },
        () => {
          toast.error("Error updating channel");
        }
      );
    } catch (error) {
      toast.error("Something went wrong, please try again.");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        borderRadius: 8,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
          padding: "21px",
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 500 }}>Channel Info</div>
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
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 20px",
          minHeight: 0,
        }}
      >
        {/* Channel Details */}
        {!showCategorized && (
          <div>
            {/* Editable Name Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                  fontSize: 14,
                  width: 120,
                }}
              >
                Name
              </div>
              {currentChat?.admin === user._id ? (
                <Input
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  placeholder="Enter chat name"
                  styles={{
                    input: {
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    },
                  }}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    width: 200,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    background:
                      themeType === "light"
                        ? theme.light.secondaryBackground
                        : theme.dark.secondaryBackground,
                  }}
                />
              ) : (
                <Typography
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                  }}
                >
                  {editableName}
                </Typography>
              )}
            </div>

            {/* Editable Status Field */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                  fontSize: 14,
                  width: 120,
                }}
              >
                Channel Status
              </div>
              {currentChat?.admin === user._id ? (
                <Select
                  value={editableStatus}
                  onChange={(value) => setEditableStatus(value)}
                  className={
                    themeType === "light" ? "select-light" : "select-dark"
                  }
                  dropdownStyle={{
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                    backgroundColor:
                      themeType === "light"
                        ? theme.light.secondaryBackground
                        : theme.dark.secondaryBackground,
                  }}
                  style={{
                    width: 200,
                    border: "none",
                  }}
                >
                  <Option
                    style={{
                      background:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                    value="Public"
                  >
                    Public
                  </Option>
                  <Option
                    style={{
                      background:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                    value="Private"
                  >
                    Private
                  </Option>
                </Select>
              ) : (
                <Typography
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
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
                  {editableStatus}
                </Typography>
              )}
            </div>

            {/* Created By Section */}
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                  fontSize: 14,
                  width: 120,
                }}
              >
                Created By
              </div>
              <div
                style={{ display: "flex", alignItems: "center", width: 120 }}
              >
                <Avatar size={24} src={adminPic} />
                <Typography
                  style={{
                    fontWeight: 500,
                    fontSize: 14,
                    marginLeft: 8,
                    color:
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                  }}
                >
                  {adminName}
                </Typography>
              </div>
            </div>
          </div>
        )}
        {!showCategorized && <Divider className="custom-divider" />}
        {/* Tabs */}
        <div style={{ display: "flex" }}>
          {["Members", "Files"].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "12px 0",
                fontWeight: activeTab === tab ? 600 : 400,
                color:
                  activeTab === tab
                    ? themeType === "light"
                      ? theme.light.primaryText
                      : theme.dark.primaryText
                    : themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
                borderBottom:
                  activeTab === tab
                    ? `1px solid ${
                        themeType === "light"
                          ? theme.light.primaryText
                          : theme.dark.primaryText
                      }`
                    : `1px solid ${
                        themeType === "light"
                          ? theme.light.border
                          : theme.dark.border
                      }`,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Members Section */}
        {activeTab === "Members" && (
          <div style={{ flex: 1 }}>
            {/* Search */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 0",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 0,
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                Members
              </Title>
              <span
                style={{
                  fontWeight: 400,
                  fontSize: "13px",
                  color:
                    themeType === "light"
                      ? theme.light.primaryText
                      : theme.dark.primaryText,
                }}
              >
                Total Members: {memberCount}
              </span>
            </div>
            <StatusMenu currentChat={currentChat} />
          </div>
        )}

        {activeTab === "Files" && (
          <div>
            <div style={{}}>
              <AttachmentViewer
                attachments={attachments}
                showCategorized={showCategorized}
                setShowCategorized={setShowCategorized}
              />
            </div>
          </div>
        )}
      </div>
      {currentChat?.admin === user._id && (
        <div
          style={{
            borderTop: "1px solid #F0F0F0",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          <Button
            style={{
              flex: 1,
              backgroundColor: "transparent",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              border: `1px solid ${
                themeType === "light" ? theme.light.border : theme.dark.border
              }`,
            }}
            onClick={() => dispatch(ToggleSidebar(SideBarType.PROFILE, false))}
          >
            Cancel
          </Button>
          <Button
            style={{
              flex: 1,
              border: "none",
              backgroundColor:
                themeType === "light"
                  ? theme.dark.primaryBackground
                  : theme.light.primaryBackground,
              color: themeType === "light" ? theme.light.text : theme.dark.text,
            }}
            onClick={handleRenameClick}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export const ProfileDetails = () => {
  const { Text, Title } = Typography;
  const dispatch = useDispatch();
  const { theme, themeType } = useTheme();
  const { user } = useSelector((state: any) => state.auth);
  const { currentChat, messages } = useSelector((state: any) => state.chat);
  const receiver = currentChat?.participants?.find(
    (participant: any) => participant._id !== user?._id
  );
  const [attachments, setAttachments] = React.useState<any[]>([]);
  const [showCategorized, setShowCategorized] = useState(false);

  const isSelfChat = currentChat?.isSelfChat;

  const getUserStatusProps = (status: string) => {
    switch (status) {
      case "Online":
        return {
          label: "Online",
          dotColor: "#00FF80",
          bgColor: "rgba(12, 151, 118, 0.2)",
          textColor: "#0c9776",
        };
      case "Idle":
        return {
          label: "Idle",
          dotColor: "#FFC107",
          bgColor: "rgba(255, 193, 7, 0.2)",
          textColor: "#b48800",
        };
      case "Do Not Disturb":
        return {
          label: "Do Not Disturb",
          dotColor: "#F44336",
          bgColor: "rgba(244, 67, 54, 0.2)",
          textColor: "#b12318",
        };
      case "Offline":
      default:
        return {
          label: "Offline",
          dotColor: "#9E9E9E",
          bgColor: "rgba(158, 158, 158, 0.2)",
          textColor: "#555",
        };
    }
  };

  const status = isSelfChat ? user?.userStatus : receiver?.userStatus;
  const { label, dotColor, bgColor, textColor } = getUserStatusProps(status);

  React.useEffect(() => {
    //let interval: NodeJS.Timeout;
    const fetchAttachments = async () => {
      try {
        await requestHandler(
          async () => await getAttachments(currentChat._id),
          null,
          (res: any) => {
            setAttachments(res.data);
          },
          () => {
            toast.error("Error fetching attachments");
          }
        );
      } catch (error) {
        console.error("Error in fetching attachments", error);
      }
    };
    fetchAttachments();
  }, [currentChat?._id, messages]);

  if (!currentChat?.isGroupChat || isSelfChat) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Profile Top Bar */}
        <Row
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "19px",
            borderBottom: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
          }}
        >
          <Text
            strong
            style={{
              fontWeight: 500,
              fontSize: "18px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              margin: 0,
            }}
          >
            Profile
          </Text>
          <X
            strokeWidth={1}
            size={20}
            style={{
              cursor: "pointer",
              borderRadius: "6px",
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
            onClick={() =>
              dispatch(ToggleSidebar(SideBarType.PROFILE, false) as any)
            }
          />
        </Row>

        {!showCategorized ? (
          <Card
            style={{
              margin: "5px",
              textAlign: "center",
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              borderRadius: 10,
              border: `1px solid ${
                themeType === "light" ? theme.light.border : theme.dark.border
              }`,
            }}
          >
            {/* Profile Card */}
            <div
              style={{
                margin: 5,
                position: "absolute",
                top: 0,
                left: 0,
                width: "97%",
                height: "20%",
                background:
                  themeType === "light"
                    ? theme.light.primaryLight
                    : theme.dark.primaryLight,
                borderRadius: 12,
              }}
            />
            {/* <div style={{ position: "relative", zIndex: 1 }}> */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Avatar
                size={115}
                src={isSelfChat ? user?.pic : receiver?.pic}
                style={{
                  border:
                    themeType === "light"
                      ? `4px solid ${theme.light.border}`
                      : `4px solid ${theme.dark.border}`,
                }}
              />

              {/* Status Badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: bgColor,
                  borderRadius: 20,
                  padding: "2px 12px",
                  color: textColor,
                  fontSize: 14,
                  fontWeight: 500,
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: dotColor,
                    border: "1px solid white",
                  }}
                />
                {label}
              </div>
              <Title
                level={4}
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                {isSelfChat ? user?.userName : receiver?.userName}
              </Title>
              <Text
                type="secondary"
                style={{
                  color:
                    themeType === "light"
                      ? theme.light.textHilight
                      : theme.dark.textHilight,
                }}
              >
                {isSelfChat ? user?.about : receiver?.about}
              </Text>
            </div>

            <Divider className="custom-divider" />

            {/* Info Section */}
            <Title
              level={5}
              style={{
                textAlign: "start",
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
            >
              Info
            </Title>
            <List
              style={{
                color:
                  themeType === "light"
                    ? theme.light.textHilight
                    : theme.dark.textHilight,
              }}
              itemLayout="horizontal"
              dataSource={[
                {
                  label: "Phone",
                  value: isSelfChat ? user?.phone : receiver?.phone || "N/A",
                },
                {
                  label: "Mail",
                  value: isSelfChat ? user?.email : receiver?.email,
                },
                {
                  label: "Designation",
                  value: isSelfChat
                    ? user?.designation
                    : receiver?.designation || "Marketing",
                },
                {
                  label: "Social Media",
                  value: (
                    <>
                      {(() => {
                        const socialLinks = isSelfChat
                          ? user?.social
                          : receiver?.social;
                        if (!socialLinks?.length) {
                          return <span>N/A</span>;
                        }
                        return socialLinks.map(
                          (link: string, index: number) => {
                            const platform = detectSocialPlatform(link);
                            return platform ? (
                              <Button
                                key={index}
                                type="link"
                                icon={GetSocialMediaIcon(platform)}
                                href={link}
                                target="_blank"
                                style={{ marginRight: 8 }}
                              />
                            ) : null;
                          }
                        );
                      })()}
                    </>
                  ),
                },
              ]}
              renderItem={(item) => (
                <List.Item style={{ borderBottom: "none", padding: "4px" }}>
                  <Text
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                  >
                    {item.value}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        ) : null}

        {/* Attachments Section */}
        <AttachmentViewer
          attachments={attachments}
          showCategorized={showCategorized}
          setShowCategorized={setShowCategorized}
        />
      </div>
    );
  }
};

export const StatusMenu = ({ currentChat }: any) => {
  const { theme, themeType } = useTheme();
  const statusOrder = ["Online", "Idle", "Do Not Disturb", "Offline"];
  const { sideBar } = useSelector((state: any) => state.app);
  const { currentOrganization, user } = useSelector((state: any) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredParticipants =
    currentChat?.participants?.filter((participant: any) =>
      participant?.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <>
      <Input
        placeholder="Search"
        styles={{
          input: {
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
          color:
            themeType === "light"
              ? theme.light.textHilight
              : theme.dark.textHilight,
          borderRadius: 6,
          height: 36,
          fontSize: 14,
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
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div style={{ height: "70%" }}>
        <Sider
          width="100%"
          style={{
            maxHeight: "48vh",
            overflowY: "auto",
            background:
              themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
          }}
        >
          <Menu
            mode="inline"
            defaultOpenKeys={statusOrder}
            style={{
              border: "none",
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
            }}
            className="custom-menu"
          >
            {statusOrder.map((status: string) => {
              const usersByStatus = filteredParticipants.filter(
                (participant: any) =>
                  (participant?.userStatus || "Offline") === status
              );
              if (!usersByStatus.length) return null;
              return (
                <Menu.SubMenu
                  key={status}
                  title={
                    <span
                      style={{
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
                      {status} - {""}
                      {usersByStatus.length.toString().padStart(2, "0")}
                    </span>
                  }
                  style={{
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  <Menu.ItemGroup
                    style={{
                      backgroundColor:
                        themeType === "light"
                          ? theme.light.secondaryBackground
                          : theme.dark.secondaryBackground,
                    }}
                  >
                    <List
                      dataSource={usersByStatus}
                      renderItem={(v: any) => (
                        <List.Item
                          key={v.userName}
                          onMouseEnter={() => setHoveredUserId(v._id)}
                          onMouseLeave={() => setHoveredUserId(null)}
                          style={{
                            padding: "6px 10px",
                            borderBottom: "none",
                            background:
                              themeType === "light"
                                ? theme.light.secondaryBackground
                                : theme.dark.secondaryBackground,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <div
                                className="avatar-container"
                                style={{ position: "relative" }}
                              >
                                <Avatar
                                  src={v.pic}
                                  size={35}
                                  icon={
                                    <UserRound strokeWidth={1.25} size={25} />
                                  }
                                />
                                <span>
                                  {status === "Online" && (
                                    <ActiveIcon className="active-icon" />
                                  )}
                                  {status === "Idle" && (
                                    <IdleIcon className="idle-icon" />
                                  )}
                                  {status === "Do Not Disturb" && (
                                    <DNDIcon className="dnd-icon" />
                                  )}
                                  {status === "Offline" && (
                                    <OfflineIcon className="offline-icon" />
                                  )}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <span
                                  style={{
                                    fontWeight: 500,
                                    color:
                                      themeType === "light"
                                        ? theme.light.textHilight
                                        : theme.dark.textHilight,
                                  }}
                                >
                                  {v.userName}
                                </span>
                                <span
                                  style={{
                                    fontSize: 12,
                                    color:
                                      themeType === "light"
                                        ? theme.light.textLight
                                        : theme.dark.textLight,
                                  }}
                                >
                                  {v.designation}
                                </span>
                              </div>
                            </div>
                            {hoveredUserId === v._id &&
                              (currentChat?.admin === user._id
                                ? v._id !== user._id && (
                                    <Tooltip title="Remove">
                                      <UserRoundMinus
                                        strokeWidth={1}
                                        size={25}
                                        stroke={
                                          themeType === "light"
                                            ? theme.light.textHilight
                                            : theme.dark.textHilight
                                        }
                                        style={{
                                          padding: "5px",
                                          background:
                                            themeType === "light"
                                              ? theme.light.neutralbackground
                                              : theme.dark.neutralbackground,
                                          borderRadius: "6px",
                                          cursor: "pointer",
                                        }}
                                        onClick={() => {
                                          requestHandler(
                                            async () =>
                                              await removeParticipantFromGroup(
                                                currentOrganization.id,
                                                currentChat._id,
                                                v._id
                                              ),
                                            null,
                                            (res) => {
                                              if (res.statusCode === 200) {
                                                toast.success(
                                                  "Participant removed successfully",
                                                  {
                                                    position: "top-right",
                                                  }
                                                );
                                                dispatch(
                                                  ToggleSidebar(
                                                    sideBar.type,
                                                    false
                                                  ) as any
                                                );

                                                dispatch(
                                                  updateGroupChatDetails(
                                                    res?.data
                                                  ) as any
                                                );
                                              }
                                            },
                                            () =>
                                              toast.error(
                                                "Failed to remove participant",
                                                {
                                                  position: "top-right",
                                                }
                                              )
                                          );
                                        }}
                                      />
                                    </Tooltip>
                                  )
                                : v._id === user._id && (
                                    <UserRoundMinus
                                      strokeWidth={1}
                                      size={18}
                                      style={{
                                        color: "#ED2B2B",
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        requestHandler(
                                          async () =>
                                            await leaveGroup(
                                              currentOrganization.id,
                                              currentChat._id,
                                              v._id
                                            ),
                                          null,
                                          (res) => {
                                            if (res.statusCode === 200) {
                                              toast.success(
                                                "Left group successfully",
                                                {
                                                  position: "top-right",
                                                }
                                              );
                                              dispatch(
                                                ToggleSidebar(
                                                  sideBar.type,
                                                  false
                                                ) as any
                                              );
                                              dispatch(
                                                updateGroupChatDetails(
                                                  res?.data
                                                ) as any
                                              );
                                              dispatch(
                                                FetchChats(
                                                  currentOrganization.id
                                                ) as any
                                              );
                                              dispatch(
                                                setCurrentChat(null) as any
                                              );
                                              navigate("/chats");
                                            }
                                          },
                                          () =>
                                            toast.error(
                                              "Failed to leave group",
                                              {
                                                position: "top-right",
                                              }
                                            )
                                        );
                                      }}
                                    />
                                  ))}
                          </div>
                        </List.Item>
                      )}
                    />
                  </Menu.ItemGroup>
                </Menu.SubMenu>
              );
            })}
          </Menu>
        </Sider>
      </div>
    </>
  );
};

export const PinDetails = () => {
  const dispatch = useDispatch();
  const { theme, themeType } = useTheme();
  const { messages } = useSelector((state: any) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const { Text } = Typography;

  // const handlePinMessage = async (messageId: string, chatId: string) => {
  //   debugger;
  //   await requestHandler(
  //     async () => await pinMessage(currentOrganization.id, chatId, messageId),
  //     null,
  //     (res) => {
  //       if (res?.success && res?.data) {
  //         const updatedMessages = messages.map((msg: any) =>
  //           msg._id === messageId
  //             ? {
  //                 ...msg,
  //                 isPinned: res.data.isPinned,
  //                 pinnedAt: res.data.pinnedAt,
  //                 pinnedBy: res.data.pinnedBy,
  //               }
  //             : msg
  //         );
  //         dispatch(updateMessages(updatedMessages) as any);
  //       }
  //     },
  //     (err) => {
  //       console.error("Pin message error:", err);
  //     }
  //   );
  // };

  const groupMessagesByPinnedDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};

    messages.forEach((msg) => {
      if (!msg.isPinned) return;

      const pinnedDate = moment(msg.pinnedAt);
      const now = moment();

      let label = "";

      if (pinnedDate.isSame(now, "day")) {
        label = "Today";
      } else if (pinnedDate.isSame(now.clone().subtract(1, "days"), "day")) {
        label = "Yesterday";
      } else if (pinnedDate.isSame(now.clone().subtract(2, "days"), "day")) {
        label = "2 days ago";
      } else {
        label = pinnedDate.format("MMMM D, YYYY");
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });

    return groups;
  };
  const pinnedGroups = groupMessagesByPinnedDate(
    messages.filter((msg: any) =>
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatSizeToMB = (bytes: any) => {
    if (!bytes || isNaN(bytes)) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  // const handleScrollToMessage = (id: string) => {
  //   dispatch(highlightMessage(id));
  // };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Row
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "19px",
          borderBottom: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
        }}
      >
        <Text
          strong
          style={{
            fontWeight: 500,
            fontSize: "18px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
            margin: 0,
          }}
        >
          Pins
        </Text>
        <X
          strokeWidth={1}
          size={20}
          style={{
            cursor: "pointer",
            borderRadius: "6px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
          onClick={() =>
            dispatch(ToggleSidebar(SideBarType.PROFILE, false) as any)
          }
        />
      </Row>

      {/* Content */}
      <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
        <Input
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          styles={{
            input: {
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
            color:
              themeType === "light"
                ? theme.light.textLight
                : theme.dark.textLight,
            borderRadius: 6,
            height: 36,
            fontSize: 14,
            marginBottom: 5,
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

        {/* Pinned Groups */}
        {Object.entries(pinnedGroups).map(([dateLabel, group]) => (
          <div key={dateLabel} style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 12,
                color: "#888",
                marginBottom: 8,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {dateLabel}
            </Text>

            {group.map((msg: any) => (
              <div
                key={msg._id}
                style={{
                  backgroundColor:
                    themeType === "light"
                      ? theme.light.primaryLight
                      : theme.dark.primaryLight,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 12,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                // onClick={() => handleScrollToMessage(msg._id)}
              >
                <Row align="middle" justify="space-between">
                  <Row align="middle" gutter={8}>
                    <Avatar
                      size={32}
                      style={{ marginRight: 8 }}
                      src={msg.sender?.pic}
                      icon={<UserRound />}
                    />
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: 14,
                          color:
                            themeType === "light"
                              ? theme.light.textHilight
                              : theme.dark.textHilight,
                        }}
                      >
                        {msg.sender?.userName}
                      </Text>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {moment(msg.pinnedAt).format("hh:mm A")}
                      </div>
                    </div>
                  </Row>

                  <Row align="middle" gutter={10}>
                    <Tooltip
                      title={`Pinned by ${msg.pinnedBy?.userName}`}
                      showArrow={false}
                      placement="left"
                    >
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
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   handlePinMessage(msg._id, msg.chatId);
                        // }}
                      />
                    </Tooltip>
                  </Row>
                </Row>

                {/* Forwarded Message */}
                {msg?.forwardTo && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      borderLeft: "4px solid rgba(255,255,255,0.4)",
                      padding: "10px 12px",
                      borderRadius: 12,
                      marginTop: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Row align="middle" justify="space-between">
                      <Row align="middle" gutter={12}>
                        <Avatar
                          size={28}
                          src={msg?.forwardToMeta?.pic}
                          icon={<UserRound />}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: 13,
                            marginLeft: 8,
                            color:
                              themeType === "light"
                                ? theme.light.textHilight
                                : theme.dark.textHilight,
                          }}
                        >
                          {msg?.forwardToMeta?.userName}
                        </Text>
                      </Row>

                      <Text
                        style={{
                          fontSize: 12,
                          color: "#888",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {moment(msg?.forwardToMeta?.timestamp).format(
                          "hh:mm A"
                        )}
                      </Text>
                    </Row>

                    <Typography.Text
                      style={{
                        fontStyle: "italic",
                        fontSize: 13,
                        marginTop: 4,
                        color:
                          themeType === "light"
                            ? theme.light.textHilight
                            : theme.dark.textHilight,
                      }}
                    >
                      {msg?.forwardToMeta?.content}
                    </Typography.Text>
                  </div>
                )}

                {/* Main Message Content */}
                {msg.content && (
                  <Text
                    style={{
                      marginTop: 12,
                      display: "block",
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                  >
                    {msg.content}
                  </Text>
                )}

                {/* Attachments */}
                {msg.attachments?.length > 0 && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {msg.attachments.map((att: any, idx: number) => {
                      const isImage = att.fileType?.startsWith("image/");
                      return (
                        <div key={idx}>
                          {isImage ? (
                            <img
                              src={att.url}
                              alt={att.fileName}
                              style={{
                                width: 120,
                                height: 100,
                                objectFit: "cover",
                                borderRadius: 6,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundColor:
                                  themeType === "light"
                                    ? theme.light.secondaryBackground
                                    : theme.dark.secondaryBackground,
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                                fontSize: "14px",
                                borderRadius: "10px",
                                padding: "10px 16px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                }}
                              >
                                <FileText
                                  strokeWidth={1.5}
                                  size={28}
                                  style={{
                                    padding: "6px",
                                    borderRadius: "8px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                  }}
                                />
                                <div>
                                  <div style={{ fontWeight: 400 }}>
                                    {att.fileName}
                                  </div>
                                  <div style={{ fontSize: "12px" }}>
                                    {formatSizeToMB(att.size)}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download
                                  strokeWidth={1.5}
                                  size={28}
                                  style={{
                                    padding: "6px",
                                    borderRadius: "8px",
                                    backgroundColor: "rgba(255,255,255,0.2)",
                                    cursor: "pointer",
                                  }}
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
export default ChatHeader;
