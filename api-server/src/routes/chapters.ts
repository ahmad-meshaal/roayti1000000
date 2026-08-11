import { Router } from 'express';
import { db } from '@workspace/db';
import { chaptersTable } from '@workspace/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

router.get('/novels/:novelId/chapters', async (req, res) => {
  try {
    const rows = await db.select().from(chaptersTable)
      .where(eq(chaptersTable.novelId, req.params.novelId))
      .orderBy(asc(chaptersTable.order));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/novels/:novelId/chapters/:id', async (req, res) => {
  try {
    const rows = await db.select().from(chaptersTable)
      .where(and(eq(chaptersTable.id, req.params.id), eq(chaptersTable.novelId, req.params.novelId)))
      .limit(1);
    if (!rows.length) return res.status(404).json({ error: 'Chapter not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:novelId/chapters', async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId };
    const inserted = await db.insert(chaptersTable).values({
      id: data.id || crypto.randomUUID(),
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

router.put('/novels/:novelId/chapters/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    delete data.createdAt;
    const rows = await db.update(chaptersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(chaptersTable.id, req.params.id), eq(chaptersTable.novelId, req.params.novelId)))
      .returning();
    if (!rows.length) return res.status(404).json({ error: 'Chapter not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/novels/:novelId/chapters/:id', async (req, res) => {
  try {
    await db.delete(chaptersTable)
      .where(and(eq(chaptersTable.id, req.params.id), eq(chaptersTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
