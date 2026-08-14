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
  const geminiKey = (userApiKey && userApiKey.trim().length > 15)
    ? userApiKey.trim()
    : (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

  if (!geminiKey || geminiKey.length < 15) {
    res.status(400).json({ 
      error: "مفتاح الذكاء الاصطناعي (GEMINI_API_KEY) غير مضاف أو غير صالح. يرجى إضافته في إعدادات البيئة على Render أو في إعدادات الملف الشخصي." 
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
        ] as any,
        ...config,
      },
    });

    if (!response.text || !response.text.trim()) {
      res.status(500).json({ error: "لم يتم استلام أي نص من نموذج Google Gemini." });
      return;
    }

    return res.json({ text: response.text, candidates: response.candidates });
  } catch (err: any) {
    req.log.error({ err }, "Google Gemini API error");
    const errMsg = err?.message || String(err);
    return res.status(500).json({ error: `فشل الاتصال بـ Google Gemini: ${errMsg}` });
  }
});

export default router;
