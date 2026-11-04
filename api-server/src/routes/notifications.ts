import { Router } from 'express';
import { db } from '@workspace/db';
import { notificationsTable, usersTable } from '@workspace/db/schema';
import { eq, desc, and, gte, inArray } from 'drizzle-orm';

const router = Router();

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const clean = String(email).trim().toLowerCase();
  return (
    clean === 'ahmad.meshaal.2040@gmail.com' ||
    clean === 'ahnad.meshaal.2040@gmail.com'
  );
};

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

// POST /notifications — create a single notification
router.post('/notifications', async (req, res) => {
  try {
    const { uid, title, body, type, actorUid, actorName, actorPhoto, novelId, novelTitle } = req.body;
    if (!uid || !title) {
      return res.status(400).json({ error: 'uid and title are required' });
    }

    const inserted = await db
      .insert(notificationsTable)
      .values({
        uid,
        title,
        body: body || '',
        type: type || 'general',
        actorUid: actorUid || null,
        actorName: actorName || null,
        actorPhoto: actorPhoto || null,
        novelId: novelId || null,
        novelTitle: novelTitle || null,
        read: false,
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

// POST /notifications/admin-send — Admin sends messages to accounts (single user or broadcast to all)
router.post('/notifications/admin-send', async (req, res) => {
  try {
    const { adminEmail, targetUid, sendToAll, title, body, type, actorName, role } = req.body;

    const isAuthorized = isAdminEmail(adminEmail);
    if (!isAuthorized) {
      return res.status(403).json({ error: 'ممنوع: هذه الصلاحية محصورة حصراً بالمدير ahmad.meshaal.2040@gmail.com فقط' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const notifType = type || 'admin_message';
    const senderName = actorName || 'إدارة منصة روايتي (المدير)';

    if (sendToAll) {
      // Broadcast to all users
      const allUsers = await db.select({ uid: usersTable.uid }).from(usersTable);
      if (!allUsers.length) {
        return res.json({ success: true, count: 0, message: 'No users found' });
      }

      // Batch insert notifications
      const valuesToInsert = allUsers.map((u: { uid: string }) => ({
        uid: u.uid,
        title,
        body,
        type: notifType,
        actorName: senderName,
        read: false,
        createdAt: new Date(),
      }));

      // Insert in chunks of 100 to avoid payload overflow
      const chunkSize = 100;
      for (let i = 0; i < valuesToInsert.length; i += chunkSize) {
        const chunk = valuesToInsert.slice(i, i + chunkSize);
        await db.insert(notificationsTable).values(chunk);
      }

      return res.json({
        success: true,
        count: allUsers.length,
        message: `تم إرسال الإشعار بنجاح إلى جميع الحسابات (${allUsers.length} حساب)`,
      });
    }

    // Send to specific target user
    if (!targetUid) {
      return res.status(400).json({ error: 'targetUid is required when sendToAll is false' });
    }

    const inserted = await db
      .insert(notificationsTable)
      .values({
        uid: targetUid,
        title,
        body,
        type: notifType,
        actorName: senderName,
        read: false,
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json({
      success: true,
      count: 1,
      notification: inserted[0],
      message: 'تم إرسال الإشعار إلى الحساب بنجاح',
    });
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

// DELETE /notifications/:id
router.delete('/notifications/:id', async (req, res) => {
  try {
    await db
      .delete(notificationsTable)
      .where(eq(notificationsTable.id, req.params.id));
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
      .values({ uid, type: 'welcome', title: g.title, body: g.body, id: req.body.id || crypto.randomUUID() })
      .returning();
    res.status(201).json({ created: true, notification: inserted[0] });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
