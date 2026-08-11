import { Router } from 'express';
import { db } from '@workspace/db';
import { charactersTable, worldNotesTable } from '@workspace/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

router.get('/novels/:novelId/characters', async (req, res) => {
  try {
    const rows = await db.select().from(charactersTable).where(eq(charactersTable.novelId, req.params.novelId)).orderBy(asc(charactersTable.createdAt));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:novelId/characters', async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId };
    const inserted = await db.insert(charactersTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/novels/:novelId/characters/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    const rows = await db.update(charactersTable).set(data).where(and(eq(charactersTable.id, req.params.id), eq(charactersTable.novelId, req.params.novelId))).returning();
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/novels/:novelId/characters/:id', async (req, res) => {
  try {
    await db.delete(charactersTable).where(and(eq(charactersTable.id, req.params.id), eq(charactersTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/novels/:novelId/world-notes', async (req, res) => {
  try {
    const rows = await db.select().from(worldNotesTable).where(eq(worldNotesTable.novelId, req.params.novelId)).orderBy(asc(worldNotesTable.createdAt));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/novels/:novelId/world-notes', async (req, res) => {
  try {
    const data = { ...req.body, novelId: req.params.novelId };
    const inserted = await db.insert(worldNotesTable).values(data).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/novels/:novelId/world-notes/:id', async (req, res) => {
  try {
    const data = { ...req.body };
    delete data.id;
    delete data.novelId;
    const rows = await db.update(worldNotesTable).set(data).where(and(eq(worldNotesTable.id, req.params.id), eq(worldNotesTable.novelId, req.params.novelId))).returning();
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/novels/:novelId/world-notes/:id', async (req, res) => {
  try {
    await db.delete(worldNotesTable).where(and(eq(worldNotesTable.id, req.params.id), eq(worldNotesTable.novelId, req.params.novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
