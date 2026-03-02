import { useTheme } from "../../../Contexts/ThemeContext";
import { LogOut, Pencil, UserRound } from "lucide-react";
import {
  Avatar,
  Button,
  Divider,
  Form,
  Image,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import { mergeStyles } from "@fluentui/merge-styles";
import { useSelector } from "react-redux";
import { deleteWorkSpaceMember, updateWorkSpace } from "../../../Api";
import { useEffect, useState } from "react";
import { ExclamationCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { FileUploadTwoIcon } from "../../../Assets/CustomAntIcons";
import Dragger from "antd/lib/upload/Dragger";
import { UpdateWorkSpaceProfile } from "../../../redux/slices/auth";
import { dispatch } from "../../../redux/store";
import * as Yup from "yup";
import { Formik } from "formik";
import { toast } from "react-toastify";
import { requestHandler } from "../../../Utils";
import { showSnackbar } from "../../../redux/slices/app";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const WorkspaceProfile = () => {
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { currentOrganization } = useSelector((state: any) => state.auth);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDragger, setShowDragger] = useState(false);
  const [disable, setDisable] = useState(true);
  const navigate = useNavigate();

  const WorkspaceSchema = Yup.object().shape({
    name: Yup.string().required("Workspace name is required"),
    description: Yup.string().nullable(),
  });

  useEffect(() => {
    if (currentOrganization?.members?.length) {
      const mapped = currentOrganization.members.map((m: any, index: any) => ({
        key: m.id || index,
        email: m.email || "-",
        username: m.userName || "-",
        pic: m.pic || "",
        designation: m.designation || "-",
      }));
      setMembers(mapped);
    }
  }, [currentOrganization]);

  const showConfirmRemove = (memberName: string, memberId: string) => {
    Modal.confirm({
      title: "Confirm",
      icon: <ExclamationCircleOutlined />,
      content: (
        <span>
          Are you sure you want to remove <strong>{memberName}</strong>?
        </span>
      ),
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk() {
        setLoading(true);
        return requestHandler(
          async () =>
            await deleteWorkSpaceMember(currentOrganization?.id, memberId),
          null,
          (res) => {
            setLoading(false);
            if (res.success) {
              dispatch(
                UpdateWorkSpaceProfile({
                  id: res.data?._id,
                  name: res.data?.name,
                  about: res.data?.about,
                  logo: res.data?.logo,
                  members: res.data?.members,
                  admin: res.data?.admin,
                })
              );
              toast.success("Member removed successfully");
            }
          },
          (error: string) => {
            setLoading(false);
            dispatch(
              showSnackbar({ severity: "error", message: error }) as any
            );
          }
        );
      },
    });
  };

  const columns: any = [
    {
      title: "Name",
      key: "senderName",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar
            size="small"
            src={record.pic}
            icon={<UserRound size={15} />}
          />
          <span>{record.username}</span>
        </div>
      ),
    },
    {
      title: "Designation",
      dataIndex: "designation",
    },
    {
      title: "",
      key: "logout",
      render: (_: any, record: any) => (
        <Tooltip title="Remove">
          <LogOut
            size={18}
            style={{ cursor: "pointer", color: "#ff4d4f" }}
            onClick={() => showConfirmRemove(record.username, record.key)}
          />
        </Tooltip>
      ),
      width: 40,
      align: "center",
    },
  ];

  return (
    <Formik
      initialValues={{
        id: currentOrganization?.id || "",
        name: currentOrganization?.name || "",
        about: currentOrganization?.about || "",
        logo: currentOrganization?.logo || "",
        members: currentOrganization?.members || [],
      }}
      enableReinitialize
      validationSchema={WorkspaceSchema}
      onSubmit={() => {
        try {
          //dispatch(UpdateWorkSpaceProfile(values));
          toast.success("WorkSpace updated successfully");
        } catch (error) {
          toast.error("Failed to update profile");
        }
      }}
    >
      {({ values, setFieldValue, handleChange, handleSubmit }) => (
        <div
          style={{
            width: "100%",
            transition: "width 0.2s ease",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            overflowY: "scroll",
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor:
                themeType === "light"
                  ? theme.light.secondaryBackground
                  : theme.dark.secondaryBackground,
              padding: "12px 16px",
              borderBottom: `1px solid ${
                themeType === "light" ? theme.light.border : theme.dark.border
              }`,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              fontSize: fontSizes.header,
              fontFamily: fontFamily,
              color:
                themeType === "light"
                  ? theme.light.textHilight
                  : theme.dark.textHilight,
            }}
          >
            Workspace
          </div>

          <div style={{ padding: "8px" }}>
            <div
              style={{
                width: "100%",
                borderRadius: "10px 8px",
                border: "none",
                backgroundColor:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
              }}
            >
              {/* Profile Header */}
              <div
                style={{
                  position: "relative",
                  backgroundColor:
                    themeType === "light"
                      ? theme.light.primaryLight
                      : theme.dark.primaryLight,
                  height: 140,
                  borderRadius: 10,
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "25px",
                  justifyContent: "space-between",
                  position: "relative",
                  marginTop: "-90px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    size={125}
                    src={
                    <Image
                      src={currentOrganization?.logo}
                      width={125}
                      height={125}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "1px solid #f0f0f0",
                      }}
                      preview={true}
                    />
                  }
                    //src={currentOrganization?.logo}
                    style={{
                      border: `4px solid ${
                        themeType === "light"
                          ? theme.light.border
                          : theme.dark.border
                      }`,
                      marginRight: 20,
                    }}
                  />

                  <div>
                    <Title
                      level={4}
                      style={{
                        margin: 0,
                        color:
                          themeType === "light"
                            ? theme.light.textHilight
                            : theme.dark.textHilight,
                        fontFamily: fontFamily,
                        fontSize: fontSizes.header,
                      }}
                    >
                      {currentOrganization?.name || "Alex Wayne"}
                    </Title>

                    <div style={{ paddingTop: 20 }} hidden={disable}>
                      <Tag
                        style={{
                          border: "none",
                          backgroundColor:
                            themeType === "light"
                              ? theme.light.hover
                              : theme.dark.hover,
                          fontWeight: 400,
                          color:
                            themeType === "light"
                              ? theme.light.textHilight
                              : theme.dark.textHilight,
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          fontFamily: fontFamily,
                          fontSize: fontSizes.body,
                          transition: "background-color 0.2s ease-in-out",
                        }}
                        onClick={() => setShowDragger((prev) => !prev)}
                      >
                        Change Profile Picture
                        <Pencil
                          strokeWidth={1}
                          size={18}
                          style={{ marginLeft: "4px" }}
                        />
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>

              <>
                <Form
                  layout="vertical"
                  style={{ padding: "0px 20px" }}
                  onFinish={handleSubmit}
                >
                  <Title
                    level={4}
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.header,
                    }}
                  >
                    Basic Info
                  </Title>

                  <Space
                    size="large"
                    style={{ display: "flex", alignItems: "flex-start" }}
                  >
                    <div style={{ flex: 1 }}>
                      <Space size="large" style={{ display: "flex" }}>
                        <Form.Item
                          label={
                            <span
                              style={{
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                                fontFamily: fontFamily,
                                fontSize: fontSizes.body,
                              }}
                            >
                              Workspace Name
                            </span>
                          }
                          name="name"
                          style={{ flex: 1 }}
                        >
                          <Input
                            name="name"
                            onChange={handleChange}
                            disabled={disable}
                            value={values?.name}
                            defaultValue={values?.name}
                            placeholder="Enter workspace name"
                            styles={{
                              input: {
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                              },
                            }}
                            style={{
                              width: 300,
                              borderRadius: 5,
                              backgroundColor:
                                themeType === "light"
                                  ? theme.light.secondaryBackground
                                  : theme.dark.secondaryBackground,
                              color:
                                themeType === "light"
                                  ? theme.light.textHilight
                                  : theme.dark.textHilight,
                            }}
                          />
                        </Form.Item>
                        <Form.Item
                          label={
                            <span
                              style={{
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                                fontFamily: fontFamily,
                                fontSize: fontSizes.body,
                              }}
                            >
                              Description
                            </span>
                          }
                          name="about"
                          style={{ flex: 1 }}
                        >
                          <Input
                            name="about"
                            defaultValue={values?.about}
                            value={values?.about}
                            onChange={handleChange}
                            disabled={disable}
                            placeholder="About your workspace"
                            styles={{
                              input: {
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                              },
                            }}
                            style={{
                              width: 300,
                              borderRadius: 5,
                              backgroundColor:
                                themeType === "light"
                                  ? theme.light.secondaryBackground
                                  : theme.dark.secondaryBackground,
                              color:
                                themeType === "light"
                                  ? theme.light.textHilight
                                  : theme.dark.textHilight,
                            }}
                          />
                        </Form.Item>
                        <div
                          style={{
                            width: 600,
                            height: 100,
                            textAlign: "center",
                          }}
                        >
                          {showDragger && !disable && (
                            <Dragger
                              multiple={false}
                              showUploadList={true}
                              onChange={handleChange}
                              name="logo"
                              beforeUpload={(file) => {
                                const previewUrl = URL.createObjectURL(file);
                                setFieldValue("logo", previewUrl);
                                setFieldValue("uploadLogo", file);
                                return false;
                              }}
                            >
                              <p className="ant-upload-drag-icon">
                                <FileUploadTwoIcon
                                  style={{
                                    fontSize: 40,
                                  }}
                                  fill={
                                    themeType === "light"
                                      ? theme.light.primaryBackground
                                      : theme.dark.primaryBackground
                                  }
                                />
                              </p>
                              <p
                                style={{
                                  fontWeight: 500,
                                  color:
                                    themeType === "light"
                                      ? theme.light.textHilight
                                      : theme.dark.textHilight,
                                }}
                              >
                                Upload Your Picture
                              </p>
                            </Dragger>
                          )}
                        </div>
                      </Space>
                    </div>
                  </Space>
                </Form>
              </>

              <Divider className="custom-divider" />
              <div
                style={{
                  padding: "0px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: "10px",
                }}
              >
                <div
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <Title
                    level={4}
                    style={{
                      margin: 0,
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.header,
                    }}
                  >
                    People
                  </Title>
                  <Typography.Text
                    type="secondary"
                    style={{
                      margin: 0,
                      fontFamily: fontFamily,
                      fontSize: "14px",
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                    }}
                  >
                    Total Member {members.length}
                  </Typography.Text>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <Button
                    style={{
                      backgroundColor:
                        themeType === "light"
                          ? theme.light.primaryBackground
                          : theme.dark.primaryBackground,
                      color:
                        themeType === "light"
                          ? theme.light.text
                          : theme.dark.text,
                    }}
                  >
                    Change Designation
                  </Button>
                  <Button
                    style={{
                      backgroundColor:
                        themeType === "light"
                          ? theme.light.primaryBackground
                          : theme.dark.primaryBackground,
                      color:
                        themeType === "light"
                          ? theme.light.text
                          : theme.dark.text,
                    }}
                    icon={<PlusOutlined />}
                  >
                    Add Designation
                  </Button>
                </div>
              </div>

              <Table
                className={mergeStyles({
                  // ".ant-table-thead": {
                  //   backgroundColor: `${themeType === "light" ? theme.light.secondaryBackground : theme.dark.secondaryBackground} !important`,
                  // },
                  ".ant-table-thead > tr > th": {
                    backgroundColor: `${
                      themeType === "light"
                        ? theme.light.neutralbackground
                        : theme.dark.neutralbackground
                    } !important`,
                    color: `${
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    } !important`,
                  },
                  ".ant-table-tbody": {
                    backgroundColor: `${
                      themeType === "light"
                        ? theme.light.secondaryBackground
                        : theme.dark.secondaryBackground
                    } !important`,
                  },
                  ".ant-table-tbody > tr > td": {
                    backgroundColor: `${
                      themeType === "light"
                        ? theme.light.secondaryBackground
                        : theme.dark.secondaryBackground
                    } !important`,
                    color: `${
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    } !important`,
                    borderBottom: "none !important",
                  },
                  ".ant-empty-description": {
                    color: `${
                      themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight
                    } !important`,
                  },
                  ".ant-table-cell::before": {
                    display: "none !important", // Hides internal separator pseudo-element
                  },
                  ".ant-table-thead > tr > th:last-child": {
                    boxShadow: "none !important",
                  },
                })}
                columns={columns}
                dataSource={members}
                loading={loading}
                pagination={false}
                scroll={{ y: 300 }}
                size="small"
                style={{ padding: "0px 20px" }}
              />
            </div>
          </div>
          <div
            style={{
              marginTop: "auto",
            }}
          >
            <Divider className="custom-divider" />
            <div style={{ textAlign: "right", padding: "30px 20px" }}>
              <Button
                style={{
                  marginRight: 10,
                  borderRadius: 6,
                  backgroundColor:
                    themeType === "light"
                      ? theme.light.primaryBackground
                      : theme.dark.primaryBackground,
                  color:
                    themeType === "light" ? theme.light.text : theme.dark.text,
                  fontFamily: fontFamily,
                  fontSize: fontSizes.body,
                }}
                onClick={() => {
                  disable ? navigate("/client") : setDisable(true);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (disable) {
                    setDisable(false);
                  } else {
                    const WorkspaceData = {
                      ...values,
                      id: currentOrganization?.id,
                    };
                    setLoading(true);
                    requestHandler(
                      () => updateWorkSpace(WorkspaceData),
                      null,
                      (res) => {
                        if (res.success) {
                          console.log("userData", WorkspaceData);
                          dispatch(
                            UpdateWorkSpaceProfile({
                              id: res.data?._id,
                              name: res.data?.name,
                              about: res.data?.about,
                              logo: res.data?.logo,
                              members: res.data?.members,
                              admin: res.data?.admin,
                            })
                          );
                          setShowDragger(false);
                          setDisable(true);
                          setLoading(false);
                          toast.success("WorkSpace updated successfully");
                        }
                      },
                      (error: string) => {
                        toast.error(error);
                      }
                    );
                  }
                }}
                style={{
                  height: 30,
                  borderRadius: 5,
                  backgroundColor:
                    themeType === "light"
                      ? theme.dark.primaryBackground
                      : theme.light.primaryBackground,
                  color:
                    themeType === "light" ? theme.light.text : theme.dark.text,
                  fontFamily: fontFamily,
                  fontSize: fontSizes.body,
                }}
              >
                {disable ? "Edit" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Formik>
  );
};

export default WorkspaceProfile;
