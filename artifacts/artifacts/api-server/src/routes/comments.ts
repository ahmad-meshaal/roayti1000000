import { Router } from 'express';
import { db } from '@workspace/db';
import { commentsTable } from '@workspace/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

router.get('/novels/:novelId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const rows = await db.select().from(commentsTable)
      .where(and(eq(commentsTable.novelId, novelId), eq(commentsTable.chapterId, chapterId)))
      .orderBy(asc(commentsTable.createdAt));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:novelId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const data = { ...req.body, novelId, chapterId };
    const inserted = await db.insert(commentsTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/novels/:novelId/chapters/:chapterId/comments/:id', async (req, res) => {
  try {
    const { novelId, chapterId, id } = req.params;
    await db.delete(commentsTable).where(and(eq(commentsTable.id, id), eq(commentsTable.novelId, novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
