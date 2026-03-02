import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Typography,
  Space,
  Row,
  Col,
  Avatar,
  Input,
  Modal,
  Divider,
  Tag,
  Menu,
  Image,
} from "antd";
import { requestHandler } from "../Utils";
import {
  createWorkSpace,
  getWorkSpacesList,
  updateWorkSpaceMembers,
} from "../Api";
import { useDispatch, useSelector } from "react-redux";
import {
  AuthInitialState,
  setCurrentOrg,
  updateOrgList,
} from "../redux/slices/auth";
import { dispatch } from "../redux/store";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { setCurrentChat } from "../redux/slices/chat";
import { toast } from "react-toastify";
import Background from "../Assets/Images/Background.png";
import Workspace from "../Assets/Images/Workspace.png";
import { Spin } from "antd";
import { useTheme } from "../Contexts/ThemeContext";
import { ArrowRight, Plus, Send, Trash2, Upload } from "lucide-react";
import { ToggleSidebar } from "../redux/slices/app";

const WorkspacePage = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModel, setShowCreateModel] = useState<boolean>(false);
  const { user, currentOrganization, isLoggedIn } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );

  useEffect(() => {
    getSpace();
  }, []);

  const location = useLocation();

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModel(true);
    }
  }, [location.state]);

  if (isLoggedIn && currentOrganization?.id !== undefined) {
    return <Navigate to={`/client/${currentOrganization?.id}`} />;
  }

  const { Text } = Typography;

  const getSpace = async () => {
    setIsLoading(true);
    await requestHandler(
      async () => await getWorkSpacesList(user?.email),
      () => {},
      (res) => {
        if (res.data) setValues(res.data);
        dispatch(
          updateOrgList(
            res.data?.map((res: any) => {
              return {
                id: res._id,
                name: res.name,
                logo: res.logo,
                about: res.about,
                members: res.members,
                admin: res.admin,
              };
            })
          )
        );
        setIsLoading(false);
      },
      () => {
        toast.warning("No workspace found for the given email.");
        setIsLoading(false);
      }
    );
  };

  const layoutStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F8FB",
    paddingTop: "100px",
    backgroundImage: `url(${Background})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  const handleCreateWorkspace = async (value: any) => {
    setIsLoading(true);
    const updatedMembers = [...value.members];
    if (user?.email && !updatedMembers.includes(user.email)) {
      updatedMembers.push(user.email);
    }

    const formData = new FormData();
    formData.append("name", value.name);
    formData.append("about", value.about);

    updatedMembers.forEach((email) => formData.append("members", email));

    if (value.logo) {
      formData.append("logo", value.logo);
    }

    await requestHandler(
      async () => await createWorkSpace(formData),
      () => {},
      (data: any) => {
        dispatch(
          setCurrentOrg({
            id: data._id,
            logo: data.logo,
            name: data.name,
            members: data.members,
            about: data.about,
            pic: data.pic,
            admin: data.admin,
          }) as any
        );
        toast.success("Workspace created successfully!");
        setShowCreateModel(false);
        setIsLoading(false);
        navigate(`/client/${data._id}`);
      },
      (error) => {
        console.error("Error creating workspace", error);
        toast.error("Failed to create workspace. Please try again.");
        setIsLoading(false);
      }
    );
  };

  const userName = user?.displayName || "User";

  return (
    <>
      <Row justify="center" align="middle" style={layoutStyle}>
        <Col>
          <div
            style={{
              width: "500px",
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
            }}
          >
            {isLoading ? (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  height: 500,
                  width: 500,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Spin tip="Loading..." size="large" />
              </div>
            ) : (
              <>
                {showCreateModel ? (
                  <CreateWorkspace
                    disable={isLoading}
                    onBack={() => setShowCreateModel(false)}
                    onCreateWorkspace={async (payload) => {
                      await handleCreateWorkspace(payload);
                      await getSpace();
                    }}
                  />
                ) : values.length === 0 ? (
                  <Space
                    direction="vertical"
                    align="center"
                    style={{
                      textAlign: "center",
                      width: "100%",
                      padding: "100px",
                    }}
                  >
                    <Image
                      src={Workspace}
                      alt="Workspace"
                      preview={false}
                      style={{ marginBottom: "10px" }}
                    />
                    <Typography
                      style={{
                        color: "#333333",
                        fontWeight: 400,
                        fontSize: "20px",
                      }}
                    >
                      No Workspaces Found
                    </Typography>
                    <Typography
                      style={{
                        color: "#33333366",
                        fontWeight: 400,
                        fontSize: "13px",
                        marginBottom: 0,
                        display: "inline",
                      }}
                    >
                      Workspaces help you and your team
                    </Typography>
                    <Typography
                      style={{
                        color: "#33333366",
                        fontWeight: 400,
                        fontSize: "13px",
                        display: "inline",
                      }}
                    >
                      stay organized and productive.
                    </Typography>

                    <Typography
                      style={{
                        color: "#33333366",
                        fontWeight: 400,
                        fontSize: "13px",
                        marginBottom: "20px",
                      }}
                    >
                      Create your first workspace now to get started!
                    </Typography>
                    <div
                      style={{
                        margin: "4px 0px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#002E6908",
                        padding: "8px 20px",
                        borderRadius: "8px",
                        position: "relative",
                        zIndex: 10,
                        cursor: "pointer",
                      }}
                      onClick={() => setShowCreateModel(true)}
                    >
                      <Plus
                        size={30}
                        strokeWidth={1.5}
                        style={{
                          color: "#1677FF",
                          fontWeight: "bold",
                          padding: "5px",
                          borderRadius: "4px",
                          backgroundColor: "#0078EF0F",
                        }}
                      />
                      <Text
                        style={{
                          marginLeft: "8px",
                          color: "#0078EF",
                          fontWeight: 500,
                          fontSize: "13px",
                        }}
                      >
                        Create New Workspace
                      </Text>
                    </div>
                  </Space>
                ) : (
                  <>
                    <div style={{ padding: "30px" }}>
                      <Typography.Text
                        style={{
                          display: "block",
                          fontWeight: 400,
                          fontSize: "26px",
                        }}
                      >
                        Hi {userName.toUpperCase()}
                      </Typography.Text>
                      <Typography.Text
                        style={{
                          display: "block",
                          color: "#33333366",
                          fontWeight: 400,
                          fontSize: "13px",
                          marginBottom: "30px",
                        }}
                      >
                        Select your workspace
                      </Typography.Text>

                      <div style={{ width: "100%" }}>
                        {values?.map((workspace) => (
                          <div key={workspace._id}>
                            <CurrentWorkspaceItem
                              workspace={workspace}
                              onOpen={(val) => {
                                dispatch(
                                  setCurrentOrg({
                                    id: val._id,
                                    logo: val.logo,
                                    name: val.name,
                                    members: val.members,
                                    about: val.about,
                                    admin: val.admin,
                                  })
                                );
                                navigate(`/client/${val._id}`);
                                console.log(
                                  `Open workspace: ${workspace.name}`
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          marginTop: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#002E6908",
                          padding: "8px 20px",
                          borderRadius: "8px",
                          position: "relative",
                          zIndex: 10,
                          cursor: "pointer",
                        }}
                        onClick={() => setShowCreateModel(true)}
                      >
                        <Plus
                          size={30}
                          strokeWidth={1.5}
                          style={{
                            color: "#1677FF",
                            fontWeight: "bold",
                            padding: "5px",
                            borderRadius: "4px",
                            backgroundColor: "#0078EF0F",
                          }}
                        />
                        <Text
                          style={{
                            marginLeft: "8px",
                            color: "#0078EF",
                            fontWeight: 500,
                            fontSize: "13px",
                          }}
                        >
                          Create New Workspace
                        </Text>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default WorkspacePage;

const CurrentWorkspaceItem = ({
  workspace,
  onOpen,
}: {
  workspace: any;
  onOpen: (val: any) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Row
      justify="space-between"
      align="middle"
      style={{
        borderRadius: isHovered ? "12px" : 0,
        borderBottom: isHovered ? "none" : "1px solid #ddd",
        padding: "12px",
        position: "relative",
        backgroundColor: isHovered ? "#002E6908" : "transparent",
        transition: "background-color 0.3s ease",
        cursor: "pointer",
      }}
      onClick={() => onOpen(workspace)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Col>
        <Row align="middle">
          <Avatar
            shape="square"
            style={{ borderRadius: "8px" }}
            src={workspace.logo}
            alt={workspace.name}
          />
          <Col style={{ marginLeft: 16 }}>
            <Typography
              style={{ fontWeight: isHovered ? 500 : 400, fontSize: "16px" }}
            >
              {workspace.name}
            </Typography>
            <Typography
              style={{ fontWeight: isHovered ? 400 : 300, fontSize: "11px" }}
            >
              Total Members- {workspace.members.length}
            </Typography>
          </Col>
        </Row>
      </Col>
      <div>
        <ArrowRight
          strokeWidth={1}
          size={30}
          style={{
            borderRadius: 6,
            color: "FFFFFF",
            padding: "5px",
            backgroundColor: "#0078EF",
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
          onClick={() => onOpen(workspace)}
        />
      </div>
    </Row>
  );
};

const CreateWorkspace = ({
  onBack,
  onCreateWorkspace,
  disable,
}: {
  onBack: () => void;
  onCreateWorkspace: (val: any) => void;
  disable: boolean;
}) => {
  const fileUploadRef = useRef<any>();
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceAbout, setWorkspaceAbout] = useState("");
  const [workspaceMembers, setWorkspaceMembers] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [workspacePic, setWorkspacePic] = useState<File | null>(null);
  const [workspacePicPreview, setWorkspacePicPreview] = useState<string | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { Text } = Typography;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const handleAddMember = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !workspaceMembers.includes(trimmedInput)) {
      if (emailRegex.test(trimmedInput)) {
        setWorkspaceMembers([...workspaceMembers, trimmedInput]);
        setInputValue("");
        setErrorMessage(null);
      } else {
        setErrorMessage("Please enter a valid email address.");
      }
    } else if (workspaceMembers.includes(trimmedInput)) {
      setErrorMessage("This email is already added.");
    }
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setWorkspaceMembers(
      workspaceMembers.filter((member) => member !== memberToRemove)
    );
  };

  const handleCreate = async () => {
    setLoading(true);
    const payload = {
      name: workspaceName,
      about: workspaceAbout,
      members: workspaceMembers,
      logo: workspacePic,
    };
    await onCreateWorkspace(payload);
    setLoading(false);
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setWorkspacePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setWorkspacePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        // padding: 24,
        background: "#fff",
        borderRadius: 8,
        // boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      <Typography style={{ fontSize: 18, fontWeight: 500, padding: "18px" }}>
        Create New Workspace
      </Typography>
      <Divider style={{ margin: 0 }} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "16px 0",
          padding: "5px 22px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#0D9488",
            margin: 0,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {workspacePicPreview ? (
            <img
              src={workspacePicPreview}
              alt="Workspace Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Text style={{ color: "#fff", fontSize: 32 }}>*</Text>
          )}
          {workspacePicPreview && isHovered && (
            <Trash2
              onClick={() => setWorkspacePicPreview(null)}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: 18,
                color: "white",
                background: "rgba(0, 0, 0, 0.5)",
                borderRadius: "50%",
                padding: 4,
                cursor: "pointer",
              }}
            />
          )}
        </div>
        <Tag
          style={{
            border: "none",
            backgroundColor: "#EBF5FF",
            fontWeight: 400,
            color: "#0078EF",
            borderRadius: 6,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            fontSize: "14px",
            transition: "background-color 0.2s ease-in-out",
          }}
          onClick={() => fileUploadRef?.current?.click()}
        >
          <Upload strokeWidth={1.5} size={18} style={{ marginLeft: "4px" }} />
          {workspacePicPreview ? "Change Image" : "Upload Picture"}
        </Tag>
        <input
          ref={fileUploadRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePicChange}
        />
      </div>
      <div style={{ padding: "5px 30px" }}>
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Workspace Name
        </Typography.Text>
        <Input
          placeholder="Enter workspace name"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          style={{ marginBottom: 16, borderRadius: "6px" }}
        />
        <Typography.Text style={{ fontWeight: 400, color: "#333333" }}>
          Description
        </Typography.Text>
        <Input.TextArea
          placeholder="About your workspace (optional)"
          value={workspaceAbout}
          onChange={(e) => setWorkspaceAbout(e.target.value)}
          style={{ marginBottom: 16, borderRadius: "6px" }}
          autoSize={{ minRows: 3, maxRows: 5 }}
        />
        <Divider style={{ margin: "5px 0px" }} />
        <Typography.Text
          style={{ display: "block", fontWeight: 500, fontSize: "16px" }}
        >
          Invite People
        </Typography.Text>
        <Typography.Text
          style={{ fontWeight: 400, color: "#333333", display: "block" }}
        >
          Email
        </Typography.Text>

        <Input
          placeholder="Enter email or username"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddMember();
            }
          }}
          style={{ marginBottom: 16, marginTop: 8, borderRadius: "6px" }}
        />
        {errorMessage && (
          <Text type="danger" style={{ display: "block", marginBottom: 16 }}>
            {errorMessage}
          </Text>
        )}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            maxHeight: "200px", // Limit vertical space
            overflowY: "auto", // Enable vertical scroll
            paddingRight: 4, // Optional: prevent content cutoff by scrollbar
          }}
        >
          {workspaceMembers?.map((member) => (
            <Tag
              key={member}
              closable
              onClose={() => handleRemoveMember(member)}
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
            >
              <Avatar
                style={{ backgroundColor: "#87d068" }}
                size="small"
                src={`https://ui-avatars.com/api/?name=${member}`}
              />
              {member}
            </Tag>
          ))}
        </div>
      </div>
      <Divider style={{ margin: 0 }} />
      <div style={{ textAlign: "right", padding: "20px" }}>
        <Button
          style={{
            marginRight: 10,
            borderRadius: 6,
            border: "none",
            backgroundColor: "#F1F4F8",
            color: "#333333B2",
          }}
          onClick={onBack}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          onClick={handleCreate || disable}
          // disabled={loading || !workspaceName.trim()}
          style={{
            height: 30,
            borderRadius: 5,
            backgroundColor: "#0078EF",
            border: "none",
          }}
        >
          {loading ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};

