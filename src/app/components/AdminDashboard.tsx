import { useState, useEffect } from "react";
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
  MapPin,
  Archive,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  UserCheck,
  Calculator,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { salesData } from "@/app/data/mockData";
import {
  fetchOrders,
  fetchTables,
  fetchMenu,
  updateMenuItem,
  createMenuItem,
  createTable,
  fetchRestaurants,
  createRestaurant,
  fetchInventoryRequests,
  updateInventoryRequest,
} from "@/app/services/api";
import { Order, Table, MenuItem } from "@/app/data/mockData";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Card,
  CardContent,
  Stack,
  Dialog,
  CircularProgress,
  useTheme,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem as MuiMenuItem,
  Tabs,
  Tab,
  Alert,
  Select,
  InputLabel,
  FormControl,
  Avatar,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { TableLayoutCard } from "./TableLayoutCard";

export function AdminDashboard() {
  const { user, activeRestaurantId, setActiveRestaurantId } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();


  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    ordersCount: 0,
    occupancy: 0,
    kitchenLoad: 0,
  });
  const [loading, setLoading] = useState(true);

  // Lists
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [inventoryRequests, setInventoryRequests] = useState<any[]>([]);

  // Dialogs
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [openRestaurantDialog, setOpenRestaurantDialog] = useState(false);
  const [openTableDialog, setOpenTableDialog] = useState(false);

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
  const [itemSearch, setItemSearch] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<number>(0);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
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
        const [orderData, tableData, menuData, invData] = await Promise.all([
          fetchOrders(activeRestaurantId),
          fetchTables(activeRestaurantId),
          fetchMenu(activeRestaurantId),
          fetchInventoryRequests(activeRestaurantId),
        ]);

        setOrders(orderData);
        setTables(tableData);
        setMenuItems(menuData);
        setInventoryRequests(invData);

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
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(false), 5000);
    return () => clearInterval(interval);
  }, [activeRestaurantId]);

  // Handlers
  const handleInventoryAction = async (id: string, status: string) => {
    await updateInventoryRequest(id, status);
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

        <Button
          variant="contained"
          color="secondary"
          startIcon={<ClipboardList />}
          onClick={() => navigate('/waiter')}
          sx={{ ml: 2, height: 40 }}
        >
          Open POS / Orders
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
      >
        <Tab
          icon={<TrendingUp size={18} />}
          label="Overview"
          iconPosition="start"
        />
        <Tab
          icon={<ShoppingBag size={18} />}
          label="Menu"
          iconPosition="start"
        />
        <Tab icon={<Layers size={18} />} label="Tables" iconPosition="start" />
        <Tab
          icon={<Archive size={18} />}
          label="Inventory"
          iconPosition="start"
        />
        <Tab
          icon={<Settings size={18} />}
          iconPosition="start"
        />
        <Tab
          icon={<FileText size={18} />}
          label="Reports & Sales"
          iconPosition="start"
        />
        <Tab
          icon={<UserCheck size={18} />}
          label="Staff & AI"
          iconPosition="start"
        />
        <Tab
          icon={<Settings size={18} />}
          label="Settings"
          iconPosition="start"
        />
      </Tabs>

      {/* OVERVIEW TAB */}
      {activeTab === 0 && (
        <Box>
          <Grid container spacing={3}>
            {/* Stats Cards */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    ₹{stats.todaySales}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "primary.light",
                    borderRadius: 2,
                    color: "primary.main",
                  }}
                >
                  <DollarSign />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.ordersCount}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "warning.light",
                    borderRadius: 2,
                    color: "warning.main",
                  }}
                >
                  <ShoppingBag />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Occupancy
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.occupancy}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "success.light",
                    borderRadius: 2,
                    color: "success.main",
                  }}
                >
                  <Users />
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Kitchen Load
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {Math.round(stats.kitchenLoad)}%
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "error.light",
                    borderRadius: 2,
                    color: "error.main",
                  }}
                >
                  <ChefHat />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Traffic Analytics
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke={theme.palette.primary.main}
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: 400 }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Staff Status
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography noWrap>Kitchen Staff</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography noWrap>Waiters</Typography>
                    <Chip label="Active" color="success" size="small" />
                  </Box>
                  <Alert severity="info">
                    Cleaning Report is Pending for Kitchen Area.
                  </Alert>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Box mt={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Live Activity Feed
            </Typography>
            <Grid container spacing={3}>
              {orders.slice(0, 6).map((order) => {
                const oId = order.id || (order as any)._id;
                const minsAgo = Math.floor((Date.now() - new Date(order.timestamp).getTime()) / 60000);

                const getStatusColor = (s: string) => {
                  switch (s) {
                    case 'pending': return 'warning';
                    case 'preparing': return 'info';
                    case 'ready': return 'success';
                    case 'served': return 'success';
                    default: return 'default';
                  }
                };

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={oId} >
                    <Card variant="outlined">
                      <CardContent sx={{ pb: 1 }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                          <Typography fontWeight="bold">Order #{oId.slice(-4)}</Typography>
                          <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center" color="text.secondary" fontSize="0.875rem">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <Clock size={14} /> {minsAgo}m ago
                          </Box>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <User size={14} /> {order.waiterName || 'App'}
                          </Box>
                        </Stack>
                        <Typography variant="body2" mt={1}>
                          {order.items.length} items • ₹{order.total}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Box>
      )}

      {/* MENU TAB */}
      {
        activeTab === 1 && (
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
        )
      }

      {/* TABLES TAB */}
      {
        activeTab === 2 && (
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
                  <TableLayoutCard
                    number={table.number}
                    seats={Number(table.seats)}
                    status={table.status}
                    shape={Number(table.seats) <= 4 ? "square" : "round"} // optional rule
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      }

      {/* INVENTORY TAB */}
      {
        activeTab === 3 && (
          <Box>
            <Typography variant="h6" mb={2}>
              Kitchen Inventory Requests
            </Typography>
            <Grid container spacing={2}>
              {inventoryRequests.length === 0 && (
                <Grid size={{ xs: 12 }}>
                  <Typography color="text.secondary">
                    No pending requests.
                  </Typography>
                </Grid>
              )}
              {inventoryRequests.map((req: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req._id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle1" fontWeight="bold">
                          {req.item}
                        </Typography>
                        <Chip
                          label={req.urgency}
                          color={
                            req.urgency === "critical"
                              ? "error"
                              : req.urgency === "high"
                                ? "warning"
                                : "default"
                          }
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Quantity: {req.quantity}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        "{req.message || "No message"}"
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        mt={1}
                        color="text.disabled"
                      >
                        Requested by {req.requestedBy?.name}
                      </Typography>

                      {req.status === "pending" && (
                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle size={14} />}
                            onClick={() =>
                              handleInventoryAction(req._id, "approved")
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<XCircle size={14} />}
                            onClick={() =>
                              handleInventoryAction(req._id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}
                      {req.status !== "pending" && (
                        <Chip
                          label={req.status}
                          sx={{ mt: 2 }}
                          variant="outlined"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )
      }

      {/* REPORTS TAB */}
      {activeTab === 4 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" mb={2}>Sales Reports & History</Typography>
          <Grid container spacing={3}>
            {/* Mock Sales Chart or Summary */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'primary.dark' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Calculator />
                  <Box>
                    <Typography variant="h6" fontWeight="bold">Total Completed Sales (Today)</Typography>
                    <Typography variant="h4">₹{stats.todaySales}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" fontWeight="bold" mb={2} mt={2}>Recent Transactions</Typography>
              <TableContainer component={Paper} variant="outlined">
                <MuiTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Items</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.filter(o => o.status === 'paid' || o.status === 'served').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">No completed transactions yet today.</TableCell>
                      </TableRow>
                    ) : (
                      orders.filter(o => o.status === 'paid' || o.status === 'served').map((order) => (
                        <TableRow key={order.id || (order as any)._id}>
                          <TableCell>{(order.id || (order as any)._id).slice(-6)}</TableCell>
                          <TableCell>{new Date(order.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell>{order.items.map(i => i.menuItem?.name).join(', ')}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>₹{order.total}</TableCell>
                          <TableCell>
                            <Chip label={order.status} color={order.status === 'paid' ? 'success' : 'warning'} size="small" />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </MuiTable>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* STAFF TAB */}
      {activeTab === 5 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight="bold">Staff Performance (AI Analytics)</Typography>
            <Chip label="AI Analysis Active" color="primary" icon={<Sparkles size={14} />} />
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TableContainer component={Paper} variant="outlined">
                <MuiTable>
                  <TableHead>
                    <TableRow>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Active Orders</TableCell>
                      <TableCell>Avg Response Time</TableCell>
                      <TableCell>Performance Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {['Rahul', 'Priya', 'Amit', 'Sneha'].map((staff) => {
                      // Mock AI Calculation
                      const staffOrders = orders.filter(o => o.waiterName === staff);
                      const activeCount = staffOrders.filter(o => o.status !== 'paid' && o.status !== 'served').length;
                      const avgTime = Math.floor(Math.random() * 5) + 2; // Mock 2-7 mins
                      const score = 90 + Math.floor(Math.random() * 10) - (avgTime * 2);

                      return (
                        <TableRow key={staff}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>{staff[0]}</Avatar>
                              <Typography fontWeight="bold">{staff}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>Waiter</TableCell>
                          <TableCell>{activeCount}</TableCell>
                          <TableCell sx={{ color: avgTime > 5 ? 'error.main' : 'success.main', fontWeight: 'bold' }}>
                            {avgTime} mins
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CircularProgress variant="determinate" value={score} size={24} color={score > 80 ? 'success' : 'warning'} />
                              <Typography variant="body2">{score}/100</Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </MuiTable>
              </TableContainer>
            </Grid>

            {/* AI Insight Card */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, height: '100%', bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2} display="flex" alignItems="center" gap={1}>
                  <Sparkles size={18} color={theme.palette.secondary.main} /> AI Insights
                </Typography>
                <Stack spacing={2}>
                  <Alert severity="success" icon={<TrendingUp size={18} />}>
                    <strong>Rahul</strong> is performing 15% faster than average today. Great job!
                  </Alert>
                  <Alert severity="warning" icon={<Clock size={18} />}>
                    Peak hours expected at 8 PM. Suggest assigning <strong>Amit</strong> to the patio section.
                  </Alert>
                  <Box p={2} bgcolor="action.hover" borderRadius={2}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>OVERALL STAFF RESPONSIVENESS</Typography>
                    <Typography variant="h3" fontWeight="bold" color="primary.main">4.2m</Typography>
                    <Typography variant="body2" color="text.secondary">Top 10% in the region.</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* SETTINGS TAB (Restaurant Management) */}
      {
        activeTab === 6 && (
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
        )
      }

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
    </Box >
  );
}
