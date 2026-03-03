import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button, Col, Drawer, Empty, Flex, Input,
  Modal, Row, Select, Spin, Typography, message, Divider,
} from "antd";
import {
  MinusCircleOutlined, PlusCircleOutlined, ShoppingCartOutlined,
  DeleteOutlined, CheckOutlined, ReloadOutlined, SearchOutlined,
} from "@ant-design/icons";
import {
  getOrders, getTables, getMenuItems, createOrder, addOrderItems, updateOrder,
} from "../../Api";
import { useAuthStore } from "../../Store/store";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { cleanTable } from "../../Api";
import { LogOut } from "lucide-react";

const { Text, Title } = Typography;

/* ─── Types ─────────────────────────────────────────────────────────────── */
type MenuItem = { _id: string; name: string; category: string; price: number; isVeg: boolean; available: boolean; prepTime?: number; };
type PosTable = { _id: string; number: number; seats: number; status: string; floor?: string; currentOrderID?: string | null; reservedBy?: { name?: string; phone?: string; time?: string; type?: "online" | "offline"; partySize?: number; notes?: string; }; };
type CartItem = { menuItem: string; name: string; price: number; quantity: number; };

/* ─── Animations ─────────────────────────────────────────────────────────── */
const CSS = `
  @keyframes wv-cardIn   { from { opacity: 0; transform: translateY(16px) scale(.95); } to { opacity: 1; transform: none; } }
  @keyframes wv-breathe  { 0%, 100% { opacity: 1; } 50% { opacity: .45; } }
  @keyframes wv-ring     { 0%, 100% { box-shadow: 0 0 0 0 var(--rc); } 55% { box-shadow: 0 0 0 8px transparent; } }
  @keyframes wv-shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes wv-badgePop { 0% { opacity: 0; transform: scale(0) rotate(-15deg); } 65% { transform: scale(1.2) rotate(3deg); } 100% { opacity: 1; transform: none; } }
  @keyframes wv-chairIn  { 0% { opacity: 0; transform: scale(0); } 65% { transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }

  .wv-card {
    animation: wv-cardIn .38s cubic-bezier(.22,.68,0,1.2) both;
    transition: transform .2s cubic-bezier(.22,.68,0,1.2), box-shadow .2s;
    cursor: pointer;
  }
  .wv-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 10px 28px rgba(0,0,0,.12) !important; }
  .wv-card.occupied { animation: wv-cardIn .38s cubic-bezier(.22,.68,0,1.2) both, wv-ring 2.5s ease infinite .8s; }
  .wv-card.reserved { animation: wv-cardIn .38s cubic-bezier(.22,.68,0,1.2) both, wv-ring 3s ease infinite 1s; }
  .wv-card.billing  { animation: wv-cardIn .38s cubic-bezier(.22,.68,0,1.2) both, wv-ring 3s ease infinite 1s; }

  .wv-chair { animation: wv-chairIn .32s cubic-bezier(.22,.68,0,1.2) both; }
  .wv-dot   { animation: wv-breathe 2s ease infinite; }

  .wv-badge { animation: wv-badgePop .35s cubic-bezier(.22,.68,0,1.2) both; }

  .wv-place-btn {
    background-size: 200% auto;
    background-image: linear-gradient(90deg, #15803d 0%, #22c55e 40%, #4ade80 50%, #22c55e 60%, #15803d 100%);
    animation: wv-shimmer 2.5s linear infinite;
  }
  .wv-menu-row { transition: background .13s, transform .13s; }
  .wv-menu-row:hover { background: #f0f7ff !important; transform: translateX(3px); }
  .wv-stat { transition: transform .15s, box-shadow .15s; cursor: pointer; }
  .wv-stat:hover { transform: translateY(-3px); }
`;

/* ─── Exact helpers copied from TableLayoutCard.tsx ─────────────────────── */
function clampSeats(seats: number) {
  if (!Number.isFinite(seats) || seats <= 0) return 0;
  return Math.min(Math.max(Math.round(seats), 1), 12);
}

function getSeatAngles(seats: number): number[] {
  switch (seats) {
    case 1: return [270];
    case 2: return [90, 270];
    case 3: return [90, 210, 330];
    case 4: return [0, 90, 180, 270];
    case 5: return [270, 342, 54, 126, 198];
    case 6: return [0, 60, 120, 180, 240, 300];
    case 8: return [0, 45, 90, 135, 180, 225, 270, 315];
    default: {
      const step = 360 / seats;
      return Array.from({ length: seats }, (_, i) => i * step);
    }
  }
}

