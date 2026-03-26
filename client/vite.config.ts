import { defineConfig } from "vite";
import dns from "dns";
import react from "@vitejs/plugin-react";

dns.setDefaultResultOrder("verbatim");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost",
    port: 3000,
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 8192, // inline assets < 8kb as base64
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-antd": ["antd", "@ant-design/icons"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-redux": ["react-redux", "@reduxjs/toolkit", "redux-persist"],
        },
      },
    },
  },
});
