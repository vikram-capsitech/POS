import { useState, useEffect, useRef } from "react";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --surface3: #22222f;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --accent: #ff6b2b;
    --accent2: #ff9500;
    --accent3: #00d4aa;
    --accent4: #7c6dfa;
    --text: #f0f0f8;
    --text2: #8888aa;
    --text3: #555570;
    --green: #00c48c;
    --red: #ff4d6d;
    --yellow: #ffd60a;
    --blue: #3b82f6;
    --font-display: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --r: 14px;
    --r2: 10px;
    --r3: 8px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --glow: 0 0 30px rgba(255,107,43,0.15);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); }

  .pos-root {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
    background-image: radial-gradient(ellipse at 10% 0%, rgba(124,109,250,0.08) 0%, transparent 50%),
                      radial-gradient(ellipse at 90% 100%, rgba(255,107,43,0.06) 0%, transparent 50%);
  }

  /* SIDEBAR */
  .sidebar {
    width: 72px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    gap: 8px;
    z-index: 100;
    flex-shrink: 0;
  }

  .sidebar-logo {
    width: 42px; height: 42px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display);
    font-weight: 800; font-size: 16px; color: white;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(255,107,43,0.3);
  }

  .sidebar-divider {
    width: 32px; height: 1px;
    background: var(--border);
    margin: 8px 0;
  }

  .nav-btn {
    width: 46px; height: 46px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: var(--text3);
    cursor: pointer;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    transition: all 0.2s;
    position: relative;
    font-size: 18px;
  }
  .nav-btn:hover { background: var(--surface2); color: var(--text2); }
  .nav-btn.active { background: rgba(255,107,43,0.12); color: var(--accent); }
  .nav-btn.active::before {
    content: ''; position: absolute; left: -1px;
    top: 50%; transform: translateY(-50%);
    width: 3px; height: 24px;
    background: var(--accent); border-radius: 0 3px 3px 0;
  }
  .nav-label {
    font-size: 8px; font-family: var(--font-display);
    font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
  }
  .nav-badge {
    position: absolute; top: 6px; right: 6px;
    min-width: 16px; height: 16px; border-radius: 8px;
    background: var(--red); color: white;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px;
  }

  /* MAIN AREA */
  .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  .topbar {
    height: 60px;
    padding: 0 24px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    flex-shrink: 0;
  }

  .topbar-left { display: flex; align-items: center; gap: 16px; }

  .page-title {
    font-family: var(--font-display);
    font-size: 18px; font-weight: 700;
    background: linear-gradient(90deg, var(--text), var(--text2));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .badge-chip {
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    font-family: var(--font-display);
    letter-spacing: 0.5px;
  }
  .badge-chip.green { background: rgba(0,196,140,0.15); color: var(--green); border: 1px solid rgba(0,196,140,0.2); }
  .badge-chip.orange { background: rgba(255,107,43,0.15); color: var(--accent); border: 1px solid rgba(255,107,43,0.2); }
  .badge-chip.purple { background: rgba(124,109,250,0.15); color: var(--accent4); border: 1px solid rgba(124,109,250,0.2); }
  .badge-chip.red { background: rgba(255,77,109,0.15); color: var(--red); border: 1px solid rgba(255,77,109,0.2); }
  .badge-chip.blue { background: rgba(59,130,246,0.15); color: var(--blue); border: 1px solid rgba(59,130,246,0.2); }
  .badge-chip.yellow { background: rgba(255,214,10,0.15); color: var(--yellow); border: 1px solid rgba(255,214,10,0.2); }

  .content { flex: 1; overflow: hidden; }

  /* BTN */
  .btn {
    padding: 8px 16px; border-radius: var(--r3);
    border: none; cursor: pointer;
    font-family: var(--font-body); font-size: 13px; font-weight: 500;
    display: inline-flex; align-items: center; gap: 6px;
    transition: all 0.18s;
  }
  .btn-primary { background: var(--accent); color: white; }
  .btn-primary:hover { background: #ff7d45; box-shadow: 0 4px 12px rgba(255,107,43,0.3); }
  .btn-ghost { background: var(--surface2); color: var(--text2); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
  .btn-green { background: rgba(0,196,140,0.15); color: var(--green); border: 1px solid rgba(0,196,140,0.2); }
  .btn-green:hover { background: rgba(0,196,140,0.25); }
  .btn-red { background: rgba(255,77,109,0.15); color: var(--red); border: 1px solid rgba(255,77,109,0.2); }
  .btn-red:hover { background: rgba(255,77,109,0.25); }
  .btn-sm { padding: 5px 10px; font-size: 12px; }
  .btn-icon { width: 34px; height: 34px; padding: 0; justify-content: center; }

  /* CARDS */
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 20px;
  }
  .card-sm { padding: 14px; border-radius: var(--r2); }

  /* SCROLLABLE */
  .scroll { overflow-y: auto; }
  .scroll::-webkit-scrollbar { width: 4px; }
  .scroll::-webkit-scrollbar-track { background: transparent; }
  .scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

  /* KPI CARDS */
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .kpi-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 18px 20px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }
  .kpi-card:hover { border-color: var(--border2); }
  .kpi-card::before {
    content: ''; position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
  }
  .kpi-card.orange::before { background: linear-gradient(90deg, var(--accent), var(--accent2)); }
  .kpi-card.green::before { background: linear-gradient(90deg, var(--green), #00f5a0); }
  .kpi-card.purple::before { background: linear-gradient(90deg, var(--accent4), #a78bfa); }
  .kpi-card.blue::before { background: linear-gradient(90deg, var(--blue), #60a5fa); }
  .kpi-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; margin-bottom: 12px;
  }
  .kpi-icon.orange { background: rgba(255,107,43,0.15); }
  .kpi-icon.green { background: rgba(0,196,140,0.15); }
  .kpi-icon.purple { background: rgba(124,109,250,0.15); }
  .kpi-icon.blue { background: rgba(59,130,246,0.15); }
  .kpi-value {
    font-family: var(--font-display);
    font-size: 26px; font-weight: 700;
    line-height: 1;
  }
  .kpi-label { font-size: 12px; color: var(--text2); margin-top: 4px; }
  .kpi-sub { font-size: 11px; color: var(--text3); margin-top: 8px; }

  /* TABLE GRID */
  .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
  .table-card {
    aspect-ratio: 1;
    border-radius: var(--r);
    border: 1.5px solid var(--border);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 6px; cursor: pointer;
    transition: all 0.2s;
    position: relative; overflow: hidden;
  }
  .table-card:hover { transform: translateY(-2px); border-color: var(--border2); }
  .table-card.available { background: rgba(0,196,140,0.06); border-color: rgba(0,196,140,0.2); }
  .table-card.occupied { background: rgba(255,107,43,0.06); border-color: rgba(255,107,43,0.25); }
  .table-card.reserved { background: rgba(255,214,10,0.06); border-color: rgba(255,214,10,0.2); }
  .table-card.billing { background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.2); }
  .table-num { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
  .table-card.available .table-num { color: var(--green); }
  .table-card.occupied .table-num { color: var(--accent); }
  .table-card.reserved .table-num { color: var(--yellow); }
  .table-card.billing .table-num { color: var(--blue); }
  .table-meta { font-size: 10px; color: var(--text2); }
  .table-dot {
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px; border-radius: 50%;
  }
  .table-card.available .table-dot { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .table-card.occupied .table-dot { background: var(--accent); box-shadow: 0 0 6px var(--accent); animation: pulse 1.5s infinite; }
  .table-card.reserved .table-dot { background: var(--yellow); }
  .table-card.billing .table-dot { background: var(--blue); }

  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

  /* ORDER PANEL */
  .order-panel {
    width: 340px; flex-shrink: 0;
    background: var(--surface);
    border-left: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .order-panel-header {
    padding: 16px 18px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }
  .order-items { flex: 1; overflow-y: auto; padding: 12px; }
  .order-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: var(--r2);
    background: var(--surface2);
    margin-bottom: 8px;
    border: 1px solid var(--border);
  }
  .order-item-name { font-size: 13px; font-weight: 500; flex: 1; }
  .order-item-price { font-size: 13px; color: var(--text2); }
  .qty-ctrl {
    display: flex; align-items: center; gap: 6px;
  }
  .qty-btn {
    width: 22px; height: 22px; border-radius: 6px;
    background: var(--surface3); border: none; color: var(--text2);
    cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
  }
  .qty-btn:hover { background: var(--accent); color: white; }
  .qty-num { font-family: var(--font-display); font-size: 13px; font-weight: 700; min-width: 18px; text-align: center; }

  .order-footer {
    padding: 16px 18px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
  }
  .order-total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .order-total-label { font-size: 12px; color: var(--text2); }
  .order-total-val { font-size: 13px; }
  .order-grand { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--accent); }

  /* MENU GRID */
  .menu-categories { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
  .cat-chip {
    padding: 6px 14px; border-radius: 20px;
    background: var(--surface2); border: 1px solid var(--border);
    font-size: 12px; cursor: pointer; transition: all 0.15s;
    font-weight: 500; color: var(--text2);
  }
  .cat-chip:hover { border-color: var(--border2); color: var(--text); }
  .cat-chip.active { background: rgba(255,107,43,0.15); border-color: rgba(255,107,43,0.3); color: var(--accent); }

  .menu-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
  .menu-item-card {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r2); overflow: hidden; cursor: pointer;
    transition: all 0.2s;
  }
  .menu-item-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,107,43,0.12); }
  .menu-item-img {
    width: 100%; height: 100px; object-fit: cover;
    background: var(--surface3);
    display: flex; align-items: center; justify-content: center;
    font-size: 32px;
  }
  .menu-item-body { padding: 10px; }
  .menu-item-name { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .menu-item-meta { display: flex; align-items: center; justify-content: space-between; }
  .menu-item-price { font-family: var(--font-display); font-size: 13px; font-weight: 700; color: var(--accent); }
  .veg-dot { width: 8px; height: 8px; border-radius: 2px; border: 1.5px solid; }
  .veg-dot.veg { border-color: var(--green); background: var(--green); }
  .veg-dot.nonveg { border-color: var(--red); background: var(--red); }

  /* KITCHEN DISPLAY */
  .kitchen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
  .kitchen-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--r); overflow: hidden;
    transition: all 0.2s;
  }
  .kitchen-card-header {
    padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }
  .kitchen-card-header.pending { background: rgba(255,214,10,0.06); border-bottom-color: rgba(255,214,10,0.15); }
  .kitchen-card-header.preparing { background: rgba(255,107,43,0.06); border-bottom-color: rgba(255,107,43,0.15); }
  .kitchen-card-header.ready { background: rgba(0,196,140,0.06); border-bottom-color: rgba(0,196,140,0.15); }
  .kitchen-table-num { font-family: var(--font-display); font-size: 20px; font-weight: 800; }
  .kitchen-timer { font-size: 12px; color: var(--text2); }
  .kitchen-timer.urgent { color: var(--red); font-weight: 600; }
  .kitchen-items { padding: 12px 16px; }
  .kitchen-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 0; border-bottom: 1px solid var(--border);
  }
  .kitchen-item:last-child { border-bottom: none; }
  .kitchen-item-qty {
    width: 28px; height: 28px; border-radius: 8px;
    background: var(--surface2); display: flex; align-items: center; justify-content: center;
    font-family: var(--font-display); font-size: 13px; font-weight: 700;
    color: var(--accent); flex-shrink: 0;
  }
  .kitchen-item-name { font-size: 13px; flex: 1; }
  .kitchen-item-note { font-size: 11px; color: var(--text2); font-style: italic; }
  .kitchen-actions { padding: 12px 16px; display: flex; gap: 8px; }

  /* AGGREGATOR */
  .agg-card {
    border-radius: var(--r); border: 1.5px solid var(--border);
    padding: 20px; transition: all 0.2s;
    background: var(--surface);
  }
  .agg-card.connected { border-color: rgba(0,196,140,0.25); }
  .agg-card.disconnected { border-color: var(--border); }
  .agg-logo { font-size: 32px; margin-bottom: 12px; }
  .agg-name { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 4px; }
  .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
  .toggle-switch input { display: none; }
  .toggle-slider {
    position: absolute; inset: 0; border-radius: 12px;
    background: var(--surface3); cursor: pointer; transition: 0.2s;
    border: 1px solid var(--border);
  }
  .toggle-slider::before {
    content: ''; position: absolute;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--text3); top: 2px; left: 2px; transition: 0.2s;
  }
  .toggle-switch input:checked + .toggle-slider { background: rgba(0,196,140,0.2); border-color: rgba(0,196,140,0.4); }
  .toggle-switch input:checked + .toggle-slider::before { transform: translateX(20px); background: var(--green); }

  /* WAITER VIEW */
  .waiter-root { display: flex; height: 100%; }
  .waiter-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

  /* TABS */
  .tabs { display: flex; gap: 4px; background: var(--surface2); padding: 4px; border-radius: 10px; }
  .tab-btn {
    padding: 7px 16px; border-radius: 8px; border: none;
    background: transparent; color: var(--text2);
    cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 500;
    transition: all 0.15s;
  }
  .tab-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

  /* MISC */
  .section-title {
    font-family: var(--font-display);
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.3px; margin-bottom: 14px;
  }
  .input-field {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r3); padding: 8px 12px;
    color: var(--text); font-family: var(--font-body); font-size: 13px;
    width: 100%; outline: none; transition: border-color 0.15s;
  }
  .input-field:focus { border-color: var(--accent); }
  .input-field::placeholder { color: var(--text3); }

  .flex { display: flex; }
  .flex-center { display: flex; align-items: center; }
  .flex-between { display: flex; align-items: center; justify-content: space-between; }
  .gap-4 { gap: 4px; } .gap-8 { gap: 8px; } .gap-12 { gap: 12px; } .gap-16 { gap: 16px; }
  .flex-1 { flex: 1; }
  .p-16 { padding: 16px; } .p-20 { padding: 20px; } .p-24 { padding: 24px; }
  .mb-8 { margin-bottom: 8px; } .mb-12 { margin-bottom: 12px; } .mb-16 { margin-bottom: 16px; }
  .text-sm { font-size: 12px; } .text-xs { font-size: 11px; }
  .text-muted { color: var(--text2); }
  .text-muted2 { color: var(--text3); }
  .fw-700 { font-weight: 700; }
  .font-display { font-family: var(--font-display); }
  .text-accent { color: var(--accent); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .text-yellow { color: var(--yellow); }
  .w-full { width: 100%; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .orders-list { display: flex; flex-direction: column; gap: 8px; }
  .order-row {
    padding: 12px 16px;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r2); display: flex; align-items: center; gap: 12px;
    transition: all 0.15s;
  }
  .order-row:hover { border-color: var(--border2); }
  .order-id { font-family: var(--font-display); font-size: 13px; font-weight: 700; }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px);
    z-index: 1000; display: flex; align-items: center; justify-content: center;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border2);
    border-radius: var(--r); padding: 24px; min-width: 420px; max-width: 560px; width: 100%;
    box-shadow: 0 24px 60px rgba(0,0,0,0.6);
    animation: modalIn 0.2s ease;
  }
  @keyframes modalIn { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
  .modal-title { font-family: var(--font-display); font-size: 18px; font-weight: 700; margin-bottom: 20px; }

  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 11px; font-weight: 600; color: var(--text2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }

  .receipt {
    font-family: 'Courier New', monospace; font-size: 12px;
    background: white; color: #111;
    padding: 24px; border-radius: 8px;
    max-width: 320px; margin: 0 auto;
  }
  .receipt-title { text-align: center; font-weight: 700; font-size: 16px; margin-bottom: 4px; }
  .receipt-divider { border: none; border-top: 1px dashed #999; margin: 8px 0; }
  .receipt-row { display: flex; justify-content: space-between; }
  .receipt-total { font-weight: 700; font-size: 14px; }

  .status-flow { display: flex; align-items: center; gap: 6px; margin: 16px 0; }
  .status-step {
    flex: 1; height: 4px; border-radius: 2px;
    background: var(--surface3);
    transition: background 0.3s;
  }
  .status-step.done { background: var(--green); }
  .status-step.active { background: var(--accent); }

  .agg-orders { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
  .agg-order {
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: var(--r2); padding: 12px;
  }
  .agg-badge { padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; font-family: var(--font-display); }
  .agg-badge.swiggy { background: rgba(252,128,25,0.2); color: #fc8019; }
  .agg-badge.zomato { background: rgba(203,32,39,0.2); color: #cb2027; }

  .empty-state {
    text-align: center; padding: 48px 24px;
    color: var(--text3);
  }
  .empty-state-icon { font-size: 48px; margin-bottom: 12px; }
  .empty-state-text { font-size: 14px; color: var(--text2); }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const TABLES = [
  { _id: "t1", number: 1, seats: 4, status: "occupied", floor: "Ground", currentOrder: "o1" },
  { _id: "t2", number: 2, seats: 2, status: "available", floor: "Ground" },
  { _id: "t3", number: 3, seats: 6, status: "occupied", floor: "Ground", currentOrder: "o2" },
  { _id: "t4", number: 4, seats: 4, status: "reserved", floor: "Ground" },
  { _id: "t5", number: 5, seats: 8, status: "available", floor: "First" },
  { _id: "t6", number: 6, seats: 4, status: "billing", floor: "First" },
  { _id: "t7", number: 7, seats: 2, status: "available", floor: "First" },
  { _id: "t8", number: 8, seats: 6, status: "occupied", floor: "Ground", currentOrder: "o3" },
  { _id: "t9", number: 9, seats: 4, status: "available", floor: "Ground" },
  { _id: "t10", number: 10, seats: 4, status: "available", floor: "Ground" },
  { _id: "t11", number: 11, seats: 2, status: "reserved", floor: "First" },
  { _id: "t12", number: 12, seats: 8, status: "occupied", floor: "First", currentOrder: "o4" },
];

const MENU = [
  { _id: "m1", name: "Paneer Tikka", category: "Starters", price: 280, isVeg: true, available: true, prepTime: 15, emoji: "🥘" },
  { _id: "m2", name: "Chicken Biryani", category: "Main Course", price: 320, isVeg: false, available: true, prepTime: 25, emoji: "🍛" },
  { _id: "m3", name: "Dal Makhani", category: "Main Course", price: 220, isVeg: true, available: true, prepTime: 20, emoji: "🫕" },
  { _id: "m4", name: "Garlic Naan", category: "Breads", price: 60, isVeg: true, available: true, prepTime: 8, emoji: "🫓" },
  { _id: "m5", name: "Mango Lassi", category: "Beverages", price: 120, isVeg: true, available: true, prepTime: 5, emoji: "🥛" },
  { _id: "m6", name: "Butter Chicken", category: "Main Course", price: 340, isVeg: false, available: true, prepTime: 20, emoji: "🍗" },
  { _id: "m7", name: "Veg Manchurian", category: "Starters", price: 200, isVeg: true, available: true, prepTime: 12, emoji: "🥦" },
  { _id: "m8", name: "Masala Chai", category: "Beverages", price: 40, isVeg: true, available: true, prepTime: 3, emoji: "☕" },
  { _id: "m9", name: "Gulab Jamun", category: "Desserts", price: 100, isVeg: true, available: true, prepTime: 5, emoji: "🍮" },
  { _id: "m10", name: "Fish Curry", category: "Main Course", price: 380, isVeg: false, available: false, prepTime: 30, emoji: "🐟" },
  { _id: "m11", name: "Prawn Masala", category: "Starters", price: 420, isVeg: false, available: true, prepTime: 18, emoji: "🦐" },
  { _id: "m12", name: "Jeera Rice", category: "Main Course", price: 150, isVeg: true, available: true, prepTime: 15, emoji: "🍚" },
  { _id: "m13", name: "Rasmalai", category: "Desserts", price: 140, isVeg: true, available: true, prepTime: 2, emoji: "🍯" },
  { _id: "m14", name: "Samosa", category: "Starters", price: 80, isVeg: true, available: true, prepTime: 8, emoji: "🥟" },
  { _id: "m15", name: "Cold Coffee", category: "Beverages", price: 160, isVeg: true, available: true, prepTime: 5, emoji: "🥤" },
];

const KITCHEN_ORDERS = [
  {
    _id: "k1", tableNumber: 1, status: "preparing",
    time: "14 mins ago", urgent: true,
    items: [
      { name: "Paneer Tikka", qty: 2, note: "Extra spicy" },
      { name: "Garlic Naan", qty: 4, note: "" },
      { name: "Dal Makhani", qty: 1, note: "No butter" },
    ]
  },
  {
    _id: "k2", tableNumber: 3, status: "pending",
    time: "2 mins ago", urgent: false,
    items: [
      { name: "Butter Chicken", qty: 1, note: "" },
      { name: "Jeera Rice", qty: 2, note: "" },
    ]
  },
  {
    _id: "k3", tableNumber: 8, status: "pending",
    time: "5 mins ago", urgent: false,
    items: [
      { name: "Prawn Masala", qty: 2, note: "Less oil" },
      { name: "Garlic Naan", qty: 6, note: "" },
      { name: "Masala Chai", qty: 2, note: "" },
    ]
  },
  {
    _id: "k4", tableNumber: 12, status: "ready",
    time: "20 mins ago", urgent: false,
    items: [
      { name: "Chicken Biryani", qty: 3, note: "" },
    ]
  },
];

const RECENT_ORDERS = [
  { _id: "o1", table: 1, items: 3, total: 860, status: "preparing", waiter: "Raju", time: "12:34", source: "dine-in" },
  { _id: "o2", table: 3, items: 2, total: 540, status: "pending", waiter: "Meena", time: "12:38", source: "dine-in" },
  { _id: "o3", table: 8, items: 4, total: 1240, status: "pending", waiter: "Raju", time: "12:40", source: "dine-in" },
  { _id: "o4", table: 12, items: 3, total: 960, status: "ready", waiter: "Priya", time: "12:15", source: "dine-in" },
  { _id: "o5", table: null, items: 2, total: 440, status: "paid", waiter: "-", time: "11:50", source: "swiggy" },
  { _id: "o6", table: null, items: 1, total: 320, status: "paid", waiter: "-", time: "11:42", source: "zomato" },
  { _id: "o7", table: 6, items: 5, total: 1560, status: "paid", waiter: "Priya", time: "11:30", source: "dine-in" },
];

const AGG_ORDERS = [
  { id: "sw1", platform: "swiggy", customer: "Arjun S.", items: "Butter Chicken × 1, Naan × 2", total: 460, status: "confirmed", time: "2m ago" },
  { id: "zm1", platform: "zomato", customer: "Priya M.", items: "Biryani × 2", total: 640, status: "preparing", time: "8m ago" },
  { id: "sw2", platform: "swiggy", customer: "Rahul K.", items: "Dal Makhani × 1, Rice × 1", total: 370, status: "ready", time: "18m ago" },
];

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

const Icon = ({ name }) => {
  const icons = {
    grid: "⊞", table: "⬜", kitchen: "🔥", menu: "📋", orders: "🧾",
    settings: "⚙️", delivery: "🛵", reports: "📊", staff: "👥",
    plus: "+", minus: "−", close: "✕", refresh: "↻", search: "🔍",
    check: "✓", arrow: "→", print: "🖨️", rupee: "₹",
  };
  return <span>{icons[name] || name}</span>;
};

const StatusBadge = ({ status }) => {
  const map = {
    pending: { color: "yellow", label: "Pending" },
    preparing: { color: "orange", label: "Preparing" },
    ready: { color: "green", label: "Ready" },
    paid: { color: "blue", label: "Paid" },
    cancelled: { color: "red", label: "Cancelled" },
    served: { color: "purple", label: "Served" },
    approved: { color: "green", label: "Approved" },
    confirmed: { color: "blue", label: "Confirmed" },
  };
  const m = map[status] || { color: "orange", label: status };
  return <span className={`badge-chip ${m.color}`}>{m.label}</span>;
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const kpis = [
    { label: "Today's Revenue", value: "₹38,460", sub: "+12% vs yesterday", color: "orange", icon: "₹" },
    { label: "Total Orders", value: "94", sub: "7 currently active", color: "green", icon: "🧾" },
    { label: "Table Occupancy", value: "58%", sub: "7 of 12 tables active", color: "purple", icon: "⬜" },
    { label: "Kitchen Load", value: "3", sub: "Pending + Preparing", color: "blue", icon: "🔥" },
  ];

  return (
    <div className="scroll" style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* KPIs */}
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className={`kpi-icon ${k.color}`} style={{ fontSize: 20 }}>{k.icon}</div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        {/* Recent Orders */}
        <div className="card">
          <div className="flex-between mb-12">
            <div className="section-title" style={{ margin: 0 }}>Recent Orders</div>
            <div style={{ display: "flex", gap: 8 }}>
              <div className="badge-chip orange">4 Active</div>
            </div>
          </div>
          <div className="orders-list">
            {RECENT_ORDERS.map(o => (
              <div key={o._id} className="order-row">
                <div style={{ flex: "0 0 70px" }}>
                  <div className="order-id">#{o._id.slice(-3)}</div>
                  <div className="text-xs text-muted2">{o.time}</div>
                </div>
                <div style={{ flex: "0 0 80px" }}>
                  {o.table
                    ? <span className="badge-chip orange" style={{ fontSize: 10 }}>Table {o.table}</span>
                    : <span className={`agg-badge ${o.source}`}>{o.source}</span>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div className="text-sm">{o.waiter}</div>
                  <div className="text-xs text-muted2">{o.items} items</div>
                </div>
                <div style={{ textAlign: "right", marginRight: 12 }}>
                  <div className="font-display fw-700" style={{ fontSize: 14 }}>₹{o.total}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Table Status */}
        <div className="card">
          <div className="section-title">Live Table Status</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
            {[
              { label: "Available", count: 5, color: "green" },
              { label: "Occupied", count: 4, color: "orange" },
              { label: "Reserved", count: 2, color: "yellow" },
              { label: "Billing", count: 1, color: "blue" },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: `var(--${s.color === "orange" ? "accent" : s.color})` }} />
                <span className="text-xs text-muted">{s.label} <strong style={{ color: "var(--text)" }}>{s.count}</strong></span>
              </div>
            ))}
          </div>
          <div className="tables-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {TABLES.map(t => (
              <div key={t._id} className={`table-card ${t.status}`} style={{ padding: 8, gap: 3 }}>
                <div className="table-dot" />
                <div className="table-num" style={{ fontSize: 18 }}>{t.number}</div>
                <div className="table-meta">{t.seats}🪑</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aggregator Summary */}
      <div className="card">
        <div className="flex-between mb-12">
          <div className="section-title" style={{ margin: 0 }}>Online Orders</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span className="agg-badge swiggy" style={{ padding: "4px 10px", borderRadius: 12 }}>Swiggy Live</span>
            <span className="agg-badge zomato" style={{ padding: "4px 10px", borderRadius: 12 }}>Zomato Live</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {AGG_ORDERS.map(o => (
            <div key={o.id} className="agg-order">
              <div className="flex-between mb-8">
                <span className={`agg-badge ${o.platform}`}>{o.platform === "swiggy" ? "🟠 Swiggy" : "🔴 Zomato"}</span>
                <span className="text-xs text-muted2">{o.time}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{o.customer}</div>
              <div className="text-xs text-muted" style={{ marginBottom: 8 }}>{o.items}</div>
              <div className="flex-between">
                <span className="font-display fw-700 text-accent" style={{ fontSize: 14 }}>₹{o.total}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── WAITER UI ────────────────────────────────────────────────────────────────
function WaiterUI() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showBillModal, setShowBillModal] = useState(false);

  const categories = ["All", ...new Set(MENU.map(m => m.category))];

  const filtered = MENU.filter(m => {
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && m.available;
  });

  const addItem = (item) => {
    setOrderItems(prev => {
      const ex = prev.find(i => i._id === item._id);
      if (ex) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setOrderItems(prev =>
      prev.map(i => i._id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    );
  };

  const subtotal = orderItems.reduce((a, i) => a + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  return (
    <div className="waiter-root">
      {/* Menu Side */}
      <div className="waiter-main scroll" style={{ padding: 20, gap: 16, display: "flex", flexDirection: "column" }}>
        {/* Table Selector */}
        <div className="card card-sm">
          <div className="flex-between gap-12">
            <div className="section-title" style={{ margin: 0, fontSize: 13 }}>Select Table</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TABLES.filter(t => t.status === "available" || t.status === "occupied").slice(0, 8).map(t => (
                <button
                  key={t._id}
                  className="btn btn-ghost btn-sm"
                  style={selectedTable?._id === t._id ? { background: "rgba(255,107,43,0.15)", borderColor: "rgba(255,107,43,0.3)", color: "var(--accent)" } : {}}
                  onClick={() => setSelectedTable(t)}
                >
                  T{t.number}
                </button>
              ))}
            </div>
            {selectedTable && (
              <div className="badge-chip orange">Table {selectedTable.number} — {selectedTable.seats} seats</div>
            )}
          </div>
        </div>

        {/* Search + Categories */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input className="input-field" placeholder="🔍  Search menu items..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="menu-categories">
            {categories.map(c => (
              <button key={c} className={`cat-chip ${activeCategory === c ? "active" : ""}`} onClick={() => setActiveCategory(c)}>{c}</button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="menu-grid">
          {filtered.map(item => (
            <div key={item._id} className="menu-item-card" onClick={() => addItem(item)}>
              <div className="menu-item-img">{item.emoji}</div>
              <div className="menu-item-body">
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div className={`veg-dot ${item.isVeg ? "veg" : "nonveg"}`} />
                  <div className="menu-item-name">{item.name}</div>
                </div>
                <div className="menu-item-meta">
                  <div className="menu-item-price">₹{item.price}</div>
                  <div className="text-xs text-muted2">{item.prepTime}m</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Panel */}
      <div className="order-panel">
        <div className="order-panel-header">
          <div className="flex-between mb-8">
            <div className="font-display fw-700" style={{ fontSize: 16 }}>
              {selectedTable ? `Table ${selectedTable.number}` : "New Order"}
            </div>
            {orderItems.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setOrderItems([])}>Clear</button>
            )}
          </div>
          <div className="text-xs text-muted">{orderItems.length} items</div>
        </div>

        <div className="order-items scroll">
          {orderItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <div className="empty-state-text">Tap items from<br />the menu to add</div>
            </div>
          ) : (
            orderItems.map(item => (
              <div key={item._id} className="order-item">
                <div style={{ fontSize: 18 }}>{item.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div className="order-item-name">{item.name}</div>
                  <div className="order-item-price">₹{item.price}</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => changeQty(item._id, -1)}>−</button>
                  <span className="qty-num">{item.qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(item._id, 1)}>+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-footer">
          <div className="order-total-row">
            <div className="order-total-label">Subtotal</div>
            <div className="order-total-val">₹{subtotal}</div>
          </div>
          <div className="order-total-row">
            <div className="order-total-label">GST (5%)</div>
            <div className="order-total-val">₹{gst}</div>
          </div>
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 4 }}>
            <div className="order-total-row">
              <div className="font-display fw-700" style={{ fontSize: 14 }}>Total</div>
              <div className="order-grand">₹{total}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} disabled={!orderItems.length}
              onClick={() => setShowBillModal(true)}>🖨️ Bill</button>
            <button className="btn btn-primary" style={{ flex: 2 }} disabled={!orderItems.length || !selectedTable}
              onClick={() => { alert("Order placed to kitchen!"); setOrderItems([]); }}>
              Send to Kitchen
            </button>
          </div>
          {!selectedTable && <div className="text-xs text-muted" style={{ textAlign: "center", marginTop: 6 }}>Select a table to place order</div>}
        </div>
      </div>

      {/* Bill Modal */}
      {showBillModal && (
        <div className="modal-overlay" onClick={() => setShowBillModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🖨️ Bill Preview</div>
            <div className="receipt">
              <div className="receipt-title">RESTAURANT POS</div>
              <div style={{ textAlign: "center", fontSize: 11, marginBottom: 8 }}>Table {selectedTable?.number || "—"} | {new Date().toLocaleTimeString()}</div>
              <hr className="receipt-divider" />
              {orderItems.map(i => (
                <div key={i._id} className="receipt-row" style={{ marginBottom: 4 }}>
                  <span>{i.name} × {i.qty}</span>
                  <span>₹{i.price * i.qty}</span>
                </div>
              ))}
              <hr className="receipt-divider" />
              <div className="receipt-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="receipt-row"><span>GST 5%</span><span>₹{gst}</span></div>
              <hr className="receipt-divider" />
              <div className="receipt-row receipt-total"><span>TOTAL</span><span>₹{total}</span></div>
              <hr className="receipt-divider" />
              <div style={{ textAlign: "center", fontSize: 10, marginTop: 8 }}>Thank you! Visit again 🙏</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button className="btn btn-ghost w-full" onClick={() => setShowBillModal(false)}>Close</button>
              <button className="btn btn-primary w-full" onClick={() => setShowBillModal(false)}>Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KITCHEN DISPLAY ──────────────────────────────────────────────────────────
function KitchenDisplay() {
  const [orders, setOrders] = useState(KITCHEN_ORDERS);
  const [filter, setFilter] = useState("all");

  const filtered = orders.filter(o => filter === "all" || o.status === filter);

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
  };

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    preparing: orders.filter(o => o.status === "preparing").length,
    ready: orders.filter(o => o.status === "ready").length,
  };

  return (
    <div className="scroll" style={{ height: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex-between">
        <div className="tabs">
          {[
            { key: "all", label: `All (${counts.all})` },
            { key: "pending", label: `⏳ Pending (${counts.pending})` },
            { key: "preparing", label: `🔥 Preparing (${counts.preparing})` },
            { key: "ready", label: `✅ Ready (${counts.ready})` },
          ].map(t => (
            <button key={t.key} className={`tab-btn ${filter === t.key ? "active" : ""}`} onClick={() => setFilter(t.key)}>{t.label}</button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm">↻ Auto-refresh: ON</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍳</div>
          <div className="empty-state-text">No orders in this queue</div>
        </div>
      ) : (
        <div className="kitchen-grid">
          {filtered.map(order => (
            <div key={order._id} className="kitchen-card">
              <div className={`kitchen-card-header ${order.status}`}>
                <div>
                  <div className="kitchen-table-num">Table {order.tableNumber}</div>
                  <div className={`kitchen-timer ${order.urgent ? "urgent" : ""}`}>
                    {order.urgent ? "⚠️ " : "🕐 "}{order.time}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="kitchen-items">
                {order.items.map((item, i) => (
                  <div key={i} className="kitchen-item">
                    <div className="kitchen-item-qty">{item.qty}</div>
                    <div style={{ flex: 1 }}>
                      <div className="kitchen-item-name">{item.name}</div>
                      {item.note && <div className="kitchen-item-note">📝 {item.note}</div>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="kitchen-actions">
                {order.status === "pending" && (
                  <button className="btn btn-ghost w-full" style={{ flex: 1, fontSize: 12 }}
                    onClick={() => updateStatus(order._id, "preparing")}>🔥 Start Preparing</button>
                )}
                {order.status === "preparing" && (
                  <button className="btn btn-green w-full" style={{ flex: 1, fontSize: 12 }}
                    onClick={() => updateStatus(order._id, "ready")}>✅ Mark Ready</button>
                )}
                {order.status === "ready" && (
                  <button className="btn btn-ghost w-full" style={{ flex: 1, fontSize: 12, color: "var(--text3)" }}>
                    Waiting for waiter...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TABLES MANAGEMENT ────────────────────────────────────────────────────────
function TablesView() {
  const [tables, setTables] = useState(TABLES);
  const [selected, setSelected] = useState(null);
  const [floor, setFloor] = useState("All");

  const floors = ["All", "Ground", "First"];
  const filtered = tables.filter(t => floor === "All" || t.floor === floor);

  const statusColors = { available: "var(--green)", occupied: "var(--accent)", reserved: "var(--yellow)", billing: "var(--blue)" };

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <div className="scroll" style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="flex-between">
          <div className="tabs">
            {floors.map(f => (
              <button key={f} className={`tab-btn ${floor === f ? "active" : ""}`} onClick={() => setFloor(f)}>{f} Floor</button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm">+ Add Table</button>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {["available", "occupied", "reserved", "billing"].map(s => (
            <div key={s} className="flex-center gap-8">
              <div style={{ width: 10, height: 10, borderRadius: 3, background: statusColors[s] }} />
              <span className="text-sm text-muted" style={{ textTransform: "capitalize" }}>{s}</span>
            </div>
          ))}
        </div>

        <div className="tables-grid">
          {filtered.map(t => (
            <div key={t._id} className={`table-card ${t.status}`}
              style={selected?._id === t._id ? { boxShadow: "0 0 0 2px var(--accent)" } : {}}
              onClick={() => setSelected(selected?._id === t._id ? null : t)}
            >
              <div className="table-dot" />
              <div className="table-num">{t.number}</div>
              <div className="table-meta">{t.seats} seats</div>
              <div className="table-meta" style={{ fontSize: 9, opacity: 0.7 }}>{t.floor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Detail Panel */}
      {selected && (
        <div style={{ width: 280, background: "var(--surface)", borderLeft: "1px solid var(--border)", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="flex-between">
            <div className="font-display fw-700" style={{ fontSize: 18 }}>Table {selected.number}</div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}>✕</button>
          </div>

          <div className="card card-sm" style={{ gap: 10, display: "flex", flexDirection: "column" }}>
            <div className="flex-between">
              <span className="text-sm text-muted">Status</span>
              <StatusBadge status={selected.status} />
            </div>
            <div className="flex-between">
              <span className="text-sm text-muted">Seats</span>
              <span className="text-sm fw-700">{selected.seats}</span>
            </div>
            <div className="flex-between">
              <span className="text-sm text-muted">Floor</span>
              <span className="text-sm fw-700">{selected.floor}</span>
            </div>
          </div>

          <div className="section-title">Change Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {["available", "occupied", "reserved", "billing"].map(s => (
              <button key={s} className="btn btn-ghost"
                style={selected.status === s ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}}
                onClick={() => {
                  setTables(prev => prev.map(t => t._id === selected._id ? { ...t, status: s } : t));
                  setSelected(prev => ({ ...prev, status: s }));
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColors[s] }} />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {selected.status === "occupied" && (
            <button className="btn btn-primary">View Current Order →</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MENU MANAGEMENT ──────────────────────────────────────────────────────────
function MenuManagement() {
  const [menu, setMenu] = useState(MENU);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const categories = ["All", ...new Set(menu.map(m => m.category))];
  const filtered = menu.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || m.category === catFilter;
    return matchSearch && matchCat;
  });

  const toggleAvailable = (id) => {
    setMenu(prev => prev.map(m => m._id === id ? { ...m, available: !m.available } : m));
  };

  return (
    <div className="scroll" style={{ height: "100%", padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="flex-between">
        <div style={{ display: "flex", gap: 10, flex: 1 }}>
          <input className="input-field" style={{ maxWidth: 300 }} placeholder="🔍 Search menu..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditItem(null); setShowModal(true); }}>+ Add Item</button>
      </div>

      <div className="menu-categories">
        {categories.map(c => (
          <button key={c} className={`cat-chip ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px 80px 100px", gap: 12, padding: "10px 16px", borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
          {["", "Item", "Category", "Price", "Prep", "Veg", "Status"].map((h, i) => (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</div>
          ))}
        </div>

        {filtered.map(item => (
          <div key={item._id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px 100px 100px 80px 100px", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--border)", alignItems: "center", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize: 22 }}>{item.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
              <div className="text-xs text-muted2">{item.prepTime} min prep</div>
            </div>
            <div><span className="badge-chip purple" style={{ fontSize: 10 }}>{item.category}</span></div>
            <div className="font-display fw-700 text-accent">₹{item.price}</div>
            <div className="text-sm text-muted">{item.prepTime}m</div>
            <div>
              <div className={`veg-dot ${item.isVeg ? "veg" : "nonveg"}`} style={{ width: 12, height: 12 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label className="toggle-switch">
                <input type="checkbox" checked={item.available} onChange={() => toggleAvailable(item._id)} />
                <span className="toggle-slider" />
              </label>
              <span className={`text-xs ${item.available ? "text-green" : "text-muted2"}`}>{item.available ? "Live" : "Off"}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">+ Add Menu Item</div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input className="input-field" placeholder="e.g. Paneer Tikka" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="input-field" placeholder="e.g. Starters" />
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="input-field" type="number" placeholder="280" />
              </div>
              <div className="form-group">
                <label className="form-label">Prep Time (min)</label>
                <input className="input-field" type="number" placeholder="15" />
              </div>
              <div className="form-group">
                <label className="form-label">Spice Level (0–5)</label>
                <input className="input-field" type="number" min="0" max="5" placeholder="3" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount (%)</label>
                <input className="input-field" type="number" min="0" max="100" placeholder="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="input-field" placeholder="Short description..." />
            </div>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider" /></label>
                <span className="text-sm">Veg</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="toggle-slider" /></label>
                <span className="text-sm">Available</span>
              </label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost w-full" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary w-full" onClick={() => setShowModal(false)}>Add Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AGGREGATOR INTEGRATION ───────────────────────────────────────────────────
function AggregatorView() {
  const [swiggy, setSwiggy] = useState(true);
  const [zomato, setZomato] = useState(true);

  return (
    <div className="scroll" style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Swiggy */}
        <div className={`agg-card ${swiggy ? "connected" : "disconnected"}`}>
          <div className="flex-between mb-12">
            <div>
              <div style={{ fontSize: 28 }}>🟠</div>
              <div className="agg-name" style={{ color: "#fc8019" }}>Swiggy</div>
              <div className="text-sm text-muted">Online food delivery</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <label className="toggle-switch" style={{ marginBottom: 8, display: "block" }}>
                <input type="checkbox" checked={swiggy} onChange={e => setSwiggy(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span className={swiggy ? "badge-chip green" : "badge-chip red"}>{swiggy ? "Live" : "Paused"}</span>
            </div>
          </div>
          {swiggy && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[{ label: "Orders today", val: "23" }, { label: "Revenue", val: "₹8,240" }, { label: "Avg rating", val: "4.3⭐" }].map((s, i) => (
                <div key={i} className="card card-sm" style={{ textAlign: "center" }}>
                  <div className="font-display fw-700" style={{ fontSize: 16 }}>{s.val}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm">⚙️ Settings</button>
            <button className="btn btn-ghost btn-sm">📋 Menu Sync</button>
            {swiggy && <button className="btn btn-ghost btn-sm">📊 Analytics</button>}
          </div>
        </div>

        {/* Zomato */}
        <div className={`agg-card ${zomato ? "connected" : "disconnected"}`}>
          <div className="flex-between mb-12">
            <div>
              <div style={{ fontSize: 28 }}>🔴</div>
              <div className="agg-name" style={{ color: "#cb2027" }}>Zomato</div>
              <div className="text-sm text-muted">Online food delivery</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <label className="toggle-switch" style={{ marginBottom: 8, display: "block" }}>
                <input type="checkbox" checked={zomato} onChange={e => setZomato(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <span className={zomato ? "badge-chip green" : "badge-chip red"}>{zomato ? "Live" : "Paused"}</span>
            </div>
          </div>
          {zomato && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
              {[{ label: "Orders today", val: "31" }, { label: "Revenue", val: "₹11,680" }, { label: "Avg rating", val: "4.1⭐" }].map((s, i) => (
                <div key={i} className="card card-sm" style={{ textAlign: "center" }}>
                  <div className="font-display fw-700" style={{ fontSize: 16 }}>{s.val}</div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm">⚙️ Settings</button>
            <button className="btn btn-ghost btn-sm">📋 Menu Sync</button>
            {zomato && <button className="btn btn-ghost btn-sm">📊 Analytics</button>}
          </div>
        </div>
      </div>

      {/* Live Aggregator Orders */}
      <div className="card">
        <div className="flex-between mb-16">
          <div className="section-title" style={{ margin: 0 }}>Live Delivery Orders</div>
          <div style={{ display: "flex", gap: 8 }}>
            {swiggy && <span className="badge-chip green">Swiggy Active</span>}
            {zomato && <span className="badge-chip green">Zomato Active</span>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {AGG_ORDERS.map(o => (
            <div key={o.id} className="agg-order" style={{ background: "var(--surface2)" }}>
              <div className="flex-between mb-8">
                <span className={`agg-badge ${o.platform}`} style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11 }}>
                  {o.platform === "swiggy" ? "🟠 Swiggy" : "🔴 Zomato"}
                </span>
                <span className="text-xs text-muted2">{o.time}</span>
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{o.customer}</div>
              <div className="text-sm text-muted" style={{ marginBottom: 10 }}>{o.items}</div>
              <div className="status-flow">
                {["confirmed", "preparing", "ready"].map((s, i) => (
                  <div key={s} className={`status-step ${
                    ["confirmed","preparing","ready"].indexOf(o.status) >= i ? (["confirmed","preparing","ready"].indexOf(o.status) === i ? "active" : "done") : ""
                  }`} />
                ))}
              </div>
              <div className="flex-between">
                <span className="font-display fw-700 text-accent" style={{ fontSize: 16 }}>₹{o.total}</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu Sync */}
      <div className="card">
        <div className="section-title">Menu Sync Status</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { platform: "swiggy", items: 42, synced: 40, lastSync: "Today, 9:00 AM" },
            { platform: "zomato", items: 42, synced: 42, lastSync: "Today, 10:30 AM" },
          ].map(s => (
            <div key={s.platform} className="card card-sm">
              <div className="flex-between mb-8">
                <span className="font-display fw-700" style={{ textTransform: "capitalize" }}>{s.platform}</span>
                <button className="btn btn-ghost btn-sm">↻ Sync Now</button>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <div><div className="font-display fw-700" style={{ fontSize: 18 }}>{s.synced}/{s.items}</div><div className="text-xs text-muted">Items synced</div></div>
                <div><div className="font-display fw-700" style={{ fontSize: 18 }}>{s.items - s.synced}</div><div className="text-xs text-muted">Pending</div></div>
                <div><div className="text-xs text-muted">Last sync</div><div className="text-xs" style={{ color: "var(--green)" }}>{s.lastSync}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS VIEW ─────────────────────────────────────────────────────────────
function ReportsView() {
  const hourlyData = [
    { hour: "9AM", revenue: 1200, orders: 4 },
    { hour: "10AM", revenue: 2800, orders: 9 },
    { hour: "11AM", revenue: 4200, orders: 14 },
    { hour: "12PM", revenue: 7800, orders: 26 },
    { hour: "1PM", revenue: 9400, orders: 31 },
    { hour: "2PM", revenue: 6200, orders: 20 },
    { hour: "3PM", revenue: 3100, orders: 10 },
    { hour: "4PM", revenue: 2400, orders: 8 },
  ];
  const maxRev = Math.max(...hourlyData.map(d => d.revenue));

  const topItems = [
    { name: "Chicken Biryani", qty: 47, revenue: 15040 },
    { name: "Butter Chicken", qty: 39, revenue: 13260 },
    { name: "Paneer Tikka", qty: 35, revenue: 9800 },
    { name: "Garlic Naan", qty: 128, revenue: 7680 },
    { name: "Dal Makhani", qty: 31, revenue: 6820 },
  ];

  return (
    <div className="scroll" style={{ height: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="kpi-grid">
        {[
          { label: "Today's Revenue", value: "₹38,460", sub: "93 orders", color: "orange" },
          { label: "This Week", value: "₹2,18,340", sub: "547 orders", color: "green" },
          { label: "This Month", value: "₹8,64,200", sub: "2,194 orders", color: "purple" },
          { label: "Avg Order Value", value: "₹409", sub: "+4.2% vs last month", color: "blue" },
        ].map((k, i) => (
          <div key={i} className={`kpi-card ${k.color}`}>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Hourly Revenue Chart */}
        <div className="card">
          <div className="section-title">Hourly Revenue — Today</div>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 160 }}>
            {hourlyData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: "var(--text3)" }}>₹{(d.revenue/1000).toFixed(1)}k</div>
                <div style={{
                  width: "100%", borderRadius: "4px 4px 0 0",
                  background: `linear-gradient(180deg, var(--accent), var(--accent2))`,
                  height: `${(d.revenue / maxRev) * 110}px`,
                  transition: "height 0.3s", minHeight: 4,
                  opacity: 0.8
                }} />
                <div style={{ fontSize: 10, color: "var(--text3)" }}>{d.hour}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div className="card">
          <div className="section-title">Top Selling Items</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topItems.map((item, i) => (
              <div key={i}>
                <div className="flex-between" style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                  <div className="text-xs text-muted">{item.qty} sold</div>
                </div>
                <div style={{ height: 4, background: "var(--surface3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(item.qty / topItems[0].qty) * 100}%`, background: "linear-gradient(90deg, var(--accent), var(--accent2))", borderRadius: 2, transition: "width 0.5s" }} />
                </div>
                <div className="text-xs text-muted2" style={{ marginTop: 2 }}>₹{item.revenue.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="card">
        <div className="section-title">Revenue by Source</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Dine-in", pct: 58, rev: "₹22,310", orders: 54, color: "var(--accent4)" },
            { label: "Swiggy", pct: 22, rev: "₹8,240", orders: 23, color: "#fc8019" },
            { label: "Zomato", pct: 30, rev: "₹11,680", orders: 31, color: "#cb2027" },
          ].map((s, i) => (
            <div key={i} className="card card-sm">
              <div className="flex-between mb-8">
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: s.color }}>{s.pct}%</div>
              </div>
              <div style={{ height: 6, background: "var(--surface3)", borderRadius: 3, marginBottom: 8 }}>
                <div style={{ height: "100%", width: `${s.pct}%`, background: s.color, borderRadius: 3 }} />
              </div>
              <div className="flex-between">
                <span className="text-xs text-muted">{s.orders} orders</span>
                <span className="font-display fw-700" style={{ fontSize: 14, color: s.color }}>{s.rev}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const NAV = [
  { key: "dashboard", icon: "⊞", label: "Dash" },
  { key: "waiter", icon: "🍽️", label: "Waiter" },
  { key: "kitchen", icon: "🔥", label: "Kitchen", badge: 3 },
  { key: "tables", icon: "⬜", label: "Tables" },
  { key: "menu", icon: "📋", label: "Menu" },
  { key: "delivery", icon: "🛵", label: "Online" },
  { key: "reports", icon: "📊", label: "Reports" },
];

const PAGE_TITLES = {
  dashboard: "Dashboard",
  waiter: "Waiter — New Order",
  kitchen: "Kitchen Display System",
  tables: "Table Management",
  menu: "Menu Management",
  delivery: "Online Orders (Swiggy & Zomato)",
  reports: "Reports & Analytics",
};

export default function POSSystem() {
  const [active, setActive] = useState("dashboard");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const injectStyle = () => {
      const id = "pos-styles";
      if (!document.getElementById(id)) {
        const el = document.createElement("style");
        el.id = id; el.textContent = css;
        document.head.appendChild(el);
      }
    };
    injectStyle();
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "waiter": return <WaiterUI />;
      case "kitchen": return <KitchenDisplay />;
      case "tables": return <TablesView />;
      case "menu": return <MenuManagement />;
      case "delivery": return <AggregatorView />;
      case "reports": return <ReportsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="pos-root">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">POS</div>

        {NAV.map(n => (
          <button
            key={n.key}
            className={`nav-btn ${active === n.key ? "active" : ""}`}
            onClick={() => setActive(n.key)}
            title={n.label}
          >
            {n.badge && <div className="nav-badge">{n.badge}</div>}
            <span style={{ fontSize: 16 }}>{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}

        <div style={{ flex: 1 }} />
        <div className="sidebar-divider" />
        <button className="nav-btn" title="Settings">
          <span style={{ fontSize: 16 }}>⚙️</span>
          <span className="nav-label">Settings</span>
        </button>
      </div>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <div className="page-title">{PAGE_TITLES[active]}</div>
          </div>
          <div className="topbar-right">
            <span className="badge-chip green">● Live</span>
            <span className="badge-chip orange">🔥 3 in kitchen</span>
            <span className="text-sm text-muted">{time.toLocaleTimeString()}</span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent4), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>A</div>
          </div>
        </div>

        <div className="content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
