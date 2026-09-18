import { Router, type Request, type Response } from 'express';
import { db } from '@workspace/db';
import { usersTable, novelsTable, chaptersTable } from '@workspace/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Helper to authenticate user via headers, query, or body
async function authenticateAuthor(req: Request) {
  let token = '';

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    token = (req.headers['x-api-key'] as string) || (req.headers['x-user-id'] as string) || '';
  }

  if (!token && req.body) {
    token = req.body.apiKey || req.body.userUid || req.body.authorUid || '';
  }

  if (!token && req.query) {
    token = (req.query.apiKey as string) || (req.query.userUid as string) || '';
  }

  if (!token) {
    return null;
  }

  // Check by exact UID in users table
  let user = await db.select().from(usersTable).where(eq(usersTable.uid, token)).limit(1);

  // If not found, check if token matches username or email
  if (!user.length) {
    user = await db.select().from(usersTable).where(eq(usersTable.email, token.toLowerCase())).limit(1);
  }
  if (!user.length) {
    user = await db.select().from(usersTable).where(eq(usersTable.username, token.toLowerCase())).limit(1);
  }

  return user.length ? user[0] : null;
}

/**
 * POST /api/external/auth/verify
 * Check authentication status and return author profile
 */
router.post('/external/auth/verify', async (req: Request, res: Response) => {
  try {
    const author = await authenticateAuthor(req);
    if (!author) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'مفتاح الـ API أو معرّف الكاتب غير صالح أو غير موجود. يرجى تزويد معرّف الكاتب الصحيح.',
      });
    }

    const novelsCount = await db
      .select()
      .from(novelsTable)
      .where(eq(novelsTable.authorUid, author.uid));

    res.json({
      success: true,
      message: `مرحباً بك، ${author.displayName}`,
      author: {
        uid: author.uid,
        displayName: author.displayName,
        username: author.username,
        email: author.email,
        photoURL: author.photoURL,
        role: author.role,
        novelsCount: novelsCount.length,
      },
    });
  } catch (e: any) {
    req.log?.error?.(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /api/external/my-novels
 * List all novels belonging to the authenticated author
 */
router.get('/external/my-novels', async (req: Request, res: Response) => {
  try {
    const author = await authenticateAuthor(req);
    if (!author) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'غير مصرح: يرجى تسجيل الدخول أو إرسال مفتاح الـ API',
      });
    }

    const novels = await db
      .select()
      .from(novelsTable)
      .where(eq(novelsTable.authorUid, author.uid))
      .orderBy(desc(novelsTable.updatedAt));

    res.json({
      success: true,
      novels,
    });
  } catch (e: any) {
    req.log?.error?.(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /api/external/import
 * Comprehensive endpoint: Import a complete novel with all its chapters at once!
 */
router.post('/external/import', async (req: Request, res: Response) => {
  try {
    const author = await authenticateAuthor(req);
    if (!author) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'مفتاح الـ API غير صالح أو لم يتم تسجيل الدخول. يمكنك الحصول على مفتاحك أو معرفك من حسابك على roayti.com',
      });
    }

    const novelData = req.body.novel || req.body;
    const chaptersData = req.body.chapters || (req.body.novel && req.body.novel.chapters) || [];

    if (!novelData || !novelData.title || typeof novelData.title !== 'string' || !novelData.title.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'حقل عنوان الرواية (title أو novel.title) مطلوب ولا يمكن تركه فارغاً.',
      });
    }

    const novelId = novelData.id || crypto.randomUUID();
    const novelTitle = novelData.title.trim();
    const novelGenre = novelData.genre || (Array.isArray(novelData.genres) && novelData.genres[0]) || 'drama';
    const novelSummary = novelData.summary || novelData.description || '';
    const novelCover = novelData.coverImage || novelData.cover || '';
    const novelStatus = (novelData.status === 'published' || novelData.isDraft === false) ? 'published' : 'draft';
    const language = novelData.language || 'ar';
    const violenceLevel = novelData.violenceLevel || 'none';
    const moralTone = novelData.moralTone || 'neutral';
    const teraboxLink = novelData.teraboxLink || '';

    // 1. Insert novel linked to author
    const insertedNovel = await db
      .insert(novelsTable)
      .values({
        id: novelId,
        authorUid: author.uid,
        authorName: author.displayName || 'كاتب',
        authorPhoto: author.photoURL || '',
        title: novelTitle,
        genre: novelGenre,
        summary: novelSummary,
        coverImage: novelCover,
        status: novelStatus,
        language,
        violenceLevel,
        moralTone,
        teraboxLink,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 2. Insert chapters if provided
    const insertedChapters = [];
    if (Array.isArray(chaptersData) && chaptersData.length > 0) {
      for (let i = 0; i < chaptersData.length; i++) {
        const ch = chaptersData[i];
        if (!ch || !ch.title) continue;

        const chapterId = ch.id || crypto.randomUUID();
        const chapterOrder = typeof ch.order === 'number' ? ch.order : (typeof ch.chapterNumber === 'number' ? ch.chapterNumber : i + 1);
        const chapterTitle = ch.title.trim();
        const chapterContent = ch.content || ch.text || ch.body || '';
        const chapterDesc = ch.description || ch.summary || '';

        const inserted = await db
          .insert(chaptersTable)
          .values({
            id: chapterId,
            novelId: novelId,
            title: chapterTitle,
            content: chapterContent,
            description: chapterDesc,
            order: chapterOrder,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        insertedChapters.push(inserted[0]);
      }
    }

    const baseUrl = req.protocol + '://' + (req.get('host') || 'www.roayti.com');

    res.status(201).json({
      success: true,
      message: `تم رفع واستيراد رواية "${novelTitle}" بنجاح مع ${insertedChapters.length} فصل! وستجدها في قائمة "اكتب" بحسابك.`,
      novel: {
        id: novelId,
        title: novelTitle,
        genre: novelGenre,
        status: novelStatus,
        chaptersCount: insertedChapters.length,
        authorUid: author.uid,
        authorName: author.displayName,
      },
      chapters: insertedChapters.map(c => ({
        id: c.id,
        title: c.title,
        order: c.order,
      })),
      urls: {
        studioUrl: `${baseUrl}/#editor?novelId=${novelId}`,
        novelUrl: `${baseUrl}/#novel?id=${novelId}`,
        dashboardUrl: `${baseUrl}/#dashboard`,
      },
    });
  } catch (e: any) {
    req.log?.error?.(e);
    res.status(500).json({
      success: false,
      error: e.message || 'Internal Server Error',
      message: 'حدث خطأ أثناء استيراد الرواية وفصولها، يرجى مراجعة البيانات المدخلة.',
    });
  }
});

/**
 * POST /api/external/novels/:novelId/chapters/batch
 * Add multiple chapters to an existing novel
 */
router.post('/external/novels/:novelId/chapters/batch', async (req: Request, res: Response) => {
  try {
    const author = await authenticateAuthor(req);
    if (!author) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'غير مصرح: يرجى تزويد مفتاح API صالح.',
      });
    }

    const { novelId } = req.params;
    const existingNovel = await db
      .select()
      .from(novelsTable)
      .where(and(eq(novelsTable.id, novelId), eq(novelsTable.authorUid, author.uid)))
      .limit(1);

    if (!existingNovel.length) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'الرواية غير موجودة أو أنك لا تملك صلاحية تعديلها.',
      });
    }

    const { chapters } = req.body;
    if (!Array.isArray(chapters) || !chapters.length) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'يجب إرسال مصفوفة فصول تحتوي على فصل واحد على الأقل.',
      });
    }

    // Get current max order
    const existingChapters = await db
      .select()
      .from(chaptersTable)
      .where(eq(chaptersTable.novelId, novelId))
      .orderBy(desc(chaptersTable.order))
      .limit(1);

    let startOrder = existingChapters.length && existingChapters[0].order ? existingChapters[0].order + 1 : 1;

    const insertedChapters = [];
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch || !ch.title) continue;

      const order = typeof ch.order === 'number' ? ch.order : startOrder + i;
      const row = await db
        .insert(chaptersTable)
        .values({
          id: ch.id || crypto.randomUUID(),
          novelId,
          title: ch.title.trim(),
          content: ch.content || '',
          description: ch.description || '',
          order,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      insertedChapters.push(row[0]);
    }

    // Update novel updatedAt
    await db
      .update(novelsTable)
      .set({ updatedAt: new Date() })
      .where(eq(novelsTable.id, novelId));

    res.status(201).json({
      success: true,
      message: `تم إضافة ${insertedChapters.length} فصل جديد لرواية "${existingNovel[0].title}" بنجاح!`,
      chaptersCount: insertedChapters.length,
      chapters: insertedChapters,
    });
  } catch (e: any) {
    req.log?.error?.(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
