import { Router } from "express";
import { db } from "@workspace/db";
import { novelsTable, chaptersTable, usersTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

const router = Router();

const SITE_NAME_AR = "روايتي - منصة كتابة وقراءة الروايات والقصص بالذكاء الاصطناعي";
const SITE_NAME_EN = "Roayti - AI-Powered Novel & Story Writing and Reading Platform";
const SITE_NAME = `${SITE_NAME_AR} | ${SITE_NAME_EN}`;

const SITE_DESCRIPTION_AR = "منصة روايتي Roayti هي المنصة الرائدة المتخصصة في قراءة وكتابة وتأليف الروايات والقصص التفاعلية ونشرها باستخدام أحدث تقنيات الذكاء الاصطناعي AI.";
const SITE_DESCRIPTION_EN = "Roayti is the leading Arabic and international platform for reading, writing, authoring, and publishing interactive novels and stories using cutting-edge Artificial Intelligence (AI).";
const SITE_DESCRIPTION = `${SITE_DESCRIPTION_AR} | ${SITE_DESCRIPTION_EN}`;

const SITE_LOGO = "https://roayti.com/pwa-512x512.png";

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return unsafe
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // remove XML control chars
    .replace(/\r?\n|\r/g, " ") // replace newlines with space
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
    .trim();
}

const STATIC_SECTIONS = [
  { path: "/", title: "الرئيسية - Home", description: "الصفحة الرئيسية لمنصة روايتي لكتابة وقراءة الروايات والقصص بالذكاء الاصطناعي | Home page of Roayti AI Novel Platform", priority: "1.0", changefreq: "daily" },
  { path: "/?view=explore", title: "استكشاف الروايات - Explore Novels", description: "تصفح واستكشف أحدث الروايات والقصص المنشورة بمختلف التصنيفات | Explore latest published novels and stories", priority: "0.95", changefreq: "hourly" },
  { path: "/?view=most-read", title: "الأكثر قراءة - Most Read", description: "قائمة الروايات والقصص الأكثر شعبية وتفاعلاً وقراءة | Most popular and trending novels", priority: "0.9", changefreq: "daily" },
  { path: "/?view=library", title: "المكتبة - Library", description: "مكتبة القارئ لحفظ الروايات المفضلة ومتابعة القراءة | Personal reading library and bookmarks", priority: "0.85", changefreq: "daily" },
  { path: "/?view=ai-writer", title: "الكاتب الذكي - AI Writer", description: "أداة كتابة وتوليد فصول الروايات والقصص والشخصيات بالذكاء الاصطناعي | AI-powered creative novel writing tool", priority: "0.9", changefreq: "weekly" },
  { path: "/?view=ai-books", title: "كتب الذكاء الاصطناعي - AI Books", description: "مجموعة الكتب والقصص المولدة بالذكاء الاصطناعي مع تحليلات ذكية | Curated AI books and story collections", priority: "0.85", changefreq: "weekly" },
  { path: "/?view=dashboard", title: "لوحة التحكم - Dashboard", description: "إدارة الروايات والفصول والإحصائيات ومتابعة القراء | Author management dashboard", priority: "0.8", changefreq: "weekly" },
  { path: "/?view=sitemap", title: "خريطة الموقع - Sitemap", description: "فهرس شامل لكافة صفحات وروايات وفصول منصة روايتي | Complete directory and sitemap index", priority: "0.8", changefreq: "daily" },
  { path: "/#about", title: "عن المنصة - About Us", description: "تعرف على رؤية ورسالة منصة روايتي لتطوير الأدب بالذكاء الاصطناعي | About Roayti platform and vision", priority: "0.6", changefreq: "monthly" },
  { path: "/#privacy", title: "سياسة الخصوصية - Privacy Policy", description: "سياسة حماية بيانات وخصوصية المستخدمين | User privacy policy and data protection", priority: "0.5", changefreq: "monthly" },
  { path: "/#terms", title: "شروط الاستخدام - Terms of Service", description: "الشروط والأحكام الخاصة باستخدام ونشر المحتوى | Terms and conditions of service", priority: "0.5", changefreq: "monthly" },
  { path: "/#contact", title: "اتصل بنا - Contact Us", description: "تواصل مع فريق منصة روايتي للاستفسارات والدعم | Contact Roayti support and team", priority: "0.6", changefreq: "monthly" },
];

