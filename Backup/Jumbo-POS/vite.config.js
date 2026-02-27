import { defineConfig } from "vite";
import path from 'path'
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "pos_app",
      filename: "remoteEntry.js",
      // Modules to expose
      exposes: {
        "./App": "./src/main.tsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3001,
    strictPort: true,
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
});
