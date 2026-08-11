import { Router } from "express";
import { db } from "@workspace/db";
import { novelsTable, chaptersTable, usersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router = Router();

async function generateSitemapXml(hostUrl: string): Promise<string> {
  const baseUrl = hostUrl.replace(/\/$/, "");

  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/?view=explore", priority: "0.9", changefreq: "hourly" },
    { path: "/?view=most-read", priority: "0.9", changefreq: "daily" },
    { path: "/?view=library", priority: "0.8", changefreq: "daily" },
    { path: "/?view=dashboard", priority: "0.7", changefreq: "weekly" },
    { path: "/?view=ai-writer", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=ai-books", priority: "0.8", changefreq: "weekly" },
    { path: "/?view=sitemap", priority: "0.8", changefreq: "daily" },
    { path: "/#about", priority: "0.5", changefreq: "monthly" },
    { path: "/#privacy", priority: "0.4", changefreq: "monthly" },
    { path: "/#terms", priority: "0.4", changefreq: "monthly" },
    { path: "/#contact", priority: "0.5", changefreq: "monthly" },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const today = new Date().toISOString().split("T")[0];

  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Novels
  const publishedNovelIds = new Set<string>();
  try {
    const novels = await db.select().from(novelsTable).where(eq(novelsTable.status, "published")).orderBy(desc(novelsTable.updatedAt));
    for (const novel of novels) {
      publishedNovelIds.add(novel.id);
      const lastmod = novel.updatedAt
        ? new Date(novel.updatedAt).toISOString().split("T")[0]
        : today;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${novel.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching novels for sitemap:", err);
  }

  // Chapters
  try {
    const chapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    const filteredChapters = chapters.filter(ch => publishedNovelIds.has(ch.novelId));
    for (const ch of filteredChapters) {
      const lastmod = ch.updatedAt
        ? new Date(ch.updatedAt).toISOString().split("T")[0]
        : today;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${ch.novelId}&amp;chapterId=${ch.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.7</priority>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching chapters for sitemap:", err);
  }

  // Users / Authors
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));
    for (const user of users) {
      const lastmod = user.updatedAt
        ? new Date(user.updatedAt).toISOString().split("T")[0]
        : today;
      const userParam = user.username ? `username=${encodeURIComponent(user.username)}` : `profileUid=${user.uid}`;
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?${userParam}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.6</priority>\n`;
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
    const host = req.protocol + "://" + req.get("host");
    const xml = await generateSitemapXml(host);
    res.header("Content-Type", "application/xml; charset=utf-8");
    res.status(200).send(xml);
  } catch (e: any) {
    res.status(500).send("Error generating sitemap");
  }
});

router.get("/sitemap-data", async (req, res) => {
  try {
    const host = req.protocol + "://" + req.get("host");
    const novels = await db.select().from(novelsTable).where(eq(novelsTable.status, "published")).orderBy(desc(novelsTable.updatedAt));
    const publishedNovelIds = new Set(novels.map(n => n.id));
    const allChapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    const chapters = allChapters.filter(ch => publishedNovelIds.has(ch.novelId));
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));

    res.json({
      host,
      totalNovels: novels.length,
      totalChapters: chapters.length,
      totalAuthors: users.length,
      novels,
      chapters,
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
    res.status(500).json({ error: e.message });
  }
});

export default router;
