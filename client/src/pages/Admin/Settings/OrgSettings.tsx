import React, { useEffect, useState } from "react";
import {
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
  Button,
  message,
  Divider,
} from "antd";
import {
  UploadOutlined,
  SaveOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import { getOrganization, updateOrganization } from "../../../Api";
import { requestHandler } from "../../../Utils";
import { useTheme } from "../../../Contexts/ThemeContext";
import { themes } from "../../../Utils/theme";

const { Title } = Typography;

export default function OrgSettings() {
  const { orgId } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { setTheme } = useTheme();

  // Load organization details
  useEffect(() => {
    if (!orgId) return;
    requestHandler(
      () => getOrganization(orgId) as any,
      setLoading,
      (res) => {
        if (res.success && res.data) {
          form.setFieldsValue({
            name: res.data.name,
            address: res.data.address,
            phone: res.data.contactPhone,
            email: res.data.contactEmail,
            theme: res.data.settings?.theme || "default",
          });
        }
      },
      (err: any) => message.error("Failed to load organization settings"),
    );
  }, [orgId, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const updateData = {
        name: values.name,
        address: values.address,
        contactPhone: values.phone,
        contactEmail: values.email,
        theme: values.theme,
      };

      await updateOrganization(orgId as string, updateData);

      // Apply theme locally immediately for smooth UX
      setTheme(values.theme);

      message.success("Organization settings saved successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <Flex align="center" gap={12} style={{ marginBottom: 24 }}>
        <SettingOutlined style={{ fontSize: 24, color: "#1677ff" }} />
        <Title level={3} style={{ margin: 0 }}>
          Organization Settings
        </Title>
      </Flex>

      <Card
        loading={loading}
        style={{ borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ theme: "default" }}
        >
          <Title level={5} style={{ marginTop: 0 }}>
            General Details
          </Title>
          <Divider style={{ margin: "12px 0 24px" }} />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Restaurant / Organization Name"
                rules={[{ required: true }]}
              >
                <Input placeholder="Enter organization name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Contact Number">
                <Input placeholder="Enter contact number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Contact Email">
                <Input placeholder="Enter contact email" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="address" label="Address">
                <Input placeholder="Enter full address" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item label="Organization Logo">
                <Upload
                  listType="picture"
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Upload New Logo</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 24 }}>
            Appearance
          </Title>
          <Divider style={{ margin: "12px 0 24px" }} />

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item name="theme" label="POS & Dashboard Theme">
                <Select size="large">
                  {Object.values(themes).map((t) => (
                    <Select.Option key={t.type} value={t.type}>
                      <Flex align="center" gap={8}>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: t.light.primaryBackground,
                          }}
                        />
                        {t.name}
                      </Flex>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Flex justify="flex-end" style={{ marginTop: 32 }}>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              htmlType="submit"
              loading={saving}
            >
              Save Settings
            </Button>
          </Flex>
        </Form>
      </Card>
    </div>
  );
}
