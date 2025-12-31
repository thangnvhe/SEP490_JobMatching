import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Cho phep truy cap tu ben ngoai
    port: 5173, // Port co dinh
    strictPort: true, // Neu port da duoc su dung thi se bao loi thay vi tu dong chuyen sang port khac
  },
})
