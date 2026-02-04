import { useState, useEffect } from 'react';
import { Clock, Archive } from 'lucide-react';
import { Order, Table } from '@/app/data/mockData';
import { fetchOrders, fetchTables, updateOrder, createInventoryRequest } from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert
} from '@mui/material';

export function KitchenDisplay() {
  const { activeRestaurantId, user } = useAuth(); // Use active scope if avail
  const [orders, setOrders] = useState<Order[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  // Inventory Request State
  const [openRequestDialog, setOpenRequestDialog] = useState(false);
  const [requestData, setRequestData] = useState({ item: '', quantity: '', urgency: 'medium', message: '' });
  const [requestSuccess, setRequestSuccess] = useState(false); // To show snackbar if needed



  const loadData = async () => {
    try {
      const actualScope = activeRestaurantId || user?.restaurantId;
      const [orderData, tableData] = await Promise.all([
        fetchOrders(actualScope),
        fetchTables(actualScope)
      ]);

      const parsedOrders = orderData.map(o => {
        const t = new Date(o.timestamp);
        return {
          ...o,
          timestamp: isNaN(t.getTime()) ? new Date() : t
        };
      });
      setOrders(parsedOrders);
      setTables(tableData);
    } catch (error) {
      console.error("Failed to fetch kitchen data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [activeRestaurantId]); // Reload if scope changes

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    // Optimistic update
    setOrders(orders.map((order) => {
      const oId = order.id || (order as any)._id;
      return oId === orderId ? { ...order, status: newStatus } : order;
    }));

    try {
      await updateOrder(orderId, newStatus);
    } catch (err) {
      console.error("Failed to update order", err);
      loadData(); // Revert on failure
    }
  };

  const handleCreateRequest = async () => {
    try {
      const payload = {
        ...requestData,
        restaurantId: activeRestaurantId || user?.restaurantId
      };
      await createInventoryRequest(payload);
      setOpenRequestDialog(false);
      setRequestSuccess(true);
      setRequestData({ item: '', quantity: '', urgency: 'medium', message: '' });
    } catch (e) {
      console.error("Failed to create request", e);
      alert("Failed to send request");
    }
  };

  const getTimeSinceOrder = (timestamp: Date) => {
    const minutes = Math.round((Date.now() - timestamp.getTime()) / 60000);
    return minutes;
  };

  const sortedOrders = [...orders].sort((a, b) => {
    // Priority: pending > preparing > ready
    const statusPriority: Record<string, number> = { pending: 0, preparing: 1, ready: 2, served: 3, paid: 4 };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Then by time (oldest first)
    return a.timestamp.getTime() - b.timestamp.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'info';
      case 'ready': return 'success';
      default: return 'action'; // fallback
    }
  };

  if (loading && orders.length === 0) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100%', pb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" fontWeight="bold">Kitchen Display System (KDS)</Typography>
          <Chip label={activeRestaurantId ? "Scope: Active" : "Scope: Default"} size="small" variant="outlined" />
        </Box>
        <Button
          variant="contained"
          color="warning"
          startIcon={<Archive />}
          onClick={() => setOpenRequestDialog(true)}
        >
          Request Item
        </Button>
      </Box>

      {/* Header Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 4 }} sx={{ display: 'flex', gap: 2 }}>
          {/* Pending */}
          <Card sx={{ flex: 1, borderLeft: 6, borderColor: 'warning.main' }}>
            <CardContent>
              <Typography color="text.secondary">Pending</Typography>
              <Typography variant="h4" fontWeight="bold">{orders.filter(o => o.status === 'pending').length}</Typography>
            </CardContent>
          </Card>
          {/* Preparing */}
          <Card sx={{ flex: 1, borderLeft: 6, borderColor: 'info.main' }}>
            <CardContent>
              <Typography color="text.secondary">Preparing</Typography>
              <Typography variant="h4" fontWeight="bold">{orders.filter(o => o.status === 'preparing').length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Grid */}
      <Grid container spacing={3}>
        {sortedOrders.filter(o => o.status !== 'paid' && o.status !== 'served').map((order) => {
          const oId = order.id || (order as any)._id;
          const mins = getTimeSinceOrder(order.timestamp);
          const isLate = mins > 20;

          return (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={oId}>
              <Card
                elevation={4}
                sx={{
                  borderTop: 8,
                  borderColor: `${getStatusColor(order.status)}.main`,
                  animation: isLate ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(229, 62, 62, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(229, 62, 62, 0)' }
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Clock size={16} />
                      <Typography fontWeight="bold" color={isLate ? 'error' : 'text.primary'}>{mins} min ago</Typography>
                    </Stack>
                    <Chip label={order.status} color={getStatusColor(order.status) as any} size="small" />
                  </Box>

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h5" fontWeight="bold">Table {tables.find(t => (t.id || (t as any)._id) === order.tableId)?.number || '?'}</Typography>
                    <Typography variant="body2" color="text.secondary">#{oId.slice(-4)}</Typography>
                  </Box>

                  <Stack spacing={1}>
                    {order.items.map((item, i) => (
                      <Box key={i} display="flex" justifyContent="space-between" alignItems="center" p={1} bgcolor="action.hover" borderRadius={1}>
                        <Box>
                          <Typography fontWeight="bold">x{item.quantity} {item.menuItem?.name}</Typography>
                          {item.customization && <Typography variant="caption" color="text.secondary">{item.customization}</Typography>}
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  {order.status === 'pending' && (
                    <Button fullWidth variant="contained" color="info" onClick={() => updateOrderStatus(oId, 'preparing')}>Start Preparing</Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button fullWidth variant="contained" color="success" onClick={() => updateOrderStatus(oId, 'ready')}>Mark Ready</Button>
                  )}
                  {order.status === 'ready' && (
                    <Button fullWidth variant="outlined" color="success" onClick={() => updateOrderStatus(oId, 'served')}>Mark Served</Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Inventory Request Dialog */}
      <Dialog open={openRequestDialog} onClose={() => setOpenRequestDialog(false)}>
        <DialogTitle>Request Kitchen Inventory</DialogTitle>
        <DialogContent>
          <TextField
            label="Item Name (e.g. Tomato, Oil)" fullWidth margin="normal"
            value={requestData.item} onChange={e => setRequestData({ ...requestData, item: e.target.value })}
          />
          <TextField
            label="Quantity needed" fullWidth margin="normal"
            value={requestData.quantity} onChange={e => setRequestData({ ...requestData, quantity: e.target.value })}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Urgency</InputLabel>
            <Select
              value={requestData.urgency}
              label="Urgency"
              onChange={(e) => setRequestData({ ...requestData, urgency: e.target.value })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Note/Message" fullWidth margin="normal" multiline rows={2}
            value={requestData.message} onChange={e => setRequestData({ ...requestData, message: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRequestDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRequest} variant="contained" color="warning">Send Request</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={requestSuccess} autoHideDuration={3000} onClose={() => setRequestSuccess(false)}>
        <Alert severity="success">Request sent to Admin!</Alert>
      </Snackbar>

    </Box>
  );
}
