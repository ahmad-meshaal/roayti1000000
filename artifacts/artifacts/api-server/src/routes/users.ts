import { Router } from 'express';
import { db } from '@workspace/db';
import { usersTable, novelsTable } from '@workspace/db/schema';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const { q } = req.query as { q?: string };
    if (q) {
      const results = await db.select().from(usersTable).where(
        or(ilike(usersTable.displayName, `%${q}%`), ilike(usersTable.username!, `%${q}%`))
      ).limit(50);
      return res.json(results);
    }
    const results = await db.select().from(usersTable).limit(200);
    res.json(results);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const rows = await db.select().from(usersTable).where(eq(usersTable.uid, uid)).limit(1);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/by-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const rows = await db.select().from(usersTable).where(eq(usersTable.username!, username.toLowerCase())).limit(1);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const data = req.body;
    if (!data.uid) return res.status(400).json({ error: 'uid required' });
    const existing = await db.select().from(usersTable).where(eq(usersTable.uid, data.uid)).limit(1);
    if (existing.length) {
      // User already exists — only update email if it changed, never overwrite user-edited fields
      const safeUpdate: Record<string, any> = { updatedAt: new Date() };
      if (data.email && data.email !== existing[0].email) safeUpdate.email = data.email;
      const updated = await db.update(usersTable)
        .set(safeUpdate)
        .where(eq(usersTable.uid, data.uid))
        .returning();
      return res.json(updated[0]);
    }
    const inserted = await db.insert(usersTable).values({ ...data }).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.put('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const data = { ...req.body };
    delete data.uid;
    delete data.createdAt;
    const rows = await db.update(usersTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usersTable.uid, uid))
      .returning();
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/:uid/stats', async (req, res) => {
  try {
    const { uid } = req.params;
    const { followsTable, libraryTable } = await import('@workspace/db/schema');
    const [followersCount, followingCount, novelsCount, libraryCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followedUid, uid)),
      db.select({ count: sql<number>`count(*)` }).from(followsTable).where(eq(followsTable.followerUid, uid)),
      db.select({ count: sql<number>`count(*)` }).from(novelsTable).where(eq(novelsTable.authorUid, uid)),
      db.select({ count: sql<number>`count(*)` }).from(libraryTable).where(eq(libraryTable.uid, uid)),
    ]);
    res.json({
      followersCount: Number(followersCount[0].count),
      followingCount: Number(followingCount[0].count),
      novelsCount: Number(novelsCount[0].count),
      libraryCount: Number(libraryCount[0].count),
    });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
