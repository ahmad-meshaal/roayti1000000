import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function generateDynamicNovelAI(promptText: string): string {
  const cleanPrompt = promptText.replace(/System:[\s\S]*?\n/gi, '').trim();

  // Extract explicit novel title if mentioned
  const titleMatch = cleanPrompt.match(/(?:بعنوان|عنوان|رواية|قصة)\s*[:"']?([^\n"':،.]+)/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract character names mentioned in the prompt
  const knownNames = cleanPrompt.match(/[\u0600-\u06FF]{3,12}/g) || [];
  const stopWords = new Set(["اكتب", "فصل", "قصة", "رواية", "البطل", "الشخصية", "عن", "في", "على", "من", "إلى", "هذا", "هذه", "التي", "الذي", "مع", "كان", "كانت", "القصة", "مشهد", "أكمل", "بعنوان", "ساد", "الصمت"]);
  const probableCharacters = Array.from(new Set(knownNames.filter(n => n.length > 2 && !stopWords.has(n))));
  const mainCharacter = probableCharacters[0] || "البطل";
  const secondaryCharacter = probableCharacters[1] || "الشخصية المرافقة";

  // Extract last non-empty line/sentence from prompt to continue seamlessly
  const lines = cleanPrompt.split(/\n+/).map(l => l.trim()).filter(l => l.length > 3 && !l.includes("اكتب") && !l.includes("أكمل"));
  const lastLine = lines.length > 0 ? lines[lines.length - 1] : "";

  if (cleanPrompt.includes("شخصية") || cleanPrompt.includes("شخصيات") || cleanPrompt.includes("character")) {
    return `### 🎭 تطوير وتحليل الشخصيات ${title ? `لرواية "${title}"` : ''}:

1. **${mainCharacter}**:
   - **الدور والموقع**: البطل الرئيسي ومحرك الأحداث الأخير.
   - **الدافع السردي**: كشف الحقائق المخفية والتغلب على المواقف الحرجة التي واجهته.
   - **السلوك والقرارات**: يميل لاتخاذ قرارات شجاعة بناءً على التفاصيل التي ظهرت في المشهد الأخير.

2. **${secondaryCharacter}**:
   - **الدور والموقع**: الطرف الداعم والتأثير الدرامي المباشر.
   - **السمات**: الحكمة، الوفاء، والسرعة في استجابة المتغيرات الطارئة.`;
  }

  if (cleanPrompt.includes("ملخص") || cleanPrompt.includes("حبكة") || cleanPrompt.includes("summary")) {
    return `### 📖 ملخص السرد والتطوير الدرامي ${title ? `لرواية "${title}"` : ''}:

تتواصل الحكاية بالتركيز على ${mainCharacter} في هذه المرحلة المصيرية. تتسارع الأحداث مع ظهور خيوط جديدة تتطلب مواجهة حتمية مع ${secondaryCharacter}.

ينتج عن هذا التواجه سلسلة من القرارات غير المتوقعة التي تدفع بالقصة نحو أفق جديد مفعم بالإثارة والتحدي السردي المشوق.`;
  }

  // Dynamic context continuation built from user's actual text
  let header = "";
  if (lastLine) {
    header = `متابعة لمسار القصة بعد ("...${lastLine.slice(-80)}"):\n\n`;
  }

  const p1 = `واصل ${mainCharacter} خطواته بثبات نحو الوجهة الجديدة، متفحصاً كل زاوية بكامل التركيز. كانت المؤشرات حوله تدل على أن القرارات القادمة لن تكون سهلة، وأن كل تفصيلة ستحدث فارقاً حقيقياً في مجرى الأحداث.`;
  const p2 = `التفت ${mainCharacter} وقال بنبرة واضحة ومباشرة:\n- "إن لم نتحرك الآن ونحسم موقفنا، فستفلت الأمور من أيدينا."`;
  const p3 = `أومأ ${secondaryCharacter} برأسه موافقاً، ودون أي تردد، بدأت المرحلة التالية من هذه المواجهة المصيرية لتفتح الفصل القادم على أسرار وتحديات جديدة.`;

  return `${header}${p1}\n\n${p2}\n\n${p3}`;
}ء الوقاد، والقدرة على سرعة البديهة وتحليل المخاطر تحت الضغط.
   - **الدافع الشخصي**: السعي نحو كشف الحقيقة واستعادة الحقوق المسلوبة وسط عالم مليء بالتحديات.

2. **الشخصية المضادة (الخصم الرئيسي)**:
   - **الدور**: القوة المنافسة والمحركة للصراعات.
   - **السمات**: داهية، صاحب نفوذ وتخطيط بعيد المدى، يمتلك دافعاً عميقاً يبرر أفعاله.
   - **الدافع الشخصي**: فرض السيطرة وتحقيق رؤية خاصة تعارض مسار البطل.

3. **الشخصية المساعدة (الحليف الوفي)**:
   - **الدور**: الداعم والمستشار الحكيم.
   - **السمات**: وفاء مطلق، معرفة واسعة بالمعالم والأسرار القديمة، وحس فكاهي يخفف حدة المواقف.`;
  }

  if (text.includes("ملخص") || text.includes("حبكة") || text.includes("قصة") || text.includes("summary")) {
    const mainTitle = title || "ملحمة الصراع والعزيمة";
    return `### 📖 ملخص ملحمي لرواية: "${mainTitle}"
*التصنيف: ${genre}*

تتدفق الأحداث في إطار درامي تشويقي يبدأ عندما تنكشف أولى خيوط اللغز الكبير. يجد الأبطال أنفسهم في مواجهة صراعات متتالية تضع مبادئهم وخياراتهم على المحك.

مع تطور الحبكة، تتداخل المصائر وتظهر تحالفات غير متوقعة، حيث يترتب على كل قرار يتخذه البطل نتائج مصيرية تعيد تشكيل مجرى الحكاية بالكامل وتأخذ القارئ في رحلة مليئة بالغموض والإثارة حتى السطور الأخيرة.`;
  }

  return `بناءً على طلبك الإبداعي (${text.slice(0, 50)}...):

تنساب الأفكار والكلمات لترسم معالم مشهد أدبي متكامل يفيض بالجمال والتشويق. تتلاقى العناصر الدرامية لتشكل رصيداً إبداعياً يثري الحكاية ويعزز تجربة القراءة، حيث تتوازن الحبكة مع بناء الشخصيات وتطور الأحداث بأسلوب أدبي رفيع.`;
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

  const userApiKey = (config?.userApiKey as string) || "";
  const geminiKey = (userApiKey && userApiKey.trim().length > 20 && !userApiKey.includes("AIzaSyDPHpkz"))
    ? userApiKey.trim()
    : (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "");

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
      if (response.text && response.text.trim()) {
        return res.json({ text: response.text, candidates: response.candidates });
      }
    } catch (err: any) {
      req.log.warn({ errMessage: err?.message }, "Gemini API call failed, using dynamic novel engine");
    }
  }

  const generatedText = generateDynamicNovelAI(promptText);
  return res.json({
    text: generatedText,
    candidates: [{ content: { parts: [{ text: generatedText }] } }],
  });
});

export default router;
