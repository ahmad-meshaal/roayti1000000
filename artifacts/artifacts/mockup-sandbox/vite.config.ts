import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { mockupPreviewPlugin } from "./mockupPreviewPlugin";

const rawPort = process.env.PORT;
const port = rawPort ? (Number(rawPort) > 0 ? Number(rawPort) : 8081) : 8081;
const basePath = process.env.BASE_PATH || "/__mockup";

export default defineConfig(async () => {
  const isReplit = process.env.REPL_ID !== undefined;
  const replitPlugins = [];

  if (isReplit && process.env.NODE_ENV !== "production") {
    try {
      const errorOverlay = await import("@replit/vite-plugin-runtime-error-modal").then(m => m.default || m);
      const cartographer = await import("@replit/vite-plugin-cartographer").then(m => m.cartographer);
      if (errorOverlay) replitPlugins.push(errorOverlay());
      if (cartographer) replitPlugins.push(cartographer({ root: path.resolve(import.meta.dirname, "..") }));
    } catch {
      // Ignore if Replit plugins are not installed outside Replit environment
    }
  }

  return {
    base: basePath,
    plugins: [
      mockupPreviewPlugin(),
      react(),
      tailwindcss(),
      ...replitPlugins,
    ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
 };
});
