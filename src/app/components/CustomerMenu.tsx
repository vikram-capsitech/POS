import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  Flame,
  Leaf,
  X,
  Eye
} from 'lucide-react';
import { MenuItem, OrderItem } from '@/app/data/mockData';
import { fetchMenu, createOrder, fetchTables } from '@/app/services/api';
import { VRPreview } from '@/app/components/VRPreview';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Drawer,
  Stack,
  Badge,
  useTheme,
  alpha,
  Container,
  Tab,
  Tabs,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';

export function CustomerMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMenu();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to load menu", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = ['All', ...Array.from(new Set(menuItems.map((item) => item.category)))];

  const filteredMenu =
    selectedCategory === 'All' ? menuItems : menuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    const itemId = item.id || (item as any)._id;
    const existingItem = cart.find((cartItem) => (cartItem.menuItem.id || (cartItem.menuItem as any)._id) === itemId);

    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          (cartItem.menuItem.id || (cartItem.menuItem as any)._id) === itemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      );
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(
      cart
        .map((item) => ((item.menuItem.id || (item.menuItem as any)._id) === itemId ? { ...item, quantity: item.quantity + change } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const handleCheckout = async () => {
    try {
      const tables = await fetchTables();
      const table5 = tables.find(t => t.number === 5) || tables[0]; // Fallback to first table if 5 not found

      if (!table5) {
        alert("No tables available to place order!");
        return;
      }

      const orderData = {
        tableId: table5.id || (table5 as any)._id,
        items: cart.map(i => ({
          menuItem: i.menuItem.id || (i.menuItem as any)._id,
          quantity: i.quantity,
          customization: i.customization
        })),
        total: cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0),
        waiterName: "Customer (QR)"
      };

      await createOrder(orderData as any);
      setOrderSuccess(true);
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error("Checkout failed", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(12px)', borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Stack direction="row" justifyContent="space-between" alignItems="center" py={2}>
            <Box>
              <Typography variant="h5" fontWeight="bold">Menu</Typography>
              <Typography variant="body2" color="text.secondary">Table 5 • Browse and order</Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowCart(true)}
              startIcon={<ShoppingCart />}
              sx={{ borderRadius: 3, px: 3, py: 1 }}
            >
              Cart
              <Badge badgeContent={totalItems} color="secondary" sx={{ ml: 1 }}>
                <Box />
              </Badge>
            </Button>
          </Stack>

          <Tabs
            value={selectedCategory}
            onChange={(_, val) => setSelectedCategory(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 48 }}
          >
            {categories.map((cat) => (
              <Tab key={cat} label={cat} value={cat} sx={{ fontWeight: 600, textTransform: 'capitalize' }} />
            ))}
          </Tabs>
        </Container>
      </Box>

      {/* Menu Grid */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {filteredMenu.map((item) => {
            const itemId = item.id || (item as any)._id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={itemId}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: 1,
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'visible',
                    mt: 2,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[4],
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', height: 200, mt: -2, mx: 2, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[2] }}>
                    <CardMedia
                      component="img"
                      image={item.imageUrl}
                      alt={item.name}
                      sx={{ height: '100%', width: '100%' }}
                    />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)' }} />

                    <IconButton
                      size="small"
                      onClick={() => setSelectedDish(item)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.main' }
                      }}
                    >
                      <Eye size={16} />
                    </IconButton>

                    <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 0.5 }}>
                      {item.spiceLevel > 0 && [...Array(item.spiceLevel)].map((_, i) => <Flame key={i} size={14} fill="#ef4444" color="#ef4444" />)}
                    </Box>
                  </Box>

                  <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
                        {item.name}
                      </Typography>
                      {item.isVeg ? <Leaf size={16} color={theme.palette.success.main} /> : <Box width={12} height={12} borderRadius="50%" bgcolor="error.main" mt={0.5} />}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.ingredients.join(', ')}
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mt="auto">
                      <Box>
                        <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary" mb={0.5}>
                          <Clock size={14} />
                          <Typography variant="caption">{item.prepTime} min</Typography>
                        </Stack>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">₹{item.price}</Typography>
                      </Box>
                      <Button
                        variant="contained"
                        size="small"
                        disabled={!item.available}
                        onClick={() => addToCart(item)}
                        sx={{ borderRadius: 2, minWidth: 40, px: 2 }}
                      >
                        {item.available ? <Plus /> : 'Out'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>

      {/* Cart Drawer */}
      <Drawer
        anchor="right"
        open={showCart}
        onClose={() => setShowCart(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, borderRadius: { xs: 0, sm: '20px 0 0 20px' }, bgcolor: 'background.paper' } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold">Your Cart</Typography>
              <IconButton onClick={() => setShowCart(false)}><X /></IconButton>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
            {cart.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5 }}>
                <ShoppingCart size={48} />
                <Typography mt={2}>Cart is empty</Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {cart.map((item) => {
                  const itemId = item.menuItem.id || (item.menuItem as any)._id;
                  return (
                    <Stack key={itemId} direction="row" spacing={2}>
                      <CardMedia
                        component="img"
                        image={item.menuItem.imageUrl}
                        sx={{ width: 80, height: 80, borderRadius: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight="bold">{item.menuItem.name}</Typography>
                        <Typography color="primary.main" fontWeight="bold">₹{item.menuItem.price}</Typography>
                        <Stack direction="row" alignItems="center" spacing={1} mt={1}>
                          <IconButton size="small" onClick={() => updateQuantity(itemId, -1)} sx={{ bgcolor: 'action.hover' }}>
                            <Minus size={14} />
                          </IconButton>
                          <Typography fontWeight="bold">{item.quantity}</Typography>
                          <IconButton size="small" onClick={() => updateQuantity(itemId, 1)} sx={{ bgcolor: 'action.hover' }}>
                            <Plus size={14} />
                          </IconButton>
                        </Stack>
                      </Box>
                      <Typography fontWeight="bold">₹{item.menuItem.price * item.quantity}</Typography>
                    </Stack>
                  )
                })}
              </Stack>
            )}
          </Box>

          <Box sx={{ p: 3, bgcolor: 'background.default', borderTop: 1, borderColor: 'divider' }}>
            <Stack spacing={1} mb={3}>
              <Stack direction="row" justifyContent="space-between" color="text.secondary">
                <Typography>Subtotal</Typography>
                <Typography>₹{totalAmount}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" color="text.secondary">
                <Typography>Tax (5%)</Typography>
                <Typography>₹{Math.round(totalAmount * 0.05)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  ₹{Math.round(totalAmount * 1.05).toLocaleString()}
                </Typography>
              </Stack>
            </Stack>

            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              sx={{ borderRadius: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Snackbar open={orderSuccess} autoHideDuration={3000} onClose={() => setOrderSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>Order sent to kitchen!</Alert>
      </Snackbar>

      {/* VR Preview */}
      {selectedDish && (
        <VRPreview dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </Box>
  );
}
