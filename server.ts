import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import apiApp from "./api-server/src/app";
import { generateSitemapXml } from "./api-server/src/routes/sitemap";
import { db } from "@workspace/db";
import { novelsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Downloads
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

  // Direct Sitemap at Root /sitemap.xml with 200 OK
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
      const fullHost = `${proto}://${host}`;
      const xml = await generateSitemapXml(fullHost);
      res.header("Content-Type", "application/xml; charset=utf-8");
      res.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
      res.status(200).send(xml);
    } catch (err) {
      res.status(500).send("Error generating sitemap");
    }
  });

  // Direct HTML Sitemap at /sitemap.html with 200 OK
  app.get(["/sitemap.html", "/sitemap-view"], async (req, res) => {
    try {
      const { generateSitemapHtml } = await import("./api-server/src/routes/sitemap");
      const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
      const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
      const fullHost = `${proto}://${host}`;
      const html = await generateSitemapHtml(fullHost);
      res.header("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
    } catch (err) {
      res.status(500).send("Error generating HTML sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const robotsTxt = `User-agent: *\nAllow: /\n\nSitemap: ${proto}://${host}/sitemap.xml\n`;
    res.header("Content-Type", "text/plain; charset=utf-8");
    res.send(robotsTxt);
  });

  // API Router
  app.use(apiApp);

  // Vite middleware for development vs Production Static & Dynamic Meta Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));

    app.get("*", async (req, res) => {
      try {
        const indexPath = path.join(distPath, "index.html");
        let html = fs.readFileSync(indexPath, "utf8");

        // Check if specific novel is requested (either via /novel/:id or ?novelId=:id)
        let novelId = (req.query.novelId as string) || (req.query.id as string);
        if (!novelId && req.path.startsWith("/novel/")) {
          novelId = req.path.split("/")[2];
        }

        if (novelId) {
          try {
            const rows = await db.select().from(novelsTable).where(eq(novelsTable.id, novelId)).limit(1);
            if (rows.length > 0) {
              const novel = rows[0];

              if (novel.status !== 'published') {
                // If not published, strictly prevent search engines from indexing it
                html = html.replace(/<meta name="robots" content=".*?"\s*\/?>/gi, `<meta name="robots" content="noindex, nofollow" />`);
              } else {
                const pageTitle = `${novel.title} | رواية على منصة روايتي Roayti`;
                const pageDesc = novel.summary ? novel.summary.slice(0, 200) : `اقرأ رواية ${novel.title} على منصة روايتي للروايات والقصص العربية بالذكاء الاصطناعي.`;
                const coverImg = novel.coverImage || "https://roayti.com/pwa-512x512.png";

                // Ensure robots meta is index, follow for published
                html = html.replace(/<meta name="robots" content=".*?"\s*\/?>/gi, `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`);
                // Replace Title
                html = html.replace(/<title>.*?<\/title>/gi, `<title>${pageTitle}</title>`);
                // Replace Meta Description
                html = html.replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${pageDesc}" />`);
                // Replace OpenGraph
                html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${pageTitle}" />`);
                html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${pageDesc}" />`);
                html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/gi, `<meta property="og:image" content="${coverImg}" />`);
                // Replace Twitter
                html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${pageTitle}" />`);
                html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${pageDesc}" />`);
                html = html.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${coverImg}" />`);
              }
            }
          } catch (_) {}
        }

        res.send(html);
      } catch (err) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

