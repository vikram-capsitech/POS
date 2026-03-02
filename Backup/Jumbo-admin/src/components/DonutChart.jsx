// // import React from "react";
// import { PieChart } from "@mui/x-charts/PieChart";

// const DonutChart = ({
//   title = "Chart",
//   data = [],
//   width = 250,
//   height = 250,
//   innerRadius = 60,
//   outerRadius = 100,
// }) => {
//   const total = data.reduce((acc, item) => acc + item.value, 0);

//   const formattedData = data.map((item) => ({
//     ...item,
//     percentage: Math.round((item.value / total) * 100),
//   }));

//   return (
//     <div style={{ textAlign: "center" }}>
//       <h3 style={{ marginBottom: "16px", fontWeight: "600" }}>{title}</h3>

//       <PieChart
//         series={[
//           {
//             innerRadius,
//             outerRadius,
//             data: formattedData,
//             arcLabel: null, // ⛔ No text inside
//             arcLabelMinAngle: 0,
//             paddingAngle: 2,
//             highlightScope: { faded: "global", highlighted: "item" },
//             label: ({ percentage }) => `${percentage}%`,
//             labelPlacement: "outside",
//             labelPosition: "outside",
//             labelLine: true,
//           },
//         ]}
//         width={width}
//         height={height}
//         sx={{
//           "& .MuiChartsPieLabel-root": {
//             fontSize: 14,
//             fontWeight: 600,
//             fill: "#000",
//           },
//         }}
//       />
//     </div>
//   );
// };

// export default DonutChart;


import { PieChart } from "@mui/x-charts/PieChart";

const DonutChart = ({
  data = [],
  width = 250,
  height = 250,
  innerRadius = 60,
  outerRadius = 100,
}) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const formattedData = data.map((item) => ({
    ...item,
    percentage: Math.round((item.value / total) * 100),
    label: `${Math.round((item.value / total) * 100)}%`,
  }));

  return (
    <PieChart
      series={[
        {
          innerRadius,
          outerRadius,
          data: formattedData,
          arcLabel: null, // No inside label
          paddingAngle: 2,
          highlightScope: { faded: "global", highlighted: "item" },

          // 🔥 THIS SHOWS LABELS OUTSIDE WITH LINES
          label: (item) => item.label,
          labelPosition: "outside",
          labelLine: true, // Leader style line
        },
      ]}
      width={width}
      height={height}
      slotProps={{
        legend: { hidden: true },
      }}
      sx={{
        "& .MuiChartsPieLabel-root": {
          fontSize: 14,
          fontWeight: 600,
        },
      }}
    />
  );
};

export default DonutChart;
