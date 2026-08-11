import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getAI() {
  const directKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (directKey) {
    return new GoogleGenAI({ apiKey: directKey });
  }

  const baseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
  const replitApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;

  if (baseUrl && replitApiKey) {
    return new GoogleGenAI({
      apiKey: replitApiKey,
      httpOptions: { apiVersion: "", baseUrl },
    });
  }

  throw new Error("No Gemini API key configured. Please set GEMINI_API_KEY in your .env file.");
}

router.post("/gemini/generate", async (req, res) => {
  try {
    const { model = "gemini-2.5-flash", contents, config } = req.body as {
      model?: string;
      contents: { role: string; parts: { text: string }[] }[];
      config?: Record<string, unknown>;
    };

    if (!contents || !Array.isArray(contents)) {
      res.status(400).json({ error: "contents is required" });
      return;
    }

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
    ];

    const ai = getAI();
    const response = await ai.models.generateContent({ model, contents, safetySettings, ...config });
    res.json({ text: response.text, candidates: response.candidates });
  } catch (err: any) {
    req.log.error({ err }, "Gemini generate error");
    res.status(500).json({ error: err?.message || "Gemini error" });
  }
});

export default router;
