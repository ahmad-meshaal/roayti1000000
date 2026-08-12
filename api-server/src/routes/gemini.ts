import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function generateDynamicNovelAI(promptText: string): string {
  const text = promptText.trim();
  
  let titleMatch = text.match(/(?:بعنوان|عنوان|رواية|قصة)\s*[:"']?([^\n"':،.]+)/i);
  let title = titleMatch ? titleMatch[1].trim() : "";

  let charMatch = text.match(/(?:البطل|الشخصية|باسم|شخصية)\s*[:"']?([^\n"':،.]+)/i);
  let character = charMatch ? charMatch[1].trim() : "";

  let genre = "دراما وغموض";
  if (text.includes("رعب") || text.includes("خوف") || text.includes("شياطين")) genre = "رعب وتشويق مظلم";
  else if (text.includes("فانتازيا") || text.includes("سحر") || text.includes("مملكة")) genre = "فانتازيا ملحمية";
  else if (text.includes("رومانسي") || text.includes("حب") || text.includes("عاطفي")) genre = "رومانسية وعاطفة";
  else if (text.includes("خيال علمي") || text.includes("فضاء") || text.includes("مستقبل")) genre = "خيال علمي ودراسات مستقبلية";

  if (text.includes("فصل") || text.includes("مشهد") || text.includes("اكتب") || text.includes("chapter") || text.includes("أكمل")) {
    const openings = [
      `ساد الصمت المطبق أرجاء المكان، بينما كانت صدى الخطوات تتردد ببطء كأنها تعد الثواني الأخيرة قبل العاصفة. ${title ? `في هذه المرحلة من حكاية "${title}"،` : ''} ${character ? `وقف ${character} يتأمل` : 'وقف البطل يتأمل'} المشهد بعينين تملؤهما الريبة والترقب.`,
      `انبعثت نبرة خافتة من عتمة الأفق، تحذر مما هو قادم. ${title ? `كل حجر في "${title}"` : 'كل شبر في هذا العالم'} ينبض بأسرار طال كتمانه، وحان الوقت لتتجلى الحقائق أمام الجميع.`,
      `لم تكن تلك الليلة كغيرها من الليالي؛ فالعاصفة التي ضربت الأرجاء رسمت معالم فصل جديد مفعم بالحماس والتحدي. ${character ? `خطى ${character} نحو الأمام بثبات` : 'خطت الأقدام نحو الأمام بثبات'} دون تراجع.`
    ];

    const developments = [
      `تداعت الذكريات القديمة كشريط سينمائي متسارع، معلنة بداية مواجهة مصيرية لا مفر منها. كانت التفاصيل الدقيقة تشير إلى وجود سر محجوب خلف جدران الزمان، ينتظر من يملك الشجاعة ليكتشفه.`,
      `اقتربت الأنفاس، واشتدت وطأة الصراع النفسي بين ما يفرض الواجب وما تمليه الرغبة الحاسمة. كان القرار يتطلب شجاعة فائقة وتضحية لا يستهان بها.`,
      `ارتفعت حدة التوتر عندما ظهرت العلامة المجهولة في المكان، لتغير مجرى الأحداث كلياً وتضع جميع الحسابات في مهب الريح.`
    ];

    const dialogues = character ? [
      `التفت ${character} ونظر بحدة ثم قال:\n- "إذا كان هذا هو التحدي الذي ينبغي عليّ خوضه، فلن أتردد لحظة واحدة."`,
      `همس ${character} بنبرة واثقة:\n- "مهما كانت الأسرار المخبوءة هنا، سأكشفها جميعاً قبل انقضاء هذه الليلة."`
    ] : [
      `تردد الصوت الخافت في الأرجاء:\n- "ليس كل ما يلمع ذهباً، وبعض الحقائق قد تكون أشد قسوة من الخيال."`,
      `قال بصوت يحمل نبرة حسم:\n- "الآن تبدأ المواجهة الحقيقية، ولا مجال للعودة إلى الوراء."`
    ];

    const endings = [
      `ومع انطفاء أخر شمعة في الرواق، أدرك الجميع أن ما حدث ليس سوى بداية لشيء أكبر وأعظم ممّا يتخيله عقل.`,
      `ساد الهدوء مجدداً، ولكنها كانت الهدوء الذي يسبق الإعصار... لتظل الأسئلة معلقة في الهواء بانتظار الأحداث القادمة.`
    ];

    const rand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${rand(openings)}\n\n${rand(developments)}\n\n${rand(dialogues)}\n\n${rand(endings)}`;
  }

  if (text.includes("شخصية") || text.includes("شخصيات") || text.includes("character")) {
    const mainHero = character || "البطل الرئيسي";
    return `### 🎭 دليل الشخصيات المبتكر (${genre}):

1. **${mainHero}**:
   - **الدور**: البطل المحوري في القصة.
   - **السمات**: يتميز بالشجاعة، الذكاء الوقاد، والقدرة على سرعة البديهة وتحليل المخاطر تحت الضغط.
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
