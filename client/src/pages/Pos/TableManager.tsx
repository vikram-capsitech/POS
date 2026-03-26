import React, { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Empty,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TableOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { getTables, createTable, updateTable, deleteTable } from "../../Api";

const { Title, Text } = Typography;

/* ─── Types ─────────────────────────────────────────────────── */
type TableStatus = "available" | "occupied" | "reserved" | "billing" | "cleaning";

interface RestaurantTable {
  _id: string;
  number: number;
  seats: number;
  floor: string;
  status: TableStatus;
  currentOrderID?: string | null;
}

/* ─── Constants ──────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  TableStatus,
  { color: string; bg: string; border: string; dot: string; label: string; emoji: string }
> = {
  available: { color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", label: "Available", emoji: "🟢" },
  occupied:  { color: "#b91c1c", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", label: "Occupied",  emoji: "🔴" },
  reserved:  { color: "#b45309", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", label: "Reserved",  emoji: "🟡" },
  billing:   { color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe", dot: "#8b5cf6", label: "Billing",   emoji: "🟣" },
  cleaning:  { color: "#0369a1", bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", label: "Cleaning",  emoji: "🔵" },
};

const FLOORS = ["Ground", "First", "Second", "Rooftop", "Basement", "Outdoor"];

/* ─── Table Card ─────────────────────────────────────────────── */
function TableCard({
  table,
  onEdit,
  onDelete,
}: {
  table: RestaurantTable;
  onEdit: (t: RestaurantTable) => void;
  onDelete: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[table.status] ?? STATUS_CONFIG.available;

  return (
    <div
      style={{
        borderRadius: 18,
        border: `1.5px solid ${cfg.border}`,
        background: "#fff",
        overflow: "hidden",
        transition: "box-shadow .2s, transform .2s",
        boxShadow: "0 2px 8px #0000000a",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${cfg.dot}28`;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px #0000000a";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Top accent strip */}
      <div style={{ height: 5, background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.dot}88)` }} />

      <div style={{ padding: "16px 16px 12px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            {/* Table number large */}
            <div style={{ fontSize: 32, fontWeight: 900, color: "#0f172a", lineHeight: 1, letterSpacing: -1 }}>
              T-{table.number}
            </div>
            <div style={{ marginTop: 6 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  fontSize: 12,
                  fontWeight: 700,
                  color: cfg.color,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: cfg.dot,
                    display: "inline-block",
                    ...(table.status === "occupied" || table.status === "billing" ? { animation: "tm-pulse 1.2s ease infinite" } : {}),
                  }}
                />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Seat count circle */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${cfg.dot}22, ${cfg.dot}11)`,
              border: `2px solid ${cfg.border}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 18, fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
              {table.seats}
            </span>
            <span style={{ fontSize: 9, color: cfg.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              seats
            </span>
          </div>
        </div>

        {/* Floor badge */}
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              fontSize: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "3px 10px",
              color: "#475569",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            🏢 {table.floor || "Ground"}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          <Tooltip title="Edit">
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(table)} style={{ borderRadius: 8 }} />
          </Tooltip>
          <Popconfirm
            title={`Delete Table T-${table.number}?`}
            description="This action cannot be undone."
            onConfirm={() => onDelete(table._id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button size="small" danger icon={<DeleteOutlined />} style={{ borderRadius: 8 }} />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function TableManager() {
  const [tables, setTables]         = useState<RestaurantTable[]>([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [filterFloor, setFilterFloor]   = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form] = Form.useForm();

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await getTables();
      setTables(res?.data?.data ?? res?.data ?? []);
    } catch {
      message.error("Failed to load tables");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Open modal ── */
  const openAdd = () => {
    setEditingTable(null);
    form.resetFields();
    form.setFieldsValue({ floor: "Ground", seats: 4 });
    setModalOpen(true);
  };

  const openEdit = (t: RestaurantTable) => {
    setEditingTable(t);
    form.setFieldsValue({ number: t.number, seats: t.seats, floor: t.floor, status: t.status });
    setModalOpen(true);
  };

  /* ── Save ── */
  const handleSave = async () => {
    let values: any;
    try {
      values = await form.validateFields();
    } catch {
      return; // antd already shows field errors
    }

    setSaving(true);
    try {
      if (editingTable) {
        await updateTable(editingTable._id, values);
        message.success(`Table T-${values.number ?? editingTable.number} updated ✓`);
      } else {
        await createTable({ number: values.number, seats: values.seats, floor: values.floor });
        message.success(`Table T-${values.number} created ✓`);
      }
      setModalOpen(false);
      form.resetFields();
      load();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? e?.message ?? "Failed to save table";
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    try {
      await deleteTable(id);
      message.success("Table deleted");
      load();
    } catch {
      message.error("Failed to delete table");
    }
  };

  /* ── Filtering ── */
  const allFloors = Array.from(new Set(tables.map((t) => t.floor || "Ground")));
  const filtered = tables.filter((t) => {
    const floorOk  = filterFloor  === "all" || (t.floor || "Ground") === filterFloor;
    const statusOk = filterStatus === "all" || t.status === filterStatus;
    return floorOk && statusOk;
  });

  /* ── Stats ── */
  const stats = {
    total:     tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied:  tables.filter((t) => t.status === "occupied").length,
    other:     tables.filter((t) => !["available", "occupied"].includes(t.status)).length,
  };

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`
        @keyframes tm-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .tm-pill { padding:5px 14px; border-radius:20px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; font-weight:700; font-size:13px; color:#64748b; transition:all .15s; }
        .tm-pill.active { background:#1e293b; border-color:#1e293b; color:#fff; }
        .tm-pill:hover:not(.active) { border-color:#334155; color:#334155; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <TableOutlined style={{ fontSize:22, color:"#fff" }} />
          </div>
          <div>
            <Title level={4} style={{ margin:0, color:"#0f172a" }}>Table Manager</Title>
            <Text type="secondary" style={{ fontSize:13 }}>Manage your restaurant floor layout</Text>
          </div>
          <Badge count={tables.length} style={{ backgroundColor:"#6366f1", marginLeft:4 }} />
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openAdd}
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:10, fontWeight:600 }}
          >
            Add Table
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <Row gutter={[14, 14]} style={{ marginBottom:20 }}>
        {[
          { label:"Total Tables", value:stats.total,     color:"#6366f1", icon:"🪑" },
          { label:"Available",    value:stats.available,  color:"#22c55e", icon:"✅" },
          { label:"Occupied",     value:stats.occupied,   color:"#ef4444", icon:"🔴" },
          { label:"Other",        value:stats.other,      color:"#f59e0b", icon:"⚠️" },
        ].map((s) => (
          <Col xs={12} sm={6} key={s.label}>
            <div style={{ background:"#fff", border:`1.5px solid ${s.color}25`, borderRadius:14, padding:"13px 16px", display:"flex", alignItems:"center", gap:10, boxShadow:`0 2px 8px ${s.color}10` }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:11, color:"#64748b", fontWeight:700, marginTop:2, textTransform:"uppercase", letterSpacing:.5 }}>{s.label}</div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      {/* ── Filters ── */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center" }}>
        <Text style={{ fontWeight:700, color:"#64748b", fontSize:13 }}>Floor:</Text>
        {["all", ...allFloors].map((f) => (
          <button key={f} className={`tm-pill${filterFloor === f ? " active" : ""}`} onClick={() => setFilterFloor(f)}>
            {f === "all" ? "All" : f}
          </button>
        ))}
        <div style={{ marginLeft:"auto" }}>
          <Select
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width:155 }}
            options={[
              { label:"All Statuses", value:"all" },
              ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ label: `${v.emoji} ${v.label}`, value: k })),
            ]}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", paddingTop:80 }}><Spin size="large" /></div>
      ) : filtered.length === 0 ? (
        <Empty
          description={tables.length === 0 ? 'No tables yet. Click "Add Table" to get started.' : "No tables match the selected filters."}
          style={{ marginTop:60 }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered
            .sort((a, b) => a.number - b.number)
            .map((t) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={t._id}>
                <TableCard table={t} onEdit={openEdit} onDelete={handleDelete} />
              </Col>
            ))}
        </Row>
      )}

      {/* ── Status Legend ── */}
      {tables.length > 0 && (
        <div style={{ marginTop:28, padding:"12px 18px", background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
          <Text style={{ fontWeight:700, fontSize:11, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1 }}>Legend:</Text>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:9, height:9, borderRadius:"50%", background:v.dot }} />
              <Text style={{ fontSize:12, color:"#475569", fontWeight:600 }}>{v.label}</Text>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <Modal
        title={
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {editingTable ? <EditOutlined style={{ color:"#fff", fontSize:14 }} /> : <PlusOutlined style={{ color:"#fff", fontSize:14 }} />}
            </div>
            <span style={{ fontWeight:700 }}>
              {editingTable ? `Edit Table T-${editingTable.number}` : "Add New Table"}
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={handleSave}
        okText={editingTable ? "Save Changes" : "Create Table"}
        confirmLoading={saving}
        okButtonProps={{ style:{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", border:"none", borderRadius:8, fontWeight:700 } }}
        width={420}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop:16 }}>
          {/* Table Number */}
          <Form.Item
            name="number"
            label={<span style={{ fontWeight:600 }}>Table Number</span>}
            rules={[{ required:true, message:"Table number is required" }, { type:"number", min:1, max:999, message:"Must be between 1 and 999" }]}
          >
            <InputNumber
              min={1}
              max={999}
              style={{ width:"100%" }}
              size="large"
              placeholder="e.g. 1, 2, 3…"
            />
          </Form.Item>

          {/* Seating Capacity */}
          <Form.Item
            name="seats"
            label={<span style={{ fontWeight:600 }}>Seating Capacity</span>}
            rules={[{ required:true, message:"Seating capacity is required" }, { type:"number", min:1, max:30, message:"Must be between 1 and 30" }]}
          >
            <InputNumber
              min={1}
              max={30}
              style={{ width:"100%" }}
              size="large"
              placeholder="e.g. 2, 4, 6…"
            />
          </Form.Item>

          {/* Floor */}
          <Form.Item
            name="floor"
            label={<span style={{ fontWeight:600 }}>Floor</span>}
            rules={[{ required:true, message:"Please select a floor" }]}
          >
            <Select
              size="large"
              showSearch
              placeholder="Select floor"
              options={FLOORS.map((f) => ({ label:`🏢 ${f}`, value:f }))}
            />
          </Form.Item>

          {/* Status — only shown when editing */}
          {editingTable && (
            <Form.Item
              name="status"
              label={<span style={{ fontWeight:600 }}>Status</span>}
            >
              <Select
                size="large"
                options={Object.entries(STATUS_CONFIG).map(([k, v]) => ({
                  label:(
                    <span style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ width:10, height:10, borderRadius:"50%", background:v.dot, display:"inline-block" }} />
                      {v.label}
                    </span>
                  ),
                  value:k,
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
