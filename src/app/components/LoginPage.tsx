import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { ChefHat } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password },
      );
      login(data);

      // Redirect based on role
      switch (data.role) {
        case "admin":
          navigate("/admin");
          break;
        case "waiter":
          navigate("/waiter");
          break;
        case "kitchen":
          navigate("/kitchen");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: string) => {
    setEmail(`${role}@example.com`);
    setPassword(`${role}123`);
  };

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgcolor="grey.100"
    >
      <Paper elevation={3} sx={{ p: 4, width: 400, borderRadius: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box
            p={2}
            mb={2}
            borderRadius="50%"
            bgcolor="primary.main"
            color="white"
            display="flex"
          >
            <ChefHat size={32} />
          </Box>
          <Typography variant="h5" fontWeight="bold">
            RestoPOS Login
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleLogin}>
          <Stack spacing={2}>
            <TextField
              label="Email Address"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Log In"
              )}
            </Button>
          </Stack>
        </form>

        <Box mt={4}>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            mb={1}
          >
            Demo Credentials (Click to pre-fill):
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDemoLogin("admin")}
            >
              Admin
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDemoLogin("waiter")}
            >
              Waiter
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleDemoLogin("waiter")}
            >
              Chef
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
