import React, { useEffect, useState } from "react";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    GiftOutlined,
    InboxOutlined,
    PlusOutlined,
    RollbackOutlined,
    ToolOutlined,
    UploadOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Drawer,
    Empty,
    Flex,
    Form,
    Input,
    Popconfirm,
    Row,
    Select,
    Skeleton,
    Space,
    Table,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    Upload,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import apiClient from "../../../Api";
import type { EmployeeRecord } from "./EmployeeList";

const { Title, Text } = Typography;
const { Dragger } = Upload;

// ─── Types ────────────────────────────────────────────────────────────────────

type DocumentRecord = {
    _id: string;
    docName?: string;
    docType?: string;
    doc?: string;            // file URL — Document model field is "doc"
    status: "Pending" | "Received";
    createdAt: string;
};

type AllocatedItem = {
    _id: string;
    itemName: string;
    image?: string;
    status: "Pending" | "Received" | "Returned";
    issuedOn?: string;
    returnedOn?: string | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d?: string | null) =>
    d ? dayjs(d).format("DD MMM YYYY") : "—";

const docIcon = (docType?: string) => {
    if (!docType) return <FileOutlined style={{ fontSize: 22, color: "#8c8c8c" }} />;
    if (docType.includes("pdf"))
        return <FilePdfOutlined style={{ fontSize: 22, color: "#ff4d4f" }} />;
    return <FileTextOutlined style={{ fontSize: 22, color: "#1677ff" }} />;
};

const docStatusTag = (s: string) =>
    s === "Received" ? (
        <Tag icon={<CheckCircleOutlined />} color="green">Received</Tag>
    ) : (
        <Tag icon={<ClockCircleOutlined />} color="orange">Pending</Tag>
    );

const itemStatusTag = (s: string) => {
    if (s === "Received") return <Tag icon={<CheckCircleOutlined />} color="green">Received</Tag>;
    if (s === "Returned") return <Tag icon={<RollbackOutlined />} color="blue">Returned</Tag>;
    return <Tag icon={<ClockCircleOutlined />} color="orange">Pending</Tag>;
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
    employeeId: string;
    onBack: () => void;
    onEdit?: (emp: EmployeeRecord) => void;
};

