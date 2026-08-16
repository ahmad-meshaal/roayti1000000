import { Router } from 'express';
import { db } from '@workspace/db';
import { commentsTable } from '@workspace/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

// GET all comments for a chapter (Only real comments from database)
router.get('/novels/:novelId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const rows = await db.select().from(commentsTable)
      .where(and(eq(commentsTable.novelId, novelId), eq(commentsTable.chapterId, chapterId)))
      .orderBy(asc(commentsTable.createdAt));

    // Exclude any legacy dummy seeded comments if present in the database
    const realComments = rows.filter(r => 
      !r.authorUid?.startsWith('user_') || !r.authorUid?.endsWith('_reader')
    );

    res.json(realComments);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST a new comment
router.post('/novels/:novelId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    const authorName = req.body.authorName?.trim() || 'قارئ زائر';
    const authorUid = req.body.authorUid || `guest_${crypto.randomUUID().slice(0, 8)}`;
    const authorPhoto = req.body.authorPhoto || '';
    const text = req.body.text?.trim() || '';

    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const data = {
      id: req.body.id || crypto.randomUUID(),
      novelId,
      chapterId,
      authorUid,
      authorName,
      authorPhoto,
      text,
      createdAt: new Date(),
    };

    const inserted = await db.insert(commentsTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// DELETE a comment (Supported for Admin, Author, or Comment Creator)
router.delete('/novels/:novelId/chapters/:chapterId/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(commentsTable).where(eq(commentsTable.id, id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Global DELETE endpoint by comment id for Admin
router.delete('/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(commentsTable).where(eq(commentsTable.id, id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
