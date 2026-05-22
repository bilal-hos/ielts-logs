import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "https://api.foodlens.cloud:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
