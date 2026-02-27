import { create } from "zustand";
import {
  allSopApi,
  employeeAllotedItems,
  employeeCoinsApi,
  employeeDocuments,
  fetchAdminById,
  fetchAdmins,
  fetchEmployees,
  fetchHomeDetails,
  fetchLeaveHistory,
  fetchStaffById,
  getAllAiReview,
  getEmployeeTransaction,
  getAllEmployeeTransaction,
  fetchEmployeeOverviews,
} from "../services/api"; // your function

const useStore = create((set) => ({
  employeeOverview:null,
  sops: [],
  employees: [],
  admins: [],
  admin: null,
  history: [],
  leave: [],
  documents: [],
  allotedItems: [],
  aiReview: [],
  staff: null,
  coins: null,
  loading: false,
  error: null,
  home: null,
  historyAll:[],

  fetchHome: async (role) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchHomeDetails(role);

      set({ home: response?.data });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchSops: async (page, limit, filters = {}) => {
    set({ loading: true, error: null });
    try {
        const response = await allSopApi(page, limit, filters);

      set({
        sops: response?.data,
        totalPages: response?.totalPages || 1,
        currentPage: page - 1,
      }); // store the fetched SOPs
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchEmployees: async () => {
    try {
      const res = await fetchEmployees();
      set({ employees: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getAiReview: async () => {
    try {
      const res = await getAllAiReview();
      set({ aiReview: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getAdmins: async () => {
    try {
      const res = await fetchAdmins();
      set({ admins: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getAdminById: async (id) => {
    try {
      const res = await fetchAdminById(id);
      set({ admin: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getIndividualStaff: async (id) => {
    try {
      const res = await fetchStaffById(id);
      set({ staff: res, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  getTransactions: async() =>{
    try{
      const res = await getAllEmployeeTransaction();
      set({historyAll:res?.data , loading:false});
    } catch(err){
      set({eror:err.message,loading:false});

    }
  },

  getTransaction: async (id) => {
    try {
      const res = await getEmployeeTransaction(id);
      set({ history: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getLeave: async (id) => {
    try {
      const res = await fetchLeaveHistory(id);
      set({ leave: res?.data, loading: false }); 
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getEmployeeCoins: async (id) => {
    try {
      const res = await employeeCoinsApi(id);
      set({ coins: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getEmployeeDocuments: async (id) => {
    try {
      const res = await employeeDocuments(id);
      set({ documents: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getEmployeeAllotedItems: async (id) => {
    try {
      const res = await employeeAllotedItems(id);
      set({ allotedItems: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getEmployeeOverview: async (id) => {
    try {
      const res = await fetchEmployeeOverviews(id);
      set({ employeeOverview: res?.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));

export default useStore;
