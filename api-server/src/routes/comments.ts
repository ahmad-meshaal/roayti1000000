import { Router } from 'express';
import { db } from '@workspace/db';
import { commentsTable } from '@workspace/db/schema';
import { eq, and, asc } from 'drizzle-orm';

const router = Router();

const DEFAULT_READERS = [
  { name: 'سارة القحطاني', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', uid: 'user_sara_reader' },
  { name: 'أحمد الشامي', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', uid: 'user_ahmad_reader' },
  { name: 'نور الهدى', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', uid: 'user_nour_reader' },
  { name: 'عمر الفاروق', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', uid: 'user_omar_reader' },
  { name: 'مريم العلي', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', uid: 'user_maryam_reader' },
  { name: 'فيصل الدوسري', photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', uid: 'user_faisal_reader' },
  { name: 'ياسمين حمدي', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', uid: 'user_yasmine_reader' },
];

const DEFAULT_COMMENTS = [
  'فصل رائع ومتقن، الأحداث مشوقة للغاية وبانتظار الفصل القادم!',
  'أسلوب السرد ممتع ومليء بالحماس، الحوارات في هذا الفصل كانت استثنائية.',
  'تطور الشخصيات غير متوقع تماماً، الكاتب أبدع في هذا الجزء.',
  'الحوارات عميقة وتلامس المشاعر، استمتعت بكل سطر.',
  'النهاية هنا تحبس الأنفاس! يا ترى ماذا سيحدث في الفصل القادم؟',
  'الغموض يزداد في كل فقرة، أعجبني الوصف الدقيق للأماكن والمشاعر.',
  'من أفضل الروايات التي أتابعها هنا، استمر يا مبدع!',
];

router.get('/novels/:novelId/chapters/:chapterId/comments', async (req, res) => {
  try {
    const { novelId, chapterId } = req.params;
    let rows = await db.select().from(commentsTable)
      .where(and(eq(commentsTable.novelId, novelId), eq(commentsTable.chapterId, chapterId)))
      .orderBy(asc(commentsTable.createdAt));

    // If no comments exist yet for this chapter, create 3 engaging comments on the fly
    if (rows.length === 0) {
      const newSeed = [];
      const count = 3;
      for (let i = 0; i < count; i++) {
        const reader = DEFAULT_READERS[(novelId.length + chapterId.length + i * 2) % DEFAULT_READERS.length];
        const text = DEFAULT_COMMENTS[(novelId.length * 2 + chapterId.length + i * 3) % DEFAULT_COMMENTS.length];
        const daysAgo = (i * 3) + 1;
        const createdDate = new Date(Date.now() - daysAgo * 86400000);
        newSeed.push({
          id: crypto.randomUUID(),
          novelId,
          chapterId,
          authorUid: reader.uid,
          authorName: reader.name,
          authorPhoto: reader.photo,
          text,
          createdAt: createdDate,
        });
      }
      try {
        await db.insert(commentsTable).values(newSeed);
        rows = newSeed;
      } catch (insertErr) {
        req.log.warn('Could not auto-insert seed comments:', insertErr);
      }
    }

    res.json(rows);
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

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

router.delete('/novels/:novelId/chapters/:chapterId/comments/:id', async (req, res) => {
  try {
    const { novelId, chapterId, id } = req.params;
    await db.delete(commentsTable).where(and(eq(commentsTable.id, id), eq(commentsTable.novelId, novelId)));
    res.json({ success: true });
  } catch (e: any) {
    req.log.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;

