# Unused Code Audit

Based on a thorough scan of your frontend and backend repositories, the following features have backend models, controllers, and routes, and frontend API wrappers in `client/src/Api/index.ts`, but are **not connected or called anywhere in your frontend React components**.

*(Note: Notifications were recently implemented and integrated, so they have been removed from this list).*

### 1. Leave Requests
- **Model:** `LeaveRequest.js` (`src/Models/workforce/LeaveRequest.js`)
- **Backend Controller:** Exists in workforce controllers.
- **Frontend APIs (Unused):** 
  - `hrmApplyLeave`
  - `hrmListLeaveRequests`
  - `hrmUpdateLeaveStatus`
- **Status:** Not connected to any UI. There is no page for employees to apply for leave or for admins to review/approve it.

### 2. Advance Salary Requests
- **Model:** `AdvanceRequest.js` (`src/Models/workforce/AdvanceRequest.js`)
- **Backend Controller:** Exists in workforce controllers.
- **Frontend APIs (Unused):** 
  - `hrmApplyAdvance`
  - `hrmListAdvanceRequests`
  - `hrmUpdateAdvanceStatus`
- **Status:** Not connected to any UI. No interface exists to request or handle salary advances.

### 3. POS Inventory Requests
- **Model:** `InventoryRequest.js` (`src/Models/pos/InventoryRequest.js`)
- **Backend Controller:** Exists in pos/operations controllers.
- **Frontend APIs (Unused):**
  - `getInventoryRequests`
  - `createInventoryRequest`
  - `updateInventoryRequest`
- **Status:** The UI components for POS staff to request inventory or track these requests are missing.

### 4. AI Reviews
- **Model:** `AiReview.js` (`src/Models/operations/AiReview.js`)
- **Backend Routes:** `src/Routes/operations/aiReviewRoutes.js`
- **Frontend APIs (Unused):** None. There aren't even frontend API wrappers written for this in `Api/index.ts` yet.
- **Status:** Completely detached from the frontend.

### 5. Activity / User Logs
- **Model:** `UserLog.js` (`src/Models/core/UserLog.js`)
- **Frontend APIs (Unused):**
  - `fetchUserLogs`
  - `fetchUserLogsStats`
- **Status:** The backend successfully logs user actions, but there's no "Activity Log" or "Audit Trail" page on the frontend to visualize and display this tracking.

### 6. Global Roles / Superadmin Management
- **Models:** Built-in permissions and roles context.
- **Frontend APIs (Unused):**
  - `getGlobalRoles`
  - `createGlobalRole`
  - `updateGlobalRole`
  - `deleteGlobalRole`
- **Status:** The structure for Superadmin-level overarching global roles exists, but no UI pages have been wired up for executing these global role assignments yet.

---

### Unused System Utility Methods (in `client/src/Api/index.ts`)
The following methods are defined in your frontend API client but are completely orphaned (never imported or triggered by any React component). They may be placeholders setup early in development:
- `getAppSetting` / `saveAppSetting`
- `getAvailableUsers`
- `getUserChats`
