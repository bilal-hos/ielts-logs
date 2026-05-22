import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5177,
    proxy: {
      "/api": {
        target: "http://api.foodlens.cloud:4000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
