import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Badge } from '@mui/material';
import { fetchRooms } from '../../api/client';
import { MeetingRoom } from '@mui/icons-material';

const RoomStatusColors: any = {
    AVAILABLE: 'success.main',
    OCCUPIED: 'error.main',
    CLEANING: 'warning.main',
    MAINTENANCE: 'text.disabled'
};

const HotelPage: React.FC = () => {
    const [rooms, setRooms] = useState<any[]>([]);

    useEffect(() => {
        fetchRooms().then(setRooms);
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Hotel Management</Typography>
            <Grid container spacing={3}>
                {rooms.map(room => (
                    <Grid item xs={6} sm={4} md={3} key={room._id}>
                        <Paper
                            sx={{
                                p: 3,
                                textAlign: 'center',
                                cursor: 'pointer',
                                bgcolor: 'background.paper',
                                border: 2,
                                borderColor: RoomStatusColors[room.status]
                            }}
                        >
                            <MeetingRoom sx={{ fontSize: 40, color: RoomStatusColors[room.status], mb: 1 }} />
                            <Typography variant="h5">RM {room.number}</Typography>
                            <Typography variant="body2" color="text.secondary">{room.type}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 'bold', color: RoomStatusColors[room.status] }}>
                                {room.status}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default HotelPage;
