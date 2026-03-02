import Sider from "antd/es/layout/Sider";
import { useTheme } from "../Contexts/ThemeContext";
import { Blocks, Bug, MessageSquare, TicketPlus } from "lucide-react";
import {
  Avatar,
  Button,
  Col,
  Divider,
  Form,
  Input,
  List,
  Modal,
  Row,
  Tabs,
  Typography,
} from "antd";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { requestHandler } from "../Utils";
import { createBugorFeature, getBugOrFeatureList } from "../Api";
import { useDispatch, useSelector } from "../redux/store";
import { AuthInitialState, setBugList } from "../redux/slices/auth";
import { useNavigate } from "react-router-dom";
import { BugInterface } from "../Interfaces/user";
import { useSocket } from "../Contexts/SocketContext";
const { Title } = Typography;

const DeveloperPannel = () => {
  const { theme, themeType, fontSizes, fontFamily } = useTheme();
  const { currentOrganization } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log("isModalOpen", isModalOpen);
  const [bugList, setBugList] = useState([]);

  const fetchBugList = async () => {
    try {
      await requestHandler(
        async () => await getBugOrFeatureList(currentOrganization.id),
        null,
        async (res) => {
          if (res.success && Array.isArray(res.data)) {
            setBugList(res.data as any);
          }
        },
        (error: any) => {
          toast.error(error || "Failed to fetch bug list", {
            position: "top-right",
          });
        }
      );
    } catch (error: any) {
      toast.error(error?.message || "An unexpected error occurred", {
        position: "top-right",
      });
    }
  };

  React.useEffect(() => {
    if (currentOrganization?.id) {
      fetchBugList();
    }
  }, [currentOrganization?.id]);

  return (
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
        margin: "12px 0px 12px 0px",
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          margin: "1px 0px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2px 2px",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            cursor: "pointer",
          }}
        >
          <MessageSquare
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
            Discussions
          </Typography>
        </div>
        <TicketPlus
          style={{
            cursor: "pointer",
            color:
              themeType === "light"
                ? theme.light.textHilight
                : theme.dark.textHilight,
          }}
          onClick={() => {
            console.log("TicketPlus clicked");
            setIsModalOpen(true);
          }}
        />
        <BugFeatureModal
          fetchBugList={fetchBugList}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
      <Divider
        style={{
          borderColor:
            themeType === "light" ? theme.light.border : theme.dark.border,
          margin: "10px 0px !important",
        }}
        className="custom-divider"
      />
      <div style={{ marginTop: "12px", height: "70%", overflow: "scroll" }}>
        <List
          dataSource={bugList}
          renderItem={(item: any) => (
            <List.Item
              style={{
                borderBottom: "none",
                padding: "0px",
              }}
            >
              <ListItem item={item} />
            </List.Item>
          )}
        />
      </div>
    </Sider>
  );
};

export default DeveloperPannel;

const truncateText = (string: any, n: any) => {
  return string?.length > n ? `${string?.slice(0, n)}...` : string;
};

const ListItem = ({ item }: { item: any }) => {
  const { theme, themeType, fontFamily, fontSizes } = useTheme();
  const isSelected = false;
  const navigate = useNavigate();
  const { currentOrganization } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );

  return (
    <>
      <List.Item
        onClick={() => {
          console.log("Clicked on item:", item);
          navigate(`client/${currentOrganization.id}/bug/${item?._id}`);
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background =
            themeType === "light" ? theme.light.hover : theme.dark.hover)
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = isSelected
            ? themeType === "light"
              ? theme.light.primaryLight
              : theme.dark.primaryLight
            : themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground)
        }
        style={{
          width: "100%",
          padding: "8px",
          background: isSelected
            ? themeType === "light"
              ? theme.light.primaryLight
              : theme.dark.primaryLight
            : themeType === "light"
            ? theme.light.secondaryBackground
            : theme.dark.secondaryBackground,
          cursor: "pointer",
          transition: "background 0.2s ease-in-out",
          borderRadius: "8px",
          marginBottom: "4px",
          borderBottom: `1px solid ${
            themeType === "light" ? theme.light.border : theme.dark.border
          }`,
        }}
      >
        <Row justify="space-between" align="middle" style={{ width: "100%" }}>
          <Col flex="auto">
            <Row align="middle" gutter={12}>
              <Col>
                <div className="avatar-container">
                  <Avatar
                    icon={item.type === "bug" ? <Bug /> : <Blocks />}
                    style={{
                      backgroundColor:
                        item.type === "bug" ? "#ff4d4f" : "#1890ff",
                      color: "#fff",
                    }}
                  />
                </div>
              </Col>
              <Col flex="auto">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "8px",
                    justifyContent: "space-between",
                  }}
                >
                  <Title
                    style={{
                      color: isSelected
                        ? themeType === "light"
                          ? theme.light.primaryText
                          : theme.dark.primaryText
                        : themeType === "light"
                        ? theme.light.textHilight
                        : theme.dark.textHilight,
                      lineHeight: "13.38px",
                      fontSize: fontSizes.label,
                      fontWeight: isSelected ? 500 : 400,
                      marginBottom: "4px",
                      fontFamily: fontFamily,
                    }}
                  >
                    {truncateText(item.title, 30)}
                  </Title>
                  <ItemStatus status={item.status as string} />
                </div>
                {item.description && (
                  <>
                    <div style={{ marginTop: "10px" }}>
                      <Title
                        level={4}
                        style={{
                          color: isSelected
                            ? themeType === "light"
                              ? theme.light.primaryText
                              : theme.dark.primaryText
                            : themeType === "light"
                            ? theme.light.textHilight
                            : theme.dark.textHilight,
                          lineHeight: "1px",
                          fontSize: fontSizes.body,
                          fontWeight: isSelected ? 500 : 400,
                          marginBottom: "4px",
                          fontFamily: fontFamily,
                        }}
                      >
                        {truncateText(item.description, 40)}
                      </Title>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Col>
        </Row>
      </List.Item>
    </>
  );
};

