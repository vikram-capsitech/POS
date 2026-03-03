import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Button,
  Select,
  Typography,
  message,
  theme,
} from "antd";
import {
  ReloadOutlined,
  CheckOutlined,
  ThunderboltOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { getOrders, updateOrder } from "../../Api";
import { useAuthStore } from "../../Store/store";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useNavigate } from "react-router-dom";
dayjs.extend(relativeTime);

const { Text } = Typography;
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
  pending: "preparing",
  approved: "preparing",
  preparing: "ready",
  ready: null,
};

/* ──────────────────────── urgency config ────────────────────────────────── */
type Urgency = "fresh" | "hurry" | "urgent";

const getUrgency = (createdAt: string): Urgency => {
  const mins = dayjs().diff(dayjs(createdAt), "minute");
  if (mins < 5) return "fresh";
  if (mins < 15) return "hurry";
  return "urgent";
};

const URGENCY_PALETTE = {
  fresh: {
    border: "#22c55e",
    headerBg: "#16a34a",
    btnBg: "#15803d",
    dot: "#22c55e",
    label: "FRESH",
    glow: "#22c55e44",
  },
  hurry: {
    border: "#f59e0b",
    headerBg: "#d97706",
    btnBg: "#b45309",
    dot: "#f59e0b",
    label: "HURRY",
    glow: "#f59e0b44",
  },
  urgent: {
    border: "#ef4444",
    headerBg: "#dc2626",
    btnBg: "#b91c1c",
    dot: "#ef4444",
    label: "URGENT",
    glow: "#ef444444",
  },
} as const;

