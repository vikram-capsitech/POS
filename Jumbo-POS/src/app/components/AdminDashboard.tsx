import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Plus,
  Edit2,
  ChefHat,
  Settings,
  Layers,
  Globe,
  MapPin,
  Archive,
  CheckCircle,
  XCircle,
  Utensils,
  Brain,
  Palette,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCustomTheme } from "@/context/ThemeContext";
import {
  fetchOrders,
  fetchTables,
  fetchMenu,
  updateMenuItem,
  createMenuItem,
  updateTable,
  createTable,
  fetchRestaurants,
  createRestaurant,
  fetchInventoryRequests,
  updateInventoryRequest,
  fetchInventoryItems,
  fetchExpenses,
  fetchStaff,
  createInventoryItem,
  createExpense,
  updateRestaurantTheme,
} from "@/app/services/api";
import { Order, Table, MenuItem, InventoryItem, Expense, Staff } from "@/app/data/mockData";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  Card,
  CardContent,
  Stack,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem as MuiMenuItem,
  Tabs,
  Tab,
  Alert,
  Select,
  InputLabel,
  FormControl,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { TableLayoutCard } from "./TableLayoutCard";

export function AdminDashboard() {
  const { user, activeRestaurantId, setActiveRestaurantId } = useAuth();
  const { setCustomTheme } = useCustomTheme();
  const theme = useTheme();
  const navigate = useNavigate();

  const [period, setPeriod] = useState<"today" | "week" | "month">("today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // New States
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Calculate Chart Data with Expenses
  const chartData = useMemo(() => {
    const start = new Date(dateRange.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.endDate);
    end.setHours(23, 59, 59, 999);

    const isSameDay = start.toDateString() === end.toDateString();

    // Helper to format date key
    const getKey = (date: Date) => isSameDay ? date.getHours() : date.toISOString().split('T')[0];
    const getLabel = (key: string | number) => isSameDay ? `${key}:00` : new Date(key).toLocaleDateString();

    // Initialize Map
    const dataMap = new Map<string | number, { sales: number; expenses: number }>();

    if (isSameDay) {
      // init 24 hours
      for (let i = 0; i < 24; i++) dataMap.set(i, { sales: 0, expenses: 0 });
    } else {
      // init days loop
      let current = new Date(start);
      while (current <= end) {
        dataMap.set(current.toISOString().split('T')[0], { sales: 0, expenses: 0 });
        current.setDate(current.getDate() + 1);
      }
    }

    orders.forEach(order => {
      if (!order.timestamp) return;
      const date = new Date(order.timestamp);
      if (date >= start && date <= end) {
        const key = getKey(date);
        if (dataMap.has(key)) {
          dataMap.get(key)!.sales += (order.total || 0);
        } else if (!isSameDay) {
          // Fallback for timezone edge cases or just creating the key if simplified loop missed it
          dataMap.set(key, { sales: (order.total || 0), expenses: 0 });
        }
      }
    });

    expenses.forEach(exp => {
      if (!exp.date) return;
      const date = new Date(exp.date);
      if (date >= start && date <= end) {
        const key = getKey(date);
        if (dataMap.has(key)) {
          dataMap.get(key)!.expenses += (exp.amount || 0);
        } else if (!isSameDay) {
          dataMap.set(key, { sales: 0, expenses: (exp.amount || 0) });
        }
      }
    });

    // Convert map to array and sort
    return Array.from(dataMap.entries())
      .map(([key, val]) => ({
        time: getLabel(key),
        rawKey: key, // for sorting
        ...val
      }))
      .sort((a, b) => isSameDay ? (Number(a.rawKey) - Number(b.rawKey)) : (new Date(a.rawKey).getTime() - new Date(b.rawKey).getTime()));

  }, [orders, expenses, dateRange]);
  const [themeSettings, setThemeSettings] = useState({
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    mode: theme.palette.mode
  });

  const [stats, setStats] = useState({
    todaySales: 0,
    ordersCount: 0,
    occupancy: 0,
    kitchenLoad: 0,
  });
  const [loading, setLoading] = useState(true);

  // Loading state for table navigation
  const [openingTable, setOpeningTable] = useState<string | null>(null);

  // Lists
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [inventoryRequests, setInventoryRequests] = useState<any[]>([]);

  // Dialogs
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openRestaurantDialog, setOpenRestaurantDialog] = useState(false);
  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);

  // Forms
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    prepTime: "",
    isVeg: true,
    available: true,
    description: "",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  });
  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    address: "",
    phone: "",
  });
  const [newTable, setNewTable] = useState({ number: "", seats: "" });
  const [inventoryForm, setInventoryForm] = useState({ name: '', quantity: '', unit: '', minThreshold: '', category: '' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: '', paymentMethod: 'Cash' });

  const [itemSearch, setItemSearch] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch Restaurants first to populate selector
      const restData = await fetchRestaurants();
      setRestaurants(restData);

      // If no active restaurant, set first one
      if (!activeRestaurantId && restData.length > 0) {
        setActiveRestaurantId(restData[0]._id);
        return;
      }

      if (activeRestaurantId) {
        const [orderData, tableData, menuData, invData, invItemsData, expData, staffData] = await Promise.all([
          fetchOrders(activeRestaurantId),
          fetchTables(activeRestaurantId),
          fetchMenu(activeRestaurantId),
          fetchInventoryRequests(activeRestaurantId),
          fetchInventoryItems(),
          fetchExpenses(),
          fetchStaff(),
        ]);

        setOrders(orderData);
        setTables(tableData);
        setMenuItems(menuData);
        setInventoryRequests(invData);
        setInventoryItems(invItemsData);
        setExpenses(expData);
        setStaffList(staffData);

        // Calc Stats
        const total = orderData.reduce(
          (acc: number, o: Order) => acc + (o.total || 0),
          0,
        );
        const occ = tableData.filter(
          (t: Table) => t.status === "occupied",
        ).length;
        setStats({
          todaySales: total,
          ordersCount: orderData.length,
          occupancy: occ,
          kitchenLoad: Math.random() * 100, // Mock for now
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [activeRestaurantId]);

  // Handlers
  const handleInventoryAction = async (id: string, status: string) => {
    await updateInventoryRequest(id, status);
    loadData();
  };

  const handleCreateInventoryItem = async () => {
    await createInventoryItem({
      ...inventoryForm,
      quantity: Number(inventoryForm.quantity),
      minThreshold: Number(inventoryForm.minThreshold)
    });
    setOpenInventoryDialog(false);
    loadData();
  };

  const handleSaveTheme = async (primary: string, secondary: string, mode: string) => {
    if (!activeRestaurantId) return;
    try {
      const themeData = {
        primaryColor: primary,
        secondaryColor: secondary,
        mode: mode
      };

      await updateRestaurantTheme(activeRestaurantId, themeData);
      setCustomTheme(themeData);
      alert("Theme updated successfully! It will reflect across all apps.");
    } catch (e) {
      console.error("Failed to update theme", e);
      alert("Failed to update theme");
    }
  };

  const handleCreateExpense = async () => {
    await createExpense({
      ...expenseForm,
      amount: Number(expenseForm.amount),
      date: new Date()
    });
    setOpenExpenseDialog(false);
    loadData();
  };


  const handleCreateRestaurant = async () => {
    await createRestaurant(restaurantForm);
    setOpenRestaurantDialog(false);
    setRestaurantForm({ name: "", address: "", phone: "" });
    loadData();
  };

  const handleCreateTable = async () => {
    if (!activeRestaurantId) return;
    await createTable({ ...newTable, restaurantId: activeRestaurantId } as any);
    setNewTable({ number: "", seats: "" });
    setOpenTableDialog(false);
    loadData();
  };

  const handleSaveItem = async () => {
    if (!activeRestaurantId) return;
    const payload = {
      ...formData,
      price: Number(formData.price),
      prepTime: Number(formData.prepTime),
      restaurantId: activeRestaurantId,
    };
    if (editingItem) {
      await updateMenuItem(editingItem.id || (editingItem as any)._id, payload);
    } else {
      await createMenuItem(payload);
    }
    setOpenItemDialog(false);
    loadData();
  };

  if (loading && !restaurants.length)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  if (!activeRestaurantId && restaurants.length === 0 && !loading)
    return <Box p={4}>No Restaurants Found. Create one via API or setup.</Box>;

  return (
    <Box>
      {/* Header with Restaurant Selector */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Typography color="text.secondary">
            Welcome back, {user?.name}
          </Typography>
        </Box>

        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Restaurant Scope</InputLabel>
          <Select
            value={activeRestaurantId || ""}
            label="Restaurant Scope"
            onChange={(e) => setActiveRestaurantId(e.target.value)}
          >
            {restaurants.map((r) => (
              <MuiMenuItem key={r._id} value={r._id}>
                {r.name} - {r.address?.split(",")[0]}
              </MuiMenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<TrendingUp size={18} />} label="Overview" iconPosition="start" />
        <Tab icon={<ShoppingBag size={18} />} label="Orders" iconPosition="start" />
        <Tab icon={<Utensils size={18} />} label="Menu" iconPosition="start" />
        <Tab icon={<Layers size={18} />} label="Tables" iconPosition="start" />
        <Tab icon={<Users size={18} />} label="Staff & AI" iconPosition="start" />
        <Tab icon={<Archive size={18} />} label="Inventory" iconPosition="start" />
        <Tab icon={<DollarSign size={18} />} label="Expenses" iconPosition="start" />
        <Tab icon={<Globe size={18} />} label="Integrations" iconPosition="start" />
        <Tab icon={<Settings size={18} />} label="Settings" iconPosition="start" />
      </Tabs>

      {/* OVERVIEW TAB */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* ... existing stats cards ... */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h4" fontWeight="bold">₹{stats.todaySales}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "primary.light", borderRadius: 2, color: "primary.main" }}><DollarSign /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.ordersCount}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "warning.light", borderRadius: 2, color: "warning.main" }}><ShoppingBag /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Occupancy</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.occupancy}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "success.light", borderRadius: 2, color: "success.main" }}><Users /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Kitchen Load</Typography>
                <Typography variant="h4" fontWeight="bold">{Math.round(stats.kitchenLoad)}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: "error.light", borderRadius: 2, color: "error.main" }}><ChefHat /></Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: 450 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold">
                  Sales vs Expenses ({dateRange.startDate === dateRange.endDate ? 'Today' : `${dateRange.startDate} to ${dateRange.endDate}`})
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                  <Typography>-</Typography>
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
              </Box>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" name="Total Sales" stroke={theme.palette.primary.main} strokeWidth={3} />
                  <Line type="monotone" dataKey="expenses" name="Total Loss" stroke={theme.palette.error.main} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Simple Staff Status Summary */}
            <Paper sx={{ p: 3, height: 400, overflow: 'auto' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>AI Insights</Typography>
              <Stack spacing={2}>
                <Alert icon={<Brain size={20} />} severity="success" variant="outlined">
                  Waiter Rahul is performing 20% faster than average today.
                </Alert>
                <Alert icon={<Brain size={20} />} severity="warning" variant="outlined">
                  Table 4 turnover time is higher than usual (55m).
                </Alert>
                <Alert icon={<TrendingUp size={20} />} severity="info" variant="outlined">
                  Peak hours detected. Recommend opening Section B.
                </Alert>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* ORDERS TAB (NEW TABLE) */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" mb={2}>Order Management</Typography>
          <TableContainer component={Paper} variant="outlined">
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell>Waiter</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id || (order as any)._id}>
                    <TableCell>#{order.id?.slice(-4) || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={tables.find(t => (t.id === order.tableId) || ((t as any)._id === order.tableId))?.number || order.tableId} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>{order.waiterName || 'Unassigned'}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>₹{order.total}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'paid' ? 'success' :
                            order.status === 'ready' ? 'info' :
                              order.status === 'preparing' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                      {order.timestamp ? new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>
        </Box>
      )}

      {/* MENU TAB */}
      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              size="small"
              placeholder="Search item..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              sx={{ width: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => {
                setEditingItem(null);
                setOpenItemDialog(true);
              }}
            >
              Add Item
            </Button>
          </Box>
          <Grid container spacing={2}>
            {menuItems
              .filter((i) =>
                i.name.toLowerCase().includes(itemSearch.toLowerCase()),
              )
              .map((item) => (
                <Grid
                  size={{ xs: 12, sm: 6, md: 4 }}
                  key={item.id || (item as any)._id}
                >
                  <Card variant="outlined" sx={{ position: "relative" }}>
                    <Box sx={{ position: "absolute", top: 5, right: 5 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({
                            name: item.name,
                            price: item.price.toString(),
                            category: item.category,
                            prepTime: item.prepTime.toString(),
                            isVeg: item.isVeg,
                            available: item.available,
                            description: "",
                            imageUrl: item.imageUrl,
                          });
                          setOpenItemDialog(true);
                        }}
                      >
                        <Edit2 size={16} />
                      </IconButton>
                    </Box>
                    <CardContent>
                      <Typography variant="h6">{item.name}</Typography>
                      <Typography>₹{item.price}</Typography>
                      <Chip label={item.category} size="small" />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* TABLES TAB */}
      {activeTab === 3 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setOpenTableDialog(true)}
            >
              Add Table
            </Button>
          </Box>

          <Grid container spacing={2}>
            {tables.map((table) => (
              <Grid
                size={{ xs: 12, sm: 6, md: 3 }}
                key={table.id || (table as any)._id}
              >
                <Box position="relative">
                  {openingTable === (table.id || (table as any)._id) && (
                    <Box sx={{
                      position: 'absolute', inset: 0,
                      bgcolor: 'rgba(255,255,255,0.7)', zIndex: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 2
                    }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                  <TableLayoutCard
                    number={table.number}
                    seats={Number(table.seats)}
                    status={table.status}
                    shape={Number(table.seats) <= 4 ? "square" : "round"}
                    totalAmount={table.status === 'occupied' && table.currentOrderId ? (table.currentOrderId as any).total : undefined}
                    onClick={() => {
                      if (table.status === 'available' || table.status === 'occupied') {
                        // Show loading feedback immediately
                        setOpeningTable(table.id || (table as any)._id);
                        // Slight delay to allow UI to render spinner, then navigate
                        setTimeout(() => {
                          navigate('/waiter', { state: { tableId: table._id || table.id } });
                          setOpeningTable(null);
                        }, 50);
                      }
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* STAFF & AI TAB (NEW TABLE) */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" mb={2}>Staff Performance & AI Analysis</Typography>
          <TableContainer component={Paper} variant="outlined">
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Shift</TableCell>
                  <TableCell>Orders</TableCell>
                  <TableCell>Avg Time</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>AI Insight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffList.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{staff.name[0]}</Avatar>
                        <Typography variant="subtitle2">{staff.name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell><Chip label={staff.role} size="small" color="primary" variant="outlined" /></TableCell>
                    <TableCell>{staff.shift}</TableCell>
                    <TableCell>{staff.performance.ordersCompleted}</TableCell>
                    <TableCell>{staff.performance.avgResponseTime}m</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Typography fontWeight="bold" color="warning.main" mr={0.5}>★</Typography>
                        {staff.performance.rating}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Alert severity="info" icon={<Brain size={16} />} sx={{ py: 0, px: 1, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
                        {staff.aiInsight}
                      </Alert>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>
        </Box>
      )}

      {/* INVENTORY TAB (ENHANCED) */}
      {activeTab === 5 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
            <Typography variant="h6">Inventory Management</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenInventoryDialog(true)}>Add Stock</Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Item Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {item.quantity < item.minThreshold ? (
                        <Chip label="Low Stock" color="error" size="small" />
                      ) : (
                        <Chip label="In Stock" color="success" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                      {new Date(item.lastUpdated).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>

          <Typography variant="h6" mb={2} mt={4}>
            Kitchen Requests
          </Typography>
          <Grid container spacing={2}>
            {inventoryRequests.length === 0 && (
              <Grid size={{ xs: 12 }}>
                <Typography color="text.secondary">No pending requests.</Typography>
              </Grid>
            )}
            {inventoryRequests.map((req: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="bold">{req.item}</Typography>
                      <Chip label={req.urgency} color={req.urgency === "critical" ? "error" : req.urgency === "high" ? "warning" : "default"} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Quantity: {req.quantity}</Typography>
                    <Typography variant="body2" mt={1}>"{req.message || "No message"}"</Typography>
                    <Typography variant="caption" display="block" mt={1} color="text.disabled">Requested by {req.requestedBy?.name}</Typography>

                    {req.status === "pending" && (
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircle size={14} />} onClick={() => handleInventoryAction(req._id, "approved")}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<XCircle size={14} />} onClick={() => handleInventoryAction(req._id, "rejected")}>Reject</Button>
                      </Stack>
                    )}
                    {req.status !== "pending" && <Chip label={req.status} sx={{ mt: 2 }} variant="outlined" />}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* EXPENSES TAB (NEW) */}
      {activeTab === 6 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
            <Typography variant="h6">Expenses</Typography>
            <Button variant="contained" color="secondary" startIcon={<Plus />} onClick={() => setOpenExpenseDialog(true)}>Add Expense</Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <MuiTable>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Recorded By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell>{new Date(exp.date).toLocaleDateString()}</TableCell>
                    <TableCell>{exp.description}</TableCell>
                    <TableCell><Chip label={exp.category} size="small" /></TableCell>
                    <TableCell>{exp.paymentMethod}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>-₹{exp.amount}</TableCell>
                    <TableCell>{exp.recordedBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>
        </Box>
      )}

      {/* INTEGRATIONS TAB */}
      {activeTab === 7 && (
        <Box>
          <Typography variant="h6" mb={2}>External Integrations</Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar variant="rounded" sx={{ bgcolor: '#fc8019', width: 64, height: 64 }}>S</Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">Swiggy</Typography>
                  <Typography variant="body2" color="text.secondary">Manage online orders directly.</Typography>
                  <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
                </Box>
                <Button variant="outlined" disabled startIcon={<Globe />}>Connect</Button>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar variant="rounded" sx={{ bgcolor: '#cb202d', width: 64, height: 64 }}>Z</Avatar>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight="bold">Zomato</Typography>
                  <Typography variant="body2" color="text.secondary">Sync menu and inventory.</Typography>
                  <Chip label="Coming Soon" size="small" sx={{ mt: 1 }} />
                </Box>
                <Button variant="outlined" disabled startIcon={<Globe />}>Connect</Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* SETTINGS TAB */}
      {activeTab === 8 && (
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            mb={2}
            alignItems="center"
          >
            <Typography variant="h6">Restaurant Management</Typography>
            <Button
              variant="contained"
              startIcon={<Plus />}
              onClick={() => setOpenRestaurantDialog(true)}
            >
              New Restaurant
            </Button>
          </Box>

          {/* THEME CUSTOMIZATION SECTION */}
          {activeRestaurantId && (
            <Paper sx={{ p: 3, mb: 4 }} variant="outlined">
              <Typography variant="h6" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                <Palette size={20} /> Theme Customization
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Customize the look and feel for this restaurant across all devices (Waiter POS, Kitchen, Menu).
              </Typography>
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" mb={1}>Primary Color</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <input
                      type="color"
                      value={themeSettings.primary}
                      onChange={(e) => setThemeSettings({ ...themeSettings, primary: e.target.value })}
                      style={{ width: 60, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
                    />
                    <Typography variant="caption" fontFamily="monospace">Choose your brand color</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" mb={1}>Secondary Color</Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <input
                      type="color"
                      value={themeSettings.secondary}
                      onChange={(e) => setThemeSettings({ ...themeSettings, secondary: e.target.value })}
                      style={{ width: 60, height: 40, padding: 0, border: 'none', cursor: 'pointer' }}
                    />
                    <Typography variant="caption" fontFamily="monospace">Accent color</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle2" mb={1}>Appearance Mode</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={themeSettings.mode}
                      onChange={(e) => setThemeSettings({ ...themeSettings, mode: e.target.value as any })}
                    >
                      <MuiMenuItem value="light">Light Mode</MuiMenuItem>
                      <MuiMenuItem value="dark">Dark Mode</MuiMenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button variant="contained" onClick={() => handleSaveTheme(themeSettings.primary, themeSettings.secondary, themeSettings.mode)}>
                    Save Theme Changes
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          )}

          <Grid container spacing={3}>
            {restaurants.map((r: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={r._id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderColor:
                      activeRestaurantId === r._id ? "primary.main" : "divider",
                    borderWidth: activeRestaurantId === r._id ? 2 : 1,
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {r.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <MapPin
                            size={14}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                            }}
                          />{" "}
                          {r.address || "No Address"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Phone: {r.phone || "N/A"}
                        </Typography>
                      </Box>
                      {activeRestaurantId === r._id && (
                        <Chip
                          label="Active View"
                          color="primary"
                          size="small"
                        />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => setActiveRestaurantId(r._id)}
                    >
                      Switch to View
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* DIALOGS */}
      {/* Add Restaurant Dialog */}
      <Dialog
        open={openRestaurantDialog}
        onClose={() => setOpenRestaurantDialog(false)}
      >
        <DialogTitle>Add New Restaurant</DialogTitle>
        <DialogContent>
          <TextField
            label="Restaurant Name"
            fullWidth
            margin="normal"
            value={restaurantForm.name}
            onChange={(e) =>
              setRestaurantForm({ ...restaurantForm, name: e.target.value })
            }
          />
          <TextField
            label="Address"
            fullWidth
            margin="normal"
            value={restaurantForm.address}
            onChange={(e) =>
              setRestaurantForm({ ...restaurantForm, address: e.target.value })
            }
          />
          <TextField
            label="Phone"
            fullWidth
            margin="normal"
            value={restaurantForm.phone}
            onChange={(e) =>
              setRestaurantForm({ ...restaurantForm, phone: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestaurantDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRestaurant} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Inventory Item Dialog */}
      <Dialog open={openInventoryDialog} onClose={() => setOpenInventoryDialog(false)}>
        <DialogTitle>Add Inventory Item</DialogTitle>
        <DialogContent>
          <TextField label="Item Name" fullWidth margin="normal" value={inventoryForm.name} onChange={(e) => setInventoryForm({ ...inventoryForm, name: e.target.value })} />
          <TextField label="Category" fullWidth margin="normal" value={inventoryForm.category} onChange={(e) => setInventoryForm({ ...inventoryForm, category: e.target.value })} />
          <TextField label="Quantity" type="number" fullWidth margin="normal" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} />
          <TextField label="Unit (kg, L, pcs)" fullWidth margin="normal" value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} />
          <TextField label="Min Threshold" type="number" fullWidth margin="normal" value={inventoryForm.minThreshold} onChange={(e) => setInventoryForm({ ...inventoryForm, minThreshold: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInventoryDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateInventoryItem} variant="contained">Add Item</Button>
        </DialogActions>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={openExpenseDialog} onClose={() => setOpenExpenseDialog(false)}>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogContent>
          <TextField label="Description" fullWidth margin="normal" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <TextField label="Category" fullWidth margin="normal" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} />
          <TextField label="Amount" type="number" fullWidth margin="normal" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select value={expenseForm.paymentMethod} label="Payment Method" onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}>
              <MuiMenuItem value="Cash">Cash</MuiMenuItem>
              <MuiMenuItem value="Card">Card</MuiMenuItem>
              <MuiMenuItem value="Online">Online</MuiMenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpenseDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateExpense} variant="contained">Add Expense</Button>
        </DialogActions>
      </Dialog>


      {/* Menu Item Dialog (Simplified) */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)}>
        <DialogTitle>{editingItem ? "Edit Item" : "New Item"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            label="Price"
            fullWidth
            margin="normal"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
          <TextField
            label="Prep Time (mins)"
            fullWidth
            margin="normal"
            type="number"
            value={formData.prepTime}
            onChange={(e) =>
              setFormData({ ...formData, prepTime: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={openTableDialog} onClose={() => setOpenTableDialog(false)}>
        <DialogTitle>
          Add Table {activeRestaurantId ? "" : "(Select Restaurant First)"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Table Number"
            fullWidth
            margin="normal"
            type="number"
            value={newTable.number}
            onChange={(e) =>
              setNewTable({ ...newTable, number: e.target.value })
            }
          />
          <TextField
            label="Seats"
            fullWidth
            margin="normal"
            type="number"
            value={newTable.seats}
            onChange={(e) =>
              setNewTable({ ...newTable, seats: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTableDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateTable}
            variant="contained"
            disabled={!activeRestaurantId}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
