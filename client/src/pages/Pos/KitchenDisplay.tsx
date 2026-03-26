import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, theme } from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { getOrders, updateOrder } from "../../Api";
import { useAuthStore } from "../../Store/store";
import { useSingleSectionRole } from "../../Hooks/usePosRole";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);

const { useToken } = theme;

/* ─────────────────────────────── types ─────────────────────────────────── */
type KdsOrder = {
  _id: string;
  createdAt: string;
  tableID?: { number?: number } | string | null;
  orderSource?: string;
  status: string;
  items: Array<{
    menuItem?: { name?: string; category?: string; isVeg?: boolean } | null;
    quantity: number;
    specialRequest?: string;
    customization?: string;
  }>;
};

const ACTIVE_STATUSES = ["pending", "approved", "preparing"];

const STATUS_NEXT: Record<string, string | null> = {
  pending:  "preparing",
  approved: "preparing",
  preparing: "ready",
  ready:    null,
};

/* ──────────────────────── urgency config ────────────────────────────────── */
type Urgency = "fresh" | "hurry" | "urgent";

const getUrgency = (createdAt: string): Urgency => {
  const mins = dayjs().diff(dayjs(createdAt), "minute");
  if (mins < 5)  return "fresh";
  if (mins < 15) return "hurry";
  return "urgent";
};

const URGENCY: Record<
  Urgency,
  { border: string; header: string; btn: string; dot: string; badge: string; label: string; glow: string }
> = {
  fresh:  { border:"#22c55e", header:"linear-gradient(135deg,#15803d,#16a34a)", btn:"#15803d", dot:"#22c55e", badge:"#f0fdf4", label:"FRESH",  glow:"#22c55e20" },
  hurry:  { border:"#f59e0b", header:"linear-gradient(135deg,#b45309,#d97706)", btn:"#b45309", dot:"#f59e0b", badge:"#fffbeb", label:"HURRY",  glow:"#f59e0b20" },
  urgent: { border:"#ef4444", header:"linear-gradient(135deg,#991b1b,#dc2626)", btn:"#b91c1c", dot:"#ef4444", badge:"#fef2f2", label:"URGENT", glow:"#ef444420" },
};

