import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiApp from "./api-server/src/app";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Express API routes FIRST
  app.get("/dist_complete.zip", (req, res) => {
    const filePath = path.join(process.cwd(), "dist_complete.zip");
    res.download(filePath, "dist_complete.zip");
  });
  app.get("/download-dist-zip", (req, res) => {
    const filePath = path.join(process.cwd(), "dist_complete.zip");
    res.download(filePath, "dist_complete.zip");
  });
  app.get("/roayti-full-project.zip", (req, res) => {
    const filePath = path.join(process.cwd(), "roayti-full-project.zip");
    res.download(filePath, "roayti-full-project.zip");
  });
  app.get("/download-project-zip", (req, res) => {
    const filePath = path.join(process.cwd(), "roayti-full-project.zip");
    res.download(filePath, "roayti-full-project.zip");
  });
  app.get("/sitemap.xml", (req, res) => {
    res.redirect("/api/sitemap.xml");
  });
  app.use(apiApp);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
