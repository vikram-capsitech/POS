# Client Documentation

This document covers the UI Flow, routing structure, and component methodology for the React/Vite-based **OutletOps** frontend.

---

## 1. Application Layout & Philosophy
The client UI utilizes `react-router-dom` v6 for structured module rendering. The architecture separates concerns by mounting vastly different module sets (Main Admin vs POS vs Superadmin) into restricted routing branches wrapper with Layout GUIs (`MainLayout`, `PosLayout`, etc.).

### Navigation Principles
-   **Lazy Loading**: Most core pages are dynamically loaded through `React.lazy()` behind a `Suspense` wrapper displaying a `<LoadingScreen />`.
-   **Guards**: 
    -   `RequireAuth`: Blocks unauthenticated user access to `client/` and `pos/`.
    -   `RequirePermission`: Evaluates the authenticated user's scope (e.g., checking if the user holds valid clearance `moduleKey="POS"`).

---

## 2. Client UI Routing Flow

### A. Root & Authentication
-   `/` ➔ Redirects automatically to `/client`.
-   `/welcome` ➔ Landing Page showcasing application mockup. Contains an AI assistant driven Chatbot (`BotMessage` component).
-   `/auth/login` ➔ Login Page. Successful entry passes tokens to the auth store (`useAuthStore`).

### B. Admin Dashboard (`/client/:orgId/`)
Primary management suite wrapped in `MainLayout`. Needs the `MAIN` permission scope. 
-   **`/dashboard`**: Operational overview (KPIs, Active users).
-   **`/task`** / **`/task/new`**: Operational Checklist creation and review board.
-   **`/logs`**: Broad history logging view.
-   **`/settings`**: Organization settings.
-   **`/roles`**: Access and Role permission assignment GUI.
-   **`/attendance`**: Workforce tracking and HR table.

*Placeholders/In-Progress Views:* `issue`, `request`, `voucher`, `sop`, `ai-review`, `salary-management`.

### C. POS UI (`/pos/:orgId/`)
The transactional interface wrapped in `PosLayout`. Used securely on hardware devices internally. Needs `POS` permission scope.
-   **`/dashboard`**: Cashier/Admin transactional overview.
-   **`/waiter`**: Specialized fast-action order taking view. 
-   **`/kitchen`**: KDS (Kitchen Display System) UI designed specifically for preparation coordination. Real-time updates.
-   **`/menu`**: Menu item configuration page.
-   **`/delivery`**: Tracking integration for 3rd party/platform deliveries.
-   **`/expenses`**: Till expense tracker.

### D. SuperAdmin UI (`/super/`)
Underlying platform management GUI used to manage the system itself (not organization-specific).
-   Routes point to global metrics, global user override capabilities, and billing.

---

## 3. Theming and Components

-   The application primarily relies on the **Ant Design (antd)** library. Components like `Typography`, `Button`, `Divider`, `Space`, `Tag` are aggressively utilized for unified theming.
-   **Customization**: Heavy gradients, shadow dropping (`glassmorphism`), and pill styling are added in line to AntD default capabilities (visible in components like `BotMessage.tsx`).
-   Dark/Light structural styling is preserved in `App.css` and `index.css`.

---

## 4. How To Connect
1. Ensure the `OrgId` is injected correctly into your URLs for API Requests. It flows from the UI URI parameters (`useParams()`) directly to custom hooks bridging to an `apiClient`.
2. The UI uses Zustand (`Store/store.ts` usually) for global auth state caching. Listen to it for changes in roles to avoid sending the user to a route they won't pass `RequirePermission` guards on.
