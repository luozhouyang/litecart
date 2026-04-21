import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [
    react(),
    TanStackRouterVite({
      routesDirectory: path.join(__dirname, "./src/routes"),
      generatedRouteTree: path.join(__dirname, "./src/routeTree.gen.ts"),
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.join(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
