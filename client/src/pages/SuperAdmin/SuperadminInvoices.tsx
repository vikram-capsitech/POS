import React, { useEffect, useState, useMemo } from "react";
import { Card, Table, Tag, Typography, Input, Row, Col, Statistic } from "antd";
import {
  SearchOutlined,
  DollarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { getOrganizations } from "../../Api";
import { useAppStore } from "../../Store/app.store";
import dayjs from "dayjs";
import type { TableColumnsType } from "antd";

const { Title, Text } = Typography;

export default function SuperAdminInvoices() {
  const { showSnackbar } = useAppStore();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await getOrganizations();
      setOrganizations(res?.data?.data?.data || res?.data?.data || []);
    } catch (err: any) {
      showSnackbar("Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggregate all invoices from all organizations
  const allInvoices = useMemo(() => {
    const invoices: any[] = [];
    organizations.forEach((org) => {
      if (org.meta?.invoices && Array.isArray(org.meta.invoices)) {
        org.meta.invoices.forEach((inv: any) => {
          invoices.push({
            ...inv,
            orgName: org.name,
            orgId: org._id,
          });
        });
      }
    });
    // Sort by sentAt descending
    return invoices.sort(
      (a, b) => dayjs(b.sentAt).valueOf() - dayjs(a.sentAt).valueOf(),
    );
  }, [organizations]);

  const filteredInvoices = useMemo(() => {
    if (!searchText) return allInvoices;
    const lower = searchText.toLowerCase();
    return allInvoices.filter(
      (inv) =>
        inv.orgName?.toLowerCase().includes(lower) ||
        inv.sentTo?.toLowerCase().includes(lower) ||
        inv.notes?.toLowerCase().includes(lower),
    );
  }, [allInvoices, searchText]);

  const totalAmount = useMemo(() => {
    return allInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [allInvoices]);

  const columns: TableColumnsType<any> = [
    {
      title: "Organization",
      dataIndex: "orgName",
      key: "orgName",
      render: (text) => <Text strong>{text || "—"}</Text>,
    },
    {
      title: "Sent To",
      dataIndex: "sentTo",
      key: "sentTo",
      render: (text) => <Text>{text || "—"}</Text>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => <Text strong>₹{val?.toLocaleString()}</Text>,
    },
    {
      title: "Sent At",
      dataIndex: "sentAt",
      key: "sentAt",
      render: (val) => dayjs(val).format("DD MMM YYYY, hh:mm A"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (val) => {
        if (!val) return <Text type="secondary">—</Text>;
        const isPast = dayjs(val).isBefore(dayjs());
        return (
          <Tag color={isPast ? "error" : "warning"}>
            {dayjs(val).format("DD MMM YYYY")}
          </Tag>
        );
      },
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          All Sent Invoices
        </Title>
        <Text type="secondary">Track all invoices sent to organizations</Text>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Card
            size="small"
            style={{ borderRadius: 10, border: "1px solid #0284c720" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Total Invoices
                </Text>
              }
              value={allInvoices.length}
              valueStyle={{ color: "#0284c7", fontSize: 22, fontWeight: 800 }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card
            size="small"
            style={{ borderRadius: 10, border: "1px solid #05966920" }}
            bodyStyle={{ padding: "14px 16px" }}
          >
            <Statistic
              title={
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Total Amount Billed
                </Text>
              }
              value={totalAmount}
              valueStyle={{ color: "#059669", fontSize: 22, fontWeight: 800 }}
              prefix={<DollarOutlined />}
              formatter={(v) => `₹${v.toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      <Card
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 0 }}
        title={
          <div
            style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0" }}
          >
            <Input
              placeholder="Search by organization, email, or notes..."
              prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 300, borderRadius: 6 }}
              allowClear
            />
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredInvoices}
          rowKey={(record, index) => `${record.orgId}-${index}`}
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
