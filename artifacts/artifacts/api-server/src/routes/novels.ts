import { Router } from 'express';
import { db } from '@workspace/db';
import { novelsTable, likesTable } from '@workspace/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/novels', async (req, res) => {
  try {
    const { authorUid, status, language } = req.query as Record<string, string>;
    let q = db.select().from(novelsTable).orderBy(desc(novelsTable.updatedAt));
    const conditions = [];
    if (authorUid) conditions.push(eq(novelsTable.authorUid, authorUid));
    if (status) conditions.push(eq(novelsTable.status, status));
    if (language && language !== 'all') conditions.push(eq(novelsTable.language!, language));
    const results = conditions.length
      ? await db.select().from(novelsTable).where(and(...conditions)).orderBy(desc(novelsTable.updatedAt))
      : await db.select().from(novelsTable).orderBy(desc(novelsTable.updatedAt));
    res.json(results);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/novels/:id', async (req, res) => {
  try {
    const rows = await db.select().from(novelsTable).where(eq(novelsTable.id, req.params.id)).limit(1);
    if (!rows.length) return res.status(404).json({ error: 'Novel not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels', async (req, res) => {
  try {
    const data = req.body;
    const inserted = await db.insert(novelsTable).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/novels/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.createdAt;
    const rows = await db.update(novelsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(novelsTable.id, req.params.id))
      .returning();
    if (!rows.length) return res.status(404).json({ error: 'Novel not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/novels/:id', async (req, res) => {
  try {
    const { chaptersTable, charactersTable, worldNotesTable, commentsTable, likesTable: lt } = await import('@workspace/db/schema');
    await db.delete(chaptersTable).where(eq(chaptersTable.novelId, req.params.id));
    await db.delete(charactersTable).where(eq(charactersTable.novelId, req.params.id));
    await db.delete(worldNotesTable).where(eq(worldNotesTable.novelId, req.params.id));
    await db.delete(commentsTable).where(eq(commentsTable.novelId, req.params.id));
    await db.delete(lt).where(eq(lt.novelId, req.params.id));
    await db.delete(novelsTable).where(eq(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:id/like', async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });
    const existing = await db.select().from(likesTable).where(and(eq(likesTable.novelId, req.params.id), eq(likesTable.uid, uid))).limit(1);
    if (existing.length) {
      await db.delete(likesTable).where(and(eq(likesTable.novelId, req.params.id), eq(likesTable.uid, uid)));
      await db.update(novelsTable).set({ likesCount: sql`${novelsTable.likesCount} - 1` }).where(eq(novelsTable.id, req.params.id));
      return res.json({ liked: false });
    }
    await db.insert(likesTable).values({ novelId: req.params.id, uid });
    await db.update(novelsTable).set({ likesCount: sql`${novelsTable.likesCount} + 1` }).where(eq(novelsTable.id, req.params.id));
    res.json({ liked: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/novels/:id/liked', async (req, res) => {
  try {
    const { uid } = req.query as { uid: string };
    if (!uid) return res.json({ liked: false });
    const rows = await db.select().from(likesTable).where(and(eq(likesTable.novelId, req.params.id), eq(likesTable.uid, uid))).limit(1);
    res.json({ liked: rows.length > 0 });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:id/view', async (req, res) => {
  try {
    await db.update(novelsTable).set({ viewsCount: sql`${novelsTable.viewsCount} + 1` }).where(eq(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:id/share', async (req, res) => {
  try {
    await db.update(novelsTable).set({ sharesCount: sql`${novelsTable.sharesCount} + 1` }).where(eq(novelsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
