// src/components/admin/OrganizationList.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Input,
  Button,
  Tooltip,
  message,
  Badge,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { CopyOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminListOrgs } from "../../Api";

const { Title, Text } = Typography;

type OrgType = "restaurant" | "retail" | "hospital" | "logistics" | "other";

type OrgModules = {
  pos?: boolean;
  hrm?: boolean;
  inventory?: boolean;
  payroll?: boolean;
  ai?: boolean;
};

type OwnedBy = {
  _id: string;
  displayName?: string;
  email?: string;
};

export type Organization = {
  _id: string;
  name: string;
  type: OrgType;
  slug?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logo?: string;
  theme?: { primary?: string };
  modules?: OrgModules;
  ownedBy?: OwnedBy;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse = {
  statusCode?: number;
  data?: {
    count: number;
    data: Organization[];
  };
};

const moduleLabelMap: Array<{ key: keyof OrgModules; label: string; color: string }> = [
  { key: "pos", label: "POS", color: "blue" },
  { key: "hrm", label: "HRM", color: "purple" },
  { key: "inventory", label: "Inventory", color: "geekblue" },
  { key: "payroll", label: "Payroll", color: "gold" },
  { key: "ai", label: "AI", color: "green" },
];

export default function OrganizationList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [count, setCount] = useState(0);
  const [q, setQ] = useState("");

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = (await adminListOrgs()) as any as ApiResponse;
      const payload : any = res?.data?.data;
      setCount(payload?.count ?? 0);
      setOrgs(payload?.data ?? []);
    } catch (e: any) {
      message.error(e?.message || "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return orgs;

    return orgs.filter((o) => {
      const ownedByText = `${o.ownedBy?.displayName ?? ""} ${o.ownedBy?.email ?? ""}`.toLowerCase();
      return (
        o.name?.toLowerCase().includes(query) ||
        (o.slug ?? "").toLowerCase().includes(query) ||
        (o.type ?? "").toLowerCase().includes(query) ||
        (o.contactEmail ?? "").toLowerCase().includes(query) ||
        (o.contactPhone ?? "").toLowerCase().includes(query) ||
        ownedByText.includes(query) ||
        o._id.toLowerCase().includes(query)
      );
    });
  }, [orgs, q]);

  const columns: ColumnsType<Organization> = [
    {
      title: "Organization",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 260,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Space size={8}>
            <Text strong>{r.name}</Text>
            {r.isActive === false ? <Tag color="default">Inactive</Tag> : <Tag color="green">Active</Tag>}
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.type?.toUpperCase()} {r.slug ? `• ${r.slug}` : ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Modules",
      key: "modules",
      width: 260,
      render: (_, r) => {
        const m = r.modules ?? {};
        const enabled = moduleLabelMap.filter((x) => m?.[x.key]);
        if (!enabled.length) return <Tag>None</Tag>;
        return (
          <Space wrap>
            {enabled.map((x) => (
              <Tag key={x.key} color={x.color}>
                {x.label}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: "Owned By",
      key: "ownedBy",
      width: 220,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text>{r.ownedBy?.displayName ?? "-"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.ownedBy?.email ?? ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 240,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Text>{r.contactEmail ?? "-"}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.contactPhone ?? ""}
          </Text>
        </Space>
      ),
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 260,
      render: (v) => <Text>{v || "-"}</Text>,
    },
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
      width: 260,
      render: (id: string) => (
        <Space>
          <Text code style={{ fontSize: 12 }}>
            {id}
          </Text>
          <Tooltip title="Copy org id">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={async () => {
                await navigator.clipboard.writeText(id);
                message.success("Copied");
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: 140,
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/organizations/${r._id}`)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      style={{ borderRadius: 16 }}
      bodyStyle={{ padding: 16 }}
      title={
        <Space direction="vertical" size={0} style={{ width: "100%" }}>
          <Space style={{ width: "100%", justifyContent: "space-between" }}>
            <Space align="baseline">
              <Title level={4} style={{ margin: 0 }}>
                Organizations
              </Title>
              <Badge count={count} showZero />
            </Space>

            <Space>
              <Input
                allowClear
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, slug, id, email..."
                prefix={<SearchOutlined />}
                style={{ width: 320 }}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchOrgs} loading={loading}>
                Refresh
              </Button>
            </Space>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Showing {filtered.length} of {count}
          </Text>
        </Space>
      }
    >
      <Table<Organization>
        rowKey="_id"
        loading={loading}
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1250 }}
      />
    </Card>
  );
}