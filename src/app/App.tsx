import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AdminDashboard } from '@/app/components/AdminDashboard';
import { WaiterPOS } from '@/app/components/WaiterPOS';
import { KitchenDisplay } from '@/app/components/KitchenDisplay';
import { CustomerQRMenu } from '@/app/components/CustomerQRMenu';
import { LoginPage } from '@/app/components/LoginPage';
import { ProtectedRoute } from '@/app/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CustomThemeProvider, useCustomTheme } from '@/context/ThemeContext';
import { LayoutDashboard, Utensils, ChefHat, Sun, Moon, Palette, LogOut } from 'lucide-react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  IconButton,
  useTheme,
  Button
} from '@mui/material';

function MainLayout({ children }: { children: React.ReactNode }) {
  // const { customTheme, setCustomTheme } = useCustomTheme(); // Can use this later for toggle
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <AppBar position="fixed" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary', backdropFilter: 'blur(10px)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2} onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.main', color: 'white' }}><ChefHat size={24} /></Box>
            <Typography variant="h6" fontWeight="bold">RestoPOS</Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {user && (
              <Box display="flex" alignItems="center" gap={2} mr={2}>
                <Typography variant="body2" fontWeight="bold">Hello, {user.name} ({user.role})</Typography>
              </Box>
            )}

            {/* Theme Toggle managed via Admin Settings now */}
            {/*
            <Tooltip title="Toggle Theme">
              <IconButton onClick={() => {}}>
                <Sun size={20} />
              </IconButton>
            </Tooltip>
            */}

            {user && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<LogOut size={16} />}
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ pt: 10, px: 3, pb: 4, maxWidth: '1600px', mx: 'auto' }}>
        {children}
      </Box>
    </Box>
  );
}

function RedirectHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'admin': return <Navigate to="/admin" replace />;
    case 'waiter': return <Navigate to="/waiter" replace />;
    case 'kitchen': return <Navigate to="/kitchen" replace />;
    default: return <Navigate to="/qr-menu" replace />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <MainLayout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/waiter" element={
              <ProtectedRoute allowedRoles={['waiter', 'admin']}>
                <WaiterPOS />
              </ProtectedRoute>
            } />
            <Route path="/kitchen" element={
              <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                <KitchenDisplay />
              </ProtectedRoute>
            } />
            <Route path="/qr-menu" element={<CustomerQRMenu />} />
            <Route path="/" element={<RedirectHome />} />
          </Routes>
        </MainLayout>
      </CustomThemeProvider>
    </AuthProvider>
  );
}