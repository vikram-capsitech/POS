import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Plus,
  Edit2,
  Pause,
  UserPlus,
  ChefHat,
  Clock,
  Settings,
  Layers,
  Bike,
  Globe,
  Trash2,
  MapPin,
  Sparkles,
  Archive,
  Building,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { salesData } from '@/app/data/mockData';
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
  updateInventoryRequest
} from '@/app/services/api';
import { Order, Table, MenuItem } from '@/app/data/mockData';
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
  FormControl
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';

export function AdminDashboard() {
  const { user, activeRestaurantId, setActiveRestaurantId } = useAuth();
  const theme = useTheme();

  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stats, setStats] = useState({
    todaySales: 0,
    ordersCount: 0,
    occupancy: 0,
    kitchenLoad: 0
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
    name: '',
    price: '',
    category: '',
    prepTime: '',
    isVeg: true,
    available: true,
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
  });
  const [restaurantForm, setRestaurantForm] = useState({ name: '', address: '', phone: '' });
  const [newTable, setNewTable] = useState({ number: '', seats: '' });
  const [itemSearch, setItemSearch] = useState('');

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
        const [orderData, tableData, menuData, invData] = await Promise.all([
          fetchOrders(activeRestaurantId),
          fetchTables(activeRestaurantId),
          fetchMenu(activeRestaurantId),
          fetchInventoryRequests(activeRestaurantId)
        ]);

        setOrders(orderData);
        setTables(tableData);
        setMenuItems(menuData);
        setInventoryRequests(invData);

        // Calc Stats
        const total = orderData.reduce((acc: number, o: Order) => acc + (o.total || 0), 0);
        const occ = tableData.filter((t: Table) => t.status === 'occupied').length;
        setStats({
          todaySales: total,
          ordersCount: orderData.length,
          occupancy: occ,
          kitchenLoad: Math.random() * 100 // Mock for now
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

  const handleCreateRestaurant = async () => {
    await createRestaurant(restaurantForm);
    setOpenRestaurantDialog(false);
    setRestaurantForm({ name: '', address: '', phone: '' });
    loadData();
  };

  const handleCreateTable = async () => {
    if (!activeRestaurantId) return;
    await createTable({ ...newTable, restaurantId: activeRestaurantId } as any);
    setNewTable({ number: '', seats: '' });
    setOpenTableDialog(false);
    loadData();
  };

  const handleSaveItem = async () => {
    if (!activeRestaurantId) return;
    const payload = {
      ...formData,
      price: Number(formData.price),
      prepTime: Number(formData.prepTime),
      restaurantId: activeRestaurantId
    };
    if (editingItem) {
      await updateMenuItem(editingItem.id || (editingItem as any)._id, payload);
    } else {
      await createMenuItem(payload);
    }
    setOpenItemDialog(false);
    loadData();
  };


  if (loading && !restaurants.length) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
  if (!activeRestaurantId && restaurants.length === 0 && !loading) return <Box p={4}>No Restaurants Found. Create one via API or setup.</Box>;

  return (
    <Box>
      {/* Header with Restaurant Selector */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
          <Typography color="text.secondary">Welcome back, {user?.name}</Typography>
        </Box>

        <FormControl sx={{ minWidth: 250 }} size="small">
          <InputLabel>Restaurant Scope</InputLabel>
          <Select
            value={activeRestaurantId || ''}
            label="Restaurant Scope"
            onChange={(e) => setActiveRestaurantId(e.target.value)}
          >
            {restaurants.map(r => (
              <MuiMenuItem key={r._id} value={r._id}>{r.name} - {r.address?.split(',')[0]}</MuiMenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }} variant="scrollable">
        <Tab icon={<TrendingUp size={18} />} label="Overview" iconPosition="start" />
        <Tab icon={<ShoppingBag size={18} />} label="Menu" iconPosition="start" />
        <Tab icon={<Layers size={18} />} label="Tables" iconPosition="start" />
        <Tab icon={<Archive size={18} />} label="Inventory" iconPosition="start" />
        <Tab icon={<Settings size={18} />} label="Settings" iconPosition="start" />
      </Tabs>

      {/* OVERVIEW TAB */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                <Typography variant="h4" fontWeight="bold">₹{stats.todaySales}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 2, color: 'primary.main' }}><DollarSign /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Orders</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.ordersCount}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.main' }}><ShoppingBag /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Occupancy</Typography>
                <Typography variant="h4" fontWeight="bold">{stats.occupancy}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 2, color: 'success.main' }}><Users /></Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Kitchen Load</Typography>
                <Typography variant="h4" fontWeight="bold">{Math.round(stats.kitchenLoad)}%</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 2, color: 'error.main' }}><ChefHat /></Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Traffic Analytics</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="amount" stroke={theme.palette.primary.main} strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Staff Status</Typography>
              <Stack spacing={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography noWrap>Kitchen Staff</Typography>
                  <Chip label="Active" color="success" size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography noWrap>Waiters</Typography>
                  <Chip label="Active" color="success" size="small" />
                </Box>
                <Alert severity="info">Cleaning Report is Pending for Kitchen Area.</Alert>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* MENU TAB */}
      {activeTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <TextField
              size="small"
              placeholder="Search item..."
              value={itemSearch}
              onChange={(e) => setItemSearch(e.target.value)}
              sx={{ width: 300 }}
            />
            <Button variant="contained" startIcon={<Plus />} onClick={() => { setEditingItem(null); setOpenItemDialog(true); }}>Add Item</Button>
          </Box>
          <Grid container spacing={2}>
            {menuItems.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase())).map(item => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id || (item as any)._id}>
                <Card variant="outlined" sx={{ position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <IconButton size="small" onClick={() => {
                      setEditingItem(item);
                      setFormData({
                        name: item.name,
                        price: item.price.toString(),
                        category: item.category,
                        prepTime: item.prepTime.toString(),
                        isVeg: item.isVeg,
                        available: item.available,
                        description: '',
                        imageUrl: item.imageUrl
                      });
                      setOpenItemDialog(true);
                    }}>
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
      {activeTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenTableDialog(true)}>Add Table</Button>
          </Box>
          <Grid container spacing={2}>
            {tables.map(table => (
              <Grid size={{ xs: 6, md: 3 }} key={table.id || (table as any)._id}>
                <Paper sx={{ p: 2, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                  <Typography variant="h5">T-{table.number}</Typography>
                  <Typography variant="caption">{table.seats} Seats</Typography>
                  <Chip label={table.status} color={table.status === 'available' ? 'success' : 'error'} size="small" sx={{ mt: 1 }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* INVENTORY TAB */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" mb={2}>Kitchen Inventory Requests</Typography>
          <Grid container spacing={2}>
            {inventoryRequests.length === 0 && <Grid size={{ xs: 12 }}><Typography color="text.secondary">No pending requests.</Typography></Grid>}
            {inventoryRequests.map((req: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={req._id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="bold">{req.item}</Typography>
                      <Chip label={req.urgency} color={req.urgency === 'critical' ? 'error' : req.urgency === 'high' ? 'warning' : 'default'} size="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Quantity: {req.quantity}</Typography>
                    <Typography variant="body2" mt={1}>"{req.message || 'No message'}"</Typography>
                    <Typography variant="caption" display="block" mt={1} color="text.disabled">Requested by {req.requestedBy?.name}</Typography>

                    {req.status === 'pending' && (
                      <Stack direction="row" spacing={1} mt={2}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircle size={14} />} onClick={() => handleInventoryAction(req._id, 'approved')}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<XCircle size={14} />} onClick={() => handleInventoryAction(req._id, 'rejected')}>Reject</Button>
                      </Stack>
                    )}
                    {req.status !== 'pending' && <Chip label={req.status} sx={{ mt: 2 }} variant="outlined" />}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* SETTINGS TAB (Restaurant Management) */}
      {activeTab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={2} alignItems="center">
            <Typography variant="h6">Restaurant Management</Typography>
            <Button variant="contained" startIcon={<Plus />} onClick={() => setOpenRestaurantDialog(true)}>New Restaurant</Button>
          </Box>

          <Grid container spacing={3}>
            {restaurants.map((r: any) => (
              <Grid size={{ xs: 12, md: 6 }} key={r._id}>
                <Card variant="outlined" sx={{ borderColor: activeRestaurantId === r._id ? 'primary.main' : 'divider', borderWidth: activeRestaurantId === r._id ? 2 : 1 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Typography variant="h6" fontWeight="bold">{r.name}</Typography>
                        <Typography variant="body2" color="text.secondary"><MapPin size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> {r.address || 'No Address'}</Typography>
                        <Typography variant="body2" color="text.secondary">Phone: {r.phone || 'N/A'}</Typography>
                      </Box>
                      {activeRestaurantId === r._id && <Chip label="Active View" color="primary" size="small" />}
                    </Box>
                    <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => setActiveRestaurantId(r._id)}>Switch to View</Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* DIALOGS */}
      {/* Add Restaurant Dialog */}
      <Dialog open={openRestaurantDialog} onClose={() => setOpenRestaurantDialog(false)}>
        <DialogTitle>Add New Restaurant</DialogTitle>
        <DialogContent>
          <TextField
            label="Restaurant Name" fullWidth margin="normal"
            value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
          />
          <TextField
            label="Address" fullWidth margin="normal"
            value={restaurantForm.address} onChange={e => setRestaurantForm({ ...restaurantForm, address: e.target.value })}
          />
          <TextField
            label="Phone" fullWidth margin="normal"
            value={restaurantForm.phone} onChange={e => setRestaurantForm({ ...restaurantForm, phone: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRestaurantDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRestaurant} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Menu Item Dialog (Simplified) */}
      <Dialog open={openItemDialog} onClose={() => setOpenItemDialog(false)}>
        <DialogTitle>{editingItem ? 'Edit Item' : 'New Item'}</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="normal" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
          <TextField label="Price" fullWidth margin="normal" type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          <TextField label="Category" fullWidth margin="normal" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
          <TextField label="Prep Time (mins)" fullWidth margin="normal" type="number" value={formData.prepTime} onChange={e => setFormData({ ...formData, prepTime: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveItem} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={openTableDialog} onClose={() => setOpenTableDialog(false)}>
        <DialogTitle>Add Table {activeRestaurantId ? '' : '(Select Restaurant First)'}</DialogTitle>
        <DialogContent>
          <TextField label="Table Number" fullWidth margin="normal" type="number" value={newTable.number} onChange={e => setNewTable({ ...newTable, number: e.target.value })} />
          <TextField label="Seats" fullWidth margin="normal" type="number" value={newTable.seats} onChange={e => setNewTable({ ...newTable, seats: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTableDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTable} variant="contained" disabled={!activeRestaurantId}>Create</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
