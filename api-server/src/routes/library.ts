import { Router } from 'express';
import { db } from '@workspace/db';
import { libraryTable } from '@workspace/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/library', async (req, res) => {
  try {
    const { uid } = req.query as { uid: string };
    if (!uid) return res.status(400).json({ error: 'uid required' });
    const rows = await db.select().from(libraryTable).where(eq(libraryTable.uid, uid));
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/library', async (req, res) => {
  try {
    const { uid, novelId } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: 'uid and novelId required' });
    const existing = await db.select().from(libraryTable).where(and(eq(libraryTable.uid, uid), eq(libraryTable.novelId, novelId))).limit(1);
    if (existing.length) return res.json(existing[0]);
    const inserted = await db.insert(libraryTable).values({ uid, novelId, id: req.body.id || crypto.randomUUID() }).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/library', async (req, res) => {
  try {
    const { uid, novelId } = req.body;
    if (!uid || !novelId) return res.status(400).json({ error: 'uid and novelId required' });
    await db.delete(libraryTable).where(and(eq(libraryTable.uid, uid), eq(libraryTable.novelId, novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
