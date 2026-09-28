import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { sanitizeIslamicContent, containsShirkOrProhibited } from "../lib/sanitizer";

const router = Router();

router.post("/gemini/generate", async (req, res) => {
  const { model = "gemini-2.5-flash", contents, config } = req.body as {
    model?: string;
    contents: { role: string; parts: { text: string }[] }[];
    config?: Record<string, unknown>;
  };

  if (!contents || !Array.isArray(contents)) {
    res.status(400).json({ error: "محتوى الطلب (contents) مطلوب" });
    return;
  }

  // Inject context-aware Islamic literary guideline into prompts
  const islamicInstruction = `\n\n[إرشاد أدبي وأسلوبي إلزامي للسياق:
- يُمنع منعاً باتاً ذكر أي ألفاظ شركية أو آلهة باطلة أو ادعاءات ألوهية للكائنات إطلاقاً.
- اجعل التعبيرات متناغمة تماماً مع سياق المشهد وأسلوب الرواية الفصيح والملحمي:
  * في القوى والعناصر والمعارك: استخدم ألقاباً فخمة متسقة مثل (سيد الرعد / عاهل الصواعق / أمير الحرب / سيد النصال / حاصد الأرواح / سيد الأعماق / سلطان الرياح) بدلاً من (إله كذا).
  * في الأعراق القديمة والأزمنة: استخدم (الجبابرة القدامى / الكيانات الأزلية / الأسياد الأوائل / عهد الأساطير / صرح الأجداد / سلالة النبلاء) بدلاً من (الآلهة / أنصاف آلهة / معبد الآلهة / عصر الآلهة).
  * في الحوارات والقسم: استخدم (بحق السماء! / أقسم بشرفي / ويحك! / يا للهول!) بدلاً من الاستقسام بالآلهة.
  * في الخضوع والتعظيم: اجعل المشاعر تعظيماً وإجلالاً أو ولاءً وطاعة لسلطان القائد أو الجبار، وتجنب ألفاظ العبادة والسجود للكائنات.
  * احرص على تدفق السرد الأدبي العربي البليغ بحيث تبدو العبارات طبيعية وجذابة ورفيعة المستوى ومتسقة مع سياق الأحداث دون نشاز.]`;
  const safeContents = contents.map(c => ({
    ...c,
    parts: c.parts.map(p => ({
      ...p,
      text: p.text ? p.text + (c.role === 'user' ? islamicInstruction : '') : p.text
    }))
  }));

  const userApiKey = (config?.userApiKey as string) || "";
  const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

  const cleanKey = (k: string) => k.trim().replace(/^["']|["']$/g, '').replace(/[\r\n\t]/g, '');

  const availableKeys = [userApiKey, serverKey]
    .map(cleanKey)
    .filter((k, i, arr) => k && k.length > 10 && arr.indexOf(k) === i);

  if (availableKeys.length === 0) {
    res.status(400).json({ 
      error: "مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مضاف. يرجى إضافته في إعدادات البيئة على Render أو في إعدادات الملف الشخصي." 
    });
    return;
  }

  const candidateModels = [model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"].filter((m, i, arr) => arr.indexOf(m) === i);
  let lastError: any = null;

  for (const activeKey of availableKeys) {
    for (const currentModel of candidateModels) {
      try {
        const ai = new GoogleGenAI({ apiKey: activeKey });
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: safeContents,
          config: {
            temperature: (config?.temperature as number) ?? 0.7,
            maxOutputTokens: (config?.maxOutputTokens as number) ?? 8192,
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            ] as any,
            ...config,
          },
        });

        if (response && response.text && response.text.trim()) {
          const sanitizedText = sanitizeIslamicContent(response.text);
          return res.json({ text: sanitizedText, candidates: response.candidates, modelUsed: currentModel });
        }
      } catch (err: any) {
        lastError = err;
        req.log.warn({ currentModel, err: err?.message }, "Model/key generation failed, trying next candidate");
      }
    }
  }

  req.log.error({ err: lastError }, "Google Gemini API error on all keys and models");
  const errMsg = lastError?.message || String(lastError || "Unknown error");
  return res.status(500).json({ error: `فشل الاتصال بـ Google Gemini: ${errMsg}` });
});

// Dedicated AI Sanitization endpoint
router.post("/gemini/sanitize", async (req, res) => {
  try {
    const { text, customApiKey } = req.body as { text: string; customApiKey?: string };
    if (!text || typeof text !== 'string') {
      return res.json({ sanitizedText: text || '', modified: false });
    }

    if (!containsShirkOrProhibited(text)) {
      return res.json({ sanitizedText: text, modified: false });
    }

    // Fast deterministic fallback
    const directSanitized = sanitizeIslamicContent(text);

    // Try AI deep rewrite if text has complex structures and key is available
    const serverKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    const apiKey = customApiKey || serverKey;

    if (apiKey && apiKey.length > 10) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `أنت ناقد ومحرر أدبي وروائي محترف رفيع المستوى. هدفك تنقية النص الروائي التالي من أي ألفاظ شركية أو ادعاءات ألوهية أو مفاهيم مخالفة للشريعة الإسلامية، مع إعادة كتابتها بأسلوب أدبي بليغ متناغم ومتناسب تماماً مع سياق المشهد:
1. استبدل أي ذكر للآلهة الخيالية ببديل أدبي فخم يلائم السياق الدرامي:
   - في قوى العناصر والمعارك: (سيد الرعد، عاهل الصواعق، أمير الحرب، بطل المعارك، حاصد الأرواح، سيد الظلام، سلطان الضياء...).
   - في الكيانات والأعراق القديمة: (الجبابرة القدامى، الأسياد الأوائل، الكيانات الأسطورية، عصر الأساطير، صرح الأجداد، سلالة الأبطال...).
   - في القسم والحوارات والتعجب: (بحق السماء، أقسم بشرفي، يا للعجب، ويحك...).
   - في الطاعة والولاء: استبدل السجود والعبادة بـ (الانحناء إجلالاً، الولاء المطلق، الخضوع لسلطانه).
2. اجعل الصياغة طبيعية وسلسة وفصيحة، بحيث تنسجم بسلاسة مع السياق السردي وكأن الرواية كتبت هكذا في الأصل دون أي ركاكة.
3. لا تغير حبكة الأحداث أو أسماء الشخصيات، ولا تضف أي مقدمات أو هوامش أو تعليقات من قبلك. أعد النص الروائي المنقى فقط:

${text.substring(0, 8000)}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.3 }
        });

        if (response && response.text && response.text.trim()) {
          const finalClean = sanitizeIslamicContent(response.text.trim());
          return res.json({ sanitizedText: finalClean, modified: true, method: 'ai' });
        }
      } catch (aiErr: any) {
        req.log.warn({ err: aiErr?.message }, "AI sanitize rewrite failed, using deterministic sanitizer");
      }
    }

    return res.json({ sanitizedText: directSanitized, modified: true, method: 'regex' });
  } catch (err: any) {
    req.log.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
