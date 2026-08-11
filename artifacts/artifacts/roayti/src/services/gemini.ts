const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateWithRetry = async (params: any, _provider: 'openai' | 'gemini' = 'gemini', retries = 3, backoff = 15000): Promise<any> => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL || '/'}api/gemini/generate`.replace('//', '/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: response.statusText }));
      const error: any = new Error(err?.error || 'Gemini request failed');
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    const isRateLimit = error?.status === 429;

    if (isRateLimit && retries > 0 && !error.message?.includes('الحد اليومي')) {
      console.warn(`Rate limit hit, retrying in ${backoff / 1000}s... (${retries} retries left)`);
      await delay(backoff);
      return generateWithRetry(params, _provider, retries - 1, backoff * 1.5);
    }

    throw error;
  }
};

const ai = {
  models: {
    generateContent: async (params: any, provider: 'openai' | 'gemini' = 'gemini') => {
      return generateWithRetry(params, provider);
    }
  }
};

export const generatePlot = async (
  title: string, 
  genre: string, 
  summary: string, 
  language: string = 'ar', 
  violenceLevel: string = 'none', 
  moralTone: string = 'neutral',
  previousPartSummary?: string
) => {
  try {
    const isEnglish = language === 'en';
    const prompt = `You are a world-class novelist. Help me develop an evocative, immersive plot for a novel titled "${title}" in the genre "${genre}". 
    Current Summary: ${summary}
    ${previousPartSummary ? `This is a sequel (Part 2). Summary of the previous part: ${previousPartSummary}` : ''}
    
    ATMOSPHERIC WRITING GUIDELINES:
    - Style: Atmospheric, sensory, and emotionally resonant.
    - Identity: Focus on a "Noir" or high-literary aesthetic.
    
    Please provide:
    1. A deeply immersive and detailed plot structure (Beginning, Middle, End).
    2. Nuanced descriptions for three main characters with their internal conflicts.
    3. Three main thematic concepts or descriptive tags (e.g., "Silence — Betrayal — Redemption").
    4. Atmospheric ideas for the first five chapters.
    
    Provide the response in ${isEnglish ? 'English' : 'Arabic (فصحى بليغة وشاعرية)'} using beautiful Markdown formatting.
    - Violence Level: ${violenceLevel}
    - Moral Tone: ${moralTone}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("generatePlot error:", error);
    throw error;
  }
};

export const suggestCharacter = async (novelContext: string, characterRole: string, language: string = 'ar') => {
  try {
    const isEnglish = language === 'en';
    const prompt = `Based on the following novel context: "${novelContext}"
    Suggest a character playing the role of "${characterRole}".
    Provide Name, Traits, and Motivations.
    Provide the response in ${isEnglish ? 'English' : 'Arabic'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("suggestCharacter error:", error);
    throw error;
  }
};

export const generateChapterContent = async (
  novelTitle: string, 
  chapterTitle: string, 
  context: string, 
  previousChaptersSummary: string,
  chapterDescription?: string,
  language: string = 'ar',
  violenceLevel: string = 'none',
  moralTone: string = 'neutral',
  previousPartSummary?: string
) => {
  try {
    const isEnglish = language === 'en';
    const prompt = `You are a world-class novelist. Write a chapter for a novel titled "${novelTitle}".
    Chapter Title: "${chapterTitle}"
    ${chapterDescription ? `Chapter Description/Outline: "${chapterDescription}"` : ''}
    Novel Context: "${context}"
    Summary of previous chapters: "${previousChaptersSummary}"
    ${previousPartSummary ? `This is a sequel (Part 2). Summary of the previous part: ${previousPartSummary}` : ''}
    
    ATMOSPHERIC WRITING REQUIREMENTS:
    - Tone: Deeply immersive, sensory, and high-literary (Arabic: فصحى بليغة وشاعرية جداً).
    - Sensory Detail: Focus on lighting, smells, and the subtle movements of the environment (e.g., shadows, creaks, the weight of the air).
    - Pacing: Slow and atmospheric. Do not rush the plot; focus on the intensity of the moment and internal monologue.
    - Formatting: Use standard literary Markdown. For dialogue, use "— " (em-dash) for a classic high-literary look.
    - Narrative Style: Use a "Classic Novel" style (نمط الروايات الكلاسيكية), avoiding modern terminology and focusing on evocative imagery.
    
    LENGTH:
    - This is a LONG chapter. Expanding on every detail is MANDATORY. Aim for at least 6000 characters by detailed descriptive writing and extensive dialogue/internal reflection.
    
    Write in ${isEnglish ? 'English' : 'Arabic (فصحى بليغة وشاعرية جداً)'}.
    - Violence Level: ${violenceLevel}
    - Moral Tone: ${moralTone}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("generateChapterContent error:", error);
    throw error;
  }
};