export const ProfileMenuOrg = ({ onClose }: { onClose: any }) => {
  const { currentOrganization, organizations } = useSelector(
    (state: any) => state.auth
  );
  const [values, setValues] = useState<any[]>([]);
  const { sideBar } = useSelector((state: any) => state.app);
  const { Text } = Typography;
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    setValues(organizations);
  }, [organizations]);

  const handleWorkspaceChange = (workspace: any) => {
    dispatch(
      setCurrentOrg({
        id: workspace.id,
        logo: workspace.logo,
        name: workspace.name,
        about: workspace.about,
        members: workspace.members,
        admin: workspace.admin,
      })
    );
    dispatch(setCurrentChat(null));
    dispatch(ToggleSidebar(sideBar.type, false) as any);
    navigate(`/client/${workspace.id}`);
    onClose();
  };

  return (
    <Menu
      style={{
        width: 350,
        borderRadius: "12px",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
      }}
    >
      {values.map((workspace: any) => (
        <Menu.Item
          key={workspace.id}
          onClick={() => handleWorkspaceChange(workspace)}
          style={{
            cursor: "pointer",
            padding: "10px 16px",
            background:
              currentOrganization?.id === workspace.id
                ? themeType === "light"
                  ? theme.light.primaryLight
                  : theme.dark.primaryLight
                : themeType === "light"
                ? theme.light.secondaryBackground
                : theme.dark.secondaryBackground,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            border: "none",
          }}
        >
          <Avatar
            shape="square"
            src={workspace.logo}
            style={{
              color:
                currentOrganization?.id === workspace.id
                  ? themeType === "light"
                    ? theme.light.primaryText
                    : theme.dark.primaryText
                  : themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              fontWeight: "bold",
              fontFamily: fontFamily,
              fontSize: fontSizes.body,
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            {!workspace.logo && workspace.name.charAt(0).toUpperCase()}
          </Avatar>
          <Text
            style={{
              marginLeft: "8px",
              fontWeight: 400,
              lineHeight: "13.86px",
              fontSize: fontSizes.body,
              color:
                currentOrganization?.id === workspace.id
                  ? themeType === "light"
                    ? theme.light.primaryText
                    : theme.dark.primaryText
                  : themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
              flex: 1,
              fontFamily: fontFamily,
            }}
          >
            {workspace.name}
          </Text>
        </Menu.Item>
      ))}
      <Divider
        style={{
          margin: "8px 0",
          width: "100%",
          color: themeType === "light" ? theme.light.border : theme.dark.border,
        }}
      />
      <Menu.Item
        onClick={() => {
          dispatch(setCurrentOrg({}) as any);
          onClose();
          navigate("/client/organization", { state: { openCreate: true } });
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color:
            themeType === "light"
              ? theme.light.primaryText
              : theme.dark.primaryText,
          cursor: "pointer",
          fontWeight: "medium",
          background:
            themeType === "light"
              ? theme.light.primaryLight
              : theme.dark.primaryLight,
          borderRadius: "10px",
          padding: "8px 12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Plus
            size={20}
            strokeWidth={1.25}
            style={{
              stroke:
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText,
            }}
          />
          <Text
            style={{
              marginLeft: "8px",
              color:
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText,
              fontWeight: 500,
              fontSize: fontSizes.body,
              fontFamily: fontFamily,
            }}
          >
            Create New Company
          </Text>
        </div>
      </Menu.Item>
    </Menu>
  );
};

export const AddMemberModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  const dispatch = useDispatch();
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const [inputValue, setInputValue] = useState<string>("");
  const [addedMembers, setAddedMembers] = useState<
    { email: string; id?: string }[]
  >([]);
  const { theme, themeType } = useTheme();
  const selectedWorkspace = currentOrganization?.id || "";

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handlePressEnter = () => {
    const emailToAdd = inputValue.trim();
    if (!emailToAdd || !isValidEmail(emailToAdd)) {
      toast.error("Please enter a valid email.");
      return;
    }

    const alreadyAdded = addedMembers.some(
      (member) => member.email === emailToAdd
    );
    if (alreadyAdded) {
      toast.warning("This email is already in the list.");
      return;
    }

    setAddedMembers((prev) => [...prev, { email: emailToAdd }]);
    setInputValue("");
  };

  const handleAddMember = async () => {
    if (addedMembers.length === 0) return;
    const results = await Promise.allSettled(
      addedMembers.map((member) =>
        updateWorkSpaceMembers(selectedWorkspace, {
          action: "add",
          member: member.email,
        })
      )
    );

    let anySuccess = false;
    results.forEach((result, index) => {
      const email = addedMembers[index].email;
      if (result.status === "fulfilled") {
        const updatedWorkspace = result.value?.data?.data;
        if (updatedWorkspace?.members) {
          dispatch(
            setCurrentOrg({
              ...updatedWorkspace,
              id: updatedWorkspace._id,
            }) as any
          );
          toast.success(`${email} has been added successfully!`);
          anySuccess = true;
        } else {
          toast.error(`Failed to update workspace for ${email}`);
        }
      } else {
        console.error(`Error adding member (${email}):`, result.reason);
        toast.error(`Failed to add ${email}`);
      }
    });

    if (anySuccess) {
      onClose();
      setAddedMembers([]);
    }
  };
  useEffect(() => {
    if (!open) {
      setAddedMembers([]);
      setInputValue("");
    }
  }, [open]);

  const handleRemoveMember = (email: string) => {
    setAddedMembers((prev) => prev.filter((member) => member.email !== email));
  };

  return (
    <Modal
      className={themeType === "light" ? "select-light" : "select-dark"}
      maskClosable={false}
      closable={true}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      title="Add People"
      style={{
        borderRadius: "12px",
        background:
          themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
        color:
          themeType === "light"
            ? theme.light.primaryText
            : theme.dark.primaryText,
      }}
    >
      <div>
        <label
          style={{
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "16.38px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        >
          Email
        </label>
        <Input
          placeholder="Enter email or username"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handlePressEnter}
          className="custom-input"
          styles={{
            input: {
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            },
          }}
          style={{
            marginBottom: 10,
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

        {/* Show newly added members as tags */}
        {addedMembers.length > 0 && (
          <div
            style={{
              marginBottom: 20,
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              background:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              color:
                themeType === "light"
                  ? theme.light.primaryText
                  : theme.dark.primaryText,
            }}
          >
            {addedMembers?.map((member) => (
              <Tag
                key={member.email}
                style={{
                  borderRadius: "6px",
                  boxShadow: "0px 2px 6px 0px #00000014",
                  padding: "10px",
                  background:
                    themeType === "light"
                      ? theme.light.secondaryBackground
                      : theme.dark.secondaryBackground,
                  color:
                    themeType === "light"
                      ? theme.light.primaryText
                      : theme.dark.primaryText,
                  border: `1px solid ${
                    themeType === "light"
                      ? theme.light.border
                      : theme.dark.border
                  }`,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                closable
                onClose={() => handleRemoveMember(member.email)}
              >
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  size="small"
                  src={`https://ui-avatars.com/api/?name=${member.email}`}
                />
                {member.email}
              </Tag>
            ))}
          </div>
        )}

        <label
          style={{
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "16.38px",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
        >
          Write Message
        </label>
        <Input.TextArea
          placeholder="Enter Message (optional)"
          autoSize={{ minRows: 3, maxRows: 5 }}
          className="custom-input"
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
            color:
              themeType === "light"
                ? theme.light.primaryText
                : theme.dark.primaryText,
            border: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
            borderRadius: "6px",
          }}
        />

        <Divider
          style={{
            border: `1px solid ${
              themeType === "light" ? theme.light.border : theme.dark.border
            }`,
            width: "100%",
          }}
        />
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}
        >
          <Button
            icon={
              <Send
                strokeWidth={1}
                stroke={
                  themeType === "light" ? theme.light.text : theme.dark.text
                }
              />
            }
            onClick={handleAddMember}
            style={{
              color: themeType === "light" ? theme.light.text : theme.dark.text,
              background:
                themeType === "light"
                  ? theme.light.primaryBackground
                  : theme.dark.primaryBackground,
              borderRadius: "6px",
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
};
