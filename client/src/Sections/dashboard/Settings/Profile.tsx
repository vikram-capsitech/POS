import React, { useRef } from "react";
import { dispatch, useSelector } from "../../../redux/store";
import {
  Avatar,
  Button,
  DatePicker,
  Divider,
  Form,
  Image,
  Input,
  Space,
  Tag,
  Typography,
} from "antd";
import { requestHandler } from "../../../Utils";
import { updateUser } from "../../../Api";
import { FileUploadTwoIcon } from "../../../Assets/CustomAntIcons";
import {
  detectSocialPlatform,
  GetSocialMediaIcon,
} from "../../../Utils/socialUtils";
import { Formik, FormikProps } from "formik";
import { toast } from "react-toastify";
import {
  AuthInitialState,
  UpdateUserProfile,
} from "../../../redux/slices/auth";
import Dragger from "antd/lib/upload/Dragger";
import { UserInterface } from "../../../Interfaces/user";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useTheme } from "../../../Contexts/ThemeContext";
import { PlusOutlined } from "@ant-design/icons";
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";

export const ProfileMain = () => {
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const { user } = useSelector((state: any) => state.auth as AuthInitialState);
  const { Text, Title } = Typography;
  const profileRef = useRef<FormikProps<UserInterface> | null>(null);
  const [disable, setDisable] = React.useState(true);
  const [showDragger, setShowDragger] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const setUser = async () => {
      const val: UserInterface = {
        _id: user?._id,
        about: user?.about ?? "",
        displayName: user?.displayName ?? "",
        email: user?.email,
        pic: user?.pic,
        designation: user?.designation,
        phone: user?.phone ?? "",
        title: user?.title ?? "",
        userName: user?.userName ?? "",
        isEmailVerified: user?.isEmailVerified,
        social: user?.social,
        dob: user?.dob,
      } as any;
      profileRef.current?.setValues(val);
    };
    setUser();
  }, [user]);

  const profileSchema = Yup.object({
    username: Yup.string().required("Required Username"),
    email: Yup.string().email("Invalid email format").required("Required"),
    phone: Yup.string().required("Required PhoneNumber").min(10).nullable(),
    designation: Yup.string()
      .required("Required Designation")
      .min(10)
      .nullable(),
  });

  return (
    <>
      <div
        style={{
          width: "100%",
          transition: "width 0.2s ease",
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
          Account
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
                      src={user?.pic}
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
                  //src={user?.pic}
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
                          ? theme.light.primaryText
                          : theme.dark.primaryText,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.header,
                    }}
                  >
                    {user?.displayName || "Alex Wayne"}
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      color:
                        themeType === "light"
                          ? theme.light.textHilight
                          : theme.dark.textHilight,
                      fontFamily: fontFamily,
                      fontSize: fontSizes.label,
                    }}
                  >
                    {user?.designation || "Designing"}
                  </Text>
                  {!disable && (
                    <div style={{ paddingTop: 20 }}>
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
                          style={{
                            marginLeft: "4px",
                          }}
                        />
                      </Tag>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* User Information Form */}
            <div
              style={{
                padding: "0px 20px",
                background:
                  themeType === "light"
                    ? theme.light.secondaryBackground
                    : theme.dark.secondaryBackground,
                borderRadius: "10px",
                height: "600px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <Formik
                initialValues={user as UserInterface}
                validationSchema={profileSchema}
                onSubmit={async (values: UserInterface) => {
                  try {
                    const updatedUser: UserInterface = {
                      ...values,
                      dob: dayjs(values.dob).toDate(),
                    };
                    dispatch(UpdateUserProfile(updatedUser));
                    toast.success("Profile updated successfully");
                  } catch (error) {
                    toast.error("Failed to update profile");
                  }
                }}
              >
                {({
                  values,
                  setFieldValue,
                  handleChange,
                  handleSubmit,
                  errors,
                  touched,
                }) => {
                  return (
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
                        {/* Left Column - Form Inputs */}
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
                                  Username
                                </span>
                              }
                              name="userName"
                              style={{
                                flex: 1,
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                              }}
                              validateStatus={
                                touched.userName && errors.userName
                                  ? "error"
                                  : ""
                              }
                              help={
                                touched.userName && errors.userName
                                  ? errors.userName
                                  : ""
                              }
                            >
                              <Input
                                style={{
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
                                styles={{
                                  input: {
                                    color:
                                      themeType === "light"
                                        ? theme.light.textHilight
                                        : theme.dark.textHilight,
                                  },
                                }}
                                name="userName"
                                defaultValue={values.userName}
                                value={values.userName}
                                onChange={handleChange}
                                disabled={disable}
                                placeholder="Enter username"
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
                                  Designation
                                </span>
                              }
                              name="designation"
                              style={{ flex: 1 }}
                            >
                              <Input
                                styles={{
                                  input: {
                                    color:
                                      themeType === "light"
                                        ? theme.light.textHilight
                                        : theme.dark.textHilight,
                                  },
                                }}
                                style={{
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
                                name="designation"
                                value={values.designation}
                                defaultValue={values.designation}
                                onChange={handleChange}
                                placeholder="Enter designation"
                                disabled={disable}
                              />
                            </Form.Item>
                          </Space>

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
                                  Full Name
                                </span>
                              }
                              name="displayName"
                              style={{ flex: 1 }}
                            >
                              <Input
                                styles={{
                                  input: {
                                    color:
                                      themeType === "light"
                                        ? theme.light.textHilight
                                        : theme.dark.textHilight,
                                  },
                                }}
                                style={{
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
                                name="displayName"
                                value={values.displayName}
                                defaultValue={values.displayName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                disabled={disable}
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
                                  Date of Birth
                                </span>
                              }
                              name="dob"
                              style={{ flex: 1 }}
                            >
                              <DatePicker
                                name="dob"
                                value={values.dob ? dayjs(values.dob) : null}
                                defaultValue={
                                  values.dob ? dayjs(values.dob) : null
                                }
                                onChange={(date: any) =>
                                  setFieldValue("dob", date)
                                }
                                style={{
                                  width: "100%",
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
                                placeholder="DD/MM/YYYY"
                                disabled={disable}
                                format="DD/MM/YYYY"
                                className="custom-datepicker"
                              />
                            </Form.Item>
                          </Space>

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
                                Bio
                              </span>
                            }
                            name="about"
                          >
                            <Input.TextArea
                              autoSize={{ minRows: 3, maxRows: 5 }}
                              name="about"
                              styles={{
                                textarea: {
                                  color:
                                    themeType === "light"
                                      ? theme.light.textHilight
                                      : theme.dark.textHilight,
                                },
                              }}
                              style={{
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
                              value={values.about}
                              defaultValue={values.about}
                              onChange={handleChange}
                              placeholder="About you (optional)"
                              disabled={disable}
                            />
                          </Form.Item>
                        </div>
                        {/* Right Column - File Upload */}
                        <div
                          style={{
                            width: 600,
                            height: 255,
                            textAlign: "center",
                          }}
                        >
                          {showDragger && (
                            <Dragger
                              multiple={false}
                              showUploadList={true}
                              beforeUpload={(file) => {
                                const previewUrl = URL.createObjectURL(file);
                                setFieldValue("pic", previewUrl);
                                setFieldValue("uploadPic", file);
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
                              <p
                                style={{
                                  color:
                                    themeType === "light"
                                      ? theme.light.textLight
                                      : theme.dark.textLight,
                                }}
                              >
                                Drop your file here
                              </p>
                              <p
                                style={{
                                  fontSize: 12,
                                  color:
                                    themeType === "light"
                                      ? theme.light.textLight
                                      : theme.dark.textLight,
                                }}
                              >
                                Max Size 50 MB
                              </p>
                            </Dragger>
                          )}
                        </div>
                      </Space>
                      <Divider className="custom-divider" />
                      <Title
                        level={5}
                        style={{
                          color:
                            themeType === "light"
                              ? theme.light.textHilight
                              : theme.dark.textHilight,
                          fontFamily: fontFamily,
                          fontSize: fontSizes.header,
                        }}
                      >
                        Contact Info
                      </Title>
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
                              Phone no.
                            </span>
                          }
                          name="phone"
                        >
                          <Input
                            styles={{
                              input: {
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                              },
                            }}
                            style={{
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
                            name="phone"
                            value={values.phone}
                            defaultValue={values.phone}
                            onChange={handleChange}
                            placeholder="Enter Phone no."
                            disabled={disable}
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
                              Mail
                            </span>
                          }
                          name="email"
                        >
                          <Input
                            styles={{
                              input: {
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                              },
                            }}
                            style={{
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
                            name="email"
                            value={values.email}
                            defaultValue={values.email}
                            onChange={handleChange}
                            placeholder="Enter email"
                            disabled={disable}
                          />
                        </Form.Item>
                      </Space>
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
                            Social Media Links
                          </span>
                        }
                        name="social"
                      >
                        {(values?.social?.length ? values.social : [""]).map(
                          (link, index) => {
                            const platform = detectSocialPlatform(link);
                            return (
                              <Space
                                key={index}
                                style={{ display: "flex", marginBottom: 8 }}
                              >
                                <Input
                                  value={link}
                                  onChange={(e) => {
                                    const updatedLinks = [
                                      ...(values.social || [""]),
                                    ];
                                    updatedLinks[index] = e.target.value;
                                    setFieldValue("social", updatedLinks);
                                  }}
                                  placeholder={
                                    index === 0
                                      ? "www.linkedin.com"
                                      : "Add another link"
                                  }
                                  disabled={disable}
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
                                {platform ? GetSocialMediaIcon(platform) : null}
                                {!disable &&
                                  index ===
                                    (values?.social?.length || 1) - 1 && (
                                    <PlusOutlined
                                      width="27"
                                      height="27"
                                      style={{
                                        background:
                                          themeType === "light"
                                            ? theme.light.border
                                            : theme.dark.border,
                                        padding: 4,
                                        borderRadius: 6,
                                        cursor: "pointer",
                                        color:
                                          themeType === "light"
                                            ? theme.light.textHilight
                                            : theme.dark.textHilight,
                                      }}
                                      onClick={() =>
                                        setFieldValue("social", [
                                          ...(values.social || [""]),
                                          "",
                                        ])
                                      }
                                    />
                                  )}
                                {!disable &&
                                  (values?.social?.length || 1) > 1 && (
                                    <Button
                                      icon={
                                        <Trash2
                                          strokeWidth={1}
                                          size={20}
                                          style={{
                                            stroke:
                                              themeType === "light"
                                                ? theme.light.textHilight
                                                : theme.dark.textHilight,
                                          }}
                                        />
                                      }
                                      type="text"
                                      onClick={() =>
                                        setFieldValue(
                                          "social",
                                          (values.social || [""]).filter(
                                            (_, i) => i !== index
                                          )
                                        )
                                      }
                                      style={{
                                        background:
                                          themeType === "light"
                                            ? theme.light.neutralbackground
                                            : theme.dark.neutralbackground,
                                        borderRadius: "8px",
                                        padding: "6px",
                                        cursor: "pointer",
                                      }}
                                    />
                                  )}
                              </Space>
                            );
                          }
                        )}
                        <div
                          style={{
                            marginTop: "auto",
                          }}
                        >
                          <Divider className="custom-divider" />
                          <div style={{ textAlign: "right" }}>
                            <Button
                              style={{
                                marginRight: 10,
                                borderRadius: 6,
                                backgroundColor: "transparent",
                                color:
                                  themeType === "light"
                                    ? theme.light.textHilight
                                    : theme.dark.textHilight,
                                fontFamily: fontFamily,
                                border: `1px solid ${
                                  themeType === "light"
                                    ? theme.light.border
                                    : theme.dark.border
                                }`,
                                fontSize: fontSizes.body,
                              }}
                              onClick={() => {
                                navigate("/client");
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={(e) => {
                                if (!disable) {
                                  e.preventDefault();
                                  const userData = {
                                    ...values,
                                    _id: user?._id,
                                  };
                                  requestHandler(
                                    () => updateUser(userData),
                                    null,
                                    () => {
                                      console.log("userData", userData);
                                      dispatch(UpdateUserProfile(userData));
                                      setShowDragger(false);
                                      toast.success(
                                        "Profile updated successfully"
                                      );
                                    },
                                    (error: string) => {
                                      toast.error(error);
                                    }
                                  );
                                }
                                setDisable(!disable);
                              }}
                              style={{
                                height: 30,
                                borderRadius: 5,
                                backgroundColor:
                                  themeType === "light"
                                    ? theme.dark.primaryBackground
                                    : theme.light.primaryBackground,
                                color:
                                  themeType === "light"
                                    ? theme.light.text
                                    : theme.dark.text,
                                fontFamily: fontFamily,
                                fontSize: fontSizes.body,
                              }}
                            >
                              {disable ? "Edit" : "Save"}
                            </Button>
                          </div>
                        </div>
                      </Form.Item>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
