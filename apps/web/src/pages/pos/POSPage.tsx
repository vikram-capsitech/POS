import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent, Button, Tabs, Tab, IconButton, TextField, Dialog, DialogTitle, DialogContent, MenuItem, Select } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { fetchProducts, fetchTables, createOrder } from '../../api/client';

// Types (should be in types file)
interface Product { _id: string; name: string; price: number; category: string; type: string; }
interface CartItem extends Product { quantity: number; notes?: string; }
interface Table { _id: string; name: string; status: string; }

const POSPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [orderType, setOrderType] = useState<string>('DINE_IN');

    useEffect(() => {
        fetchProducts().then(setProducts);
        fetchTables().then(setTables);
    }, []);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item._id === id) {
                return { ...item, quantity: Math.max(0, item.quantity + delta) };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert('Cart is empty');
        if (orderType === 'DINE_IN' && !selectedTable) return alert('Select a table for Dine-In');

        try {
            await createOrder({
                items: cart,
                tableId: selectedTable || null,
                type: orderType
            });
            alert('Order Placed!');
            setCart([]);
            setSelectedTable('');
            fetchTables().then(setTables); // Refresh tables
        } catch (err) {
            alert('Failed to place order');
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
            {/* Product Section */}
            <Grid item xs={8} sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ mb: 2 }}>
                    <Tabs value={selectedCategory} onChange={(_, v) => setSelectedCategory(v)} variant="scrollable">
                        {categories.map(cat => <Tab key={cat} label={cat} value={cat} />)}
                    </Tabs>
                </Paper>

                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    <Grid container spacing={2}>
                        {products
                            .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
                            .map(product => (
                                <Grid item xs={12} sm={4} md={3} key={product._id}>
                                    <Card
                                        onClick={() => addToCart(product)}
                                        sx={{ cursor: 'pointer', height: '100%', '&:hover': { transform: 'scale(1.02)', transition: '0.2s' } }}
                                    >
                                        <CardContent>
                                            <Typography variant="h6">{product.name}</Typography>
                                            <Typography color="secondary">₹{product.price}</Typography>
                                            <Typography variant="caption" color={product.type === 'VEG' ? 'green' : 'red'}>{product.type}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                    </Grid>
                </Box>
            </Grid>

            {/* Cart Section */}
            <Grid item xs={4} sx={{ height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" gutterBottom>Current Order</Typography>

                    <Box sx={{ mb: 2 }}>
                        <Select fullWidth value={orderType} onChange={(e) => setOrderType(e.target.value)} size="small" sx={{ mb: 1 }}>
                            <MenuItem value="DINE_IN">Dine In</MenuItem>
                            <MenuItem value="TAKEAWAY">Takeaway</MenuItem>
                        </Select>
                        {orderType === 'DINE_IN' && (
                            <Select fullWidth value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} displayEmpty size="small">
                                <MenuItem value="">Select Table</MenuItem>
                                {tables.map(t => (
                                    <MenuItem key={t._id} value={t._id} disabled={t.status === 'OCCUPIED'}>
                                        {t.name} ({t.status})
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        {cart.map(item => (
                            <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Box>
                                    <Typography variant="subtitle1">{item.name}</Typography>
                                    <Typography variant="body2">₹{item.price * item.quantity}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <IconButton size="small" onClick={() => updateQuantity(item._id, -1)}><Remove /></IconButton>
                                    <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                    <IconButton size="small" onClick={() => updateQuantity(item._id, 1)}><Add /></IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6">Total</Typography>
                            <Typography variant="h6">₹{totalAmount}</Typography>
                        </Box>
                        <Button variant="contained" fullWidth size="large" onClick={handleCheckout}>
                            Place Order
                        </Button>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default POSPage;