/* colour helpers matching TableLayoutCard.tsx exactly */
function seatFill(status: string) {
  if (status === "occupied") return "#ef4444";
  if (status === "reserved") return "#f59e0b";
  if (status === "billing") return "#722ed1";
  if (status === "cleaning") return "#0ea5e9";
  return "#22c55e";
}
function tableFill(status: string) {
  if (status === "occupied") return "#fee2e2";
  if (status === "reserved") return "#ffedd5";
  if (status === "billing") return "#f9f0ff";
  if (status === "cleaning") return "#e0f2fe";
  return "#dcfce7";
}
function strokeColor(status: string) {
  if (status === "occupied") return "#ef4444";
  if (status === "reserved") return "#f59e0b";
  if (status === "billing") return "#722ed1";
  if (status === "cleaning") return "#0ea5e9";
  return "#22c55e";
}
function textColor(status: string) {
  if (status === "occupied") return "#cf1322";
  if (status === "reserved") return "#d46b08";
  if (status === "billing") return "#531dab";
  if (status === "cleaning") return "#0369a1";
  return "#15803d";
}
function chipBg(status: string) {
  if (status === "occupied") return "#fee2e2";
  if (status === "reserved") return "#fef9c3";
  if (status === "billing") return "#ede9fe";
  if (status === "cleaning") return "#e0f2fe";
  return "#dcfce7";
}
function statusLabel(status: string) {
  if (status === "occupied") return "Occupied";
  if (status === "reserved") return "Reserved";
  if (status === "billing") return "Billing";
  if (status === "cleaning") return "Cleaning";
  return "Available";
}
function statusEmoji(status: string) {
  if (status === "occupied") return "🔴";
  if (status === "reserved") return "🟡";
  if (status === "billing") return "🟣";
  if (status === "cleaning") return "🧹";
  return "🟢";
}
const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ─── TableSeatSVG — 1:1 port of the working SVG from TableLayoutCard ─────
   Key points preserved exactly:
   • cx=80, cy=80, viewBox="0 0 160 160"
   • chairRingR=52, chairW=14, chairH=10
   • shape = s<=4 ? "square" : "round"  (same as WaiterTableMapView)
   • tableR = shape==="round" ? 28 : 26
   • rotate = deg + 90   (face inward)
   • seat rect FIRST, back rect SECOND  (same order as reference)
   • table drawn AFTER chairs so it sits on top
──────────────────────────────────────────────────────────────────────────── */
function TableSeatSVG({
  seats,
  status,
  tableNumber,
  cardDelay,
}: {
  seats: number;
  status: string;
  tableNumber: number;
  cardDelay: number;
}) {
  const s = clampSeats(seats);
  const angles = getSeatAngles(s);
  const cx = 80, cy = 80;
  const chairRingR = 52;
  const chairW = 14;
  const chairH = 10;
  const shape = s <= 4 ? "square" : "round";   // matches WaiterTableMapView
  const tableR = shape === "round" ? 28 : 26;
  const isAvail = status === "available";
  const fill = seatFill(status);
  const stroke = strokeColor(status);
  const tFill = tableFill(status);
  const tText = textColor(status);

  return (
    <svg width={160} height={160} viewBox="0 0 160 160" aria-label={`Table ${tableNumber}`}>

      {/* ── Chairs rendered BEFORE table (table sits on top) ── */}
      {angles.map((deg, idx) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + chairRingR * Math.cos(rad);
        const y = cy + chairRingR * Math.sin(rad);
        const rot = deg + 90;   // face inward toward table center

        return (
          <g
            key={idx}
            transform={`translate(${x}, ${y}) rotate(${rot})`}
            className="wv-chair"
            style={{ animationDelay: `${cardDelay + idx * 45 + 100}ms` }}
          >
            {/* chair seat — exactly as in TableLayoutCard */}
            <rect
              x={-chairW / 2}
              y={-chairH / 2}
              width={chairW}
              height={chairH}
              rx={3}
              fill={fill}
              opacity={isAvail ? 0.55 : 0.85}
              stroke={stroke}
              strokeWidth={1}
            />
            {/* chair back — exactly as in TableLayoutCard */}
            <rect
              x={-chairW / 2}
              y={-chairH / 2 - 6}
              width={chairW}
              height={4}
              rx={2}
              fill={fill}
              opacity={isAvail ? 0.4 : 0.75}
            />
          </g>
        );
      })}

      {/* ── Table surface (drawn after chairs) ── */}
      {shape === "round" ? (
        <circle cx={cx} cy={cy} r={tableR} fill={tFill} stroke={stroke} strokeWidth={2} />
      ) : (
        <rect
          x={cx - tableR} y={cy - tableR}
          width={tableR * 2} height={tableR * 2}
          rx={10} fill={tFill} stroke={stroke} strokeWidth={2}
        />
      )}

      {/* ── Table label — show number + "seats" ── */}
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="middle"
        fontSize={13} fontWeight={800} fill={tText} fontFamily="system-ui, sans-serif">
        T{tableNumber}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fill={tText} opacity={0.65} fontFamily="system-ui, sans-serif">
        {s} seats
      </text>

      {/* ── Pulsing indicator dot for non-available tables ── */}
      {!isAvail && (
        <circle
          cx={cx + tableR - 5} cy={cy - tableR + 5}
          r={5} fill={stroke}
          className="wv-dot"
        />
      )}
    </svg>
  );
}