/* ────────────────── CSS animations (no colours) ─────────────────────────── */
const KDS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@700&display=swap');

  @keyframes kds-in    { from{opacity:0;transform:translateY(18px) scale(.96)} to{opacity:1;transform:none} }
  @keyframes kds-pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
  @keyframes kds-flame { 0%,100%{transform:scaleY(1) rotate(-3deg)} 50%{transform:scaleY(1.18) rotate(3deg)} }
  @keyframes kds-badge { 0%{transform:scale(0);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
  @keyframes kds-ready { 0%,100%{opacity:1} 50%{opacity:.7} }

  * { box-sizing: border-box; }
  .kds-root  { font-family: 'Plus Jakarta Sans', sans-serif; }
  .kds-mono  { font-family: 'JetBrains Mono', monospace; }
  .kds-card  { animation: kds-in .35s cubic-bezier(.22,.68,0,1.2) both; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; transition: transform .2s, box-shadow .2s; }
  .kds-card:hover { transform: translateY(-4px); }
  .kds-tick  { animation: kds-pulse 1.1s ease infinite; display:inline-block; }
  .kds-flame-icon { animation: kds-flame 1s ease infinite; transform-origin: bottom center; display:inline-block; }
  .kds-ready { animation: kds-ready 1.8s ease infinite; }
  .kds-action-btn {
    width:100%; height:46px; border:none; border-radius:12px;
    font-size:14px; font-weight:800; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:opacity .15s, transform .1s;
    font-family:'Plus Jakarta Sans', sans-serif; letter-spacing:.3px;
  }
  .kds-action-btn:hover:not(:disabled) { opacity:.88; transform:scale(.985); }
  .kds-action-btn:active:not(:disabled) { transform:scale(.97); }
  .kds-action-btn:disabled { opacity:.55; cursor:not-allowed; }
`;

/* ──────────────────────── Live Timer ────────────────────────────────────── */
function LiveTimer({ createdAt, color }: { createdAt: string; color: string }) {
  const [elapsed, setElapsed] = useState(() => dayjs().diff(dayjs(createdAt), "second"));
  useEffect(() => {
    const id = setInterval(() => setElapsed(dayjs().diff(dayjs(createdAt), "second")), 1000);
    return () => clearInterval(id);
  }, [createdAt]);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  return (
    <span className="kds-mono" style={{ color, fontWeight:700, fontSize:15, display:"inline-flex", alignItems:"center", gap:4 }}>
      <span className="kds-tick" style={{ fontSize:7 }}>⬤</span>
      {mm}:{ss}
    </span>
  );
}

/* ──────────────────────── Item Row ──────────────────────────────────────── */
function ItemRow({
  item, idx, urgency, delay, borderColor, textColor, subTextColor,
}: {
  item: KdsOrder["items"][0];
  idx: number;
  urgency: Urgency;
  delay: number;
  borderColor: string;
  textColor: string;
  subTextColor: string;
}) {
  const pal = URGENCY[urgency];
  const isVeg = item.menuItem?.isVeg !== false;
  return (
    <div
      style={{
        display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10,
        padding:"9px 0",
        borderBottom: idx > 0 ? `1px dashed ${borderColor}` : "none",
        animation: `kds-badge .28s ease ${delay}ms both`,
      }}
    >
      <div style={{ display:"flex", alignItems:"flex-start", gap:9, flex:1 }}>
        {/* Veg/Non-veg dot */}
        <div
          style={{
            width:10, height:10, minWidth:10, borderRadius:2, marginTop:4,
            border:`2px solid ${isVeg ? "#22c55e" : "#ef4444"}`,
            background: isVeg ? "#22c55e" : "#ef4444",
          }}
        />
        <div>
          <div style={{ fontWeight:800, fontSize:14, color:textColor, lineHeight:1.2 }}>
            {item.menuItem?.name ?? "Unknown Item"}
          </div>
          {(item.specialRequest || item.customization) && (
            <div
              style={{
                marginTop:4, paddingLeft:8,
                borderLeft:`2.5px solid ${pal.border}88`,
                fontSize:11, color:subTextColor, fontStyle:"italic", lineHeight:1.4,
              }}
            >
              📝 {item.specialRequest || item.customization}
            </div>
          )}
        </div>
      </div>
      {/* Qty bubble */}
      <div
        style={{
          width:34, height:34, borderRadius:"50%",
          background:pal.header, color:"#fff",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:800, fontSize:14, flexShrink:0,
          boxShadow:`0 2px 8px ${pal.border}55`,
        }}
      >
        {item.quantity}
      </div>
    </div>
  );
}

/* ──────────────────────── Order Card ────────────────────────────────────── */
function OrderCard({
  order, index, updating, onAction, cardBg, borderColor, textColor, subTextColor,
}: {
  order: KdsOrder;
  index: number;
  updating: string | null;
  onAction: (o: KdsOrder) => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  subTextColor: string;
}) {
  const urgency = getUrgency(order.createdAt);
  const pal = URGENCY[urgency];
  const next = STATUS_NEXT[order.status];
  const isUpdating = updating === order._id;
  const mins = dayjs().diff(dayjs(order.createdAt), "minute");

  const tableLabel = () => {
    if (!order.tableID) return order.orderSource ?? "Takeaway";
    if (typeof order.tableID === "object") return `T-${order.tableID.number ?? "?"}`;
    return `T-${order.tableID}`;
  };

  return (
    <div
      className="kds-card"
      style={{
        animationDelay: `${index * 50}ms`,
        border: `2px solid ${pal.border}`,
        boxShadow: `0 4px 24px ${pal.glow}`,
        background: cardBg,
      }}
    >
      {/* Progress bar */}
      <div style={{ height:5, background:borderColor, position:"relative" }}>
        <div
          style={{
            position:"absolute", top:0, left:0, height:"100%",
            width: `${Math.min((mins / 20) * 100, 100)}%`,
            background: pal.border, transition:"width 1s linear", borderRadius:2,
          }}
        />
      </div>

      {/* Coloured header */}
      <div style={{ background:pal.header, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ fontWeight:800, fontSize:24, color:"#fff", lineHeight:1, letterSpacing:-0.5 }}>
            {tableLabel()}
          </div>
          <span style={{ fontSize:10, fontWeight:800, padding:"2px 9px", borderRadius:20, background:"#ffffff28", color:"#fff", letterSpacing:1.5, textTransform:"uppercase" }}>
            {pal.label}
          </span>
        </div>
        <div style={{ textAlign:"right" }}>
          <LiveTimer createdAt={order.createdAt} color="#fff" />
          <div className="kds-mono" style={{ fontSize:10, color:"#ffffff99", marginTop:1 }}>
            #{order._id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Status + count bar */}
      <div style={{ padding:"8px 16px", borderBottom:`1px solid ${borderColor}`, display:"flex", alignItems:"center", gap:8, background:pal.badge }}>
        <span style={{ display:"inline-flex", alignItems:"center", gap:6 }}>
          <span
            style={{
              width:8, height:8, borderRadius:"50%", background:pal.dot, display:"inline-block",
              ...(order.status === "preparing" ? { animation:"kds-pulse 1s ease infinite" } : {}),
            }}
          />
          <span style={{ fontSize:12, fontWeight:800, color:pal.btn, textTransform:"uppercase", letterSpacing:.6 }}>
            {order.status}
          </span>
        </span>
        <span style={{ marginLeft:"auto", fontSize:12, color:subTextColor, fontWeight:600 }}>
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Items */}
      <div style={{ padding:"12px 16px", flex:1 }}>
        {order.items.map((item, idx) => (
          <ItemRow
            key={idx}
            item={item}
            idx={idx}
            urgency={urgency}
            delay={index * 50 + idx * 30 + 150}
            borderColor={borderColor}
            textColor={textColor}
            subTextColor={subTextColor}
          />
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding:"10px 16px 14px" }}>
        {next ? (
          <button
            className="kds-action-btn"
            disabled={isUpdating}
            onClick={() => onAction(order)}
            style={{ background:pal.header, color:"#fff", boxShadow:`0 4px 14px ${pal.border}55` }}
          >
            {isUpdating ? <>⏳ Updating…</> : next === "preparing" ? <><ThunderboltOutlined /> Start Cooking</> : <><CheckOutlined /> Mark Ready</>}
          </button>
        ) : (
          <div
            className="kds-ready"
            style={{
              padding:"12px 0", borderRadius:12,
              background:"linear-gradient(135deg,#15803d,#22c55e)",
              color:"#fff", fontWeight:800, fontSize:14, textAlign:"center",
              boxShadow:"0 4px 16px #22c55e55",
            }}
          >
            ✓ Ready for Pickup
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────── Stat Chip ─────────────────────────────────────── */
function StatChip({
  count, label, icon, color, glowColor, chipBg, borderColor,
}: {
  count: number; label: string; icon: React.ReactNode;
  color: string; glowColor: string;
  chipBg: string; borderColor: string;
}) {
  return (
    <div
      style={{
        padding:"14px 18px", borderRadius:16, display:"flex", alignItems:"center", gap:12,
        background: chipBg,
        border: `1.5px solid ${borderColor}`,
        boxShadow: `0 2px 12px ${glowColor}`,
      }}
    >
      <div style={{ fontSize:20 }}>{icon}</div>
      <div>
        <div className="kds-mono" style={{ fontSize:24, fontWeight:700, color, lineHeight:1 }}>{count}</div>
        <div style={{ fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:1, marginTop:2, opacity:.7 }}>{label}</div>
      </div>
    </div>
  );
}

/* ──────────────────────── Main Component ────────────────────────────────── */
export default function KitchenDisplay() {
  const { token } = useToken();
  const restaurantId = useAuthStore((s) => s.session.restaurantId);
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();

  // Show inline Logout only for single-section roles (kitchen / waiter staff)
  // who have no sidebar navigation to exit from.
  const { isSingleSectionRole } = useSingleSectionRole();

  const [orders, setOrders]   = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter,   setStatusFilter]   = useState<string>("all");
  const [lastRefresh,    setLastRefresh]     = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setTick] = useState(0);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const res: any = await getOrders({ restaurantId });
      const all: KdsOrder[] = res?.data?.data ?? res?.data ?? [];
      setOrders(all.filter((o) => ACTIVE_STATUSES.includes(o.status)));
      setLastRefresh(dayjs().format("hh:mm:ss A"));
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [restaurantId]);

  useEffect(() => {
    fetchOrders();
    intervalRef.current = setInterval(fetchOrders, 30_000);
    const tickId = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearInterval(tickId);
    };
  }, [fetchOrders]);

  const handleAction = async (order: KdsOrder) => {
    const next = STATUS_NEXT[order.status];
    if (!next) return;
    setUpdating(order._id);
    try {
      await updateOrder(order._id, { status: next });
      fetchOrders();
    } catch {
      /* silent */
    } finally {
      setUpdating(null);
    }
  };

  /* ── Derived ── */
  const allCategories = Array.from(
    new Set(orders.flatMap((o) => o.items.map((i) => i.menuItem?.category ?? "Uncategorized")))
  );
  const displayed = orders
    .filter((o) => {
      const okCat = categoryFilter === "all" || o.items.some((i) => (i.menuItem?.category ?? "Uncategorized") === categoryFilter);
      const okSt  = statusFilter === "all" || o.status === statusFilter;
      return okCat && okSt;
    })
    .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf());

  const counts = {
    pending: orders.filter((o) => o.status === "pending" || o.status === "approved").length,
    cooking: orders.filter((o) => o.status === "preparing").length,
    urgent:  orders.filter((o) => getUrgency(o.createdAt) === "urgent").length,
  };
  const statusList = Array.from(new Set(orders.map((o) => o.status)));

  /* ── Theme-aware colour aliases ── */
  const bg        = token.colorBgLayout;
  const headerBg  = token.colorBgContainer;
  const cardBg    = token.colorBgContainer;
  const chipBg    = token.colorBgElevated;
  const textColor = token.colorText;
  const subText   = token.colorTextSecondary;
  const borderCol = token.colorBorderSecondary;
  const selectBg  = token.colorFillQuaternary;
  const selectBorder = token.colorBorder;
  const selectColor  = token.colorText;

  return (
    <div className="kds-root" style={{ minHeight:"100vh", background:bg, color:textColor }}>
      <style>{KDS_CSS}</style>

      {/* ── Sticky Header ── */}
      <div
        style={{
          position:"sticky", top:0, zIndex:50,
          background: headerBg,
          borderBottom: `1px solid ${borderCol}`,
          boxShadow: `0 2px 12px #00000012`,
        }}
      >
        {/* Top row */}
        <div style={{ padding:"14px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontSize:28 }} className="kds-flame-icon">🔥</div>
            <div>
              <div style={{ fontWeight:800, fontSize:19, letterSpacing:-0.5, color:textColor, lineHeight:1 }}>
                Kitchen Display
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:3 }}>
                <span className="kds-tick" style={{ width:7, height:7, borderRadius:"50%", background:loading ? "#f59e0b" : "#22c55e", display:"inline-block" }} />
                <span className="kds-mono" style={{ fontSize:11, color:subText }}>
                  {loading ? "Syncing…" : `Live · ${lastRefresh || "—"}`}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding:"7px 12px", borderRadius:10,
                border:`1.5px solid ${selectBorder}`,
                background:selectBg, color:selectColor,
                fontSize:13, fontWeight:600, cursor:"pointer", outline:"none",
              }}
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding:"7px 12px", borderRadius:10,
                border:`1.5px solid ${selectBorder}`,
                background:selectBg, color:selectColor,
                fontSize:13, fontWeight:600, cursor:"pointer", outline:"none",
              }}
            >
              <option value="all">All Statuses</option>
              {statusList.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>

            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
              style={{ borderRadius:10 }}
            >
              Refresh
            </Button>
            {isSingleSectionRole && (
              <Button
                icon={<LogoutOutlined />}
                danger
                onClick={() => { clearSession(); navigate("/auth/login"); }}
                style={{ borderRadius:10 }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ padding:"10px 24px 14px", display:"flex", gap:12, flexWrap:"wrap", borderTop:`1px solid ${borderCol}`, background:bg }}>
          <StatChip count={displayed.length} label="Active"   icon="📋" color="#6366f1" glowColor="#6366f120" chipBg={chipBg} borderColor={`#6366f130`} />
          <StatChip count={counts.pending}   label="Pending"  icon="⏳" color="#f59e0b" glowColor="#f59e0b20" chipBg={chipBg} borderColor={`#f59e0b30`} />
          <StatChip count={counts.cooking}   label="Cooking"  icon="👨‍🍳" color="#22c55e" glowColor="#22c55e20" chipBg={chipBg} borderColor={`#22c55e30`} />
          {counts.urgent > 0 && (
            <StatChip count={counts.urgent}  label="⚠ Urgent" icon="🚨" color="#ef4444" glowColor="#ef444420" chipBg={chipBg} borderColor={`#ef444430`} />
          )}

          {/* Urgency legend */}
          <div style={{ marginLeft:"auto", display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:11, color:subText, fontWeight:700, textTransform:"uppercase", letterSpacing:1 }}>Urgency:</span>
            {(["fresh", "hurry", "urgent"] as Urgency[]).map((u) => (
              <div key={u} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:11, height:11, borderRadius:3, background:URGENCY[u].border }} />
                <span style={{ fontSize:12, color:subText, fontWeight:600 }}>
                  {u === "fresh" ? "< 5 min" : u === "hurry" ? "5–15 min" : "> 15 min"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ padding:"24px" }}>
        {loading && orders.length === 0 ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
            <div style={{ textAlign:"center" }}>
              <div className="kds-flame-icon" style={{ fontSize:56 }}>🔥</div>
              <div style={{ color:subText, marginTop:18, fontSize:16, fontWeight:600 }}>Loading orders…</div>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"60vh" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
              <div style={{ fontWeight:800, fontSize:26, color:"#22c55e", marginBottom:8 }}>Kitchen is Clear!</div>
              <div style={{ fontSize:15, color:subText }}>
                {orders.length > 0 ? "No orders match the current filters." : "No active orders — well done, team! 👏"}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <div style={{ fontWeight:700, fontSize:14, color:subText }}>
                Showing <span style={{ color:textColor, fontWeight:800 }}>{displayed.length}</span> order{displayed.length !== 1 ? "s" : ""}
                {categoryFilter !== "all" && <> · <span style={{ color:"#6366f1" }}>{categoryFilter}</span></>}
              </div>
              <div style={{ fontSize:12, color:subText }}>Auto-refresh every 30 s</div>
            </div>

            {/* Cards grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(290px, 1fr))", gap:20 }}>
              {displayed.map((order, index) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  index={index}
                  updating={updating}
                  onAction={handleAction}
                  cardBg={cardBg}
                  borderColor={borderCol}
                  textColor={textColor}
                  subTextColor={subText}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}