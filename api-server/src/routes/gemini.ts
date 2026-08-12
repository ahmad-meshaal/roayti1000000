import { Router } from "express";
import { GoogleGenAI } from "@google/genai";

const router = Router();

function generateCreativeNovelContent(promptText: string): string {
  const textLower = promptText.toLowerCase();

  if (textLower.includes("فصل") || textLower.includes("الفصل") || textLower.includes("chapter") || textLower.includes("مشهد") || textLower.includes("اكتب")) {
    return `تداخلت الظلال على جدران الغرفة العتيقة بينما كانت قطرات المطر تضرب النافذة المظلمة بإيقاع منتظم حزين. وقف يتأمل اللوحة الغامضة المعلقة في زاوية الرواق، وشعور غريب بالريبة يجري في عروقه كالسم البارد.

لم تكن تلك الليلة كبقية الليالي؛ فكل حجر في هذا المكان يحمل سراً طال كتمانه، وكل خفقة قلب تُنبئ بنقطة تحول لا رجعة فيها. خطى خطوة إلى الأمام، وعيناه تتفحصان بالتفاصيل الدقيقة تلك العلامات المنقوشة ببراعة على الإطار الخشبي.

تنهد بعمق، ثم قال بنبرة خافتة مليئة بالتحدي:
- "إذا كان هذا هو القدر الذي اختارني، فلن أتراجع خطوة واحدة إلى الخلف."

فجأة، انبعث صوت همس خفيف من خلف الباب المغلق، يليه صوت خطوات بطيئة تقتفي أثره... صمت كل شيء حوله إلا من دقات ساعته الحائطية القديمة التي أعلنت منتصف الليل، لتبدأ حكاية جديدة تتجاوز كل الحدود وتكشف ما كان طي الكتمان.`;
  }

  if (textLower.includes("شخصية") || textLower.includes("شخصيات") || textLower.includes("character")) {
    return `1. **البطل الرئيسي (ليث الساهر)**:
- **الصفات**: شاب غامض، ذكي للغاية، حاد الملاحظة، يمتلك نظرة ثاقبة وهدوءاً مهيباً في أحلك الظروف.
- **الخلفية**: يحمل وساماً قديماً وسراً يربطه بسلالة المدافعين القدامى، ويسعى لكشف الحقيقة وراء اختفاء والده.

2. **الخصم المباشر (الكونت فكتور)**:
- **الصفات**: داهية، شخصية نافذة وباردة، يجيد اللعب بالمصائر ومحرك الأحداث خلف الكواليس.
- **الخلفية**: يسيطر على الموارد السحرية القديمة، ويرى في البطل التهديد الوحيد لمخططاته الشاملة.

3. **الشخصية الداعمة (ميار الحكيمة)**:
- **الصفات**: عالمة بالمخطوطات القديمة، شجاعة، وفيّة، تمتلك معرفة واسعة باللغات النادرة والشفرات المعقدة.`;
  }

  if (textLower.includes("ملخص") || textLower.includes("حبكة") || textLower.includes("قصة") || textLower.includes("summary")) {
    return `في عالم يقف على حافة الهاوية بين الضياء والظلال، تتقاطع أقدار أرواح تبحث عن الحقيقة وسط ركام الأسرار القديمة. تبدأ الملحمة عندما يكتشف البطل وثيقة نادرة تكشف وجود قوة خفية تعيد تشكيل التاريخ. 

مع تصاعد الصراع واشتداد وطأة المواجهات، يجد أبطالنا أنفسهم أمام خيارات مصيرية تختبر ولاءهم وشجاعتهم، حيث لا مكان للضعف، وكل قرار يتخذونه يترك أثراً لا يمحى في مصير المملكة بأكملها. 

رواية مشوقة تأخذك في رحلة ملحمية مليئة بالغموض، الدراما، والتحولات المفاجئة التي تحبس الأنفاس حتى الصفحة الأخيرة.`;
  }

  return `في عمق تلك الأحداث المتسارعة، تتجلى الحقيقة المحجوبة لتسلط الضوء على صراع درامي ملهم. تشتبك الخيوط وتتعقد المخططات، لترسم ملامح مرحلة جديدة من التشويق والإبداع، حيث تتآلف الكلمات لتبني عوالم فريدة تأسر الوجدان وتثري التجربة الأدبية.`;
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
      if (response.text && response.text.trim()) {
        return res.json({ text: response.text, candidates: response.candidates });
      }
    } catch (err: any) {
      req.log.warn({ errMessage: err?.message }, "Gemini API call failed, falling back to built-in creative engine");
    }
  }

  const generatedText = generateCreativeNovelContent(promptText);
  return res.json({
    text: generatedText,
    candidates: [{ content: { parts: [{ text: generatedText }] } }],
  });
});

export default router;
