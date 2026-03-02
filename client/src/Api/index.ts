// Import necessary modules and utilities
import axios from "axios";
import { store } from "../redux/store";
import { SizeLevel } from "../Utils/theme";

// Create an Axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI, // Root server URL, e.g., http://localhost:8080
  withCredentials: true,
  timeout: 120000,
});

export interface ThemeSettings {
  themeName: string;
  themeType: "light" | "dark";
  fontFamily: string;
  sizeLevel: SizeLevel;
  isSystemDefault: boolean;
}

// Add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config) {
    const state = store.getState();
    if (state.auth?.token) {
      config.headers.Authorization = `Bearer ${state.auth.token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Helper for creating form data for file uploads
export const createFormData = (
  data: Record<string, any>,
  notAllowedKeys: string[] = [],
) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (
      !notAllowedKeys.includes(key) &&
      value !== undefined &&
      value !== null
    ) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item);
        });
      } else if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};

// ── 🔐 CORE / AUTH MODULE ───────────────────────────────────────────────────

export const setupSuperadmin = (data: any) =>
  apiClient.post("/api/auth/setup", data);
export const loginUser = (data: any) => apiClient.post("/api/auth/login", data);
export const logoutUser = () => apiClient.post("/api/auth/logout");
export const refreshAccessToken = (refreshToken?: string) =>
  apiClient.post("/api/auth/refresh-token", { refreshToken });
export const getMyProfile = () => apiClient.get("/api/auth/profile");
export const updateMyProfile = (data: FormData) =>
  apiClient.put("/api/auth/profile", data);
export const changePassword = (data: any) =>
  apiClient.put("/api/auth/change-password", data);
export const updateFcmToken = (fcmToken: string) =>
  apiClient.put("/api/auth/fcm-token", { fcmToken });

// ── 🏢 ADMIN MODULE ──────────────────────────────────────────────────────────

export const adminCreateOrg = (data: FormData) =>
  apiClient.post("/api/admin/organizations", data);
export const adminListOrgs = () => apiClient.get("/api/admin/organizations");
export const adminUpdateOrgTheme = (id: string, data: any) =>
  apiClient.put(`/api/admin/organizations/${id}/theme`, data);
export const adminCreateAdminAndOrg = (data: FormData) =>
  apiClient.post("/api/admin/admins", data);
export const adminListUsers = (params?: any) =>
  apiClient.get("/api/admin/users", { params });
export const adminGetUserById = (id: string) =>
  apiClient.get(`/api/admin/users/${id}`);
export const adminUpdateUser = (id: string, data: FormData) =>
  apiClient.put(`/api/admin/users/${id}`, data);
export const adminDeleteUser = (id: string) =>
  apiClient.delete(`/api/admin/users/${id}`);
export const adminAssignRole = (id: string, data: any) =>
  apiClient.put(`/api/admin/users/${id}/role`, data);
export const adminCreateRole = (data: any) =>
  apiClient.post("/api/admin/roles", data);
export const adminListRoles = (orgId?: string) =>
  apiClient.get("/api/admin/roles", { params: { orgId } });
export const adminUpdateRole = (id: string, data: any) =>
  apiClient.put(`/api/admin/roles/${id}`, data);
export const adminDeleteRole = (id: string) =>
  apiClient.delete(`/api/admin/roles/${id}`);

// ── 🏪 POS MODULE ────────────────────────────────────────────────────────────

// Menu
export const getMenuItems = (params?: any) =>
  apiClient.get("/api/pos/menu", { params });
export const createMenuItem = (data: FormData) =>
  apiClient.post("/api/pos/menu", data);
export const getMenuItemById = (id: string) =>
  apiClient.get(`/api/pos/menu/${id}`);
export const updateMenuItem = (id: string, data: FormData) =>
  apiClient.put(`/api/pos/menu/${id}`, data);
export const deleteMenuItem = (id: string) =>
  apiClient.delete(`/api/pos/menu/${id}`);

// Tables
export const getTables = () => apiClient.get("/api/pos/tables");
export const createTable = (data: any) =>
  apiClient.post("/api/pos/tables", data);
export const updateTable = (id: string, data: any) =>
  apiClient.put(`/api/pos/tables/${id}`, data);
export const deleteTable = (id: string) =>
  apiClient.delete(`/api/pos/tables/${id}`);

// Orders
export const getOrders = (params?: any) =>
  apiClient.get("/api/pos/orders", { params });
export const createOrder = (data: any) =>
  apiClient.post("/api/pos/orders", data);
export const getOrderById = (id: string) =>
  apiClient.get(`/api/pos/orders/${id}`);
export const updateOrder = (id: string, data: any) =>
  apiClient.put(`/api/pos/orders/${id}`, data);
export const deleteOrder = (id: string) =>
  apiClient.delete(`/api/pos/orders/${id}`);

// Inventory
export const getInventoryRequests = (params?: any) =>
  apiClient.get("/api/pos/inventory", { params });
export const createInventoryRequest = (data: any) =>
  apiClient.post("/api/pos/inventory", data);
export const updateInventoryRequest = (id: string, data: any) =>
  apiClient.put(`/api/pos/inventory/${id}`, data);

// Reports & Org
export const getPOSReports = (params?: any) =>
  apiClient.get("/api/pos/reports", { params });
export const getDailyPOSSummary = () => apiClient.get("/api/pos/reports/daily");
export const getCurrentOrg = () => apiClient.get("/api/pos/organization");
export const updateOrgSettings = (id: string, data: FormData) =>
  apiClient.put(`/api/pos/organization/${id}`, data);

// ── 👷 HRM / WORKFORCE MODULE ───────────────────────────────────────────────

// Employees
export const hrmListEmployees = (params?: any) =>
  apiClient.get("/api/employees", { params });
export const hrmAddEmployee = (data: FormData) =>
  apiClient.post("/api/employees", data);
export const hrmGetMyEmployeeProfile = () =>
  apiClient.get("/api/employees/profile");
export const hrmGetEmployeeOverview = (id: string, params?: any) =>
  apiClient.get(`/api/employees/overview/${id}`, { params });
export const hrmGetEmployeeById = (id: string) =>
  apiClient.get(`/api/employees/${id}`);
export const hrmUpdateEmployee = (id: string, data: FormData) =>
  apiClient.put(`/api/employees/${id}`, data);
export const hrmDeleteEmployee = (id: string) =>
  apiClient.delete(`/api/employees/${id}`);

// Attendance
export const hrmCheckIn = (data: FormData) =>
  apiClient.post("/api/attendance/check-in", data);
export const hrmManagerCheckIn = (data: any) =>
  apiClient.post("/api/attendance/check-in/manager", data);
export const hrmCheckOut = () => apiClient.post("/api/attendance/check-out");
export const hrmManagerCheckOut = (data: any) =>
  apiClient.post("/api/attendance/check-out/manager", data);
export const hrmStartBreak = () =>
  apiClient.post("/api/attendance/break/start");
export const hrmEndBreak = () => apiClient.post("/api/attendance/break/end");
export const hrmGetDailyAttendance = (date?: string) =>
  apiClient.get("/api/attendance/daily", { params: { date } });
export const hrmGetMonthlyAttendance = (params: any) =>
  apiClient.get("/api/attendance/monthly", { params });
export const hrmGetAttendanceById = (id: string) =>
  apiClient.get(`/api/attendance/${id}`);

// Leave & Advance
export const hrmApplyLeave = (data: any) =>
  apiClient.post("/api/leave-requests", data);
export const hrmListLeaveRequests = (params?: any) =>
  apiClient.get("/api/leave-requests", { params });
export const hrmUpdateLeaveStatus = (id: string, data: any) =>
  apiClient.put(`/api/leave-requests/${id}`, data);
export const hrmApplyAdvance = (data: any) =>
  apiClient.post("/api/advance-requests", data);
export const hrmListAdvanceRequests = () =>
  apiClient.get("/api/advance-requests");
export const hrmUpdateAdvanceStatus = (id: string, data: any) =>
  apiClient.put(`/api/advance-requests/${id}`, data);

// Tasks & SOPs
export const hrmListTasks = (params?: any) =>
  apiClient.get("/api/tasks", { params });
export const hrmCreateTask = (data: any) => apiClient.post("/api/tasks", data);
export const hrmUpdateTask = (id: string, data: any) =>
  apiClient.put(`/api/tasks/${id}`, data);
export const hrmDeleteTask = (id: string) =>
  apiClient.delete(`/api/tasks/${id}`);
export const hrmListSops = () => apiClient.get("/api/sops");
export const hrmCreateSop = (data: any) => apiClient.post("/api/sops", data);

// Financials (HRM)
export const hrmCreateSalaryRecord = (data: any) =>
  apiClient.post("/api/salary-records", data);
export const hrmListSalaryRecords = (params?: any) =>
  apiClient.get("/api/salary-records", { params });
export const hrmRecordPayment = (data: any) =>
  apiClient.post("/api/payments", data);
export const hrmListPayments = (params?: any) =>
  apiClient.get("/api/payments", { params });
export const hrmGetCoinWallet = () => apiClient.get("/api/coins");
export const hrmGetCoinTransactions = (params?: any) =>
  apiClient.get("/api/coins/transactions", { params });
export const hrmAwardCoins = (data: any) =>
  apiClient.post("/api/coins/award", data);

// ── 🔔 COMMON / MISC ────────────────────────────────────────────────────────

export const getNotifications = (params?: any) =>
  apiClient.get("/api/notifications", { params });
export const markNotificationRead = (id: string) =>
  apiClient.put(`/api/notifications/${id}/read`);
export const getDashboardHome = () => apiClient.get("/api/home");

// Legacy support placeholders (to prevent immediate build break if referenced)
export const getAvailableUsers = () => Promise.resolve({ data: [] });
export const getUserChats = () => Promise.resolve({ data: [] });

export default apiClient;
