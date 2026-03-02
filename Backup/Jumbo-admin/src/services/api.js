import axios from "axios";
import { setGlobalLoading } from "../components/ui/LoaderContext";
import { toast } from "sonner";
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    setGlobalLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setGlobalLoading(false);
    return Promise.reject(error);
  },
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    setGlobalLoading(false);
    return response;
  },
  (error) => {
    setGlobalLoading(false);
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      //  Clear session
      localStorage.clear();

      toast.error("Session expired. Please login again.");

      //  Small delay so user sees toast
      setTimeout(() => {
        window.location.replace("/");
      }, 1500);
    }
    return Promise.reject(error);
  },
);

// API functions
export const fetchHomeDetails = async (range) => {
  try {
    const response = await api.get(`/home?range=${range}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const fetchHomeBadges = async () => {
  try {
    const response = await api.get("/home/badges");
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const fetchEmployees = async (page, limit, filter = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filter,
    }).toString();
    const response = await api.get(`/employees?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const fetchTasks = async (page, limit, filter = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filter,
    }).toString();
    const response = await api.get(`/task?${queryParams}`);
    return response.data; // { tasks: [...], total, totalPages, page }
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};




export const fetchTasksbyFilter = async ({ page, limit, filters = {} }) => {
  try {
    const body = {
      page,
      limit,
      ...filters, // category, assignTo, priority, status
    };
    const response = await api.post("/task/filter", body);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const fetchSopsbyFilter = async (page, limit, filter = {}) => {
  try {
    const response = await api.post(`/sop/filter`, filter, {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchAiReviewsbyFilter = async (bodyData) => {
  try {
    const response = await api.post("/ai-review/filter", bodyData);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchRequestbyFilter = async (page, limit, filter = {}) => {
  try {
    const response = await api.post(`/issue-request/filter`, filter, {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchAdvancebyFilter = async ({ page, limit, filters = {} }) => {
  try {
    const body = {
      page,
      limit,
      ...filters,
    };
    const response = await api.post("/advance-request/filter", body);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchLeavebyFilter = async ({ page, limit, filters = {} }) => {
  try {
    const body = {
      page,
      limit,
      ...filters,
    };
    const response = await api.post("/leave-request/filter", body);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchTaskById = async (id) => {
  try {
    const response = await api.get(`/task/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

export const fetchStaffById = async (id) => {
  try {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error;
  }
};

//  ********************************   SOP API ************************************

export const allSopApi = async (page, limit, filter = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filter,
  }).toString();
  try {
    const response = await api.get(`/sop?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching SOP:", error);
    throw error;
  }
};

export const fetchSOPById = async (id) => {
  try {
    const response = await api.get(`/sop/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching SOP:", error);
    throw error;
  }
};

export const createSop = async (form) => {
  try {
    const response = await api.post(`/sop`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error Creating SOP:", error);
    throw error;
  }
};

export const createTask = async (form) => {
  try {
    const response = await api.post(`/task`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error Creating Task:", error);
    throw error;
  }
};
export const updateSop = async (id, form) => {
  try {
    const response = await api.put(`/sop/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error Updating SOP:", error);
    throw error;
  }
};

export const updateTask = async (id, form) => {
  try {
    const response = await api.put(`/task/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error Updating Task:", error);
    //  throw new Error(error);
    throw error;
  }
};
export const deleteSOPById = async (id) => {
  try {
    const response = await api.delete(`/sop/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error Delete SOP:", error);
    throw error;
  }
};

export const deleteAdminById = async (id) => {
  try {
    const response = await api.delete(`/admin/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error Delete Admin:", error);
    throw error;
  }
};

//  *******************************   AI REVIEW API  ****************************

export const getAllAiReview = async () => {
  try {
    const response = await api.get(`/ai-review`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Ai Review:", error);
    throw error;
  }
};

export const fetchAiReviewById = async (id) => {
  try {
    const response = await api.get(`/ai-review/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Ai Review:", error);
    throw error;
  }
};
export const updateAiReview = async (id, form) => {
  try {
    const response = await api.put(`/ai-review/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error update aireview:", error);
    throw error;
  }
};

export const deleteAiReviewById = async (id) => {
  try {
    const response = await api.delete(`/ai-review/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Ai Review:", error);
    throw error;
  }
};

//*************************      Attendence Apis      *********************** */
export const getDailyAttendence = async (date) => {
  try {
    const response = await api.get(`/attendance/daily`, {
      params: {
        date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API ERROR:", error?.response || error);
    throw error;
  }
};

export const getAdminDailyAttendance = async (date) => {
  //  const queryParams = new URLSearchParams({ page, limit, ...filter,date}).toString();
  try {
    const response = await api.get(`/adminAttendance/daily`, {
      params: {
        date,
      },
    });
    return response.data;
  } catch (error) {
    console.error("API ERROR:", error?.response || error);
    throw error;
  }
};

//****************************  Request apis         ************************************* */

//*********isuues api  *************/
export const getAllIssueRequest = async (page, limit, filter = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filter,
    }).toString();
    const response = await api.get(`/issue-request?${queryParams}`);

    return response.data;
  } catch (error) {
    console.error("Error fetching Issue Request:", error);
    throw error;
  }
};

export const fetchIssueRequestById = async (id) => {
  try {
    const response = await api.get(`/issue-request/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Issue Request:", error);
    throw error;
  }
};

export const createRequestIssue = async (form) => {
  try {
    const response = await api.post("/issue-request", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating Issue Request: ", error);
    throw error;
  }
};
export const updateRequestIssue = async (id, status) => {
  try {
    const response = await api.put(`/issue-request/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("Error in creating Issue Request: ", error);
    throw error;
  }
};
export const editRequestIssue = async (id, form) => {
  try {
    const response = await api.put(`/issue-request/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in creating Issue Request: ", error);
    throw error;
  }
};

//************************    Advance request ******************** */

export const getAllAdvanceRequest = async (page, limit, filter = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filter,
  }).toString();
  try {
    const response = await api.get(`/advance-request?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Advance Request:", error);
    throw error;
  }
};
export const getAdvanceRequestById = async (id) => {
  try {
    const response = await api.get(`/advance-request/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Advance Request:", error);
    throw error;
  }
};

export const approveAdvanceRequest = async (id) => {
  try {
    const response = await api.post(`/advance-request/approve/${id}`, {
      status: "Completed",
    });
    return response.data;
  } catch (error) {
    console.error("Error approving Advance Request:", error);
    throw error;
  }
};
export const rejectAdvanceRequest = async (id) => {
  try {
    const response = await api.post(`/advance-request/reject/${id}`, {
      status: "Rejected",
    });
    return response.data;
  } catch (error) {
    console.error("Error reject Advance Request:", error);
    throw error;
  }
};
export const getEmployeeTransaction = async (id) => {
  try {
    const response = await api.get(`/advance-request/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Advance Request Transcation:", error);
    throw error;
  }
};
export const getAllEmployeeTransaction = async () => {
  try {
    const response = await api.get("/advance-request/transactionAll");
    return response.data;
  } catch (error) {
    console.error("Error fetching Advance Request Transcation:", error);
    throw error;
  }
};

//*****************    Leave Request ******************** */

export const getAllLeaveRequest = async (page, limit, filter = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filter,
    }).toString();
    const response = await api.get(`/leave-request?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Leave Request:", error);
    throw error;
  }
};

export const fetchLeaveRequestById = async (id) => {
  try {
    const response = await api.get(`/leave-request/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Leave Reques:", error);
    throw error;
  }
};
export const fetchLeaveHistory = async (id) => {
  try {
    const response = await api.get(`/leave-request/history/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching Leave Reques History:", error);
    throw error;
  }
};
export const approveLeaveRequest = async (id) => {
  try {
    const response = await api.put(`/leave-request/approve/${id}`, {
      status: "Completed",
    });
    return response.data;
  } catch (error) {
    console.error("Error approving Leave Reques:", error);
    throw error;
  }
};
export const rejectLeaveRequest = async (id) => {
  try {
    const response = await api.put(`/leave-request/reject/${id}`, {
      status: "Rejected",
    });
    return response.data;
  } catch (error) {
    console.error("Error reject Leave Reques:", error);
    throw error;
  }
};

//  ******************************         profile apis        *****************************
export const employeeCoinsApi = async (id) => {
  try {
    const response = await api.get(`/coins/wallet/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};
export const employeeDocuments = async (id) => {
  try {
    const response = await api.get(`/documents/employee/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};
export const employeeAllotedItems = async (employeeId) => {
  try {
    const response = await api.get(`/alloted-items/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};

export const fetchRequestById = async (id) => {
  try {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};

export const fetchAIReviewById = async (id) => {
  try {
    const response = await api.get(`/ai-reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching AI review:", error);
    throw error;
  }
};

export const fetchEmployeeOverviews = async (id) => {
  try {
    const response = await api.get(`/employees/overview/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching AI review:", error);
    throw error;
  }
};


// Add more API functions as needed for dashboard stats, etc.
export const fetchDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};

export const fetchRecentActivity = async () => {
  try {
    const response = await api.get("/activity/recent");
    return response.data;
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw error;
  }
};

export const fetchCheckIns = async () => {
  try {
    const response = await api.get("/checkins/today");
    return response.data;
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    throw error;
  }
};

export const createAdminCheckIns = async (form) => {
  try {
    const response = await api.post("/adminAttendance/check-in", form);
    return response.data;
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    throw error;
  }
};
export const createManagerCheckIns = async (form) => {
  try {
    const response = await api.post("attendance/check-in/manager", form);
    return response.data;
  } catch (error) {
    console.error("Error fetching check-ins:", error);
    throw error;
  }
};

export const createAdminCheckOut = async (form) => {
  try {
    const response = await api.post("/adminAttendance/check-out", form);
    return response.data;
  } catch (error) {
    console.error("Error fetching check-out:", error);
    throw error;
  }
};
export const createManagerCheckOut = async (form) => {
  try {
    const response = await api.post("/attendance/check-out/manager", form);
    return response.data;
  } catch (error) {
    console.error("Error fetching check-out:", error);
    throw error;
  }
};

export const loginUser = async (email, password, device) => {
  try {
    const response = await api.post("/auth/login", { email, password, device });
    return response.data; // Expected: { token, role: 'superadmin' | 'admin' }
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Test connection to backend
export const testConnection = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Error testing connection:", error);
    throw error;
  }
};

// Add restaurant and admin
export const addRestaurant = async (restaurantData) => {
  try {
    const response = await api.post("/admin/restaurants", restaurantData);
    return response.data;
  } catch (error) {
    console.error("Error adding restaurant:", error);
    throw error;
  }
};

export const updateRestaurantTheme = async (arg1, arg2) => {
  try {
    let url = "/admin/restaurants/theme";
    // Check if called as (restaurantId, updateData) or just (updateData)
    // If arg1 is ID (string) and arg2 is object, behave appropriately.
    let updateData = arg1;

    if (arg2 && typeof arg2 === "object") {
      url = `/admin/restaurants/${arg1}/theme`;
      updateData = arg2;
    }

    // Support both { theme: ..., modules: ... } format and older format where arg2 was just theme
    // If updateData has 'theme' or 'modules' as keys, use it directly.
    // If not, assume it's legacy theme object and wrap it in { theme: ... }
    let body = updateData;
    if (!updateData.theme && !updateData.modules && updateData.primary) {
         body = { theme: updateData };
         // Actually, if updateData has `primary` key then it's likely a theme object.
         // But what if modules is passed?
    }
    // But wait, existing code was: 
    // const response = await api.put(url, { theme: themeData });
    // This forcibly wraps it.
    
    // To maintain compatibility but allow modules:
    // If arg2 has 'modules' key, we pass it as is (merging theme if needed).
    // Or simpler: check if 'modules' inside arg2.
    
    if (updateData.modules) {
        body = updateData; // Pass as is: { modules: {...}, maybe theme: {...} }
    } else {
        // Assume it's just theme data if no modules key, for backward compat with existing calls
        // Existing calls pass { primary: '...' }
        // We wrap it in { theme: { primary: '...' } }
        if (!updateData.theme) {
             body = { theme: updateData };
        }
    }

    const response = await api.put(url, body);
    return response.data;
  } catch (error) {
    console.error("Error updating restaurant settings:", error);
    throw error;
  }
};

export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await api.put(`/employees/${id}`, employeeData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const fetchRestaurants = async () => {
  try {
    const response = await api.get("/restaurants");
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

export const addEmployee = async (form) => {
  try {
    const response = await api.post("/employees", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

//*************************   Admin Apis **************************** */

export const addAdmin = async (form) => {
  try {
    const response = await api.post("/admin/admins", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
};

export const fetchAdmins = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};
export const fetchAdminById = async (id) => {
  try {
    const response = await api.get(`/admin/user/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};
export const updateAdminById = async (id, form) => {
  try {
    const response = await api.put(`/admin/user/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
};

export const deleteAdmin = async (adminId) => {
  try {
    const response = await api.delete(`/admin/users/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};

// Restaurant Management
export const addNewRestaurant = async (restaurantData) => {
  try {
    const response = await api.post("/admin/restaurants", restaurantData);
    return response.data;
  } catch (error) {
    console.error("Error adding restaurant:", error);
    throw error;
  }
};

export const fetchAllRestaurants = async () => {
  try {
    const response = await api.get("/admin/restaurants");
    return response.data;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    throw error;
  }
};

export const deleteRestaurant = async (restaurantId) => {
  try {
    const response = await api.delete(`/admin/restaurants/${restaurantId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    throw error;
  }
};

export const createSalaryRecord = async (form) => {
  try {
    const response = await api.post(`/salary-record`, form);
    return response.data;
  } catch (error) {
    console.error("Error Creating Task:", error);
    throw error;
  }
};

export const getSalaryRecord = async (month, year) => {
  try {
    const response = await api.get(
      `/salary-record?month=${month}&year=${year}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};
export const createPaymentRecord = async (payload) => {
  try {
    const response = await api.post("/payments", payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};
export const getPaymentRecord = async (month, year) => {
  try {
    const response = await api.get(`/payments?month=${month}&year=${year}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

export const getPaymentRecordByid = async (id, month, year) => {
  try {
    const response = await api.get(
      `/payments/${id}?month=${month}&year=${year}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
};

/* Vouchers Apis*/
export const fetchVouchers = async (page = 1, limit = 10, filter = {}) => {
  try {
    const params = {
      page,
      limit,
    };

    if (filter.status) params.status = filter.status;

    if (filter.assignTo?.length) {
      params.assignTo = filter.assignTo.join(","); // send as CSV
    }

    if (filter.monthYear) {
      params.monthYear = filter.monthYear; // YYYY-MM
    }

    const response = await api.get("/voucher", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching voucher:", error);
    throw error;
  }
};

export const fetchVoucherById = async (id) => {
  try {
    const response = await api.get(`/voucher/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching voucher:", error);
    throw error;
  }
};

export const createVoucher = async (payload) => {
  try {
    const response = await api.post(`/voucher`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching voucher:", error);
    throw error;
  }
};
export const updateVoucher = async (id, payload) => {
  try {
    const response = await api.put(`/voucher/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error fetching voucher:", error);
    throw error;
  }
};
export default api;
