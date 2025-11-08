import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",//ASP.NET backend
        changeOrigin: true,
      },
      "/openapi": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
