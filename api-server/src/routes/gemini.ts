import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

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
          contents,
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
          return res.json({ text: response.text, candidates: response.candidates, modelUsed: currentModel });
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

export default router;
