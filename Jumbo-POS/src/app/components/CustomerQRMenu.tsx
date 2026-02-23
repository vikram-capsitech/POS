import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    TextField,
    Chip,
    Stack,
    IconButton,
    Drawer,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import { Plus, Minus, ShoppingBag, ArrowLeft, MessageSquare, Info, Wifi, ChevronDown } from 'lucide-react';
import { fetchMenu, createOrder, fetchTables, fetchRestaurantDetails } from '../services/api';
import { MenuItem } from '../data/mockData';

// Simulated Table ID if not in URL (for demo)
const DEMO_TABLE_ID = '1';

export function CustomerQRMenu() {
    // Try to get tableId from URL parameters, else defaults
    const location = useLocation();
    const [tableId, setTableId] = useState('1');
    const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [cart, setCart] = useState<{ item: MenuItem; quantity: number; note: string }[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [openCart, setOpenCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [loading, setLoading] = useState(true);
    const [restaurantInfo, setRestaurantInfo] = useState({ name: 'My Restaurant', description: '', wifiSsid: '', wifiPass: '' });

    useEffect(() => {
        // Parse params from query string
        const searchParams = new URLSearchParams(location.search);
        const tbl = searchParams.get('table') || '1';
        const rid = searchParams.get('restaurantId') || undefined;

        setTableId(tbl);
        setRestaurantId(rid);

        const loadData = async () => {
            try {
                // Fetch restaurant info
                try {
                    const rData = await fetchRestaurantDetails(rid);
                    if (rData) setRestaurantInfo(rData);
                } catch (e) {
                    console.error("Failed to load restaurant info", e);
                }

                const data = await fetchMenu(rid); // Pass rid to fetchMenu
                setMenuItems(data);
                setCategories(['All', ...Array.from(new Set(data.map((i: any) => i.category)))]);
                setLoading(false);
            } catch (e) {
                console.error("Failed to load menu", e);
                setLoading(false);
            }
        };
        loadData();
    }, [location.search]);

    const addToCart = (item: MenuItem) => {
        const itemId = item.id || (item as any)._id;
        setCart(prev => {
            const existing = prev.find(i => (i.item.id || (i.item as any)._id) === itemId);
            if (existing) {
                return prev.map(i => (i.item.id || (i.item as any)._id) === itemId ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { item, quantity: 1, note: '' }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => (i.item.id || (i.item as any)._id) !== itemId).map(i =>
            (i.item.id || (i.item as any)._id) === itemId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
        ).filter(i => i.quantity > 0));
    };

    const updateNote = (itemId: string, note: string) => {
        setCart(prev => prev.map(i => (i.item.id || (i.item as any)._id) === itemId ? { ...i, note } : i));
    };

    const getTotal = () => cart.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);

    const handlePlaceOrder = async () => {
        try {
            // Find actual table ID from backend would be better, but assuming number mapping for now or direct ID
            // Real app: fetchTables() -> find table with number == tableId -> get _id
            const tables = await fetchTables();
            const actualTable = tables.find((t: any) => t.number.toString() === tableId.toString());

            if (!actualTable) {
                alert('Invalid Table');
                return;
            }

            const tableMongoId = actualTable.id || (actualTable as any)._id;

            await createOrder({
                tableId: tableMongoId,
                items: cart.map(c => ({
                    menuItem: c.item.id || (c.item as any)._id,
                    quantity: c.quantity,
                    customization: c.note,
                    specialRequest: c.note
                })),
                total: getTotal(),
                waiterName: 'Customer App', // Self-ordering
                orderSource: 'dine-in'
            });

            setOrderPlaced(true);
            setCart([]);
            setOpenCart(false);
        } catch (e) {
            console.error("Order failed", e);
            alert("Failed to place order. Please call waiter.");
        }
    };

    if (loading) return <Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box>;
    if (orderPlaced) return (
        <Box height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3} textAlign="center">
            <Typography variant="h4" mb={2}>🎉</Typography>
            <Typography variant="h5" fontWeight="bold" gutterBottom>Order Placed!</Typography>
            <Typography color="text.secondary" paragraph>Your order has been sent to the waiter for approval.</Typography>
            <Typography variant="body2" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', py: 0.5, px: 2, borderRadius: 2 }}>Status: Pending Approval</Typography>
            <Button variant="outlined" sx={{ mt: 4 }} onClick={() => setOrderPlaced(false)}>Order More</Button>
        </Box>
    );

    const filteredItems = selectedCategory === 'All' ? menuItems : menuItems.filter(i => i.category === selectedCategory);

    return (
        <Box sx={{ pb: 10, bgcolor: 'grey.50', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'white', position: 'sticky', top: 0, zIndex: 10, boxShadow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight="bold">Table {tableId}</Typography>
                        <Typography variant="caption" color="text.secondary">{restaurantInfo.name}</Typography>
                    </Box>
                    <Box>
                        {/* Info Icon / Toggle */}
                    </Box>
                </Stack>

                <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, mt: 1, bgcolor: 'transparent' }}>
                    <AccordionSummary expandIcon={<ChevronDown size={16} />} sx={{ minHeight: 0, p: 0, '& .MuiAccordionSummary-content': { m: 0 } }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Info size={14} className="text-gray-500" />
                            <Typography variant="caption" color="text.secondary">Restaurant Info & WiFi</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pt: 1 }}>
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ fontSize: '0.8rem', mb: 1 }}>
                            {restaurantInfo.description}
                        </Typography>
                        {restaurantInfo.wifiSsid && (
                            <Stack direction="row" alignItems="center" spacing={1} bgcolor="blue.50" p={1} borderRadius={2}>
                                <Wifi size={16} color="#3b82f6" />
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">WiFi: <strong>{restaurantInfo.wifiSsid}</strong></Typography>
                                    <Typography variant="caption" color="text.secondary">Pass: <strong>{restaurantInfo.wifiPass}</strong></Typography>
                                </Box>
                            </Stack>
                        )}
                    </AccordionDetails>
                </Accordion>

                <Stack direction="row" spacing={1} mt={2} overflow="auto">
                    {categories.map(c => (
                        <Chip
                            key={c}
                            label={c}
                            onClick={() => setSelectedCategory(c)}
                            color={selectedCategory === c ? 'primary' : 'default'}
                            variant={selectedCategory === c ? 'filled' : 'outlined'}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Menu Grid */}
            <Box p={2}>
                <Grid container spacing={2}>
                    {filteredItems.map(item => {
                        const itemId = item.id || (item as any)._id;
                        return (
                            <Grid size={{ xs: 12, sm: 6 }} key={itemId}>
                                <Card elevation={0} sx={{ display: 'flex', p: 1, borderRadius: 3, border: '1px solid #eee' }}>
                                    <Box width={100} height={100} borderRadius={2} overflow="hidden" position="relative">
                                        <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Box>
                                    <Box flex={1} pl={2} display="flex" flexDirection="column" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>{item.name}</Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap>{item.ingredients.join(', ')}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography fontWeight="bold">₹{item.price}</Typography>
                                            <Button size="small" variant="contained" onClick={() => addToCart(item)} sx={{ borderRadius: 2, minWidth: 32, px: 2 }}>
                                                ADD
                                            </Button>
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>

            {/* View Cart Button */}
            {cart.length > 0 && (
                <Box position="fixed" bottom={20} left={0} right={0} p={2} zIndex={20}>
                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        startIcon={<ShoppingBag />}
                        onClick={() => setOpenCart(true)}
                        sx={{ borderRadius: 4, py: 1.5, fontSize: '1.1rem', boxShadow: 3 }}
                    >
                        View Cart • {cart.reduce((s, i) => s + i.quantity, 0)} items
                    </Button>
                </Box>
            )}

            {/* Cart Drawer */}
            <Drawer anchor="bottom" open={openCart} onClose={() => setOpenCart(false)} PaperProps={{ sx: { borderRadius: '20px 20px 0 0', maxHeight: '90vh' } }}>
                <Box p={3}>
                    <Typography variant="h6" fontWeight="bold" mb={3}>Your Cart</Typography>
                    <Stack spacing={3}>
                        {cart.map((c, idx) => {
                            const cItemId = c.item.id || (c.item as any)._id;
                            return (
                                <Box key={idx}>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography fontWeight="bold">{c.item.name}</Typography>
                                        <Typography fontWeight="bold">₹{c.item.price * c.quantity}</Typography>
                                    </Box>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                                        <TextField
                                            placeholder="Special request (e.g. less spicy)"
                                            size="small"
                                            variant="outlined"
                                            fullWidth
                                            sx={{ mr: 2, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: 'grey.50' } }}
                                            value={c.note}
                                            onChange={(e) => updateNote(cItemId, e.target.value)}
                                        />
                                        <Stack direction="row" alignItems="center" spacing={1} bgcolor="grey.100" borderRadius={2} px={1}>
                                            <IconButton size="small" onClick={() => removeFromCart(cItemId)}><Minus size={16} /></IconButton>
                                            <Typography fontWeight="bold">{c.quantity}</Typography>
                                            <IconButton size="small" onClick={() => addToCart(c.item)}><Plus size={16} /></IconButton>
                                        </Stack>
                                    </Stack>
                                </Box>
                            )
                        })}
                    </Stack>

                    <Box mt={4} pt={2} borderTop="1px dashed #eee">
                        <Stack direction="row" justifyContent="space-between" mb={2}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6" fontWeight="bold">₹{getTotal()}</Typography>
                        </Stack>
                        <Button variant="contained" fullWidth size="large" onClick={handlePlaceOrder} sx={{ borderRadius: 3, py: 1.5 }}>
                            Place Order
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </Box>
    );
}
