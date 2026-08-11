import { Router } from 'express';
import { db } from '@workspace/db';
import { notificationsTable, usersTable } from '@workspace/db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = Router();

// GET /notifications?uid=...
router.get('/notifications', async (req, res) => {
  try {
    const { uid } = req.query as { uid: string };
    if (!uid) return res.status(400).json({ error: 'uid required' });
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.uid, uid))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /notifications/:id/read
router.put('/notifications/:id/read', async (req, res) => {
  try {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, req.params.id));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// PUT /notifications/read-all  — mark all as read for a uid
router.put('/notifications/read-all', async (req, res) => {
  try {
    const { uid } = req.body as { uid: string };
    if (!uid) return res.status(400).json({ error: 'uid required' });
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.uid, uid));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /notifications/welcome — create a welcome notification if none in last 7 days
router.post('/notifications/welcome', async (req, res) => {
  try {
    const { uid, displayName } = req.body as { uid: string; displayName?: string };
    if (!uid) return res.status(400).json({ error: 'uid required' });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent = await db
      .select()
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.uid, uid),
          eq(notificationsTable.type, 'welcome'),
          gte(notificationsTable.createdAt!, sevenDaysAgo),
        ),
      )
      .limit(1);

    if (recent.length) return res.json({ created: false });

    const greetings = [
      { title: '👋 أهلاً وسهلاً!', body: `مرحباً ${displayName || ''} — يسعدنا وجودك معنا في روايتي. استمر في كتابتك وشارك إبداعك مع العالم!` },
      { title: '✨ عدت من جديد!', body: `نور المكان ${displayName || ''} — روايتي تنتظر إبداعك. ماذا تكتب اليوم؟` },
      { title: '📖 حياك الله!', body: `يا ${displayName || 'صديق'} الكتابة تنتظرك — أفكار جديدة تولد كل يوم. أطلق قلمك!` },
      { title: '🌟 أهلاً بك!', body: `مرحباً يا ${displayName || ''} — قصتك القادمة قد تغير حياة أحدهم. لا تتوقف عن الكتابة!` },
    ];
    const g = greetings[Math.floor(Math.random() * greetings.length)];

    const inserted = await db
      .insert(notificationsTable)
      .values({ uid, type: 'welcome', title: g.title, body: g.body })
      .returning();
    res.status(201).json({ created: true, notification: inserted[0] });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