/* ─── Table Card ─────────────────────────────────────────────────────────── */
function TableCard({ table, idx, onClick }: { table: PosTable; idx: number; onClick: () => void; }) {
  const stroke = strokeColor(table.status);
  const delay = idx * 55;

  return (
    <div
      onClick={onClick}
      className={`wv-card ${table.status}`}
      style={{
        animationDelay: `${delay}ms`,
        // @ts-ignore
        "--rc": stroke + "55",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px 12px 10px",
        background: "#ffffff",
        borderRadius: 20,
        border: `2px solid ${stroke}`,
        boxShadow: `0 2px 10px ${stroke}22`,
        userSelect: "none",
      }}
    >
      <TableSeatSVG
        seats={table.seats}
        status={table.status}
        tableNumber={table.number}
        cardDelay={delay}
      />
      {/* Status pill */}
      <div style={{
        marginTop: 6,
        padding: "4px 14px",
        borderRadius: 20,
        background: chipBg(table.status),
        border: `1.5px solid ${stroke}`,
        fontSize: 10,
        fontWeight: 800,
        color: textColor(table.status),
        letterSpacing: 1,
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        gap: 5,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: "50%", background: stroke,
          display: "inline-block",
          animation: table.status !== "available" ? "wv-breathe 2s ease infinite" : "none",
        }} />
        {statusLabel(table.status)}
      </div>
    </div>
  );
}

/* ─── Stat Chip ──────────────────────────────────────────────────────────── */
function StatChip({ status, count, active, onClick, delay }: { status: string; count: number; active: boolean; onClick: () => void; delay: number; }) {
  const stroke = strokeColor(status);
  return (
    <div className="wv-stat" onClick={onClick} style={{
      animationDelay: `${delay}ms`,
      background: active ? chipBg(status) : "#fff",
      border: `1.5px solid ${active ? stroke : "#e5e7eb"}`,
      borderRadius: 14,
      padding: "10px 18px",
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: active ? `0 0 16px ${stroke}44` : "0 1px 4px #0000000a",
      transition: "all .18s",
    }}>
      <span style={{ fontSize: 20 }}>{statusEmoji(status)}</span>
      <div>
        <div style={{ fontSize: 22, fontWeight: 900, color: textColor(status), lineHeight: 1 }}>{count}</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: textColor(status), opacity: .75, textTransform: "uppercase", letterSpacing: .8 }}>
          {statusLabel(status)}
        </div>
      </div>
    </div>
  );
}