async function generateSitemapXml(hostUrl: string): Promise<string> {
  let baseUrl = "https://roayti.com";
  if (hostUrl && !hostUrl.includes("localhost") && !hostUrl.includes("127.0.0.1")) {
    baseUrl = hostUrl.replace(/\/$/, "");
    if (!baseUrl.startsWith("http")) {
      baseUrl = `https://${baseUrl}`;
    }
  }

  const today = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<!-- ================================================================== -->\n`;
  xml += `<!-- Site Name: ${escapeXml(SITE_NAME_AR)} | ${escapeXml(SITE_NAME_EN)} -->\n`;
  xml += `<!-- Description (AR): ${escapeXml(SITE_DESCRIPTION_AR)} -->\n`;
  xml += `<!-- Description (EN): ${escapeXml(SITE_DESCRIPTION_EN)} -->\n`;
  xml += `<!-- Generated At: ${today} -->\n`;
  xml += `<!-- ================================================================== -->\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n`;

  // 1. Static Core Pages with Descriptions & Images
  xml += `  <!-- ── 1. الصفحات والأقسام الرئيسية (Core Pages) ── -->\n`;
  for (const page of STATIC_SECTIONS) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += `    <image:image>\n`;
    xml += `      <image:loc>${SITE_LOGO}</image:loc>\n`;
    xml += `      <image:title>${escapeXml(page.title)}</image:title>\n`;
    xml += `      <image:caption>${escapeXml(page.description)}</image:caption>\n`;
    xml += `    </image:image>\n`;
    xml += `  </url>\n`;
  }

  // 2. Published Novels ONLY (الروايات المنشورة فقط)
  xml += `\n  <!-- ── 2. الروايات والقصص المنشورة فقط (Published Novels Only) ── -->\n`;
  const publishedNovelIds = new Set<string>();
  try {
    const novels = await db.select().from(novelsTable).where(eq(novelsTable.status, "published")).orderBy(desc(novelsTable.updatedAt));
    for (const novel of novels) {
      if (!novel.id) continue;
      publishedNovelIds.add(novel.id);

      const lastmod = novel.updatedAt
        ? new Date(novel.updatedAt).toISOString().split("T")[0]
        : today;

      const titleEsc = escapeXml(novel.title || "رواية");
      const rawSummary = novel.summary ? novel.summary.slice(0, 250) : `رواية ${novel.title} على منصة روايتي بالذكاء الاصطناعي`;
      const summaryEsc = escapeXml(rawSummary);
      const coverImg = (novel.coverImage && novel.coverImage.startsWith("http")) 
        ? escapeXml(novel.coverImage) 
        : SITE_LOGO;

      // Query param link
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${novel.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.95</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${coverImg}</image:loc>\n`;
      xml += `      <image:title>${titleEsc}</image:title>\n`;
      xml += `      <image:caption>${summaryEsc}</image:caption>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;

      // Direct /novel/ path
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/novel/${novel.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.90</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${coverImg}</image:loc>\n`;
      xml += `      <image:title>${titleEsc}</image:title>\n`;
      xml += `      <image:caption>${summaryEsc}</image:caption>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching novels for sitemap:", err);
  }

  // 3. Chapters of Published Novels ONLY
  xml += `\n  <!-- ── 3. فصول الروايات المنشورة (Chapters of Published Novels) ── -->\n`;
  try {
    const chapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    const filteredChapters = chapters.filter(ch => publishedNovelIds.has(ch.novelId));
    for (const ch of filteredChapters) {
      if (!ch.id || !ch.novelId) continue;
      const lastmod = ch.updatedAt
        ? new Date(ch.updatedAt).toISOString().split("T")[0]
        : today;

      const chapTitle = escapeXml(ch.title || "فصل");

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?novelId=${ch.novelId}&amp;chapterId=${ch.id}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.80</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${SITE_LOGO}</image:loc>\n`;
      xml += `      <image:title>${chapTitle}</image:title>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching chapters for sitemap:", err);
  }

  // 4. Authors Profiles
  xml += `\n  <!-- ── 4. الكتاب والمؤلفون (Authors) ── -->\n`;
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
      const authorName = escapeXml(user.displayName || user.username || "كاتب");
      const userPhoto = (user.photoURL && user.photoURL.startsWith("http")) ? escapeXml(user.photoURL) : SITE_LOGO;

      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}/?${userParam}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.70</priority>\n`;
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${userPhoto}</image:loc>\n`;
      xml += `      <image:title>ملف الكاتب ${authorName}</image:title>\n`;
      xml += `    </image:image>\n`;
      xml += `  </url>\n`;
    }
  } catch (err) {
    console.error("Error fetching users for sitemap:", err);
  }

  xml += `</urlset>`;
  return xml;
}

// Generates a rich, search-engine friendly HTML Sitemap page
async function generateSitemapHtml(hostUrl: string): Promise<string> {
  let baseUrl = "https://roayti.com";
  if (hostUrl && !hostUrl.includes("localhost") && !hostUrl.includes("127.0.0.1")) {
    baseUrl = hostUrl.replace(/\/$/, "");
    if (!baseUrl.startsWith("http")) baseUrl = `https://${baseUrl}`;
  }

  const novels = await db.select().from(novelsTable).where(eq(novelsTable.status, "published")).orderBy(desc(novelsTable.updatedAt));
  const publishedNovelIds = new Set(novels.map(n => n.id));
  const allChapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
  const chapters = allChapters.filter(ch => publishedNovelIds.has(ch.novelId));
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>خريطة الموقع والفهرس الشامل | ${SITE_NAME}</title>
  <meta name="description" content="${SITE_DESCRIPTION}">
  <link rel="canonical" href="${baseUrl}/sitemap.html">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem 1rem; line-height: 1.8; }
    .container { max-width: 1100px; margin: 0 auto; }
    header { border-bottom: 1px solid #334155; padding-bottom: 1.5rem; margin-bottom: 2rem; }
    h1 { font-size: 1.8rem; color: #38bdf8; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; color: #f59e0b; margin-top: 2rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem; }
    p.lead { color: #94a3b8; font-size: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .card { background: #1e293b; padding: 1.2rem; border-radius: 12px; border: 1px solid #334155; transition: transform 0.2s; }
    .card:hover { transform: translateY(-3px); border-color: #38bdf8; }
    .card a { color: #38bdf8; text-decoration: none; font-weight: bold; font-size: 1.05rem; display: block; margin-bottom: 0.4rem; }
    .card a:hover { text-decoration: underline; }
    .card p { color: #cbd5e1; font-size: 0.85rem; margin: 0; }
    .list { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .list li a { display: inline-block; background: #1e293b; color: #cbd5e1; padding: 0.4rem 0.8rem; border-radius: 6px; text-decoration: none; font-size: 0.85rem; border: 1px solid #334155; }
    .list li a:hover { background: #38bdf8; color: #0f172a; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🗺️ خريطة الموقع والفهرس الكامل - منصة روايتي</h1>
      <p class="lead">${SITE_DESCRIPTION}</p>
      <p style="color: #64748b; font-size: 0.85rem;">رابط خريطة XML لمحركات البحث: <a href="${baseUrl}/sitemap.xml" style="color: #38bdf8;">sitemap.xml</a></p>
    </header>

    <h2>📌 الصفحات والأقسام الرئيسية</h2>
    <div class="grid">
      ${STATIC_SECTIONS.map(s => `
        <div class="card">
          <a href="${baseUrl}${s.path}">${s.title}</a>
          <p>${s.description}</p>
        </div>
      `).join("")}
    </div>

    <h2>📚 فهرس الروايات والقصص المنشورة (${novels.length} رواية)</h2>
    <div class="grid">
      ${novels.map(n => `
        <div class="card">
          <a href="${baseUrl}/?novelId=${n.id}">📖 ${n.title}</a>
          <p>${n.summary ? n.summary.slice(0, 140) + '...' : 'اقرأ هذه الرواية كاملة على منصة روايتي'}</p>
        </div>
      `).join("")}
    </div>

    <h2>✍️ الكتاب والمؤلفون (${users.length} مؤلف)</h2>
    <ul class="list">
      ${users.map(u => `
        <li>
          <a href="${baseUrl}/?${u.username ? `username=${encodeURIComponent(u.username)}` : `profileUid=${u.uid}`}">
            👤 ${u.displayName || u.username || 'كاتب'}
          </a>
        </li>
      `).join("")}
    </ul>

    <h2>📑 فصول الروايات المنشورة (${chapters.length} فصل)</h2>
    <ul class="list">
      ${chapters.slice(0, 100).map(c => `
        <li>
          <a href="${baseUrl}/?novelId=${c.novelId}&amp;chapterId=${c.id}">
            📄 ${c.title}
          </a>
        </li>
      `).join("")}
    </ul>
  </div>
</body>
</html>`;
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

router.get(["/sitemap.html", "/sitemap-view"], async (req, res) => {
  try {
    const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
    const proto = (req.headers["x-forwarded-proto"] as string) || req.protocol || "https";
    const html = await generateSitemapHtml(`${proto}://${host}`);
    res.header("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).send("Error generating HTML sitemap");
  }
});

router.get("/sitemap-data", async (req, res) => {
  try {
    const host = req.headers["x-forwarded-host"] || req.get("host") || "roayti.com";
    const novels = await db.select().from(novelsTable).where(eq(novelsTable.status, "published")).orderBy(desc(novelsTable.updatedAt));
    const publishedNovelIds = new Set(novels.map(n => n.id));
    const allChapters = await db.select().from(chaptersTable).orderBy(desc(chaptersTable.updatedAt));
    const chapters = allChapters.filter(ch => publishedNovelIds.has(ch.novelId));
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.updatedAt));

    res.json({
      siteName: SITE_NAME,
      siteDescription: SITE_DESCRIPTION,
      host: `https://${host}`,
      totalNovels: novels.length,
      totalChapters: chapters.length,
      totalAuthors: users.length,
      staticPages: STATIC_SECTIONS,
      novels,
      chapters,
      users,
    });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
export { generateSitemapXml, generateSitemapHtml };


