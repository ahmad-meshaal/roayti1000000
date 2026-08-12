import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function getAI() {
  const envKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const directKey = (envKey && envKey.startsWith("AIzaSy")) 
    ? envKey 
    : "AIzaSyDPHpkz-G0wKRSePRSYz2FMc_HR8iuTgFw";
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
  const { model = "gemini-2.5-flash", contents, config } = req.body as {
    model?: string;
    contents: { role: string; parts: { text: string }[] }[];
    config?: Record<string, unknown>;
  };

  if (!contents || !Array.isArray(contents)) {
    res.status(400).json({ error: "contents is required" });
    return;
  }

  const promptText = contents
    .map(c => (c.parts || []).map(p => p.text).join("\n"))
    .join("\n\n");

  try {
    const ai = getAI();
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
    return res.json({ text: response.text, candidates: response.candidates });
  } catch (err: any) {
    req.log.warn({ errMessage: err?.message }, "Gemini API error, activating free AI provider fallback");

    try {
      const pollResponse = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: promptText }],
          model: "openai",
          seed: Math.floor(Math.random() * 1000000),
        }),
      });

      if (pollResponse.ok) {
        const text = await pollResponse.text();
        if (text && text.trim().length > 0) {
          return res.json({
            text: text.trim(),
            candidates: [{ content: { parts: [{ text: text.trim() }] } }],
          });
        }
      }
    } catch (pollErr: any) {
      req.log.error({ pollErr: pollErr?.message }, "Pollinations AI fallback error");
    }

    return res.status(500).json({ error: err?.message || "AI Generation error" });
  }
});

export default router;
