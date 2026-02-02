import React from "react";
import { Box, Paper, Typography, Chip } from "@mui/material";

type TableStatus = "available" | "occupied" | "reserved" | string;

type TableLayoutCardProps = {
  number: string | number;
  seats: number;
  status: TableStatus;
  shape?: "round" | "square"; // optional
};

function clampSeats(seats: number) {
  // keep it sane; you can expand later
  if (!Number.isFinite(seats) || seats <= 0) return 0;
  return Math.min(Math.max(Math.round(seats), 1), 12);
}

function statusChipColor(
  status: TableStatus,
): "success" | "error" | "warning" | "default" {
  if (status === "available") return "success";
  if (status === "occupied") return "error";
  if (status === "reserved") return "warning";
  return "default";
}

function seatFill(status: TableStatus) {
  if (status === "occupied") return "#ef4444"; // red-ish
  if (status === "reserved") return "#f59e0b"; // amber-ish
  return "#22c55e"; // green-ish
}

function tableFill(status: TableStatus) {
  if (status === "occupied") return "#fee2e2";
  if (status === "reserved") return "#ffedd5";
  return "#dcfce7";
}

function strokeColor(status: TableStatus) {
  if (status === "occupied") return "#ef4444";
  if (status === "reserved") return "#f59e0b";
  return "#22c55e";
}

function getSeatAngles(seats: number) {
  // Special-case nice spacing for common sizes
  switch (seats) {
    case 1:
      return [270];
    case 2:
      return [90, 270]; // left/right
    case 3:
      return [90, 210, 330];
    case 4:
      return [0, 90, 180, 270]; // top/right/bottom/left
    case 5:
      return [270, 342, 54, 126, 198];
    case 6:
      return [0, 60, 120, 180, 240, 300];
    case 8:
      return [0, 45, 90, 135, 180, 225, 270, 315];
    default: {
      // evenly distribute
      const step = 360 / seats;
      return Array.from({ length: seats }, (_, i) => i * step);
    }
  }
}

export const TableLayoutCard: React.FC<TableLayoutCardProps> = ({
  number,
  seats,
  status,
  shape = "round",
}) => {
  const s = clampSeats(seats);
  const cx = 80;
  const cy = 80;

  // central table size
  const tableR = shape === "round" ? 28 : 26;
  const chairW = 14;
  const chairH = 10;

  // radius where chairs are placed
  const chairRingR = 52;

  const angles = getSeatAngles(s);

  return (
    <Paper
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          T-{number}
        </Typography>
        <Chip
          size="small"
          label={status}
          color={statusChipColor(status)}
          variant={status === "available" ? "filled" : "outlined"}
        />
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          aria-label={`Table ${number}`}
        >
          {/* Chairs */}
          {angles.map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const x = cx + chairRingR * Math.cos(rad);
            const y = cy + chairRingR * Math.sin(rad);

            // rotate chair to face center
            const rotate = deg + 90;

            return (
              <g
                key={idx}
                transform={`translate(${x}, ${y}) rotate(${rotate})`}
              >
                {/* chair seat */}
                <rect
                  x={-chairW / 2}
                  y={-chairH / 2}
                  width={chairW}
                  height={chairH}
                  rx={3}
                  fill={seatFill(status)}
                  opacity={status === "available" ? 0.55 : 0.85}
                  stroke={strokeColor(status)}
                  strokeWidth={1}
                />
                {/* chair back */}
                <rect
                  x={-chairW / 2}
                  y={-chairH / 2 - 6}
                  width={chairW}
                  height={4}
                  rx={2}
                  fill={seatFill(status)}
                  opacity={status === "available" ? 0.4 : 0.75}
                />
              </g>
            );
          })}

          {/* Table */}
          {shape === "round" ? (
            <circle
              cx={cx}
              cy={cy}
              r={tableR}
              fill={tableFill(status)}
              stroke={strokeColor(status)}
              strokeWidth={2}
            />
          ) : (
            <rect
              x={cx - tableR}
              y={cy - tableR}
              width={tableR * 2}
              height={tableR * 2}
              rx={10}
              fill={tableFill(status)}
              stroke={strokeColor(status)}
              strokeWidth={2}
            />
          )}

          {/* Center label */}
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
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
          >
            seats
          </text>
        </svg>
      </Box>

      <Box mt={1} display="flex" justifyContent="space-between">
        <Typography variant="caption" color="text.secondary">
          {s} seats
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Layout view
        </Typography>
      </Box>
    </Paper>
  );
};
