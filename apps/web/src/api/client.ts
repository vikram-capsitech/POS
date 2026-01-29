import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchProducts = async () => (await apiClient.get('/products')).data;
export const fetchTables = async () => (await apiClient.get('/tables')).data;
export const createOrder = async (orderData: any) => (await apiClient.post('/orders', orderData)).data;
export const fetchOrders = async () => (await apiClient.get('/orders')).data;
export const updateOrderStatus = async (id: string, status: string) => (await apiClient.put(`/orders/${id}/status`, { status })).data;
export const fetchRooms = async () => (await apiClient.get('/rooms')).data;

export const fetchInventory = async () => (await apiClient.get('/inventory')).data;
export const addStock = async (data: any) => (await apiClient.post('/inventory/stock', data)).data;
export const fetchStats = async () => (await apiClient.get('/reports/stats')).data;
