import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      'localhost',
      'convo-companion-ui.onrender.com',
      'convo-companion.onrender.com'
    ],
    hmr: process.env.VITE_HMR_PROTOCOL && process.env.VITE_HMR_HOST
      ? {
          protocol: process.env.VITE_HMR_PROTOCOL,
          host: process.env.VITE_HMR_HOST,
          port: parseInt(process.env.VITE_HMR_PORT || '443'),
        }
      : undefined,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