/* ──────────────────────── CSS animations ────────────────────────────────── */
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Syne:wght@700;800&display=swap');

  @keyframes kds-slide-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes kds-tick {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.3; }
  }
  @keyframes kds-flame {
    0%,100% { transform: scaleY(1) rotate(-2deg); }
    50%     { transform: scaleY(1.2) rotate(2deg); }
  }
  @keyframes kds-badge-pop {
    0%  { transform: scale(0.5); opacity: 0; }
    60% { transform: scale(1.2); }
    100%{ transform: scale(1); opacity: 1; }
  }
  @keyframes kds-ready-glow {
    0%,100% { box-shadow: 0 0 0 0 #22c55e44; }
    50%     { box-shadow: 0 0 20px 6px #22c55e44; }
  }

  .kds-flame-icon {
    display: inline-block;
    animation: kds-flame 1.1s ease-in-out infinite;
    transform-origin: bottom center;
  }
  .kds-card {
    animation: kds-slide-in .38s cubic-bezier(.22,.68,0,1.2) both;
    transition: transform .2s ease, box-shadow .2s ease;
  }
  .kds-card:hover {
    transform: translateY(-3px) scale(1.008);
  }
`;

/* ──────────────────────── Timer component ───────────────────────────────── */
function LiveTimer({ createdAt, color }: { createdAt: string; color: string }) {
  const [elapsed, setElapsed] = useState(() =>
    dayjs().diff(dayjs(createdAt), "second")
  );
  useEffect(() => {
    const id = setInterval(
      () => setElapsed(dayjs().diff(dayjs(createdAt), "second")),
      1000
    );
    return () => clearInterval(id);
  }, [createdAt]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        fontSize: 15,
        color,
        letterSpacing: 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span
        style={{
          fontSize: 8,
          animation: "kds-tick 1.2s ease infinite",
          display: "inline-block",
        }}
      >
        ●
      </span>
      {mm}:{ss}
    </span>
  );
}

/* ──────────────────────── Order Card ────────────────────────────────────── */
function OrderCard({
  order,
  index,
  updating,
  onAction,
  token,
}: {
  order: KdsOrder;
  index: number;
  updating: string | null;
  onAction: (o: KdsOrder) => void;
  token: ReturnType<typeof useToken>["token"];
}) {
  const urgency = getUrgency(order.createdAt);
  const pal = URGENCY_PALETTE[urgency];
  const next = STATUS_NEXT[order.status];
  const isUpdating = updating === order._id;
  const mins = dayjs().diff(dayjs(order.createdAt), "minute");

  const tableLabel = () => {
    if (!order.tableID) return order.orderSource ?? "Takeaway";
    if (typeof order.tableID === "object")
      return `T-${order.tableID.number ?? "?"}`;
    return `T-${order.tableID}`;
  };

  return (
    <div
      className="kds-card"
      style={{
        animationDelay: `${index * 55}ms`,
        borderRadius: 16,
        border: `2px solid ${pal.border}`,
        background: token.colorBgContainer,
        boxShadow: `0 4px 20px ${pal.glow}, 0 1px 4px ${(token as any).colorShadow}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Progress strip */}
      <div
        style={{
          height: 4,
          background: token.colorFillTertiary,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${Math.min((mins / 20) * 100, 100)}%`,
            background: pal.headerBg,
            transition: "width 1s linear",
            borderRadius: 2,
          }}
        />
      </div>

      {/* Colored header */}
      <div
        style={{
          background: pal.headerBg,
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              letterSpacing: -0.5,
              lineHeight: 1,
            }}
          >
            {tableLabel()}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              background: "#ffffff25",
              color: "#fff",
              padding: "2px 8px",
              borderRadius: 20,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            {pal.label}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <LiveTimer createdAt={order.createdAt} color="#fff" />
          <div
            style={{
              fontSize: 10,
              color: "#ffffffbb",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: 1,
            }}
          >
            #{order._id.slice(-6).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Status badge row */}
      <div
        style={{
          padding: "8px 16px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "3px 10px",
            borderRadius: 20,
            border: `1.5px solid ${pal.border}`,
            fontSize: 11,
            fontWeight: 800,
            color: pal.btnBg,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            background: `${pal.border}18`,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: pal.dot,
              display: "inline-block",
              ...(order.status === "preparing"
                ? { animation: "kds-tick 1s ease infinite" }
                : {}),
            }}
          />
          {order.status}
        </span>
        <span
          style={{
            fontSize: 12,
            color: token.colorTextSecondary,
            marginLeft: "auto",
          }}
        >
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Items list */}
      <div style={{ padding: "12px 16px", flex: 1 }}>
        {order.items.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "8px 0",
              borderBottom:
                idx < order.items.length - 1
                  ? `1px dashed ${token.colorBorderSecondary}`
                  : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    border: `2px solid ${item.menuItem?.isVeg !== false ? "#22c55e" : "#ef4444"
                      }`,
                    background:
                      item.menuItem?.isVeg !== false ? "#22c55e" : "#ef4444",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    color: token.colorText,
                  }}
                >
                  {item.menuItem?.name ?? "Item"}
                </span>
              </div>
              {(item.specialRequest || item.customization) && (
                <div
                  style={{
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    marginTop: 2,
                    marginLeft: 17,
                    fontStyle: "italic",
                    borderLeft: `2px solid ${pal.border}88`,
                    paddingLeft: 6,
                  }}
                >
                  {item.specialRequest || item.customization}
                </div>
              )}
            </div>

            {/* Quantity bubble */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: pal.headerBg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                flexShrink: 0,
                animation: `kds-badge-pop 0.3s ease ${index * 60 + idx * 40 + 200
                  }ms both`,
                boxShadow: `0 2px 8px ${pal.border}55`,
              }}
            >
              {item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "12px 16px", paddingTop: 0 }}>
        {next ? (
          <Button
            type="primary"
            loading={isUpdating}
            onClick={() => onAction(order)}
            icon={
              next === "preparing" ? (
                <ThunderboltOutlined />
              ) : (
                <CheckOutlined />
              )
            }
            style={{
              width: "100%",
              height: 44,
              borderRadius: 12,
              background: isUpdating
                ? undefined
                : `linear-gradient(135deg, ${pal.btnBg}, ${pal.headerBg})`,
              border: "none",
              fontWeight: 800,
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              letterSpacing: 0.4,
              boxShadow: `0 4px 14px ${pal.border}55`,
            }}
          >
            {next === "preparing" ? "Start Preparing" : "Mark Ready"}
          </Button>
        ) : (
          <div
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 12,
              background: "linear-gradient(135deg, #16a34a, #22c55e)",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              fontFamily: "'Syne', sans-serif",
              textAlign: "center",
              letterSpacing: 0.5,
              boxShadow: "0 4px 16px #22c55e55",
              animation: "kds-ready-glow 2s ease infinite",
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
  count,
  label,
  color,
  icon,
  token,
}: {
  count: number;
  label: string;
  color: string;
  icon: string;
  token: ReturnType<typeof useToken>["token"];
}) {
  return (
    <div
      style={{
        background: token.colorBgElevated,
        border: `1.5px solid ${color}40`,
        borderRadius: 14,
        padding: "10px 18px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 110,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color,
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1,
          }}
        >
          {count}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: token.colorTextSecondary,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
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

  const [orders, setOrders] = useState<KdsOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [lastRefresh, setLastRefresh] = useState<string>("");
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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
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
      message.success(
        <span>
          Order <b>{order._id.slice(-6).toUpperCase()}</b> → <b>{next}</b>
        </span>
      );
      fetchOrders();
    } catch {
      message.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const allCategories = Array.from(
    new Set(
      orders.flatMap((o) =>
        o.items.map((i) => i.menuItem?.category ?? "Uncategorized")
      )
    )
  );

  const displayed = orders
    .filter((o) => {
      if (categoryFilter === "all") return true;
      return o.items.some(
        (i) => (i.menuItem?.category ?? "Uncategorized") === categoryFilter
      );
    })
    .sort(
      (a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf()
    );

  const counts = {
    pending: orders.filter(
      (o) => o.status === "pending" || o.status === "approved"
    ).length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    urgent: orders.filter((o) => getUrgency(o.createdAt) === "urgent").length,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: token.colorBgLayout,
        fontFamily: "'Syne', 'JetBrains Mono', sans-serif",
        color: token.colorText,
        position: "relative",
      }}
    >
      <style>{GLOBAL_STYLES}</style>

      {/* Subtle grid texture */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `
            linear-gradient(${token.colorBorderSecondary} 1px, transparent 1px),
            linear-gradient(90deg, ${token.colorBorderSecondary} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.5,
        }}
      />

      <div style={{ position: "relative", zIndex: 1, padding: "16px 24px" }}>

        {/* ── HEADER ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 20,
            padding: "12px 16px",
            borderRadius: 16,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadowTertiary,
          }}
        >
          {/* Left: Brand + live status */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="kds-flame-icon" style={{ fontSize: 28 }}>🔥</span>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: token.colorText,
                  letterSpacing: -0.8,
                  lineHeight: 1.1,
                }}
              >
                Kitchen Display
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 3,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: loading ? "#f59e0b" : "#22c55e",
                    animation: "kds-tick 1.2s ease infinite",
                  }}
                />
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {loading
                    ? "Syncing…"
                    : `Live · Last sync ${lastRefresh || "—"}`}
                </Text>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 160 }}
              options={[
                { label: "All Categories", value: "all" },
                ...allCategories.map((c) => ({ label: c, value: c })),
              ]}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              icon={<LogoutOutlined />}
              danger
              onClick={() => {
                clearSession();
                navigate("/auth/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div
          style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}
        >
          <StatChip
            count={displayed.length}
            label="Active"
            color={token.colorPrimary}
            icon="📋"
            token={token}
          />
          <StatChip
            count={counts.pending}
            label="Pending"
            color="#f59e0b"
            icon="⏳"
            token={token}
          />
          <StatChip
            count={counts.preparing}
            label="Cooking"
            color="#22c55e"
            icon="👨‍🍳"
            token={token}
          />
          {counts.urgent > 0 && (
            <StatChip
              count={counts.urgent}
              label="Urgent!"
              color="#ef4444"
              icon="🚨"
              token={token}
            />
          )}
        </div>

        {/* ── LEGEND ── */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 20,
            padding: "10px 16px",
            background: token.colorBgContainer,
            borderRadius: 12,
            border: `1px solid ${token.colorBorderSecondary}`,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: token.colorTextTertiary,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            Urgency:
          </Text>
          {(
            [
              { u: "fresh", label: "< 5 min · Fresh" },
              { u: "hurry", label: "5–15 min · Hurry" },
              { u: "urgent", label: "> 15 min · Urgent!" },
            ] as const
          ).map(({ u, label }) => (
            <div
              key={u}
              style={{ display: "flex", alignItems: "center", gap: 7 }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: URGENCY_PALETTE[u].headerBg,
                }}
              />
              <Text style={{ fontSize: 12, color: token.colorTextSecondary }}>
                {label}
              </Text>
            </div>
          ))}
        </div>

        {/* ── CARDS GRID ── */}
        {loading && orders.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 380,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <span className="kds-flame-icon" style={{ fontSize: 52 }}>
                🔥
              </span>
              <div
                style={{
                  color: token.colorTextSecondary,
                  marginTop: 16,
                  fontSize: 14,
                }}
              >
                Loading orders…
              </div>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: 380,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "#22c55e",
                  marginBottom: 8,
                }}
              >
                Kitchen is Clear!
              </div>
              <Text type="secondary" style={{ fontSize: 14 }}>
                No active orders — well done, team 👏
              </Text>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            {displayed.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                index={index}
                updating={updating}
                onAction={handleAction}
                token={token}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}