/* ─── Table Detail Modal ─────────────────────────────────────────────────── */
function DetailModal({ table, open, onClose, onOpenOrder, orders, loading, onClean }: {
  table: PosTable | null; open: boolean; onClose: () => void;
  onOpenOrder: () => void; orders: any[]; loading: boolean;
  onClean: (tableId: string, photo: string) => void;
}) {
  if (!table) return null;
  const stroke = strokeColor(table.status);
  const tText = textColor(table.status);
  const cBg = chipBg(table.status);
  const active = orders[0];
  const isCleaning = table.status === "cleaning";

  const fileRef = React.useRef<HTMLInputElement>(null);
  const [cleanPreview, setCleanPreview] = React.useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCleanPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={460} title={null}
      styles={{ content: { padding: 0, borderRadius: 22, overflow: "hidden" } }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${cBg},#fff)`, borderBottom: `3px solid ${stroke}`, padding: "22px 24px 18px" }}>
        <Flex justify="space-between" align="flex-start">
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: tText }}>{isCleaning ? "🧹" : ""} Table {table.number}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{table.seats} seats · {table.floor ?? "Ground Floor"}</div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 800, background: stroke, color: "#fff", padding: "5px 14px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" }}>
            {statusLabel(table.status)}
          </span>
        </Flex>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {/* CLEANING flow */}
        {isCleaning && (
          <div>
            <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              The table was just paid. Please clean it and upload a photo to mark it available again.
            </p>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: "100%", height: 160, borderRadius: 14, border: "2px dashed #0ea5e9",
                background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", overflow: "hidden", marginBottom: 16, transition: "border-color .15s",
              }}
            >
              {cleanPreview
                ? <img src={cleanPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ textAlign: "center", color: "#0ea5e9" }}>
                  <div style={{ fontSize: 36 }}>📷</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>Tap to take / upload photo</div>
                </div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
            <button
              onClick={() => { onClean(table._id, cleanPreview ?? ""); setCleanPreview(null); }}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff", fontWeight: 900, fontSize: 15, cursor: "pointer",
              }}
            >
              ✓ Mark as Clean & Available
            </button>
          </div>
        )}

        {/* Reservation */}
        {!isCleaning && table.status === "reserved" && table.reservedBy && (
          <div style={{ background: cBg, border: `1.5px solid ${stroke}55`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: tText, marginBottom: 10 }}>📋 Reservation Details</div>
            {([
              ["👤", "Guest", table.reservedBy.name ?? "—"],
              ["📞", "Phone", table.reservedBy.phone ?? "—"],
              ["🕐", "Time", table.reservedBy.time ? dayjs(table.reservedBy.time).format("DD MMM, hh:mm A") : "—"],
              ["👥", "Party", table.reservedBy.partySize ? `${table.reservedBy.partySize} people` : "—"],
            ] as const).map(([ic, lb, vl]) => (
              <Flex key={String(lb)} justify="space-between" style={{ padding: "6px 0", borderBottom: `1px solid ${stroke}22` }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>{ic} {lb}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: tText }}>{vl}</span>
              </Flex>
            ))}
          </div>
        )}

        {/* Active order */}
        {!isCleaning && (table.status === "occupied" || table.status === "billing") && (
          loading
            ? <Flex justify="center" style={{ padding: 24 }}><Spin /></Flex>
            : active
              ? (
                <div style={{ background: cBg, border: `1.5px solid ${stroke}55`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: tText }}>🧾 Current Order</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: tText, background: "#fff", border: `1px solid ${stroke}`, padding: "2px 10px", borderRadius: 20 }}>
                      #{active._id?.slice(-6).toUpperCase()}
                    </span>
                  </Flex>
                  <div style={{ maxHeight: 200, overflowY: "auto" }}>
                    {active.items?.map((it: any, i: number) => (
                      <Flex key={i} justify="space-between" align="center" style={{ padding: "5px 0", borderBottom: `1px solid ${stroke}22` }}>
                        <Flex gap={8} align="center">
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: it.menuItem?.isVeg ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, color: "#374151" }}>{it.menuItem?.name ?? "Item"}</span>
                          <span style={{ fontSize: 11, color: "#9ca3af" }}>×{it.quantity}</span>
                        </Flex>
                        <span style={{ fontSize: 13, fontWeight: 700, color: tText }}>₹{(it.price * it.quantity).toLocaleString("en-IN")}</span>
                      </Flex>
                    ))}
                  </div>
                  <Flex justify="space-between" align="center" style={{ marginTop: 12, paddingTop: 10, borderTop: `2px solid ${stroke}44` }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: tText }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 900, color: stroke }}>₹{active.total?.toLocaleString("en-IN") ?? 0}</span>
                  </Flex>
                </div>
              )
              : <Empty description={<span style={{ color: "#9ca3af" }}>No active order</span>} style={{ marginBottom: 16 }} />
        )}

        {/* Actions */}
        {!isCleaning && (
          <Flex gap={10} vertical>
            <button
              onClick={() => { onClose(); onOpenOrder(); }}
              className="wv-place-btn"
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, border: "none", color: "#fff", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 20px ${stroke}44` }}
            >
              <ShoppingCartOutlined />
              {table.status === "available" ? "Take New Order" : table.status === "occupied" ? "Add More Items" : table.status === "billing" ? "Go to Order Terminal" : "Seat & Order"}
            </button>
            {table.status === "reserved" && (
              <Button block size="large" style={{ borderRadius: 14, height: 46 }} onClick={onClose}>✓ Mark as Arrived</Button>
            )}
          </Flex>
        )}
      </div>
    </Modal>
  );
}

/* ─── Main WaiterView ────────────────────────────────────────────────────── */
export default function WaiterView() {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const restaurantId = useAuthStore(s => s.session.restaurantId);
  const session = useAuthStore(s => s.session);

  const [tables, setTables] = useState<PosTable[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailTable, setDetailTable] = useState<PosTable | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrders, setDetailOrders] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState<PosTable | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [menuCategory, setMenuCategory] = useState("All");
  const [placing, setPlacing] = useState(false);
  const [tableOrders, setTableOrders] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [billModal, setBillModal] = useState(false);
  const [floorFilter, setFloorFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const clearSession = useAuthStore((s) => s.clearSession);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sid = restaurantId || orgId;
      const [tR, mR] = await Promise.all([getTables(), getMenuItems({ orgId: sid })]);
      setTables(tR?.data?.data ?? tR?.data ?? []);
      setMenu((mR?.data?.data ?? mR?.data ?? []).filter((i: MenuItem) => i.available));
    } catch { message.error("Failed to load tables/menu"); }
    finally { setLoading(false); }
  }, [restaurantId, orgId]);

  useEffect(() => { load(); }, [load]);

  const fetchOrders = async (table: PosTable) => {
    setDetailLoading(true);
    try {
      const res: any = await getOrders({ restaurantId: restaurantId || orgId });
      const all: any[] = res?.data?.data ?? res?.data ?? [];
      const filtered = all.filter(o =>
        (o.tableID === table._id || o.tableID?._id === table._id) &&
        !["paid", "cancelled"].includes(o.status)
      );
      setDetailOrders(filtered);
      return filtered;
    } catch { return []; }
    finally { setDetailLoading(false); }
  };

  const handleClick = async (table: PosTable) => {
    // Cleaning tables: show clean modal inline
    if (table.status === "cleaning") {
      setDetailTable(table);
      setDetailOpen(true);
      setDetailOrders([]);
      return;
    }
    // Navigate directly to full-page order terminal
    const orderId = table.currentOrderID;
    if (orderId) {
      navigate(`/pos/${orgId}/order/${table._id}?orderId=${orderId}`);
    } else {
      navigate(`/pos/${orgId}/order/${table._id}`);
    }
  };

  const openTerminal = async (table: PosTable, orders: any[]) => {
    const orderId = orders[0]?._id;
    if (orderId) {
      navigate(`/pos/${orgId}/order/${table._id}?orderId=${orderId}`);
    } else {
      navigate(`/pos/${orgId}/order/${table._id}`);
    }
  };

  const floors = useMemo(() =>
    ["All", ...Array.from(new Set(tables.map(t => t.floor ?? "Ground")))], [tables]);

  const filteredTables = useMemo(() =>
    tables.filter(t =>
      (floorFilter === "All" || (t.floor ?? "Ground") === floorFilter) &&
      (statusFilter === "All" || t.status === statusFilter)
    ), [tables, floorFilter, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    tables.forEach(t => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [tables]);

  const categories = useMemo(() =>
    ["All", ...Array.from(new Set(menu.map(m => m.category)))], [menu]);

  const filteredMenu = useMemo(() => {
    const q = menuSearch.toLowerCase();
    return menu.filter(m =>
      (!q || m.name.toLowerCase().includes(q)) &&
      (menuCategory === "All" || m.category === menuCategory)
    );
  }, [menu, menuSearch, menuCategory]);

  const addToCart = (item: MenuItem) => setCart(prev => {
    const ex = prev.find(c => c.menuItem === item._id);
    return ex
      ? prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c)
      : [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
  });

  const removeFromCart = (id: string) => setCart(prev => {
    const ex = prev.find(c => c.menuItem === id);
    return ex && ex.quantity > 1
      ? prev.map(c => c.menuItem === id ? { ...c, quantity: c.quantity - 1 } : c)
      : prev.filter(c => c.menuItem !== id);
  });

  const clearCart = () => setCart([]);
  const cartTotal = useMemo(() => cart.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((a, i) => a + i.quantity, 0), [cart]);

  const placeOrder = async () => {
    if (!cart.length) { message.warning("Cart is empty"); return; }
    if (!selectedTable) return;
    setPlacing(true);
    try {
      const payload = {
        tableID: selectedTable._id, organizationID: restaurantId || orgId,
        items: cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity, price: c.price })),
        total: cartTotal, finalAmount: cartTotal, waiterID: session.userId, orderSource: "dine-in",
      };
      if (activeOrderId) {
        await addOrderItems(activeOrderId, { items: payload.items, total: cartTotal });
        message.success("Items added! 🎉");
      } else {
        const res: any = await createOrder(payload);
        setActiveOrderId(res?.data?.data?._id ?? res?.data?._id ?? null);
        message.success("Order placed! 🎉");
      }
      clearCart(); load();
    } catch (e: any) { message.error(e?.message || "Failed"); }
    finally { setPlacing(false); }
  };

  const markPaid = async () => {
    if (!activeOrderId) return;
    try {
      await updateOrder(activeOrderId, { status: "paid" });
      message.success("Bill settled ✓");
      setBillModal(false); setDrawerOpen(false); load();
    } catch { message.error("Failed to update"); }
  };

  if (loading) return (
    <Flex align="center" justify="center" style={{ height: "60vh" }}>
      <Spin size="large" />
    </Flex>
  );

  return (
    <div style={{ padding: "24px 28px", background: "#f5f7fa", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <Flex justify="space-between" align="center" style={{ marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: -.5 }}>🍴 Floor Map</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>{tables.length} tables · click to view or take orders</Text>
        </div>
        <div style={{ gap: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button icon={<ReloadOutlined />} onClick={load} style={{ borderRadius: 10 }}>Refresh</Button>
          <Button icon={<LogOut />} onClick={() => {
            clearSession();
            navigate("/auth/login");
          }} style={{ borderRadius: 10 }} />
        </div>
      </Flex>

      {/* ── Stat chips (clickable status filter) ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
        {["available", "occupied", "reserved", "billing", "cleaning"].map((s, i) => (
          <StatChip key={s} status={s} count={counts[s] ?? 0} active={statusFilter === s}
            delay={i * 60} onClick={() => setStatusFilter(statusFilter === s ? "All" : s)} />
        ))}
        {statusFilter !== "All" && (
          <button onClick={() => setStatusFilter("All")} style={{ padding: "10px 16px", borderRadius: 14, border: "1.5px solid #e5e7eb", background: "#fff", color: "#6b7280", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* ── Floor filter ── */}
      {floors.length > 2 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {floors.map(f => (
            <button key={f} onClick={() => setFloorFilter(f)} style={{
              padding: "6px 18px", borderRadius: 24, cursor: "pointer",
              border: `1.5px solid ${floorFilter === f ? "#1677ff" : "#e5e7eb"}`,
              background: floorFilter === f ? "#e8f0fe" : "#fff",
              color: floorFilter === f ? "#1677ff" : "#6b7280",
              fontWeight: 700, fontSize: 13, transition: "all .15s",
            }}>
              {f === "All" ? "🏢 All Floors" : `Floor: ${f}`}
            </button>
          ))}
        </div>
      )}

      {/* ── Legend ── */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "10px 18px", marginBottom: 24, background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", alignItems: "center" }}>
        <Text type="secondary" style={{ fontSize: 11, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase" }}>Chairs:</Text>
        {[
          { label: "Available (empty)", fill: "#22c55e", opacity: 0.55 },
          { label: "Occupied / Reserved", fill: "#ef4444", opacity: 0.85 },
        ].map(({ label, fill, opacity }) => (
          <Flex key={label} gap={7} align="center">
            <svg width={20} height={20} viewBox="0 0 20 20">
              <rect x={2} y={8} width={16} height={9} rx={3} fill={fill} opacity={opacity} stroke={fill} strokeWidth={1} />
              <rect x={2} y={3} width={16} height={4} rx={2} fill={fill} opacity={opacity * .75} />
            </svg>
            <Text style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>{label}</Text>
          </Flex>
        ))}
      </div>

      {/* ── Tables grid ── */}
      {filteredTables.length === 0 ? (
        <Empty description="No tables found" />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20 }}>
          {filteredTables.map((t, i) => (
            <TableCard key={t._id} table={t} idx={i} onClick={() => handleClick(t)} />
          ))}
        </div>
      )}

      {/* ── Detail Modal ── */}
      <DetailModal
        table={detailTable} open={detailOpen} onClose={() => setDetailOpen(false)}
        onOpenOrder={() => { if (detailTable) openTerminal(detailTable, detailOrders); }}
        orders={detailOrders} loading={detailLoading}
        onClean={async (tableId, photo) => {
          try {
            await cleanTable(tableId, { cleaningPhoto: photo || undefined });
            message.success("Table is clean & available ✓");
            setDetailOpen(false);
            load();
          } catch { message.error("Failed to mark clean"); }
        }}
      />

      {/* ── Order Drawer ── */}
      <Drawer
        title={
          <Flex justify="space-between" align="center">
            <span style={{ fontWeight: 800 }}>🍴 Table {selectedTable?.number} — Order Terminal</span>
            {activeOrderId && (
              <Button danger size="small" onClick={() => setBillModal(true)} style={{ borderRadius: 8, fontWeight: 700 }}>
                💰 Bill & Pay
              </Button>
            )}
          </Flex>
        }
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setCart([]); }}
        width={Math.min(window.innerWidth, 920)}
        styles={{ body: { padding: 0 } }}
        destroyOnClose
      >
        <Row style={{ height: "100%" }}>
          {/* Menu panel */}
          <Col xs={24} md={14} style={{ borderRight: "1px solid #f0f0f0", padding: 16, overflowY: "auto", height: "calc(100vh - 110px)" }}>
            <Flex gap={8} style={{ marginBottom: 14 }}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search menu…"
                value={menuSearch}
                onChange={e => setMenuSearch(e.target.value)}
                style={{ flex: 1, borderRadius: 10 }}
                allowClear
              />
              <Select value={menuCategory} onChange={setMenuCategory} style={{ width: 140 }}
                options={categories.map(c => ({ label: c, value: c }))} />
            </Flex>

            {categories.filter(c => c !== "All" && (menuCategory === "All" || menuCategory === c)).map(cat => {
              const items = filteredMenu.filter(m => m.category === cat);
              if (!items.length) return null;
              return (
                <div key={cat} style={{ marginBottom: 20 }}>
                  <Flex align="center" gap={8} style={{ marginBottom: 10 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: "#1677ff" }} />
                    <Text strong style={{ fontSize: 11, color: "#444", textTransform: "uppercase", letterSpacing: 1 }}>{cat}</Text>
                  </Flex>
                  {items.map(item => {
                    const inCart = cart.find(c => c.menuItem === item._id);
                    return (
                      <div key={item._id} className="wv-menu-row" style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 14px", marginBottom: 6,
                        background: inCart ? "#f0f7ff" : "#fff",
                        border: `1.5px solid ${inCart ? "#1677ff" : "#f0f0f0"}`,
                        borderRadius: 10,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Flex gap={7} align="center">
                            <div style={{ width: 9, height: 9, borderRadius: "50%", background: item.isVeg ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                          </Flex>
                          <div style={{ fontSize: 12, color: "#9ca3af", marginLeft: 16, marginTop: 2 }}>
                            {money(item.price)}{item.prepTime && <span style={{ marginLeft: 6 }}>⏱ {item.prepTime}m</span>}
                          </div>
                        </div>
                        {inCart ? (
                          <Flex gap={8} align="center">
                            <MinusCircleOutlined style={{ fontSize: 20, color: "#ef4444", cursor: "pointer" }} onClick={() => removeFromCart(item._id)} />
                            <span style={{ minWidth: 20, textAlign: "center", fontWeight: 800, fontSize: 15 }}>{inCart.quantity}</span>
                            <PlusCircleOutlined style={{ fontSize: 20, color: "#22c55e", cursor: "pointer" }} onClick={() => addToCart(item)} />
                          </Flex>
                        ) : (
                          <Button size="small" type="primary" icon={<PlusCircleOutlined />} onClick={() => addToCart(item)} style={{ borderRadius: 8 }}>Add</Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Col>

          {/* Cart panel */}
          <Col xs={24} md={10} style={{ padding: 16, display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
            <Flex justify="space-between" align="center" style={{ marginBottom: 14 }}>
              <Flex align="center" gap={8}>
                <ShoppingCartOutlined style={{ fontSize: 18, color: "#6b7280" }} />
                <Text strong style={{ fontSize: 15 }}>Cart</Text>
                {cartCount > 0 && (
                  <span className="wv-badge" style={{ background: "#1677ff", color: "#fff", borderRadius: 20, padding: "1px 9px", fontSize: 12, fontWeight: 800 }}>
                    {cartCount}
                  </span>
                )}
              </Flex>
              {cart.length > 0 && (
                <Button size="small" danger icon={<DeleteOutlined />} onClick={clearCart} style={{ borderRadius: 8 }}>Clear</Button>
              )}
            </Flex>

            {tableOrders.length > 0 && (
              <div style={{ marginBottom: 14, padding: 12, background: "#f0fdf4", borderRadius: 12, border: "1.5px solid #bbf7d0" }}>
                <Text strong style={{ fontSize: 12, color: "#15803d" }}>✅ Already Ordered</Text>
                {tableOrders[0].items?.map((i: any, idx: number) => (
                  <Flex key={idx} justify="space-between" style={{ fontSize: 12, marginTop: 5, color: "#6b7280" }}>
                    <span>{i.menuItem?.name ?? "Item"} ×{i.quantity}</span>
                    <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
                  </Flex>
                ))}
              </div>
            )}

            {cart.length === 0 ? (
              <Flex align="center" justify="center" style={{ flex: 1 }}>
                <Empty description={<span style={{ color: "#9ca3af", fontSize: 13 }}>Add items from the menu</span>} imageStyle={{ height: 56, opacity: .35 }} />
              </Flex>
            ) : (
              <div style={{ flex: 1, overflowY: "auto" }}>
                {cart.map(item => (
                  <Flex key={item.menuItem} justify="space-between" align="center" style={{ padding: "10px 0", borderBottom: "1px solid #f5f5f5" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{money(item.price)} × {item.quantity}</div>
                    </div>
                    <Flex gap={10} align="center">
                      <span style={{ fontSize: 14, fontWeight: 800, color: "#1677ff" }}>{money(item.price * item.quantity)}</span>
                      <MinusCircleOutlined style={{ color: "#ef4444", cursor: "pointer", fontSize: 16 }} onClick={() => removeFromCart(item.menuItem)} />
                    </Flex>
                  </Flex>
                ))}
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "2px solid #f0f0f0" }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 14 }}>
                <Text strong style={{ fontSize: 16 }}>Total</Text>
                <Text strong style={{ fontSize: 24, color: "#1677ff" }}>{money(cartTotal)}</Text>
              </Flex>
              <button
                disabled={!cart.length || placing}
                onClick={placeOrder}
                className={cart.length ? "wv-place-btn" : ""}
                style={{
                  width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                  background: !cart.length ? "#f0f0f0" : undefined,
                  color: !cart.length ? "#9ca3af" : "#fff",
                  fontWeight: 800, fontSize: 15,
                  cursor: !cart.length ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: cart.length ? "0 4px 20px #22c55e44" : "none",
                }}
              >
                <CheckOutlined />
                {placing ? "Placing…" : activeOrderId ? "Add to Order" : "Place Order"}
              </button>
            </div>
          </Col>
        </Row>
      </Drawer>

      {/* ── Bill Modal ── */}
      <Modal
        title={
          <Flex gap={10} align="center">
            <span style={{ fontSize: 20 }}>💰</span>
            <span style={{ fontWeight: 800 }}>Bill — Table {selectedTable?.number}</span>
          </Flex>
        }
        open={billModal} onOk={markPaid} onCancel={() => setBillModal(false)}
        okText="✓ Mark as Paid"
        okButtonProps={{ style: { background: "#22c55e", border: "none", borderRadius: 10, fontWeight: 700 } }}
      >
        {tableOrders.length > 0 && (
          <div style={{ marginTop: 8, padding: 14, background: "#f8f9fa", borderRadius: 12 }}>
            {tableOrders[0].items?.map((i: any, idx: number) => (
              <Flex key={idx} justify="space-between" style={{ marginBottom: 8, fontSize: 13, color: "#374151" }}>
                <span>{i.menuItem?.name ?? "Item"} ×{i.quantity}</span>
                <span>₹{(i.price * i.quantity).toLocaleString("en-IN")}</span>
              </Flex>
            ))}
            <Divider style={{ margin: "10px 0" }} />
            <Flex justify="space-between">
              <Text strong style={{ fontSize: 16 }}>Total</Text>
              <Text strong style={{ fontSize: 20, color: "#22c55e" }}>₹{tableOrders[0].total?.toLocaleString("en-IN") ?? 0}</Text>
            </Flex>
          </div>
        )}
      </Modal>
    </div>
  );
}