export const generateShortSummary = async (title: string, genre: string, fullSummary: string, language: string = 'ar') => {
  try {
    const isEnglish = language === 'en';
    const prompt = `You are a professional book marketer. Write a short, catchy, and intriguing description for a novel titled "${title}" in the genre "${genre}".
    Full Summary: "${fullSummary}"
    
    The description should be concise (around 2-3 sentences) and designed to hook potential readers.
    
    Provide the response in ${isEnglish ? 'English' : 'Arabic (فصحى جذابة)'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("generateShortSummary error:", error);
    throw error;
  }
};


export const generateChapterDescription = async (novelTitle: string, novelSummary: string, chapterTitle: string, language: string = 'ar') => {
  try {
    const isEnglish = language === 'en';
    const prompt = `You are a creative writing assistant. Based on the novel titled "${novelTitle}" and its summary: "${novelSummary}", 
    suggest a detailed outline or description for a chapter titled "${chapterTitle}".
    The description should include key events, character interactions, and the emotional tone of the chapter.
    
    Provide the response in ${isEnglish ? 'English' : 'Arabic (فصحى بليغة)'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("generateChapterDescription error:", error);
    throw error;
  }
};

export const suggestChapterTitle = async (novelTitle: string, novelSummary: string, chapterContent: string, language: string = 'ar') => {
  try {
    const isEnglish = language === 'en';
    const prompt = `You are a creative novelist. Based on the novel titled "${novelTitle}" and its summary: "${novelSummary}", 
    suggest a short, catchy, and meaningful title for a chapter with the following content:
    "${chapterContent.substring(0, 2000)}"
    
    Provide only the suggested title without any introduction or explanation.
    The title should be in ${isEnglish ? 'English' : 'Arabic'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text.trim();
  } catch (error: any) {
    console.error("suggestChapterTitle error:", error);
    throw error;
  }
};

export const generateAvatar = async (name: string, bio: string, customDescription?: string) => {
  try {
    const prompt = customDescription 
      ? `أنت مصمم شخصيات محترف. بناءً على هذا الوصف المخصص من المستخدم: "${customDescription}"، اكتب وصفاً دقيقاً ومفصلاً باللغة الإنجليزية ليتم استخدامه كمطالبة (Prompt) لتوليد صورة ملف شخصي (Avatar) فنية وراقية بأسلوب "Raphael AI style". 
         يجب أن يحترم الوصف رغبة المستخدم في "${customDescription}".
         اجعل الوصف باللغة الإنجليزية فقط وبدون أي مقدمات.`
      : `أنت مصمم شخصيات محترف. بناءً على اسم المستخدم "${name}" ونبذته التعريفية "${bio}"، اكتب وصفاً دقيقاً ومفصلاً باللغة الإنجليزية ليتم استخدامه كمطالبة (Prompt) لتوليد صورة ملف شخصي (Avatar) فنية وراقية بأسلوب "Raphael AI style". 
         يجب أن يكون الوصف فنياً، يركز على ملامح الوجه التعبيرية، الإضاءة، والنمط البصري (مثلاً: أبيض وأسود، رسم زيتي، تصوير سينمائي). 
         اجعل الوصف باللغة الإنجليزية فقط وبدون أي مقدمات.`;

    const promptResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');
    
    const imagePrompt = promptResponse.text;
    const imagePromptFull = `A professional artistic profile picture avatar. Raphael AI style, masterpiece, high resolution, professional design, cinematic lighting, artistic style, ${imagePrompt}`;
    
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: imagePromptFull }] }]
    }, 'gemini');

    const candidate = imageResponse.candidates?.[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
        console.error("No candidates or content found in image response", imageResponse);
        throw new Error('No image data returned from AI');
    }

    for (const part of candidate.content.parts) {
      if ((part as any).inlineData) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
    
    console.error("No inline data found in image response parts", candidate.content.parts);
    throw new Error('No image data returned from AI');
  } catch (error: any) {
    console.error("generateAvatar error:", error);
    throw error;
  }
};

export const chatAboutNovel = async (
  novelTitle: string,
  novelSummary: string,
  chapters: any[],
  history: { role: 'user' | 'model', text: string }[],
  message: string,
  language: string = 'ar'
) => {
  try {
    const isEnglish = language === 'en';
    const contextSnippet = chapters.slice(0, 5).map(ch => `Chapter ${ch.order}: ${ch.title}\n${ch.content.substring(0, 500)}...`).join('\n\n');

    const prompt = `You are an expert literary critic and a fan of the novel "${novelTitle}". 
    Novel Summary: ${novelSummary}
    
    Context from chapters:
    ${contextSnippet}
    
    History of conversation:
    ${JSON.stringify(history)}
    
    User Message: ${message}
    
    Your goal is to discuss the novel with the reader, answer their questions about the plot, characters, and themes, and provide insightful analysis. 
    Stay in character as a knowledgeable and enthusiastic guide to this specific book.
    Provide responses in ${isEnglish ? 'English' : 'Arabic'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("chatAboutNovel error:", error);
    throw error;
  }
};

export const editChapterContent = async (
  novelTitle: string,
  chapterTitle: string,
  currentContent: string,
  prompt: string,
  language: string = 'ar'
) => {
  try {
    const isEnglish = language === 'en';
    const fullPrompt = `You are a professional editor and creative writer. I have a chapter from a novel titled "${novelTitle}".
    Chapter Title: "${chapterTitle}"
    
    Current Content:
    "${currentContent.substring(0, 5000)}"
    
    User Request: "${prompt}"
    
    CRITICAL INSTRUCTIONS:
    1. PRESERVE the original length and detail of the content. Do NOT summarize unless explicitly asked.
    2. Rewrite or modify the content according to the user's request while keeping the same literary style and tone. 
    3. If the request is to change a character's name, age, or any specific detail, ensure it is consistently updated throughout the text.
    4. Return ONLY the modified content without any introduction, explanation, or conversational text.
    
    The content should be in ${isEnglish ? 'English' : 'Arabic'}.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
    }, 'gemini');

    return response.text.trim();
  } catch (error: any) {
    console.error("editChapterContent error:", error);
    throw error;
  }
};

export const continueChapterContent = async (
  novelTitle: string,
  chapterTitle: string,
  existingContent: string,
  language: string = 'ar',
  violenceLevel: string = 'none',
  moralTone: string = 'neutral'
) => {
  try {
    const isEnglish = language === 'en';
    const lastPart = existingContent.slice(-3000);
    const prompt = `You are a world-class novelist. Continue writing the following chapter for a novel titled "${novelTitle}".
    Chapter Title: "${chapterTitle}"
    
    Last part of existing content (continue seamlessly from exactly where it ends):
    "${lastPart}"
    
    CRITICAL REQUIREMENTS:
    - Continue EXACTLY from where the text ends. Do NOT repeat, summarize, or introduce what came before.
    - Maintain the EXACT same literary style, tone, voice, and atmosphere.
    - Be immersive and atmospheric. Aim for at least 2000 characters of continuation.
    - Use the same language: ${isEnglish ? 'English' : 'Arabic (فصحى بليغة وشاعرية)'}.
    - Violence Level: ${violenceLevel}
    - Moral Tone: ${moralTone}
    
    Output ONLY the continuation text. No title, no introduction, no explanation.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("continueChapterContent error:", error);
    throw error;
  }
};

export const generateText = async (prompt: string, config?: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config
    }, 'gemini');

    return response.text;
  } catch (error: any) {
    console.error("generateText error:", error);
    throw error;
  }
};

export const moderateContent = async (content: string): Promise<{ isSafe: boolean; reason?: string }> => {
  try {
    const prompt = `You are a content moderator. Check if the following content is safe and appropriate for a creative writing platform.
    Content: "${content.substring(0, 500)}"
    
    Respond with JSON only: {"isSafe": true/false, "reason": "optional reason if not safe"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    }, 'gemini');

    try {
      const result = JSON.parse(response.text.replace(/```json\n?|\n?```/g, '').trim());
      return result;
    } catch {
      return { isSafe: true };
    }
  } catch (error: any) {
    console.error("moderateContent error:", error);
    return { isSafe: true };
  }
};
