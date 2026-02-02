import { useState, useEffect } from "react";
import {
  Clock,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Smartphone,
  Banknote,
  Split,
  Merge,
  Check,
  Flame,
  Leaf,
  Utensils,
  Printer,
  XCircle,
  ArrowLeft,
  Bell,
  User,
  Sparkles,
  Send,
} from "lucide-react";
import { MenuItem, OrderItem, Table } from "@/app/data/mockData";
import {
  fetchMenu,
  fetchTables,
  createOrder,
  addItemsToOrder,
  updateOrder,
  updateTable,
  fetchOrderById,
} from "@/app/services/api";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Stack,
  Divider,
  useTheme,
  alpha,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogContent,
  DialogTitle,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  TextField,
  DialogActions,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper } from "lucide-react";
import axios from "axios";
import WaiterTableMapView from "./WaiterTableMapView";

// Using @mui/material Grid (v2) where size prop is supported.
// If using legacy Grid, replace 'size' with 'item xs sm'.
// Assuming v6 logic or compatible setup.

export function WaiterPOS() {
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [openRewardDialog, setOpenRewardDialog] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(0);

  // Bill & WhatsApp State
  const [openBillDialog, setOpenBillDialog] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: "My Restaurant",
    address: "",
    phone: "",
  });

  // New Features State
  const [viewMode, setViewMode] = useState<"tables" | "menu">("tables");
  const [notifications, setNotifications] = useState<string[]>([]);
  const [openNotifications, setOpenNotifications] = useState(false);

  // Mock Staff for AI Assignment
  const waiters = ["Rahul", "Priya", "Amit", "Sneha"];

  const theme = useTheme();

  const loadData = async () => {
    try {
      const [tableData, menuData] = await Promise.all([
        fetchTables(),
        fetchMenu(),
      ]);

      // Mock AI Assignment: Assign waiters to tables
      const tablesWithStaff = tableData.map((t: any, i: number) => ({
        ...t,
        assignedWaiter: waiters[Math.floor(i / 2) % waiters.length], // 1 waiter per 2 tables logic
      }));

      setTables(tablesWithStaff);
      setMenuItems(menuData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Fetch Restaurant Info for bills
    axios
      .get("http://localhost:5000/api/restaurant")
      .then((res) => {
        if (res.data) setRestaurantInfo(res.data);
      })
      .catch(console.error);

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Order Details when Table is Selected
  useEffect(() => {
    const loadTableOrder = async () => {
      if (selectedTable && selectedTable.currentOrderId) {
        try {
          setLoading(true);
          const order = await fetchOrderById(
            selectedTable.currentOrderId.toString(),
          );
          // Map backend items to frontend OrderItem structure
          const mappedItems: OrderItem[] = order.items.map((i: any) => ({
            menuItem: i.menuItem,
            quantity: i.quantity,
            customization: i.customization,
          }));
          setCurrentOrder(mappedItems);
        } catch (e) {
          console.error("Failed to load active order", e);
        } finally {
          setLoading(false);
        }
      } else {
        setCurrentOrder([]);
      }
    };

    if (selectedTable) {
      loadTableOrder();
      setViewMode("menu"); // Auto switch to menu when table selected
    } else {
      setViewMode("tables");
    }
  }, [selectedTable]);

  // Simulate Kitchen Notifications
  useEffect(() => {
    const notifyInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomTable = Math.floor(Math.random() * 8) + 1;
        setNotifications((prev) => [
          `Kitchen: Order for Table ${randomTable} is Ready! 🍳`,
          ...prev,
        ]);
      }
    }, 15000); // Check every 15s
    return () => clearInterval(notifyInterval);
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  const filteredMenu =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addItemToOrder = (item: MenuItem) => {
    const itemId = item.id || (item as any)._id; // Robust ID check
    const existingItem = currentOrder.find(
      (orderItem) =>
        (orderItem.menuItem.id || (orderItem.menuItem as any)._id) === itemId,
    );

    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((orderItem) =>
          (orderItem.menuItem.id || (orderItem.menuItem as any)._id) === itemId
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem,
        ),
      );
    } else {
      setCurrentOrder([...currentOrder, { menuItem: item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCurrentOrder(
      currentOrder
        .map((item) =>
          (item.menuItem.id || (item.menuItem as any)._id) === itemId
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (itemId: string) => {
    setCurrentOrder(
      currentOrder.filter(
        (item) => (item.menuItem.id || (item.menuItem as any)._id) !== itemId,
      ),
    );
  };

  const getTotalAmount = () => {
    return currentOrder.reduce(
      (sum, item) => sum + item.menuItem.price * item.quantity,
      0,
    );
  };

  const handlePrintBill = () => {
    setOpenBillDialog(true);
  };

  const sendWhatsAppBill = () => {
    if (!customerPhone) {
      alert("Please enter customer number");
      return;
    }

    const subtotal = getTotalAmount();
    const tax = Math.floor(subtotal * 0.05);
    const total = Math.floor(subtotal * 1.05);

    let billText = `*${restaurantInfo.name}*\n`;
    billText += `${restaurantInfo.address || ""}\n`;
    billText += `--------------------------------\n`;
    billText += `Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    billText += `Table: ${selectedTable?.number}\n`;
    billText += `--------------------------------\n`;

    currentOrder.forEach((item) => {
      billText += `${item.menuItem.name} x${item.quantity} = ₹${item.menuItem.price * item.quantity}\n`;
    });

    billText += `--------------------------------\n`;
    billText += `Subtotal: ₹${subtotal}\n`;
    billText += `Tax (5%): ₹${tax}\n`;
    billText += `*TOTAL: ₹${total}*\n`;
    billText += `--------------------------------\n`;
    billText += `Thank you for dining with us!\n`;

    const encodedText = encodeURIComponent(billText);
    const url = `https://wa.me/91${customerPhone}?text=${encodedText}`; // Assuming +91 default

    window.open(url, "_blank");
    setOpenBillDialog(false);
    setCustomerPhone("");
  };

  const handleClearTable = async () => {
    if (!selectedTable) return;
    if (
      window.confirm(
        `Clear Table ${selectedTable.number}? This will free the table.`,
      )
    ) {
      try {
        const id = selectedTable.id || (selectedTable as any)._id; // Robust ID
        await updateTable(id, { status: "available", currentOrderId: null });
        loadData();
        setSelectedTable(null);
        setViewMode("tables"); // Go back
      } catch (e) {
        console.error("Failed to clear table", e);
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedTable) return;

    const itemsPayload = currentOrder.map((i) => ({
      menuItem: i.menuItem.id || (i.menuItem as any)._id,
      quantity: i.quantity,
      customization: i.customization,
    }));
    const total = getTotalAmount();

    try {
      if (selectedTable.currentOrderId) {
        // Add to existing order
        await addItemsToOrder(
          selectedTable.currentOrderId.toString(),
          itemsPayload,
          total,
        );
      } else {
        // Create new order
        const orderData = {
          tableId: selectedTable.id || (selectedTable as any)._id,
          items: itemsPayload,
          total: total,
          waiterName: "Staff",
        };
        await createOrder(orderData as any);
      }
      setOrderSuccess(true);
      setCurrentOrder([]);
      loadData(); // Refresh tables status
    } catch (err) {
      console.error("Failed to place order", err);
    }
  };

  const handlePayment = async (method: string) => {
    if (!selectedTable || !selectedTable.currentOrderId) return;
    try {
      // In a real app, you'd record the payment method
      await updateOrder(selectedTable.currentOrderId.toString(), "paid");
      loadData();

      // Show Reward / Success UI
      setRewardPoints(Math.floor(getTotalAmount() * 0.1)); // 10% points
      setOpenRewardDialog(true);

      setSelectedTable(null);
      setViewMode("tables"); // Go back after payment
    } catch (e) {
      console.error("Payment failed", e);
    }
  };

  const getTableColor = (
    status: Table["status"],
  ): "success" | "info" | "warning" | "error" | "primary" => {
    switch (status) {
      case "available":
        return "success";
      case "occupied":
        return "info";
      case "reserved":
        return "warning";
      case "billing":
        return "error";
      default:
        return "primary";
    }
  };

  if (loading)
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ height: "calc(100vh - 120px)", position: "relative" }}>
      {/* HEADER for Waiter View */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {viewMode === "menu" ? (
          <Button
            startIcon={<ArrowLeft />}
            onClick={() => setSelectedTable(null)}
          >
            Back to Tables
          </Button>
        ) : (
          <Typography variant="h5" fontWeight="bold">
            Floor Plan
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Bell />}
            onClick={() => setOpenNotifications(true)}
          >
            Notifications
            {notifications.length > 0 && (
              <Badge
                badgeContent={notifications.length}
                color="error"
                sx={{ ml: 1, mb: 1 }}
              />
            )}
          </Button>
        </Stack>
      </Box>

      {/* VIEW: TABLES */}
      {viewMode === "tables" && (
        <Grid container spacing={3}>
          <WaiterTableMapView
            tables={tables as any}
            getTableColor={getTableColor}
            onSelectTable={(t) => setSelectedTable(t)}
          />
        </Grid>
      )}

      {/* VIEW: MENU (Split Screen) */}
      {viewMode === "menu" && (
        <Box
          sx={{ height: "100%", display: "flex", gap: 2, overflow: "hidden" }}
        >
          {/* Left: Menu Grid */}
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ overflowX: "auto", pb: 1 }}
              >
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    onClick={() => setSelectedCategory(cat)}
                    color={selectedCategory === cat ? "primary" : "default"}
                    variant={selectedCategory === cat ? "filled" : "outlined"}
                    clickable
                  />
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                p: 2,
                flex: 1,
                overflowY: "auto",
                bgcolor: "background.default",
              }}
            >
              <Grid container spacing={2}>
                {filteredMenu.map((item) => {
                  const itemId = item.id || (item as any)._id; // Handle backend _id
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={itemId}>
                      <Card
                        elevation={0}
                        variant="outlined"
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          borderRadius: 3,
                          border: 1,
                          borderColor: "divider",
                          opacity: item.available ? 1 : 0.6,
                          position: "relative",
                        }}
                      >
                        <CardActionArea
                          onClick={() => addItemToOrder(item)}
                          disabled={!item.available}
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "stretch",
                          }}
                        >
                          <Box sx={{ position: "relative", pt: "60%" }}>
                            <CardMedia
                              component="img"
                              image={item.imageUrl}
                              alt={item.name}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                              }}
                            />
                            {!item.available && (
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  bgcolor: "rgba(0,0,0,0.6)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Chip label="Sold Out" color="error" />
                              </Box>
                            )}
                          </Box>
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              noWrap
                            >
                              {item.name}
                            </Typography>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              mt={1}
                            >
                              <Typography fontWeight="bold" color="primary">
                                ₹{item.price}
                              </Typography>
                              <Box
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1,
                                  ),
                                  p: 0.5,
                                  borderRadius: 2,
                                }}
                              >
                                <Plus
                                  size={16}
                                  color={theme.palette.primary.main}
                                />
                              </Box>
                            </Stack>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Paper>

          {/* Right: Order Cart */}
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              width: 400,
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "background.paper",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Table {selectedTable?.number}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Order Details
                </Typography>
              </Box>
              <Chip
                label="Dine In"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
            </Box>

            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {currentOrder.length === 0 ? (
                <Box
                  height="100%"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  color="text.secondary"
                >
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "action.hover",
                      borderRadius: "50%",
                      mb: 2,
                    }}
                  >
                    <Utensils size={32} />
                  </Box>
                  <Typography>No items in order</Typography>
                  <Typography variant="caption">
                    Tap menu items to add
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {currentOrder.map((item, index) => {
                    const itemId =
                      item.menuItem.id || (item.menuItem as any)._id; // Robust ID
                    return (
                      <Paper
                        key={index}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 3,
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={item.menuItem.imageUrl}
                          sx={{ width: 56, height: 56, borderRadius: 2 }}
                        />
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.menuItem.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ₹{item.menuItem.price * item.quantity}
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            bgcolor: "action.hover",
                            borderRadius: 3,
                            p: 0.5,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(itemId, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </IconButton>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ minWidth: 20, textAlign: "center" }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(itemId, 1)}
                          >
                            <Plus size={14} />
                          </IconButton>
                        </Stack>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeItem(itemId)}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Footer Actions */}
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Stack spacing={2} mb={2}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 3, bgcolor: "background.paper" }}
                >
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Subtotal</Typography>
                    <Typography fontWeight="bold">
                      ₹{getTotalAmount()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Typography color="text.secondary">Tax (5%)</Typography>
                    <Typography fontWeight="bold">
                      ₹{Math.floor(getTotalAmount() * 0.05)}
                    </Typography>
                  </Stack>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="h6" fontWeight="bold">
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      ₹{Math.floor(getTotalAmount() * 1.05)}
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>

              {selectedTable?.currentOrderId ? (
                <Box>
                  {/* Bill Actions */}
                  <Grid container spacing={1} mb={2}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        fullWidth
                        startIcon={<Smartphone size={16} />}
                        onClick={handlePrintBill}
                      >
                        WhatsApp Bill
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        fullWidth
                        startIcon={<XCircle size={16} />}
                        onClick={handleClearTable}
                      >
                        Clear
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid container spacing={1} mb={1}>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled={!selectedTable?.currentOrderId}
                        onClick={() => handlePayment("Card")}
                        sx={{
                          flexDirection: "column",
                          py: 1,
                          fontSize: "0.7rem",
                        }}
                      >
                        <CreditCard size={20} /> Card
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled={!selectedTable?.currentOrderId}
                        onClick={() => handlePayment("Cash")}
                        sx={{
                          flexDirection: "column",
                          py: 1,
                          fontSize: "0.7rem",
                        }}
                      >
                        <Banknote size={20} /> Cash
                      </Button>
                    </Grid>
                  </Grid>

                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Check />}
                    disabled={currentOrder.length === 0 || !selectedTable}
                    onClick={handlePlaceOrder}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {selectedTable?.currentOrderId
                      ? "Add to Order"
                      : "Place Order"}
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={currentOrder.length === 0}
                  onClick={handlePlaceOrder}
                  startIcon={<Check />}
                  sx={{
                    borderRadius: 3,
                    height: 56,
                    fontSize: "1.1rem",
                    boxShadow: theme.shadows[4],
                  }}
                >
                  Place Order • ₹{getTotalAmount()}
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      <Snackbar
        open={orderSuccess}
        autoHideDuration={3000}
        onClose={() => setOrderSuccess(false)}
      >
        <Alert severity="success" variant="filled">
          Order placed successfully!
        </Alert>
      </Snackbar>

      {/* Rewards Dialog */}
      <Dialog
        open={openRewardDialog}
        onClose={() => setOpenRewardDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: { borderRadius: 24, textAlign: "center", padding: 20 },
        }}
      >
        <Box position="relative" overflow="hidden">
          {/* Simple Particle Animation */}
          <AnimatePresence>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: 0 }}
                animate={{
                  opacity: 0,
                  y: Math.random() * -200 - 50,
                  x: (Math.random() - 0.5) * 200,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: ["#FFD700", "#FF6B6B", "#4ECDC4"][
                    Math.floor(Math.random() * 3)
                  ],
                }}
              />
            ))}
          </AnimatePresence>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                bgcolor: "success.light",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
                boxShadow: "0 10px 30px -10px rgba(16, 185, 129, 0.5)",
              }}
            >
              <Check size={48} color="white" strokeWidth={3} />
            </Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Payment Successful!
            </Typography>
            <Typography color="text.secondary" mb={3}>
              Transaction ID: TXN-{Date.now().toString().slice(-6)}
            </Typography>

            <Box
              sx={{
                bgcolor: "warning.light",
                p: 2,
                borderRadius: 3,
                mb: 3,
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PartyPopper size={24} color="#B45309" />
              <Typography fontWeight="bold" color="#B45309">
                You earned {rewardPoints} Points!
              </Typography>
            </Box>
          </motion.div>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => setOpenRewardDialog(false)}
            sx={{ borderRadius: 3 }}
          >
            Done
          </Button>
        </Box>
      </Dialog>

      {/* WhatsApp Bill Dialog */}
      <Dialog
        open={openBillDialog}
        onClose={() => setOpenBillDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Send Bill via WhatsApp</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Enter the customer's phone number to send a detailed bill directly
            to their WhatsApp.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            InputProps={{
              startAdornment: (
                <Typography color="text.secondary" mr={1}>
                  +91
                </Typography>
              ),
            }}
          />
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight="bold">
              Bill Preview:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "grey.100",
                borderRadius: 2,
                mt: 1,
                fontSize: "0.75rem",
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
              }}
            >
              {restaurantInfo.name}
              {"\n----------------\n"}
              Total: ₹{Math.floor(getTotalAmount() * 1.05)}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBillDialog(false)}>Cancel</Button>
          <Button
            onClick={sendWhatsAppBill}
            variant="contained"
            color="success"
            startIcon={<Send size={16} />}
          >
            Send Bill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
