import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { fetchStats } from '../../api/client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const ReportsPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchStats().then(setStats);
    }, []);

    if (!stats) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Business Reports</Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary">Daily Sales</Typography>
                            <Typography variant="h4">₹{stats.dailySales.total.toFixed(2)}</Typography>
                            <Typography variant="body2" color="success.main">
                                {stats.dailySales.count} Orders Today
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Add more summary cards here */}
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Sales Trend (Last 7 Days)</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="_id" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="sales" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>Top Selling Items</Typography>
                        {stats.topItems.map((item: any, i: number) => (
                            <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                                <Typography>{item._id}</Typography>
                                <Typography fontWeight="bold">{item.sold} sold</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ReportsPage;
