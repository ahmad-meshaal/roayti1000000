import { Router } from 'express';
import { db } from '@workspace/db';
import { readingProgressTable } from '@workspace/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/progress', async (req, res) => {
  try {
    const { uid, novelId } = req.query as Record<string, string>;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    if (novelId) {
      const rows = await db.select().from(readingProgressTable).where(and(eq(readingProgressTable.uid, uid), eq(readingProgressTable.novelId, novelId))).limit(1);
      return res.json(rows[0] || null);
    }
    const rows = await db.select().from(readingProgressTable).where(eq(readingProgressTable.uid, uid));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/progress', async (req, res) => {
  try {
    const { uid, novelId, lastChapterId, lastChapterOrder } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: 'uid and novelId required' });
    const existing = await db.select().from(readingProgressTable).where(and(eq(readingProgressTable.uid, uid), eq(readingProgressTable.novelId, novelId))).limit(1);
    if (existing.length) {
      if (existing[0].lastChapterOrder! >= lastChapterOrder) return res.json(existing[0]);
      const updated = await db.update(readingProgressTable)
        .set({ lastChapterId, lastChapterOrder, updatedAt: new Date() })
        .where(and(eq(readingProgressTable.uid, uid), eq(readingProgressTable.novelId, novelId)))
        .returning();
      return res.json(updated[0]);
    }
    const inserted = await db.insert(readingProgressTable).values({ uid, novelId, lastChapterId, lastChapterOrder, id: req.body.id || crypto.randomUUID() }).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
