// WaiterTableMapView.tsx
import React from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  Chip,
  Typography,
  Stack,
  Avatar,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Sparkles } from "lucide-react";
import type { Table } from "@/app/data/mockData";

type TableColor = "success" | "info" | "warning" | "error" | "primary" | "secondary";

type Props = {
  tables: (Table & { assignedWaiter?: string })[];
  getTableColor: (status: Table["status"]) => TableColor;
  onSelectTable: (t: Table) => void;
};

function clampSeats(seats: any) {
  const n = Number(seats);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(Math.max(Math.round(n), 1), 12);
}

function getSeatAngles(seats: number) {
  switch (seats) {
    case 1:
      return [270];
    case 2:
      return [90, 270];
    case 3:
      return [90, 210, 330];
    case 4:
      return [0, 90, 180, 270];
    case 5:
      return [270, 342, 54, 126, 198];
    case 6:
      return [0, 60, 120, 180, 240, 300];
    case 8:
      return [0, 45, 90, 135, 180, 225, 270, 315];
    default: {
      const step = 360 / seats;
      return Array.from({ length: seats }, (_, i) => i * step);
    }
  }
}

function svgColors(theme: any, colorKey: string, status: Table["status"]) {
  const main = theme.palette[colorKey].main;
  const chairFill = alpha(main, status === "available" ? 0.55 : 0.85);
  const chairBack = alpha(main, status === "available" ? 0.4 : 0.75);
  const tableFill = alpha(main, status === "available" ? 0.18 : 0.22);
  const stroke = alpha(main, 0.9);
  return { chairFill, chairBack, tableFill, stroke };
}

function TableSeatSVG({
  seats,
  status,
  colorKey,
}: {
  seats: number;
  status: Table["status"];
  colorKey: string;
}) {
  const theme = useTheme();
  const s = clampSeats(seats);
  const angles = getSeatAngles(s);

  const cx = 80;
  const cy = 80;
  const chairRingR = 52;
  const chairW = 14;
  const chairH = 10;

  const shape: "round" | "square" = s <= 4 ? "square" : "round";
  const tableR = shape === "round" ? 28 : 26;

  const c = svgColors(theme, colorKey, status);

  return (
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      aria-label="table layout"
    >
      {angles.map((deg, idx) => {
        const rad = (deg * Math.PI) / 180;
        const x = cx + chairRingR * Math.cos(rad);
        const y = cy + chairRingR * Math.sin(rad);
        const rotate = deg + 90;

        return (
          <g key={idx} transform={`translate(${x}, ${y}) rotate(${rotate})`}>
            <rect
              x={-chairW / 2}
              y={-chairH / 2}
              width={chairW}
              height={chairH}
              rx={3}
              fill={c.chairFill}
              stroke={c.stroke}
              strokeWidth={1}
            />
            <rect
              x={-chairW / 2}
              y={-chairH / 2 - 6}
              width={chairW}
              height={4}
              rx={2}
              fill={c.chairBack}
            />
          </g>
        );
      })}

      {shape === "round" ? (
        <circle
          cx={cx}
          cy={cy}
          r={tableR}
          fill={c.tableFill}
          stroke={c.stroke}
          strokeWidth={2}
        />
      ) : (
        <rect
          x={cx - tableR}
          y={cy - tableR}
          width={tableR * 2}
          height={tableR * 2}
          rx={10}
          fill={c.tableFill}
          stroke={c.stroke}
          strokeWidth={2}
        />
      )}

      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill="#111827"
      >
        {s}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9" fill="#6b7280">
        seats
      </text>
    </svg>
  );
}

export default function WaiterTableMapView({
  tables,
  getTableColor,
  onSelectTable,
}: Props) {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {tables.map((table) => {
        const color = getTableColor(table.status);
        const tableId = (table as any).id || (table as any)._id;
        const waiterName = (table as any).assignedWaiter || "Unassigned";

        return (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={tableId}>
            <Card
              elevation={0}
              variant="outlined"
              sx={{
                height: 240,
                borderRadius: 3,
                border: 2,
                borderColor: alpha(theme.palette[color].main, 0.3),
                bgcolor: alpha(theme.palette[color].main, 0.05),
                transition: "0.2s",
                overflow: "hidden",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <CardActionArea
                sx={{ height: "100%", p: 2 }}
                onClick={() => onSelectTable(table)}
              >
                <Stack height="100%" justifyContent="space-between">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      color={`${color}.main`}
                    >
                      {table.number}
                    </Typography>
                    <Chip
                      label={table.status}
                      color={color}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Box>

                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mt={-1}
                  >
                    <TableSeatSVG
                      seats={Number(table.seats)}
                      status={table.status}
                      colorKey={color}
                    />
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "background.paper",
                      p: 1,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem" }}>
                      {waiterName?.[0] || "U"}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        lineHeight={1}
                      >
                        Served by
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {waiterName}
                      </Typography>
                    </Box>
                    <Sparkles
                      size={14}
                      color="#FFD700"
                      style={{ marginLeft: "auto" }}
                    />
                  </Box>
                </Stack>
              </CardActionArea>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
