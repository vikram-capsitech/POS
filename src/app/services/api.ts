import axios from 'axios';
import { MenuItem, Table, Order } from '@/app/data/mockData';

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token if exists
api.interceptors.request.use(config => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchMenu = async (restaurantId?: string): Promise<MenuItem[]> => {
    const response = await api.get('/menu', { params: { restaurantId } });
    return response.data;
};

export const fetchTables = async (restaurantId?: string): Promise<Table[]> => {
    const response = await api.get('/tables', { params: { restaurantId } });
    return response.data;
};

export const fetchOrders = async (restaurantId?: string): Promise<Order[]> => {
    const response = await api.get('/orders', { params: { restaurantId } });
    return response.data;
};

export const createOrder = async (orderData: Partial<Order>): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

export const updateOrder = async (id: string, status: string): Promise<Order> => {
    const response = await api.put(`/orders/${id}`, { status });
    return response.data;
};

export const addItemsToOrder = async (id: string, items: any[], total: number): Promise<Order> => {
    const response = await api.post(`/orders/${id}/items`, { items, total });
    return response.data;
};

export const createMenuItem = async (itemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.post('/menu', itemData);
    return response.data;
};

export const updateMenuItem = async (id: string, itemData: Partial<MenuItem>): Promise<MenuItem> => {
    const response = await api.put(`/menu/${id}`, itemData);
    return response.data;
};

export const updateTable = async (id: string, tableData: Partial<Table>): Promise<Table> => {
    const response = await api.put(`/tables/${id}`, tableData);
    return response.data;
};

export const createTable = async (tableData: Partial<Table>): Promise<Table> => {
    const response = await api.post('/tables', tableData);
    return response.data;
};

export const fetchOrderById = async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
};

// Inventory APIs
export const fetchInventoryRequests = async (restaurantId?: string) => {
    const response = await api.get('/inventory', { params: { restaurantId } });
    return response.data;
};

export const createInventoryRequest = async (data: any) => {
    const response = await api.post('/inventory/request', data);
    return response.data;
};

export const updateInventoryRequest = async (id: string, status: string) => {
    const response = await api.put(`/inventory/${id}`, { status });
    return response.data;
};

// Restaurant APIs
export const fetchRestaurants = async () => {
    const response = await api.get('/restaurant?all=true');
    return response.data;
};

export const createRestaurant = async (data: any) => {
    const response = await api.post('/restaurant', data);
    return response.data;
};

export const fetchRestaurantDetails = async (id?: string) => {
     // If id is provided, pass it. If not, backend defaults to first/singleton.
     const response = await api.get('/restaurant', { params: { id } });
     return response.data;
};

// Report APIs
export const fetchReportStats = async (restaurantId?: string) => {
    const response = await api.get('/reports/stats', { params: { restaurantId } });
    return response.data;
};

export const fetchReports = async (restaurantId?: string) => {
    const response = await api.get('/reports', { params: { restaurantId } });
    return response.data;
};

export const createReport = async (data: any) => {
    const response = await api.post('/reports', data);
    return response.data;
};
