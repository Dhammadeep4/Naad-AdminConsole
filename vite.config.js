import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // Required for Netlify
  server: { port: 5174 },
  assetsInclude: ["**/*.JPG"],
});