interface ItemStatusProps {
  status: "open" | "closed" | string;
}

const ItemStatus = ({ status }: ItemStatusProps) => {
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return {
          backgroundColor: "#28a745",
          color: "white",
        };
      case "closed":
        return {
          backgroundColor: "#d73a49",
          color: "white",
        };
      default:
        return {
          backgroundColor: "#6c757d",
          color: "white",
        };
    }
  };

  const style = {
    padding: "2px 4px",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "bold",
    display: "inline-block",
    textTransform: "capitalize" as const,
    ...getStatusStyle(status),
  };

  return <span style={style}>{status}</span>;
};

interface BugFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  fetchBugList: () => void;
}

const BugFeatureModal: React.FC<BugFeatureModalProps> = ({
  isOpen,
  onClose,
  fetchBugList,
}) => {
  const { theme, themeType } = useTheme();
  const { socket } = useSocket();
  const [bugForm] = Form.useForm();
  const [featureForm] = Form.useForm();
  const dispatch = useDispatch();
  const { TabPane } = Tabs;
  const BUG_CREATED = "bugCreated";
  const { currentOrganization, bugList } = useSelector(
    (state: any) => state.auth as AuthInitialState
  );

  const submitForm = async (
    values: { title: string; description: string },
    type: "bug" | "feature",
    fromSocket = false
  ) => {
    const payload = { ...values, type };
    await requestHandler(
      () => createBugorFeature(currentOrganization.id, payload),
      () => {},
      (res) => {
        if (res.success) {
          const newTicket = res.data;
          if (!bugList.some((bug: BugInterface) => bug._id === newTicket._id)) {
            dispatch(setBugList([newTicket, ...bugList]) as any);
          }
          if (!fromSocket && socket) {
            socket.emit(BUG_CREATED, values); // ✅ Emit event to other clients
          }
          toast.success(`${type === "bug" ? "Bug" : "Feature"} submitted`);
          bugForm.resetFields();
          featureForm.resetFields();
          onClose();
          fetchBugList();
        } else {
          toast.error("Submission failed");
        }
      },
      (err: any) => {
        toast.error(err?.message || "Submission failed");
      }
    );
  };

  const handleBugSubmit = (values: any) => submitForm(values, "bug");
  const handleFeatureSubmit = (values: any) => submitForm(values, "feature");

  React.useEffect(() => {
    if (!currentOrganization?.id || !socket) return;

    const handleSocketBugSubmit = (values: any) => {
      submitForm(values, "bug", true);
    };

    socket.on(BUG_CREATED, handleSocketBugSubmit);
    return () => {
      socket.off(BUG_CREATED, handleSocketBugSubmit);
    };
  }, [currentOrganization?.id, bugList]);

  const getInputStyle = () => ({
    background:
      themeType === "light"
        ? theme.light.secondaryBackground
        : theme.dark.secondaryBackground,
    color:
      themeType === "light" ? theme.light.primaryText : theme.dark.primaryText,
    border: `1px solid ${
      themeType === "light" ? theme.light.border : theme.dark.border
    }`,
    borderRadius: "6px",
  });

  const getLabelStyle = () => ({
    color:
      themeType === "light" ? theme.light.textHilight : theme.dark.textHilight,
  });

  const getButtonStyle = () => ({
    color: themeType === "light" ? theme.light.text : theme.dark.text,
    backgroundColor:
      themeType === "light"
        ? theme.light.primaryBackground
        : theme.dark.primaryBackground,
    border: "none",
    borderRadius: "6px",
  });

  const renderForm = (
    form: any,
    onFinish: (values: any) => void,
    placeholderTitle: string,
    placeholderDescription: string
  ) => (
    <Form layout="vertical" form={form} onFinish={onFinish}>
      <Form.Item
        label={<span style={getLabelStyle()}>Title</span>}
        name="title"
        rules={[{ required: true, message: "Please enter a title" }]}
      >
        <Input placeholder={placeholderTitle} style={getInputStyle()} />
      </Form.Item>
      <Form.Item
        label={<span style={getLabelStyle()}>Description</span>}
        name="description"
        rules={[{ required: true, message: "Please enter a description" }]}
      >
        <Input.TextArea
          rows={4}
          autoSize={{ minRows: 3, maxRows: 5 }}
          placeholder={placeholderDescription}
          style={getInputStyle()}
        />
      </Form.Item>
      <Button htmlType="submit" block style={getButtonStyle()}>
        Submit
      </Button>
    </Form>
  );

  return (
    <Modal
      className={themeType === "light" ? "select-light" : "select-dark"}
      title="Create Ticket"
      open={isOpen}
      onCancel={onClose}
      maskClosable={false}
      closable
      footer={null}
      centered
      destroyOnClose
    >
      <Tabs defaultActiveKey="bug">
        <TabPane
          tab={<span style={getLabelStyle()}>Report a Bug</span>}
          key="bug"
        >
          {renderForm(
            bugForm,
            handleBugSubmit,
            "Enter bug title",
            "Describe the bug"
          )}
        </TabPane>
        <TabPane
          tab={<span style={getLabelStyle()}>Request a Feature</span>}
          key="feature"
        >
          {renderForm(
            featureForm,
            handleFeatureSubmit,
            "Enter feature title",
            "Describe the feature"
          )}
        </TabPane>
      </Tabs>
    </Modal>
  );
};
