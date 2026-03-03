import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { message, Modal, Spin, theme } from "antd";
import {
    getMenuItems, getTableById, getOrderById, createOrder, addOrderItems,
    updateOrder,
} from "../../Api";
import { useAuthStore } from "../../Store/store";


/* ─── Types ────────────────────────────────────────────────────────────────── */
type MenuItem = { _id: string; name: string; category: string; price: number; isVeg: boolean; available: boolean; imageUrl?: string; prepTime?: number; description?: string; };
type CartItem = { menuItem: string; name: string; price: number; quantity: number; isVeg: boolean; };

/* ─── CSS ───────────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
  * { box-sizing: border-box; }
  body { margin: 0; }

  :root{
    --bg: #ffffff;
    --panel: #ffffff;
    --panel2: #f7f7f7;
    --border: #e5e7eb;

    --text: #111827;
    --muted: #6b7280;

    --accent: #1677ff;      /* primary */
    --accent2: #4096ff;     /* hover */
    --good: #22c55e;
    --bad: #ef4444;

    --chip: #f3f4f6;
    --chipText: #374151;

    --shadow: 0 8px 24px rgba(0,0,0,.08);
  }

  .ot-root { font-family: 'Inter', system-ui, sans-serif; display: flex; height: 100vh; overflow: hidden; background: var(--bg); color: var(--text); }

  /* ── Left panel ── */
  .ot-left  { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
  .ot-topbar { padding: 14px 20px; background: var(--panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
  .ot-back  { background: var(--chip); border: none; color: var(--chipText); padding: 8px 16px; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; transition: all .15s; }
  .ot-back:hover { filter: brightness(0.97); }

  .ot-tablerole { font-size: 16px; font-weight: 800; color: var(--text); }

  .ot-tags  { display: flex; gap: 6px; flex-wrap: wrap; padding: 12px 20px; background: var(--panel2); border-bottom: 1px solid var(--border); flex-shrink: 0; overflow-x: auto; }

  .ot-tag   { padding: 6px 16px; border-radius: 20px; border: 1px solid var(--border); background: var(--chip); color: var(--muted); font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all .15s; }
  .ot-tag.active { background: var(--accent); border-color: var(--accent); color: #fff; }

  .ot-search { flex: 1; background: var(--chip); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 10px; font-size: 14px; outline: none; }
  .ot-search::placeholder { color: var(--muted); }

  .ot-menu  { flex: 1; overflow-y: auto; padding: 16px 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px; align-content: start; }

  @keyframes ot-cardIn { from { opacity: 0; transform: scale(.93) translateY(10px); } to { opacity: 1; transform: none; } }
  @keyframes ot-badgePop { 0%{transform:scale(0) rotate(-20deg);opacity:0} 65%{transform:scale(1.3) rotate(3deg)} 100%{transform:scale(1);opacity:1} }
  @keyframes ot-slide { from{transform:translateY(12px);opacity:0} to{transform:none;opacity:1} }

  .ot-item  { background: var(--panel); border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; cursor: pointer; transition: all .2s; animation: ot-cardIn .3s ease both; display: flex; flex-direction: column; }
  .ot-item:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: var(--shadow); }

  /* in-cart state */
  .ot-item.in-cart { border-color: var(--good); background: color-mix(in srgb, var(--good) 10%, var(--panel)); }

  .ot-img   { width: 100%; height: 110px; object-fit: cover; background: var(--chip); display: flex; align-items: center; justify-content: center; font-size: 36px; flex-shrink: 0; }

  .ot-iname { padding: 10px 12px 4px; font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.3; }
  .ot-iprice { padding: 2px 12px 10px; font-size: 12px; color: var(--muted); font-weight: 600; }

  .ot-qty   { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 8px 12px; background: var(--panel2); border-top: 1px solid var(--border); }
  .ot-qbtn  { background: none; border: none; color: var(--text); font-size: 20px; cursor: pointer; line-height: 1; padding: 0 4px; transition: transform .15s; }
  .ot-qbtn:hover { transform: scale(1.3); }

  .ot-add   { width: 100%; padding: 9px 0; background: var(--accent); border: none; color: #fff; font-weight: 800; font-size: 13px; cursor: pointer; border-top: 1px solid var(--border); transition: all .15s; }
  .ot-add:hover { background: var(--accent2); }

  /* ── Right cart panel ── */
  .ot-right { width: 340px; background: var(--panel2); border-left: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; }
  .ot-cart-head { padding: 16px 20px; border-bottom: 1px solid var(--border); font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 10px; color: var(--text); }

  .ot-cart-badge { background: var(--accent); color: #fff; border-radius: 20px; padding: 2px 10px; font-size: 13px; font-weight: 800; animation: ot-badgePop .3s ease both; }
  .ot-cart-items { flex: 1; overflow-y: auto; padding: 12px 16px; }

  .ot-ci   { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border); animation: ot-slide .25s ease both; }
  .ot-ci-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--text); min-width: 0; }
  .ot-ci-price { font-size: 13px; font-weight: 800; color: var(--accent); white-space: nowrap; }

  .ot-ci-qty { display: flex; align-items: center; gap: 6px; }
  .ot-ci-q  { background: var(--chip); border: 1px solid var(--border); color: var(--text); width: 26px; height: 26px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all .15s; }
  .ot-ci-q:hover { filter: brightness(0.97); }

  .ot-ci-del { background: none; border: none; color: var(--bad); cursor: pointer; font-size: 15px; padding: 2px; }

  /* Already ordered box */
  .ot-already { background: color-mix(in srgb, var(--good) 10%, var(--panel)); border: 1.5px solid color-mix(in srgb, var(--good) 35%, var(--border)); border-radius: 12px; padding: 12px 14px; margin-bottom: 10px; }
  .ot-already-title { font-size: 11px; font-weight: 800; color: var(--good); text-transform: uppercase; letter-spacing: .8px; margin-bottom: 8px; }
  .ot-ai-row { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); padding: 3px 0; }

  .ot-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; color: var(--muted); }
  .ot-empty-icon { font-size: 48px; }

  .ot-footer { padding: 16px; border-top: 1px solid var(--border); }
  .ot-total  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .ot-total-label { font-size: 15px; color: var(--muted); font-weight: 600; }
  .ot-total-val   { font-size: 26px; font-weight: 900; color: var(--text); }

  .ot-place { width: 100%; padding: 15px 0; border-radius: 14px; border: none; color: #fff; font-weight: 900; font-size: 16px; cursor: pointer; transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .ot-place.active { background: linear-gradient(135deg, var(--accent), var(--accent2)); box-shadow: var(--shadow); }
  .ot-place.active:hover { transform: translateY(-2px); filter: brightness(1.02); }
  .ot-place.disabled { background: var(--chip); color: var(--muted); cursor: not-allowed; }

  .ot-bill-btn { width: 100%; padding: 11px 0; border-radius: 12px; border: none; background: var(--good); color: #fff; font-weight: 800; font-size: 14px; cursor: pointer; margin-top: 8px; transition: all .15s; }
  .ot-bill-btn:hover { filter: brightness(0.98); }

  .ot-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .ot-veg { background: var(--good); }
  .ot-nveg { background: var(--bad); }

  @media (max-width: 700px) {
    .ot-right { width: 100%; border-left: none; border-top: 1px solid var(--border); }
    .ot-root { flex-direction: column; }
    .ot-left { height: 55vh; }
    .ot-right { height: 45vh; }
  }
`;

const money = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ─── Payment Modal ─────────────────────────────────────────────────────────── */
function PaymentModal({ open, order, onClose, onPaid }: {
    open: boolean; order: any; onClose: () => void; onPaid: (method: string) => void;
}) {
    const [method, setMethod] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const total = order?.total ?? 0;

    const methods = [
        { key: "cash", icon: "💵", label: "Cash", color: "#22c55e" },
        { key: "upi", icon: "📱", label: "UPI", color: "#6366f1" },
        { key: "card", icon: "💳", label: "Card", color: "#3b82f6" },
    ];

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={400} title={null}
            styles={{ content: { padding: 0, borderRadius: 22, overflow: "hidden" } }}>
            <div style={{ padding: "28px 28px 24px" }}>
                <h2 style={{ margin: "0 0 6px", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 900, fontSize: 22 }}>
                    💰 Settle Bill
                </h2>
                <p style={{ margin: "0 0 24px", color: "#888", fontSize: 14 }}>
                    Table order · select payment method
                </p>

                {/* Bill summary */}
                <div style={{ background: "#222", borderRadius: 14, padding: "16px 18px", marginBottom: 22 }}>
                    {order?.items?.map((it: any, i: number) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#ccc", padding: "5px 0", borderBottom: "1px solid #333" }}>
                            <span>{it.name ?? it.menuItem?.name ?? "Item"} ×{it.quantity}</span>
                            <span>₹{((it.price ?? 0) * it.quantity).toLocaleString("en-IN")}</span>
                        </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "2px solid #444" }}>
                        <span style={{ fontWeight: 800, color: "#fff", fontSize: 15 }}>Total</span>
                        <span style={{ fontWeight: 900, color: "#FF6B35", fontSize: 24 }}>{money(total)}</span>
                    </div>
                </div>

                {/* Payment methods */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
                    {methods.map(m => (
                        <button key={m.key} onClick={() => setMethod(m.key)} style={{
                            padding: "16px 0", borderRadius: 14, border: `2.5px solid ${method === m.key ? m.color : "#333"}`,
                            background: method === m.key ? `${m.color}22` : "#222",
                            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            transition: "all .15s",
                        }}>
                            <span style={{ fontSize: 28 }}>{m.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: method === m.key ? m.color : "#888" }}>{m.label}</span>
                        </button>
                    ))}
                </div>

                <button
                    disabled={!method || loading}
                    onClick={async () => { setLoading(true); await onPaid(method!); setLoading(false); }}
                    style={{
                        width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
                        background: method ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#333",
                        color: method ? "#fff" : "#666", fontWeight: 900, fontSize: 16,
                        cursor: method ? "pointer" : "not-allowed", transition: "all .2s",
                    }}
                >
                    {loading ? "Processing…" : `✓ Confirm ${method ? method.toUpperCase() : ""} Payment`}
                </button>
            </div>
        </Modal>
    );
}

/* ─── Main Component ────────────────────────────────────────────────────────── */
export default function OrderTerminal() {
    const { token } = theme.useToken();
    const { orgId, tableId } = useParams<{ orgId: string; tableId: string }>();
    const [searchParams] = useSearchParams();
    const existingOrderId = searchParams.get("orderId");
    const navigate = useNavigate();
    const session = useAuthStore(s => s.session);

    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tableInfo, setTableInfo] = useState<any>(null);
    const [existingOrder, setExistingOrder] = useState<any>(null);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [placing, setPlacing] = useState(false);
    const [payModal, setPayModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const orgPrimary = session?.organization?.theme?.primary; // adjust to your store shape

    useEffect(() => {
        const root = document.documentElement;

        const primary = orgPrimary || token.colorPrimary;
        const primaryHover = token.colorPrimaryHover || primary;

        root.style.setProperty("--accent", primary);
        root.style.setProperty("--accent2", primaryHover);

        root.style.setProperty("--bg", token.colorBgLayout);
        root.style.setProperty("--panel", token.colorBgContainer);
        root.style.setProperty("--panel2", token.colorFillQuaternary || token.colorBgElevated);
        root.style.setProperty("--border", token.colorBorder);
        root.style.setProperty("--text", token.colorText);
        root.style.setProperty("--muted", token.colorTextSecondary);

        // optional
        root.style.setProperty("--chip", token.colorFillTertiary);
        root.style.setProperty("--chipText", token.colorText);
    }, [token, orgPrimary]);

    // Load menu, table info and existing order if any
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [mRes, tRes] = await Promise.all([
                    getMenuItems({ orgId }),
                    getTableById(tableId!),
                ]);
                const items: MenuItem[] = (mRes?.data?.data ?? mRes?.data ?? []).filter((i: MenuItem) => i.available);
                setMenu(items);

                const tbl = tRes?.data?.data ?? tRes?.data;
                setTableInfo(tbl);

                // Load existing order if orderId passed (add-to-order flow)
                if (existingOrderId) {
                    const oRes: any = await getOrderById(existingOrderId);
                    setExistingOrder(oRes?.data?.data ?? oRes?.data);
                }
            } catch { message.error("Failed to load"); }
            finally { setLoading(false); }
        };
        load();
    }, [tableId, orgId, existingOrderId]);

    const categories = useMemo(() => ["All", ...Array.from(new Set(menu.map(m => m.category)))], [menu]);

    const filteredMenu = useMemo(() => {
        const q = search.toLowerCase();
        return menu.filter(m =>
            (category === "All" || m.category === category) &&
            (!q || m.name.toLowerCase().includes(q))
        );
    }, [menu, category, search]);

    const add = (item: MenuItem) => setCart(prev => {
        const ex = prev.find(c => c.menuItem === item._id);
        return ex
            ? prev.map(c => c.menuItem === item._id ? { ...c, quantity: c.quantity + 1 } : c)
            : [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg }];
    });

    const minus = (id: string) => setCart(prev => {
        const ex = prev.find(c => c.menuItem === id);
        return ex && ex.quantity > 1
            ? prev.map(c => c.menuItem === id ? { ...c, quantity: c.quantity - 1 } : c)
            : prev.filter(c => c.menuItem !== id);
    });

    const remove = (id: string) => setCart(prev => prev.filter(c => c.menuItem !== id));

    const cartTotal = useMemo(() => cart.reduce((a, i) => a + i.price * i.quantity, 0), [cart]);
    const cartCount = useMemo(() => cart.reduce((a, i) => a + i.quantity, 0), [cart]);

    // Place order / add to order
    const placeOrder = async () => {
        if (!cart.length) return;
        setPlacing(true);
        try {
            if (existingOrderId) {
                await addOrderItems(existingOrderId, {
                    items: cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity, price: c.price })),
                    total: cartTotal,
                });
                message.success("Items added to kitchen! 🎉");
            } else {
                const res: any = await createOrder({
                    tableID: tableId,
                    organizationID: orgId,
                    items: cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity, price: c.price })),
                    total: cartTotal,
                    finalAmount: cartTotal,
                    waiterID: session.userId,
                    orderSource: "dine-in",
                });
                const newOrderId = res?.data?.data?._id ?? res?.data?._id;
                message.success("Order sent to kitchen! 🔥");
                // Redirect with new orderId for subsequent add-ons
                navigate(`/pos/${orgId}/order/${tableId}?orderId=${newOrderId}`, { replace: true });
                const oRes: any = await getOrderById(newOrderId);
                setExistingOrder(oRes?.data?.data ?? oRes?.data);
            }
            setCart([]);
        } catch (e: any) {
            message.error(e?.response?.data?.message || "Failed to place order");
        } finally {
            setPlacing(false);
        }
    };

    // Request billing
    const requestBill = async () => {
        if (!existingOrderId) return;
        try {
            await updateOrder(existingOrderId, { status: "billing" });
            message.success("Bill requested — table marked for billing");
            // reload order
            const oRes: any = await getOrderById(existingOrderId);
            setExistingOrder(oRes?.data?.data ?? oRes?.data);
        } catch { message.error("Failed to request bill"); }
    };

    // Confirm payment — set paid, table auto-moves to cleaning, go back to floor map
    const handlePaid = async (method: string) => {
        if (!existingOrderId) return;
        try {
            await updateOrder(existingOrderId, { status: "paid", paymentMethod: method });
            message.success(`✅ Payment received via ${method.toUpperCase()} — Table is now set for cleaning`);
            setPayModal(false);
            // Navigate back to floor map — waiter will see the cleaning table there
            navigate(`/pos/${orgId}/waiter`);
        } catch { message.error("Payment failed"); }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
                <Spin size="large" />
            </div>
        );
    }

    const menuOrder = existingOrder ?? (existingOrderId ? existingOrder : null);
    const orderStatus: string = menuOrder?.status ?? "";
    const orderIsBilling = orderStatus === "billing";
    // Bill can only be requested AFTER food is served or ready (kitchen done)
    const canRequestBill = ["ready", "served"].includes(orderStatus);
    // Payment can only be collected when explicitly in billing state
    const canCollectPayment = orderStatus === "billing";

    // Status config for the topbar chip
    const statusChip: Record<string, { label: string; bg: string; emoji: string }> = {
        pending: { label: "Waiting for Kitchen", bg: "#faad14", emoji: "⏳" },
        preparing: { label: "Kitchen Preparing", bg: "#13c2c2", emoji: "👨‍🍳" },
        ready: { label: "Ready to Serve", bg: "#52c41a", emoji: "✅" },
        served: { label: "Served", bg: "#722ed1", emoji: "🍽️" },
        billing: { label: "Billing", bg: "#2563eb", emoji: "💰" },
        paid: { label: "Paid", bg: "#16a34a", emoji: "✓" },
        cancelled: { label: "Cancelled", bg: "#ef4444", emoji: "✕" },
    };
    const chip = orderStatus ? statusChip[orderStatus] : null;

    return (
        <div className="ot-root">
            <style>{CSS}</style>

            {/* ══ LEFT: Menu ════════════════════════════════════════════════════════ */}
            <div className="ot-left">
                {/* Top bar */}
                <div className="ot-topbar">
                    <button className="ot-back" onClick={() => navigate(`/pos/${orgId}/waiter`)}>
                        ← Back
                    </button>
                    <span className="ot-tablerole">
                        🍽️ Table {tableInfo?.number ?? "?"}
                        {tableInfo?.floor && tableInfo.floor !== "Ground" ? ` · ${tableInfo.floor}` : ""}
                        {tableInfo?.seats ? ` · ${tableInfo.seats} seats` : ""}
                    </span>
                    {chip && (
                        <span style={{
                            marginLeft: "auto", fontSize: 12, fontWeight: 800,
                            background: chip.bg, color: "#fff",
                            padding: "4px 12px", borderRadius: 20,
                            display: "flex", alignItems: "center", gap: 5,
                        }}>
                            {chip.emoji} {chip.label}
                        </span>
                    )}
                </div>

                {/* Category + Search */}
                <div className="ot-tags">
                    <input className="ot-search" placeholder="🔍 Search menu…" value={search} onChange={e => setSearch(e.target.value)} />
                    {categories.map(c => (
                        <button key={c} className={`ot-tag${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
                    ))}
                </div>

                {/* Menu grid */}
                <div className="ot-menu">
                    {filteredMenu.length === 0 && (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#555", marginTop: 60 }}>
                            <div style={{ fontSize: 48 }}>🍽️</div>
                            <div style={{ marginTop: 12, fontWeight: 700 }}>No items found</div>
                        </div>
                    )}
                    {filteredMenu.map((item, idx) => {
                        const inCart = cart.find(c => c.menuItem === item._id);
                        return (
                            <div key={item._id} className={`ot-item${inCart ? " in-cart" : ""}`}
                                style={{ animationDelay: `${idx * 25}ms` }}>
                                {/* Image or emoji placeholder */}
                                <div className="ot-img">
                                    {item.imageUrl
                                        ? <img src={item.imageUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        : <span>{item.isVeg ? "🥦" : "🍖"}</span>
                                    }
                                </div>

                                <div style={{ padding: "10px 12px 4px", display: "flex", alignItems: "flex-start", gap: 6 }}>
                                    <span className={`ot-dot ${item.isVeg ? "ot-veg" : "ot-nveg"}`} style={{ marginTop: 3 }} />
                                    <span className="ot-iname" style={{ padding: 0, flex: 1 }}>{item.name}</span>
                                </div>
                                <div className="ot-iprice">
                                    {money(item.price)}
                                    {item.prepTime && <span style={{ marginLeft: 6, fontSize: 11, color: "#666" }}>⏱{item.prepTime}m</span>}
                                </div>

                                {inCart ? (
                                    <div className="ot-qty">
                                        <button className="ot-qbtn" onClick={() => minus(item._id)}>−</button>
                                        <span style={{ fontWeight: 900, fontSize: 18, minWidth: 24, textAlign: "center" }}>{inCart.quantity}</span>
                                        <button className="ot-qbtn" onClick={() => add(item)}>+</button>
                                    </div>
                                ) : (
                                    <button className="ot-add" onClick={() => add(item)}>+ Add</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ══ RIGHT: Cart ═══════════════════════════════════════════════════════ */}
            <div className="ot-right">
                <div className="ot-cart-head">
                    🛒 Cart
                    {cartCount > 0 && <span className="ot-cart-badge">{cartCount}</span>}
                </div>

                <div className="ot-cart-items">
                    {/* Already ordered items */}
                    {menuOrder?.items?.length > 0 && (
                        <div className="ot-already">
                            <div className="ot-already-title">✅ Sent to Kitchen</div>
                            {menuOrder.items.map((it: any, idx: number) => (
                                <div key={idx} className="ot-ai-row">
                                    <span>{it.name ?? it.menuItem?.name ?? "Item"} ×{it.quantity}</span>
                                    <span>₹{((it.price ?? 0) * it.quantity).toLocaleString("en-IN")}</span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, paddingTop: 6, borderTop: "1px solid #1a4a2a", fontSize: 13, fontWeight: 800, color: "#22c55e" }}>
                                <span>Subtotal</span>
                                <span>{money(menuOrder.total)}</span>
                            </div>
                        </div>
                    )}

                    {/* New cart items */}
                    {cart.length === 0 && menuOrder?.items?.length === 0 && (
                        <div className="ot-empty">
                            <div className="ot-empty-icon">🛒</div>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>Cart is empty</div>
                            <div style={{ fontSize: 13, color: "#444" }}>Tap items on the left to add</div>
                        </div>
                    )}
                    {cart.length === 0 && menuOrder?.items?.length > 0 && (
                        <div className="ot-empty" style={{ marginTop: 16 }}>
                            <div style={{ fontSize: 36 }}>✨</div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#555" }}>Add more items or settle bill</div>
                        </div>
                    )}
                    {cart.map(item => (
                        <div key={item.menuItem} className="ot-ci">
                            <span className={`ot-dot ${item.isVeg ? "ot-veg" : "ot-nveg"}`} />
                            <div className="ot-ci-name">{item.name}</div>
                            <div className="ot-ci-qty">
                                <button className="ot-ci-q" onClick={() => minus(item.menuItem)}>−</button>
                                <span style={{ fontWeight: 800, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                                <button className="ot-ci-q" onClick={() => add({ _id: item.menuItem, name: item.name, price: item.price, isVeg: item.isVeg, category: "", available: true })}>+</button>
                            </div>
                            <span className="ot-ci-price">{money(item.price * item.quantity)}</span>
                            <button className="ot-ci-del" onClick={() => remove(item.menuItem)}>✕</button>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="ot-footer">
                    {cart.length > 0 && (
                        <div className="ot-total">
                            <span className="ot-total-label">New items</span>
                            <span className="ot-total-val">{money(cartTotal)}</span>
                        </div>
                    )}

                    {/* Place / Add to Order */}
                    <button
                        className={`ot-place ${cart.length > 0 ? "active" : "disabled"}`}
                        disabled={cart.length === 0 || placing}
                        onClick={placeOrder}
                    >
                        {placing ? "⏳ Sending to Kitchen…" : existingOrderId ? "🔥 Add to Kitchen Order" : "🔥 Send to Kitchen"}
                    </button>

                    {/* ─── Bill / Payment actions ─── */}

                    {/* Kitchen still working — show a hint */}
                    {menuOrder && ["pending", "preparing"].includes(orderStatus) && (
                        <div style={{
                            marginTop: 10, padding: "10px 14px", borderRadius: 10,
                            background: "color-mix(in srgb, #faad14 12%, var(--panel))",
                            border: "1.5px solid #faad1455",
                            fontSize: 12, fontWeight: 600, color: "#b45309",
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            ⏳ Waiting for kitchen — bill available once food is ready
                        </div>
                    )}

                    {/* Request Bill — only after food is ready/served */}
                    {menuOrder && canRequestBill && (
                        <button className="ot-bill-btn" onClick={requestBill}>
                            💰 Request Bill
                        </button>
                    )}

                    {/* Collect Payment — only when billing */}
                    {canCollectPayment && (
                        <button className="ot-bill-btn" onClick={() => setPayModal(true)}
                            style={{ background: "#16a34a" }}>
                            ✓ Collect Payment
                        </button>
                    )}
                </div>
            </div>

            {/* ── Payment Modal */}
            <PaymentModal
                open={payModal}
                order={menuOrder}
                onClose={() => setPayModal(false)}
                onPaid={handlePaid}
            />
        </div>
    );
}