// ═════════════════════════════════════════════════════════════════════════════
export default function EmployeeProfilePage({ employeeId, onBack, onEdit }: Props) {
    const [user, setUser] = useState<EmployeeRecord | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [documents, setDocuments] = useState<DocumentRecord[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);

    const [allocatedItems, setAllocatedItems] = useState<AllocatedItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(false);

    // ── Document drawer state
    const [docDrawerOpen, setDocDrawerOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
    const [docForm] = Form.useForm();
    const [docFile, setDocFile] = useState<File | null>(null);
    const [submittingDoc, setSubmittingDoc] = useState(false);

    // ── Allocated item drawer state
    const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<AllocatedItem | null>(null);
    const [itemForm] = Form.useForm();
    const [itemFile, setItemFile] = useState<File | null>(null);
    const [submittingItem, setSubmittingItem] = useState(false);

    // ─── Load employee ──────────────────────────────────────────────────────────
    const loadEmployee = async () => {
        setLoadingProfile(true);
        try {
            const res: any = await apiClient.get(`/api/employees/${employeeId}`);
            // getEmployeeById returns { user, profile } — merge for EmployeeRecord shape
            const u = res.data?.data?.user;
            const p = res.data?.data?.profile;
            setUser(u ? { ...u, profile: p } : null);
        } catch {
            message.error("Failed to load employee");
        } finally {
            setLoadingProfile(false);
        }
    };

    // ─── Load documents ─────────────────────────────────────────────────────────
    // GET /api/documents/employee/:id
    const loadDocuments = async () => {
        setLoadingDocs(true);
        try {
            const res: any = await apiClient.get(`/api/documents/employee/${employeeId}`);
            setDocuments(res.data?.data ?? []);
        } catch {
            message.error("Failed to load documents");
        } finally {
            setLoadingDocs(false);
        }
    };

    // ─── Load allocated items ───────────────────────────────────────────────────
    // GET /api/allocated-items/employee/:employeeId
    const loadItems = async () => {
        setLoadingItems(true);
        try {
            const res: any = await apiClient.get(`/api/allocated-items/employee/${employeeId}`);
            setAllocatedItems(res.data?.data ?? []);
        } catch {
            message.error("Failed to load allocated items");
        } finally {
            setLoadingItems(false);
        }
    };

    useEffect(() => {
        loadEmployee();
        loadDocuments();
        loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [employeeId]);

    // ═══════════════════════════════════════════════════════════════════════════
    //  DOCUMENTS — crud
    // ═══════════════════════════════════════════════════════════════════════════

    const openAddDoc = () => {
        setEditingDoc(null);
        docForm.resetFields();
        docForm.setFieldsValue({ status: "Pending" });
        setDocFile(null);
        setDocDrawerOpen(true);
    };

    const openEditDoc = (doc: DocumentRecord) => {
        setEditingDoc(doc);
        docForm.setFieldsValue({
            docName: doc.docName,
            docType: doc.docType,
            status: doc.status,
        });
        setDocFile(null);
        setDocDrawerOpen(true);
    };

    const handleDocSubmit = async () => {
        try {
            await docForm.validateFields();
            const v = docForm.getFieldsValue();

            // Multipart because document may have a file upload
            const fd = new FormData();
            fd.append("employeeID", employeeId);              // Document.employeeID
            if (v.docName) fd.append("docName", v.docName);  // Document.docName
            if (v.docType) fd.append("docType", v.docType);  // Document.docType
            if (v.status) fd.append("status", v.status);    // Document.status: "Pending" | "Received"
            if (docFile) fd.append("doc", docFile);         // Document.doc (file field name = "doc")

            setSubmittingDoc(true);
            if (editingDoc) {
                await apiClient.put(`/api/documents/${editingDoc._id}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Document updated");
            } else {
                await apiClient.post("/api/documents", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Document uploaded");
            }
            setDocDrawerOpen(false);
            loadDocuments();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message;
            if (msg) message.error(msg);
        } finally {
            setSubmittingDoc(false);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        try {
            await apiClient.delete(`/api/documents/${id}`);
            message.success("Document deleted");
            loadDocuments();
        } catch {
            message.error("Failed to delete document");
        }
    };

    const handleDocStatusToggle = async (doc: DocumentRecord) => {
        const newStatus = doc.status === "Pending" ? "Received" : "Pending";
        try {
            // PATCH /api/documents/:id/status  (updateDocumentStatus in fixed controller)
            await apiClient.patch(`/api/documents/${doc._id}/status`, { status: newStatus });
            message.success(`Marked as ${newStatus}`);
            loadDocuments();
        } catch {
            message.error("Failed to update status");
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  ALLOCATED ITEMS — crud
    // ═══════════════════════════════════════════════════════════════════════════

    const openAddItem = () => {
        setEditingItem(null);
        itemForm.resetFields();
        itemForm.setFieldsValue({ status: "Pending" });
        setItemFile(null);
        setItemDrawerOpen(true);
    };

    const openEditItem = (item: AllocatedItem) => {
        setEditingItem(item);
        itemForm.setFieldsValue({
            itemName: item.itemName,
            status: item.status,
        });
        setItemFile(null);
        setItemDrawerOpen(true);
    };

    const handleItemSubmit = async () => {
        try {
            await itemForm.validateFields();
            const v = itemForm.getFieldsValue();

            const fd = new FormData();
            fd.append("itemName", v.itemName);       // AllocatedItems.itemName (required)
            fd.append("issuedTo", employeeId);        // AllocatedItems.issuedTo
            fd.append("status", v.status ?? "Pending"); // AllocatedItems.status enum
            if (itemFile) fd.append("image", itemFile);   // AllocatedItems.image

            setSubmittingItem(true);
            if (editingItem) {
                await apiClient.put(`/api/allocated-items/${editingItem._id}`, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Item updated");
            } else {
                await apiClient.post("/api/allocated-items", fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                message.success("Item allocated");
            }
            setItemDrawerOpen(false);
            loadItems();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message;
            if (msg) message.error(msg);
        } finally {
            setSubmittingItem(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await apiClient.delete(`/api/allocated-items/${id}`);
            message.success("Item removed");
            loadItems();
        } catch {
            message.error("Failed to delete item");
        }
    };

    const handleItemStatusChange = async (item: AllocatedItem, status: string) => {
        try {
            await apiClient.put(`/api/allocated-items/${item._id}`, { status });
            message.success(`Marked as ${status}`);
            loadItems();
        } catch {
            message.error("Failed to update status");
        }
    };

    // ═══════════════════════════════════════════════════════════════════════════
    //  TABLE COLUMNS
    // ═══════════════════════════════════════════════════════════════════════════

    const docColumns: ColumnsType<DocumentRecord> = [
        {
            title: "Document",
            key: "doc",
            render: (_, r) => (
                <Space>
                    {docIcon(r.docType)}
                    <Space direction="vertical" size={0}>
                        <Text strong>{r.docName || "Untitled"}</Text>
                        {r.docType && <Text type="secondary" style={{ fontSize: 12 }}>{r.docType}</Text>}
                    </Space>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (v) => docStatusTag(v),
        },
        {
            title: "Uploaded",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 130,
            render: (v) => fmtDate(v),
        },
        {
            title: "File",
            key: "file",
            width: 90,
            render: (_, r) =>
                r.doc ? (
                    <Button size="small" type="link" icon={<FileOutlined />} href={r.doc} target="_blank">
                        View
                    </Button>
                ) : (
                    <Text type="secondary" style={{ fontSize: 12 }}>No file</Text>
                ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 130,
            render: (_, r) => (
                <Space>
                    <Tooltip title={r.status === "Pending" ? "Mark Received" : "Mark Pending"}>
                        <Button
                            size="small"
                            icon={r.status === "Pending" ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                            onClick={() => handleDocStatusToggle(r)}
                            style={{ borderRadius: 8 }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEditDoc(r)} style={{ borderRadius: 8 }} />
                    </Tooltip>
                    <Popconfirm title="Delete document?" onConfirm={() => handleDeleteDoc(r._id)} okButtonProps={{ danger: true }}>
                        <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const itemColumns: ColumnsType<AllocatedItem> = [
        {
            title: "Item",
            key: "item",
            render: (_, r) => (
                <Space>
                    {r.image ? (
                        <Avatar src={r.image} shape="square" size={36} style={{ borderRadius: 8 }} />
                    ) : (
                        <Avatar
                            shape="square"
                            size={36}
                            icon={<ToolOutlined />}
                            style={{ background: "#f5f5f5", color: "#8c8c8c", borderRadius: 8 }}
                        />
                    )}
                    <Text strong>{r.itemName}</Text>
                </Space>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,
            render: (v) => itemStatusTag(v),
        },
        {
            title: "Issued On",
            dataIndex: "issuedOn",
            key: "issuedOn",
            width: 130,
            render: (v) => fmtDate(v),
        },
        {
            title: "Returned On",
            dataIndex: "returnedOn",
            key: "returnedOn",
            width: 130,
            render: (v) => fmtDate(v),
        },
        {
            title: "Actions",
            key: "actions",
            width: 180,
            render: (_, r) => (
                <Space>
                    {r.status === "Pending" && (
                        <Tooltip title="Mark Received">
                            <Button
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleItemStatusChange(r, "Received")}
                                style={{ borderRadius: 8, color: "#52c41a", borderColor: "#52c41a" }}
                            />
                        </Tooltip>
                    )}
                    {r.status === "Received" && (
                        <Tooltip title="Mark Returned">
                            <Button
                                size="small"
                                icon={<RollbackOutlined />}
                                onClick={() => handleItemStatusChange(r, "Returned")}
                                style={{ borderRadius: 8, color: "#1677ff", borderColor: "#1677ff" }}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit">
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEditItem(r)} style={{ borderRadius: 8 }} />
                    </Tooltip>
                    <Popconfirm title="Remove item?" onConfirm={() => handleDeleteItem(r._id)} okButtonProps={{ danger: true }}>
                        <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // ═══════════════════════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    if (loadingProfile) {
        return (
            <div style={{ padding: 24 }}>
                <Skeleton avatar active paragraph={{ rows: 5 }} />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, margin: "0 auto" }}>

            {/* ── Header ── */}
            <Flex align="center" gap={12} style={{ marginBottom: 24 }} wrap="wrap">
                <Button icon={<ArrowLeftOutlined />} onClick={onBack} style={{ borderRadius: 8 }}>
                    Back to List
                </Button>

                <Avatar
                    size={52}
                    src={user?.profilePhoto}
                    icon={!user?.profilePhoto && <UserOutlined />}
                    style={{ background: "#e8f4ff", color: "#1677ff", flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        {user?.displayName || user?.userName}
                    </Title>
                    <Text type="secondary">
                        {user?.profile?.jobRole || "—"}
                        {user?.profile?.position ? ` · ${user.profile.position}` : ""}
                    </Text>
                </div>
                <Badge
                    status={user?.profile?.employeeStatus === "active" ? "success" : "default"}
                    text={user?.profile?.employeeStatus === "active" ? "Active" : "Inactive"}
                />
                {onEdit && user && (
                    <Button icon={<EditOutlined />} onClick={() => onEdit(user)} style={{ borderRadius: 8 }}>
                        Edit Employee
                    </Button>
                )}
            </Flex>

            {/* ── Tabs ── */}
            <Tabs
                items={[

                    // ── Overview ─────────────────────────────────────────────────────
                    {
                        key: "overview",
                        label: <Space><UserOutlined />Overview</Space>,
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={12}>
                                    <Card title="Personal Info" style={{ borderRadius: 12 }}>
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Email">{user?.email || "—"}</Descriptions.Item>
                                            <Descriptions.Item label="Phone">{user?.phoneNumber || "—"}</Descriptions.Item>
                                            <Descriptions.Item label="Username">{user?.userName || "—"}</Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card title="Job Info" style={{ borderRadius: 12 }}>
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Job Role">{user?.profile?.jobRole || "—"}</Descriptions.Item>
                                            <Descriptions.Item label="Position">{user?.profile?.position || "—"}</Descriptions.Item>
                                            <Descriptions.Item label="Hire Date">{fmtDate(user?.profile?.hireDate)}</Descriptions.Item>
                                            <Descriptions.Item label="Status">
                                                <Badge
                                                    status={user?.profile?.employeeStatus === "active" ? "success" : "default"}
                                                    text={user?.profile?.employeeStatus ?? "—"}
                                                />
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Card title="Compensation" style={{ borderRadius: 12 }}>
                                        <Descriptions column={1} size="small">
                                            <Descriptions.Item label="Salary">
                                                {user?.profile?.salary
                                                    ? `₹${user.profile.salary.toLocaleString("en-IN")}`
                                                    : "—"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Coins / Month">
                                                {user?.profile?.coinsPerMonth ?? "—"}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Total Leaves">
                                                {user?.profile?.totalLeave ?? "—"}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },

                    // ── Documents ─────────────────────────────────────────────────────
                    {
                        key: "documents",
                        label: (
                            <Space>
                                <FileTextOutlined />
                                Documents
                                {documents.length > 0 && <Tag style={{ marginLeft: 2 }}>{documents.length}</Tag>}
                            </Space>
                        ),
                        children: (
                            <Card
                                style={{ borderRadius: 12 }}
                                title={<Text strong>Employee Documents</Text>}
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={openAddDoc}
                                        style={{ borderRadius: 8 }}
                                    >
                                        Add Document
                                    </Button>
                                }
                            >
                                {loadingDocs ? (
                                    <Skeleton active />
                                ) : documents.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No documents uploaded yet">
                                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddDoc} style={{ borderRadius: 8 }}>
                                            Upload First Document
                                        </Button>
                                    </Empty>
                                ) : (
                                    <Table rowKey="_id" dataSource={documents} columns={docColumns} pagination={false} size="small" />
                                )}
                            </Card>
                        ),
                    },

                    // ── Allocated Items ───────────────────────────────────────────────
                    {
                        key: "items",
                        label: (
                            <Space>
                                <GiftOutlined />
                                Allocated Items
                                {allocatedItems.length > 0 && <Tag style={{ marginLeft: 2 }}>{allocatedItems.length}</Tag>}
                            </Space>
                        ),
                        children: (
                            <Card
                                style={{ borderRadius: 12 }}
                                title={<Text strong>Allocated Items</Text>}
                                extra={
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        onClick={openAddItem}
                                        style={{ borderRadius: 8 }}
                                    >
                                        Allocate Item
                                    </Button>
                                }
                            >
                                {loadingItems ? (
                                    <Skeleton active />
                                ) : allocatedItems.length === 0 ? (
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items allocated to this employee">
                                        <Button type="primary" icon={<PlusOutlined />} onClick={openAddItem} style={{ borderRadius: 8 }}>
                                            Allocate First Item
                                        </Button>
                                    </Empty>
                                ) : (
                                    <Table rowKey="_id" dataSource={allocatedItems} columns={itemColumns} pagination={false} size="small" />
                                )}
                            </Card>
                        ),
                    },
                ]}
            />

            {/* ══════════════════════════════════════════════════════════════════════
          Document Drawer
      ══════════════════════════════════════════════════════════════════════ */}
            <Drawer
                open={docDrawerOpen}
                onClose={() => { setDocDrawerOpen(false); docForm.resetFields(); }}
                title={
                    <Space>
                        <FileTextOutlined />
                        <Text strong>{editingDoc ? "Edit Document" : "Upload Document"}</Text>
                    </Space>
                }
                width={440}
                footer={
                    <Flex justify="space-between">
                        <Button onClick={() => setDocDrawerOpen(false)}>Cancel</Button>
                        <Button
                            type="primary"
                            loading={submittingDoc}
                            onClick={handleDocSubmit}
                            style={{ borderRadius: 8 }}
                        >
                            {editingDoc ? "Save Changes" : "Upload"}
                        </Button>
                    </Flex>
                }
            >
                <Form form={docForm} layout="vertical" requiredMark="optional">
                    <Form.Item name="docName" label="Document Name">
                        <Input placeholder="e.g. Aadhaar Card, Offer Letter" size="large" />
                    </Form.Item>

                    {/* docType → Document.docType */}
                    <Form.Item name="docType" label="Document Type">
                        <Select
                            size="large"
                            allowClear
                            placeholder="Select type"
                            options={[
                                { value: "id_proof", label: "ID Proof" },
                                { value: "contract", label: "Contract" },
                                { value: "certificate", label: "Certificate" },
                                { value: "other", label: "Other" },
                            ]}
                        />
                    </Form.Item>

                    {/* status → Document.status enum: "Pending" | "Received" */}
                    <Form.Item name="status" label="Status">
                        <Select
                            size="large"
                            options={[
                                { value: "Pending", label: <Space><ClockCircleOutlined style={{ color: "#faad14" }} />Pending</Space> },
                                { value: "Received", label: <Space><CheckCircleOutlined style={{ color: "#52c41a" }} />Received</Space> },
                            ]}
                        />
                    </Form.Item>

                    {/* File field name must be "doc" to match Document.doc + multer field */}
                    <Form.Item label="File (PDF, DOC, image)">
                        <Dragger
                            beforeUpload={(file) => { setDocFile(file); return false; }}
                            onRemove={() => setDocFile(null)}
                            maxCount={1}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        >
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to upload</p>
                        </Dragger>
                        {editingDoc?.doc && !docFile && (
                            <Text type="secondary" style={{ fontSize: 12, marginTop: 6, display: "block" }}>
                                Current:{" "}
                                <a href={editingDoc.doc} target="_blank" rel="noreferrer">View existing file</a>
                            </Text>
                        )}
                    </Form.Item>
                </Form>
            </Drawer>

            {/* ══════════════════════════════════════════════════════════════════════
          Allocated Item Drawer
      ══════════════════════════════════════════════════════════════════════ */}
            <Drawer
                open={itemDrawerOpen}
                onClose={() => { setItemDrawerOpen(false); itemForm.resetFields(); }}
                title={
                    <Space>
                        <ToolOutlined />
                        <Text strong>{editingItem ? "Edit Item" : "Allocate New Item"}</Text>
                    </Space>
                }
                width={400}
                footer={
                    <Flex justify="space-between">
                        <Button onClick={() => setItemDrawerOpen(false)}>Cancel</Button>
                        <Button
                            type="primary"
                            loading={submittingItem}
                            onClick={handleItemSubmit}
                            style={{ borderRadius: 8 }}
                        >
                            {editingItem ? "Save Changes" : "Allocate"}
                        </Button>
                    </Flex>
                }
            >
                <Form form={itemForm} layout="vertical" requiredMark="optional">
                    {/* itemName → AllocatedItems.itemName (required in model) */}
                    <Form.Item
                        name="itemName"
                        label="Item Name"
                        rules={[{ required: true, message: "Item name is required" }]}
                    >
                        <Input
                            size="large"
                            placeholder="e.g. Laptop, Uniform, Access Card, Locker Key"
                        />
                    </Form.Item>

                    {/* status → AllocatedItems.status enum: "Pending" | "Received" | "Returned" */}
                    <Form.Item name="status" label="Status">
                        <Select
                            size="large"
                            options={[
                                { value: "Pending", label: <Space><ClockCircleOutlined style={{ color: "#faad14" }} />Pending</Space> },
                                { value: "Received", label: <Space><CheckCircleOutlined style={{ color: "#52c41a" }} />Received</Space> },
                                { value: "Returned", label: <Space><RollbackOutlined style={{ color: "#1677ff" }} />Returned</Space> },
                            ]}
                        />
                    </Form.Item>

                    {/* image → AllocatedItems.image */}
                    <Form.Item label="Item Photo (optional)">
                        <Upload
                            beforeUpload={(file) => { setItemFile(file); return false; }}
                            onRemove={() => setItemFile(null)}
                            maxCount={1}
                            listType="picture"
                            accept=".jpg,.jpeg,.png,.webp"
                        >
                            <Button icon={<UploadOutlined />}>Upload Photo</Button>
                        </Upload>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}