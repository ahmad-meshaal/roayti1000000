import { Router } from "express";
import { db } from "@workspace/db";
import { novelsTable, chaptersTable, usersTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router = Router();

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateSitemapXml(hostUrl: string): Promise<string> {
  // Normalize base URL to production domain or current host
  let baseUrl = "https://roayti.com";
  if (hostUrl && !hostUrl.includes("localhost") && !hostUrl.includes("127.0.0.1")) {
    baseUrl = hostUrl.replace(/\/$/, "");
    if (!baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/?view=explore", priority: "0.9", changefreq: "hourly" },
    { path: "/?view=most-read", priority: "0.9", changefreq: "daily" },
    { path: "/?view=library", priority: "0.8", changefreq: "daily" },
    { path: "/?view=dashboard", priority: "0.7", changefreq: "weekly" },
    { path: "/?view=ai-writer", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=ai-books", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=sitemap", priority: "0.8", changefreq: "daily" },
    { path: "/#about", priority: "0.6", changefreq: "monthly" },
    { path: "/#privacy", priority: "0.5", changefreq: "monthly" },
    { path: "/#terms", priority: "0.5", changefreq: "monthly" },
    { path: "/#contact", priority: "0.6", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // 1. Static Pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // 2. All Novels with Title, Image, Description, and Author
  const novelIds = new Set<string>();
  try {
    const novels = await db.select().from(novelsTable).orderBy(desc(novelsTable.updatedAt));
    for (const novel of novels) {
      if (!novel.id) continue;
      novelIds.add(novel.id);

      const lastmod = novel.updatedAt
        ? new Date(novel.updatedAt).toISOString().split("T")[0]
        : today;

      const titleEsc = escapeXml(novel.title || "رواية");
      const summaryEsc = escapeXml(novel.summary || novel.title || "");
      const coverImg = novel.coverImage && novel.coverImage.startsWith("http") 
        ? escapeXml(novel.coverImage) 
        : "";

      // Query param link
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${novel.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      if (coverImg) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${coverImg}</image:loc>\n`;
        xml += `      <image:title>${titleEsc}</image:title>\n`;
        if (summaryEsc) {
          xml += `      <image:caption>${summaryEsc}</image:caption>\n`;
        }
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;

      // Direct /novel/ path for clean indexing
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/novel/${novel.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching novels for sitemap:", err);
  }

  // 3. Chapters
  try {
    const chapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    for (const ch of chapters) {
      if (!ch.id || !ch.novelId) continue;
      const lastmod = ch.updatedAt
        ? new Date(ch.updatedAt).toISOString().split("T")[0]
        : today;

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${ch.novelId}&amp;chapterId=${ch.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.75</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching chapters for sitemap:", err);
  }

  // 4. Users / Authors Profiles
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));
    for (const user of users) {
      if (!user.uid) continue;
      const lastmod = user.updatedAt
        ? new Date(user.updatedAt).toISOString().split("T")[0]
        : today;
      const userParam = user.username 
        ? `username=${encodeURIComponent(user.username)}` 
        : `profileUid=${user.uid}`;

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?${userParam}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.65</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching users for sitemap:", err);
  }

  xml += `</urlset>`;
  return xml;
}

router.get("/sitemap.xml", async (req, res) => {
  try {
    const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const fullHost = `${proto}://${host}`;
    const xml = await generateSitemapXml(fullHost);

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.status(200).send(xml);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).send("Error generating sitemap");
  }
});

router.get("/sitemap-data", async (req, res) => {
  try {
    const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
    const novels = await db.select().from(novelsTable).orderBy(desc(novelsTable.updatedAt));
    const allChapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));

    res.json({
      host: `https://${host}`,
      totalNovels: novels.length,
      totalChapters: allChapters.length,
      totalAuthors: users.length,
      novels,
      chapters: allChapters,
      users,
      staticPages: [
        { title: "الرئيسية", path: "/" },
        { title: "اكتشف الروايات", path: "/?view=explore" },
        { title: "الأكثر قراءة", path: "/?view=most-read" },
        { title: "المكتبة", path: "/?view=library" },
        { title: "لوحة التحكم", path: "/?view=dashboard" },
        { title: "الكاتب الذكي AI", path: "/?view=ai-writer" },
        { title: "كتب الذكاء الاصطناعي", path: "/?view=ai-books" },
        { title: "خريطة الموقع", path: "/?view=sitemap" },
        { title: "من نحن", path: "/#about" },
        { title: "سياسة الخصوصية", path: "/#privacy" },
        { title: "شروط الاستخدام", path: "/#terms" },
        { title: "اتصل بنا", path: "/#contact" }
      ]
    });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
export { generateSitemapXml };

