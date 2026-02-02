import { useState } from 'react';
import { X, RotateCw, ZoomIn, ZoomOut, Flame, Leaf, Clock, Info } from 'lucide-react';
import { MenuItem } from '@/app/data/mockData';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Chip,
  Stack,
  alpha,
  useTheme,
  Paper
} from '@mui/material';

interface VRPreviewProps {
  dish: MenuItem;
  onClose: () => void;
}

export function VRPreview({ dish, onClose }: VRPreviewProps) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const theme = useTheme();

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {dish.isVeg ? <Leaf color={theme.palette.success.main} /> : <Box width={12} height={12} borderRadius="50%" bgcolor="error.main" />}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">{dish.name}</Typography>
            <Typography variant="body2" color="text.secondary">3D Interactive Preview</Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ bgcolor: 'action.hover' }}><X /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Grid container>
          {/* 3D View */}
          <Grid size={{ xs: 12, lg: 8 }} sx={{ p: 4, bgcolor: 'action.hover', borderRight: { lg: 1 }, borderBottom: { xs: 1, lg: 0 }, borderColor: 'divider', minHeight: 500, display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1000px' }}>
              <Box
                component="img"
                src={dish.imageUrl}
                alt={dish.name}
                sx={{
                  width: 400,
                  height: 400,
                  objectFit: 'cover',
                  borderRadius: 4,
                  boxShadow: theme.shadows[10],
                  transition: 'transform 0.3s ease-out',
                  transform: `rotate(${rotation}deg) scale(${zoom})`
                }}
              />
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
              <IconButton onClick={() => setRotation(r => r - 45)} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><RotateCw style={{ transform: 'scaleX(-1)' }} /></IconButton>
              <IconButton onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><ZoomOut /></IconButton>
              <Button variant="contained" onClick={() => { setRotation(0); setZoom(1); }}>Reset</Button>
              <IconButton onClick={() => setZoom(z => Math.min(2, z + 0.1))} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><ZoomIn /></IconButton>
              <IconButton onClick={() => setRotation(r => r + 45)} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><RotateCw /></IconButton>
            </Box>

            <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
              <Chip icon={<Info size={16} />} label="Drag to rotate • Pinch to zoom" color="info" variant="outlined" sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }} />
            </Box>
          </Grid>

          {/* Details */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ p: 4 }}>
            <Stack spacing={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1), border: 1, borderColor: alpha(theme.palette.primary.main, 0.2) }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">PRICE</Typography>
                <Typography variant="h3" fontWeight="bold" color="primary.main">₹{dish.price}</Typography>
              </Paper>

              <Grid container spacing={2}>
                <Grid size={6}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} mb={1} color="info.main"><Clock size={18} /><Typography variant="caption" fontWeight="bold">PREP TIME</Typography></Stack>
                    <Typography variant="h6" fontWeight="bold">{dish.prepTime} min</Typography>
                  </Paper>
                </Grid>
                <Grid size={6}>
                  <Paper elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={1} mb={1} color="error.main"><Flame size={18} /><Typography variant="caption" fontWeight="bold">SPICE</Typography></Stack>
                    <Stack direction="row" spacing={0.5}>
                      {[...Array(3)].map((_, i) => <Box key={i} width={8} height={8} borderRadius="50%" bgcolor={i < dish.spiceLevel ? 'error.main' : 'action.disabled'} />)}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" gutterBottom>INGREDIENTS</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {dish.ingredients.map((ing, i) => (
                    <Chip key={i} label={ing} />
                  ))}
                </Box>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                {dish.isVeg ? (
                  <>
                    <Box p={1} borderRadius={1} border={1} borderColor="success.main"><Leaf color={theme.palette.success.main} /></Box>
                    <Box>
                      <Typography fontWeight="bold">Vegetarian</Typography>
                      <Typography variant="caption" color="success.main">100% Plant-based</Typography>
                    </Box>
                  </>
                ) : (
                  <>
                    <Box p={1} borderRadius={1} border={1} borderColor="error.main"><Box width={20} height={20} borderRadius="50%" bgcolor="error.main" /></Box>
                    <Box>
                      <Typography fontWeight="bold">Non-Vegetarian</Typography>
                      <Typography variant="caption" color="error.main">Contains meat</Typography>
                    </Box>
                  </>
                )}
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={!dish.available}
          sx={{ py: 1.5, fontSize: '1.1rem' }}
        >
          {dish.available ? `Add to Cart • ₹${dish.price}` : 'Currently Unavailable'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
