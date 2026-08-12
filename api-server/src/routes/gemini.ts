import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

async function generateFreeAI(promptText: string) {
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
      return text.trim();
    }
  }
  throw new Error("Free AI provider did not return content");
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

  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  if (geminiKey && geminiKey.trim().length > 20 && !geminiKey.includes("AIzaSyDPHpkz")) {
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
      return res.json({ text: response.text, candidates: response.candidates });
    } catch (err: any) {
      req.log.warn({ errMessage: err?.message }, "Gemini API failed, switching to free AI");
    }
  }

  try {
    const text = await generateFreeAI(promptText);
    return res.json({
      text,
      candidates: [{ content: { parts: [{ text }] } }],
    });
  } catch (err: any) {
    req.log.error({ err }, "Free AI generation failed");
    return res.status(500).json({ error: err?.message || "AI generation failed" });
  }
});

export default router;
