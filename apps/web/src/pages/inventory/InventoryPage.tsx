import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, TextField, Chip } from '@mui/material';
import { fetchInventory, addStock } from '../../api/client';
import { Add } from '@mui/icons-material';

const InventoryPage: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [qty, setQty] = useState('');
    const [cost, setCost] = useState('');

    const loadData = () => fetchInventory().then(setItems);

    useEffect(() => { loadData(); }, []);

    const handleAddStock = async () => {
        if (!selectedItem || !qty) return;
        await addStock({ id: selectedItem._id, quantity: qty, cost: cost || selectedItem.costPerUnit });
        setOpen(false);
        loadData();
    };

    const openStockDialog = (item: any) => {
        setSelectedItem(item);
        setQty('');
        setCost(item.costPerUnit);
        setOpen(true);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Inventory Management</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'secondary.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Total Stock Value</Typography>
                            <Typography variant="h4">
                                ₹{items.reduce((acc, i) => acc + (i.quantity * i.costPerUnit), 0).toFixed(2)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
                        <CardContent>
                            <Typography variant="h6">Low Stock Items</Typography>
                            <Typography variant="h4">
                                {items.filter(i => i.quantity <= i.lowStockThreshold).length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item Name</TableCell>
                            <TableCell>Current Qty</TableCell>
                            <TableCell>Unit</TableCell>
                            <TableCell>Cost/Unit</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item._id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.quantity.toFixed(3)}</TableCell>
                                <TableCell>{item.unit}</TableCell>
                                <TableCell>₹{item.costPerUnit}</TableCell>
                                <TableCell>
                                    {item.quantity <= item.lowStockThreshold ?
                                        <Chip label="Low Stock" color="error" size="small" /> :
                                        <Chip label="In Stock" color="success" size="small" />}
                                </TableCell>
                                <TableCell>
                                    <Button startIcon={<Add />} size="small" onClick={() => openStockDialog(item)}>
                                        Add Stock
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Update Stock: {selectedItem?.name}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Quantity to Add"
                        fullWidth
                        type="number"
                        sx={{ mt: 2 }}
                        value={qty}
                        onChange={e => setQty(e.target.value)}
                    />
                    <TextField
                        label="New Cost Per Unit (Optional)"
                        fullWidth
                        type="number"
                        sx={{ mt: 2 }}
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                    />
                    <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleAddStock}>
                        Confirm Update
                    </Button>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default InventoryPage;
