import { GoogleGenAI } from "@google/genai";
import { db } from "@workspace/db";
import { usersTable, notificationsTable } from "@workspace/db/schema";
import { or, ilike, eq } from "drizzle-orm";

interface ImageCheckParams {
  userUid: string;
  displayName: string;
  username?: string;
  imageUrl: string;
  imageType?: 'avatar' | 'banner';
}

/**
 * Inspects an uploaded avatar or banner image for immodest female depiction (متبرجة).
 * If detected, automatically creates an urgent moderation notification for the admin accounts.
 */
export async function checkImageForTabarrujAndNotifyAdmin({
  userUid,
  displayName,
  username,
  imageUrl,
  imageType = 'avatar'
}: ImageCheckParams): Promise<{ checked: boolean; isTabarruj?: boolean }> {
  try {
    if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length < 5) {
      return { checked: false };
    }

    // Skip placeholder avatars or defaults
    if (imageUrl.includes('placeholder') || imageUrl.includes('default') || imageUrl.length < 20) {
      return { checked: false };
    }

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (imageUrl.startsWith('data:image/')) {
      const matches = imageUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const imgRes = await fetch(imageUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (imgRes.ok) {
          const buffer = await imgRes.arrayBuffer();
          base64Data = Buffer.from(buffer).toString('base64');
          const headerType = imgRes.headers.get('content-type');
          if (headerType && headerType.startsWith('image/')) {
            mimeType = headerType;
          }
        }
      } catch (fetchErr) {
        console.warn('Could not fetch image for moderation analysis:', fetchErr);
      }
    }

    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

    let isTabarruj = false;
    let detectionDetails = '';

    if (base64Data && serverKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: serverKey });
        const prompt = `أنت نظام رقابي إسلامي وأخلاقي صارم لمنصة الروايات "روايتي".
المهمة: افحص هذه الصورة لتحديد ما إذا كانت لـ "امرأة أو فتاة متبرجة" (بإظهار شعر الرأس، أو الصدر، أو الكتفين، أو الساقين، أو مفاتن الجسد، أو ملابس مكشوفة/فاضحة/غير محتشمة، سواء كانت صورة حقيقية أو رسم/أنمي واقعي متبرج).

المعايير:
- إذا كانت صورة رجل، أو طفل، أو منظر طبيعي، أو كائن، أو سيارة، أو امرأة محجبة بحجاب كامل ساتر، أو منقبة: أجب بـ false.
- إذا كانت امرأة أو فتاة كاشفة لشعرها أو جسدها أو تظهر مفاتنها أو متبرجة: أجب بـ true.

أجب بصيغة JSON فقط كالتالي دون أي زيادات:
{"isTabarruj": true أو false, "details": "سبب موجز بالعربية"}`;

        const candidateModels = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
        for (const currentModel of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: currentModel,
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
                        data: base64Data
                      }
                    },
                    { text: prompt }
                  ]
                }
              ]
            });

            const textOutput = response.text || '';
            const jsonMatch = textOutput.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              isTabarruj = !!parsed.isTabarruj;
              detectionDetails = parsed.details || '';
            } else if (textOutput.toLowerCase().includes('"istabarruj": true') || textOutput.includes('true')) {
              isTabarruj = true;
            }
            break;
          } catch (modelErr) {
            console.warn(`Model ${currentModel} failed in image moderation:`, modelErr);
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini vision moderation error:', geminiErr);
      }
    }

    // Secondary heuristic fallback (if URL or query has explicit keywords)
    if (!isTabarruj && typeof imageUrl === 'string') {
      const lower = imageUrl.toLowerCase();
      const suspiciousKeywords = ['tabarruj', 'bikini', 'nude', 'sexy_woman', 'cleavage', 'lingerie', 'erotic'];
      if (suspiciousKeywords.some(kw => lower.includes(kw))) {
        isTabarruj = true;
        detectionDetails = 'تم رصد وسوم وكلمات دالة على عدم الحشمة في مسار الصورة';
      }
    }

    // If flagged as tabarruj, create an admin alert notification!
    if (isTabarruj) {
      console.log(`[Content Moderation] Flagged tabarruj image for user ${userUid} (@${username}): ${detectionDetails}`);

      // Find strictly the admin account in database
      const adminUsers = await db
        .select({ uid: usersTable.uid, email: usersTable.email })
        .from(usersTable)
        .where(
          or(
            ilike(usersTable.email, '%ahmad.meshaal.2040%'),
            ilike(usersTable.email, '%ahnad.meshaal.2040%')
          )
        );

      const typeLabel = imageType === 'banner' ? 'صورة الغلاف / البانر' : 'الصورة الشخصية (الأفاتار)';
      const notifTitle = `⚠️ تنبيه رقابي: رصد صورة امرأة متبرجة بحساب @${username || 'user'}`;
      const notifBody = `قام المستخدم «${displayName || 'مستخدم'}» (@${username || 'user'}) بتعيين صورة امرأة متبرجة في ${typeLabel}. معرّف الحساب (UID): ${userUid}. يرجى مراجعة الحساب وتغيير الصورة أو حذفها. ${detectionDetails ? `[ملاحظة: ${detectionDetails}]` : ''}`;

      for (const admin of adminUsers) {
        await db.insert(notificationsTable).values({
          uid: admin.uid,
          title: notifTitle,
          body: notifBody,
          type: 'admin_moderation_alert',
          actorUid: userUid,
          actorName: displayName || 'مستخدم',
          actorPhoto: imageUrl,
          read: false,
          createdAt: new Date(),
        }).catch(err => console.warn('Error inserting admin notification:', err));
      }

      return { checked: true, isTabarruj: true };
    }

    return { checked: true, isTabarruj: false };
  } catch (err) {
    console.warn('Unhandled error in checkImageForTabarrujAndNotifyAdmin:', err);
    return { checked: false };
  }
}

