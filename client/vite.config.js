import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "https://barber-x.onrender.com", // Your backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
