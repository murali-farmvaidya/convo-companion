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
    ]
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
