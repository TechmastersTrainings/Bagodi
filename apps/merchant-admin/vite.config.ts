import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  cacheDir: "/tmp/vite_cache/merchant-admin",
  plugins: [react()],
  resolve: {
    alias: {
      "@bagodi/design-system/css": path.resolve(__dirname, "../../packages/design-system/src/index.css"),
      "@bagodi/design-system": path.resolve(__dirname, "../../packages/design-system/src"),
      "@bagodi/shared-types": path.resolve(__dirname, "../../packages/shared-types/src"),
      "@bagodi/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
      "@bagodi/validation": path.resolve(__dirname, "../../packages/validation/src"),
      "@bagodi/authentication": path.resolve(__dirname, "../../packages/authentication/src"),
      "@bagodi/utilities": path.resolve(__dirname, "../../packages/utilities/src"),
      "@bagodi/shared-components": path.resolve(__dirname, "../../packages/shared-components/src"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      "/api/v1": {
        target: process.env.VITE_API_BASE_URL || "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-icons": ["lucide-react"],
          "vendor-forms": ["react-hook-form", "@hookform/resolvers", "zod"],
        },
      },
    },
  },
});

