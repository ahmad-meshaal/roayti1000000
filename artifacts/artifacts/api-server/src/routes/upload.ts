import { Router } from "express";

const router = Router();

const STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0313303198.firebasestorage.app";
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "AIzaSyDPHpkz-G0wKRSePRSYz2FMc_HR8iuTgFw";

router.post("/upload", async (req, res) => {
  try {
    const { base64Data, path: storagePath } = req.body as {
      base64Data: string;
      path: string;
    };

    if (!base64Data || !storagePath) {
      res.status(400).json({ error: "base64Data and path are required" });
      return;
    }

    const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = "image/jpeg";

    if (matches) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], "base64");
    } else {
      buffer = Buffer.from(base64Data, "base64");
    }

    const encodedPath = encodeURIComponent(storagePath);
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodedPath}&key=${FIREBASE_API_KEY}`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": mimeType },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errText = await uploadResponse.text();
      req.log.error({ errText }, "Firebase Storage upload failed");
      throw new Error(`Firebase Storage upload failed: ${errText}`);
    }

    const uploadData = (await uploadResponse.json()) as any;
    const downloadToken = uploadData.downloadTokens;
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encodedPath}?alt=media&token=${downloadToken}`;

    res.json({ url: downloadUrl });
  } catch (err: any) {
    req.log.error({ err }, "Upload route error");
    res.status(500).json({ error: err?.message || "Upload failed" });
  }
});

export default router;
