import { Router } from 'express';
import { db } from '@workspace/db';
import {
  usersTable,
  novelsTable,
  followsTable,
  libraryTable,
  readingProgressTable,
  commentsTable,
  likesTable,
  notificationsTable,
} from '@workspace/db/schema';
import { eq, ilike, or, desc, sql } from 'drizzle-orm';

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const { q } = req.query as { q?: string };
    if (q) {
      const results = await db
        .select()
        .from(usersTable)
        .where(
          or(ilike(usersTable.displayName, `%${q}%`), ilike(usersTable.username!, `%${q}%`))
        )
        .limit(50);
      return res.json(results);
    }
    const results = await db.select().from(usersTable).limit(200);
    res.json(results);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/by-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const rows = await db
      .select()
      .from(usersTable)
      .where(ilike(usersTable.username!, username.trim().toLowerCase()))
      .limit(1);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.get('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    // Try exact UID first
    let rows = await db.select().from(usersTable).where(eq(usersTable.uid, uid)).limit(1);

    // Fallback try by username
    if (!rows.length) {
      rows = await db.select().from(usersTable).where(ilike(usersTable.username!, uid.toLowerCase())).limit(1);
    }

    // Fallback try by email
    if (!rows.length && uid.includes('@')) {
      rows = await db.select().from(usersTable).where(ilike(usersTable.email!, uid.toLowerCase())).limit(1);
    }

    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.uid) return res.status(400).json({ error: 'uid required' });

    // 1. Check if user already exists by exact UID
    const existingByUid = await db.select().from(usersTable).where(eq(usersTable.uid, data.uid)).limit(1);
    if (existingByUid.length) {
      const safeUpdate: Record<string, any> = { updatedAt: new Date() };
      if (data.email && data.email !== existingByUid[0].email) safeUpdate.email = data.email;
      if (data.displayName && (!existingByUid[0].displayName || existingByUid[0].displayName === 'كاتب مجهول')) {
        safeUpdate.displayName = data.displayName;
      }
      if (data.photoURL && !existingByUid[0].photoURL) safeUpdate.photoURL = data.photoURL;

      const updated = await db
        .update(usersTable)
        .set(safeUpdate)
        .where(eq(usersTable.uid, data.uid))
        .returning();
      return res.json(updated[0]);
    }

    // 2. Check if user exists by EMAIL (e.g. seeded user logging in with same email but new Clerk UID)
    if (data.email) {
      const existingByEmail = await db
        .select()
        .from(usersTable)
        .where(ilike(usersTable.email!, data.email.trim().toLowerCase()))
        .limit(1);

      if (existingByEmail.length) {
        const oldUid = existingByEmail[0].uid;
        const newUid = data.uid;

        // If old UID is different, re-link all child table references from oldUid -> newUid
        if (oldUid !== newUid) {
          try {
            await db.update(novelsTable).set({ authorUid: newUid }).where(eq(novelsTable.authorUid, oldUid));
            await db.update(followsTable).set({ followerUid: newUid }).where(eq(followsTable.followerUid, oldUid));
            await db.update(followsTable).set({ followedUid: newUid }).where(eq(followsTable.followedUid, oldUid));
            await db.update(libraryTable).set({ uid: newUid }).where(eq(libraryTable.uid, oldUid));
            await db.update(readingProgressTable).set({ uid: newUid }).where(eq(readingProgressTable.uid, oldUid));
            await db.update(commentsTable).set({ authorUid: newUid }).where(eq(commentsTable.authorUid, oldUid));
            await db.update(likesTable).set({ uid: newUid }).where(eq(likesTable.uid, oldUid));
            await db.update(notificationsTable).set({ uid: newUid }).where(eq(notificationsTable.uid, oldUid));
          } catch (relErr) {
            req.log.warn(relErr, 'Error re-linking user child table references');
          }
        }

        const safeUpdate: Record<string, any> = {
          uid: newUid,
          updatedAt: new Date(),
        };
        if (data.displayName) safeUpdate.displayName = data.displayName;
        if (data.photoURL) safeUpdate.photoURL = data.photoURL;

        const updated = await db
          .update(usersTable)
          .set(safeUpdate)
          .where(eq(usersTable.uid, oldUid))
          .returning();
        return res.json(updated[0]);
      }
    }

    // 3. Prevent UNIQUE constraint violation on username
    let targetUsername = data.username ? data.username.toLowerCase().replace(/[^a-z0-9_]/g, '_') : '';
    if (!targetUsername) {
      targetUsername = `user_${Math.floor(100000 + Math.random() * 900000)}`;
    }

    const existingByUsername = await db
      .select()
      .from(usersTable)
      .where(ilike(usersTable.username!, targetUsername))
      .limit(1);

    if (existingByUsername.length) {
      targetUsername = `${targetUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }
    data.username = targetUsername;

    const inserted = await db.insert(usersTable).values({
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

