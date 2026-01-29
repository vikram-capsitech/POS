import React from 'react';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, AppBar } from '@mui/material';
import { RestaurantMenu, Hotel, Kitchen, Assessment, Inventory } from '@mui/icons-material'; // Icons
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
    { text: 'POS', icon: <RestaurantMenu />, path: '/' },
    { text: 'KDS', icon: <Kitchen />, path: '/kds' },
    { text: 'Hotel', icon: <Hotel />, path: '/hotel' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Inventory', icon: <Inventory />, path: '/inventory' },
];

const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div">
                        Antigravity POS & Hotel System
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    selected={location.pathname === item.path}
                                    onClick={() => navigate(item.path)}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Outlet />
            </Box>
        </Box>
    );
};

export default MainLayout;
