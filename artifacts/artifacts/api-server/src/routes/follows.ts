import { Router } from 'express';
import { db } from '@workspace/db';
import { followsTable, usersTable } from '@workspace/db/schema';
import { eq, and } from 'drizzle-orm';

const router = Router();

router.get('/follows', async (req, res) => {
  try {
    const { followerUid, followedUid } = req.query as Record<string, string>;
    if (followerUid) {
      const rows = await db.select().from(followsTable).where(eq(followsTable.followerUid, followerUid));
      return res.json(rows);
    }
    if (followedUid) {
      const rows = await db.select().from(followsTable).where(eq(followsTable.followedUid, followedUid));
      return res.json(rows);
    }
    res.json([]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/follows', async (req, res) => {
  try {
    const { followerUid, followedUid } = req.body;
    if (!followerUid || !followedUid) return res.status(400).json({ error: 'followerUid and followedUid required' });
    const existing = await db.select().from(followsTable).where(and(eq(followsTable.followerUid, followerUid), eq(followsTable.followedUid, followedUid))).limit(1);
    if (existing.length) return res.json(existing[0]);
    const inserted = await db.insert(followsTable).values({ followerUid, followedUid }).returning();
    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/follows', async (req, res) => {
  try {
    const { followerUid, followedUid } = req.body;
    if (!followerUid || !followedUid) return res.status(400).json({ error: 'followerUid and followedUid required' });
    await db.delete(followsTable).where(and(eq(followsTable.followerUid, followerUid), eq(followsTable.followedUid, followedUid)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/follows/profiles', async (req, res) => {
  try {
    const { followerUid } = req.query as { followerUid: string };
    if (!followerUid) return res.json([]);
    const followRows = await db.select().from(followsTable).where(eq(followsTable.followerUid, followerUid));
    if (!followRows.length) return res.json([]);
    const profiles = await Promise.all(
      followRows.map(f => db.select().from(usersTable).where(eq(usersTable.uid, f.followedUid)).limit(1))
    );
    res.json(profiles.map(p => p[0]).filter(Boolean));
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
