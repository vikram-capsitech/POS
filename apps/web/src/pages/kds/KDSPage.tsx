import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Button, Chip } from '@mui/material';
import { fetchOrders, updateOrderStatus } from '../../api/client';
import { differenceInMinutes } from 'date-fns';

const StatusColors: any = {
    NEW: 'error',
    PREPARING: 'warning',
    READY: 'success',
    SERVED: 'default'
};

const KDSPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);

    const loadOrders = () => {
        fetchOrders().then((data: any[]) => {
            // Filter out completed orders for active KDS view
            setOrders(data.filter(o => o.status !== 'SERVED'));
        });
    };

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const handleStatusUpdate = async (id: string, currentStatus: string) => {
        let nextStatus = 'PREPARING';
        if (currentStatus === 'PREPARING') nextStatus = 'READY';
        if (currentStatus === 'READY') nextStatus = 'SERVED';

        await updateOrderStatus(id, nextStatus);
        loadOrders();
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Kitchen Display System</Typography>
            <Grid container spacing={2}>
                {orders.map(order => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={order._id}>
                        <Paper sx={{ p: 2, border: 1, borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">#{order._id.slice(-4)}</Typography>
                                <Chip label={order.status} color={StatusColors[order.status]} />
                            </Box>
                            <Typography variant="subtitle2" gutterBottom>
                                {order.type} • {order.tableName || 'No Table'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {differenceInMinutes(new Date(), new Date(order.createdAt))} mins ago
                            </Typography>

                            <Box sx={{ my: 2, flexGrow: 1 }}>
                                {order.items.map((item: any, idx: number) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography>{item.quantity}x {item.name}</Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Button
                                variant="contained"
                                color={order.status === 'NEW' ? 'primary' : 'success'}
                                onClick={() => handleStatusUpdate(order._id, order.status)}
                            >
                                {order.status === 'NEW' ? 'Start Preparing' : order.status === 'PREPARING' ? 'Mark Ready' : 'Serve'}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default KDSPage;
