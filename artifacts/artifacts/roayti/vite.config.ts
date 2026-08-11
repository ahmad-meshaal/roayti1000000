import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;
const port = rawPort ? (Number(rawPort) > 0 ? Number(rawPort) : 19648) : 19648;
const basePath = process.env.BASE_PATH || "/";

export default defineConfig(async () => {
  const isReplit = process.env.REPL_ID !== undefined;
  const replitPlugins = [];

  if (isReplit && process.env.NODE_ENV !== "production") {
    try {
      const errorOverlay = await import("@replit/vite-plugin-runtime-error-modal").then(m => m.default || m);
      const cartographer = await import("@replit/vite-plugin-cartographer").then(m => m.cartographer);
      const devBanner = await import("@replit/vite-plugin-dev-banner").then(m => m.devBanner);
      if (errorOverlay) replitPlugins.push(errorOverlay());
      if (cartographer) replitPlugins.push(cartographer({ root: path.resolve(import.meta.dirname, "..") }));
      if (devBanner) replitPlugins.push(devBanner());
    } catch {
      // Ignore if Replit plugins are not installed outside Replit environment
    }
  }

  return {
    base: basePath,
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || ''),
      'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(process.env.VITE_CLERK_PUBLISHABLE_KEY || ''),
      'import.meta.env.VITE_ENCRYPTION_KEY': JSON.stringify(process.env.VITE_ENCRYPTION_KEY || ''),
    },
    plugins: [
      react(),
      tailwindcss(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "src"),
        "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      strictPort: true,
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
