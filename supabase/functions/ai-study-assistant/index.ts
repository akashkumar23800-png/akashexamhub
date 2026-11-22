const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_INPUT_LENGTH = 8000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MODEL_PREFERENCES = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"];
const MODELS_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const GEMINI_ENDPOINT = (model: string) => `${MODELS_ENDPOINT}/${model}:generateContent`;
const NOT_CONFIGURED_MESSAGE =
  "The AI Study Assistant is not configured. Add GEMINI_API_KEY to Supabase Edge Function secrets.";

type Mode = "ask" | "rewrite" | "ai-detect" | "doubt" | "planner" | "quiz" | "notes" | "performance" | "english";
const REWRITE_STYLES = ["simple", "formal", "friendly", "exam-answer", "summary"] as const;
const STYLE_INSTRUCTIONS: Record<(typeof REWRITE_STYLES)[number], string> = {
  simple: "Rewrite in simple, easy-to-understand language for a school student.",
  formal: "Rewrite in a formal, polished academic tone.",
  friendly: "Rewrite in a warm, friendly and encouraging tone.",
  "exam-answer": "Rewrite as a clear, well-structured CBSE exam answer with short points.",
  summary: "Rewrite as a short summary that keeps the key facts.",
};

type Payload = {
  mode?: Mode;
  input?: string;
  style?: string;
  classLevel?: number;
  subject?: string;
  chapter?: string;
  language?: string;
  difficulty?: string;
  availableMinutes?: number;
  topics?: string;
  history?: { role: "user" | "model"; text: string }[];
  image?: { mimeType: string; data: string };
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}
interface GeminiModelList {
  models?: { name?: string; supportedGenerationMethods?: string[] }[];
}

async function findAvailableModel(apiKey: string): Promise<string | null> {
  const response = await fetch(`${MODELS_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const modelList = (await response.json()) as GeminiModelList;
  const available = (modelList.models ?? [])
    .filter((model) => model.supportedGenerationMethods?.includes("generateContent"))
    .map((model) => model.name?.replace(/^models\//, ""))
    .filter((model): model is string => Boolean(model));
  return MODEL_PREFERENCES.find((model) => available.includes(model)) ??
    available.find((model) => model.startsWith("gemini-")) ?? null;
}

function buildInstruction(payload: Payload): { instruction: string; json: boolean } {
  const classText = payload.classLevel ? `Class ${payload.classLevel}` : "CBSE Classes 6–12";
  const subject = payload.subject || "the relevant school subject";
  const language = payload.language || "match the student's language (Hindi, English or Hinglish)";
  const chapter = payload.chapter ? ` Chapter/topic: ${payload.chapter}.` : "";
  const studyTime = payload.availableMinutes ? ` Available study time per day: ${payload.availableMinutes} minutes.` : "";
  const topics = payload.topics ? ` Topics to cover: ${payload.topics.slice(0, 3000)}.` : "";
  const context = `Student level: ${classText}. Subject: ${subject}.${chapter} Preferred response language: ${language}.${studyTime}${topics} Use age-appropriate, accurate explanations. Do not invent NCERT page numbers or claim syllabus alignment when uncertain.`;
  switch (payload.mode) {
    case "doubt":
    case "ask":
      return {
        instruction: `You are Akash Exam Hub's CBSE tutor. ${context} Explain the answer step by step, define difficult terms, use a small example where useful, and finish with a short key takeaway. If the question is ambiguous, state the assumption. For image questions, read only what is visible and ask for a clearer image if needed.`,
        json: false,
      };
    case "planner":
      return {
        instruction: `You are an evidence-aware CBSE study planner. ${context} Create a realistic daily/weekly study schedule using the student's available minutes, subjects and topics. Include breaks, revision, practice questions and buffer time. Do not promise marks. Clearly mark any assumptions and give a practical progress checklist.`,
        json: false,
      };
    case "quiz":
      return {
        instruction: `You are a CBSE question writer. ${context} Generate exactly 5 multiple-choice questions for the given chapter/topic at ${payload.difficulty || "medium"} difficulty. Return ONLY valid JSON in this schema: {"title":"...","questions":[{"question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"..."}]}. Every question must have exactly four options, correctIndex must be 0–3, and explanations must be concise. Avoid ambiguous questions.`,
        json: true,
      };
    case "notes":
      return {
        instruction: `You are a CBSE notes author. ${context} Produce chapter-focused revision notes with a short overview, key concepts, definitions, formulas or dates where relevant, common mistakes, and 5 quick-revision questions. Keep facts precise; distinguish facts from mnemonics. Use clear headings and bilingual explanations if requested.`,
        json: false,
      };
    case "performance":
      return {
        instruction: `You are a supportive academic performance analyst. ${context} Analyze only the supplied test and topic data. Identify strengths, weak areas, patterns and 3–5 concrete next actions. If there is insufficient data, say so instead of inventing trends. Do not shame the student or predict exact exam marks.`,
        json: false,
      };
    case "english":
      return {
        instruction: `You are an English teacher for CBSE Classes 6–12. ${context} Teach grammar, vocabulary, tenses, sentence formation, reading comprehension or Hindi-to-English translation at the student's level. Explain rules simply, show examples, correct errors gently and finish with 3 short practice questions. Follow the requested language.`,
        json: false,
      };
    case "rewrite":
      return {
        instruction: `You rewrite text for students. Keep the original meaning and facts. ${STYLE_INSTRUCTIONS[payload.style as keyof typeof STYLE_INSTRUCTIONS] || ""} Return only the rewritten text.`,
        json: false,
      };
    case "ai-detect":
      return {
        instruction: 'Estimate whether a text may be AI-generated. This is not reliable proof. Respond only with JSON: {"score": integer from 0 to 100, "reasoning": "two or three short sentences"}.',
        json: true,
      };
    default:
      return { instruction: `You are Akash Exam Hub's CBSE tutor. ${context}`, json: false };
  }
}

async function checkRateLimit(req: Request): Promise<boolean> {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const authorization = req.headers.get("Authorization");
  if (!url || !anonKey || !authorization) return false;
  const response = await fetch(`${url}/rest/v1/rpc/consume_ai_request_limit`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_max_requests: 20 }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) return false;
  return (await response.json()) === true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    if (!req.headers.get("Authorization")) return jsonResponse({ error: "Please sign in to use the AI Study Assistant." }, 401);
    const payload = (await req.json().catch(() => null)) as Payload | null;
    if (!payload || !["ask", "rewrite", "ai-detect", "doubt", "planner", "quiz", "notes", "performance", "english"].includes(payload.mode || "")) {
      return jsonResponse({ error: "Unknown request type." }, 400);
    }
    const mode = payload.mode!;
    const input = typeof payload.input === "string" ? payload.input.trim() : "";
    if (!input) return jsonResponse({ error: "Please provide a question or study details." }, 400);
    if (input.length > MAX_INPUT_LENGTH) return jsonResponse({ error: `Please keep your input under ${MAX_INPUT_LENGTH} characters.` }, 400);
    if (payload.classLevel !== undefined && (!Number.isInteger(payload.classLevel) || payload.classLevel < 6 || payload.classLevel > 12)) {
      return jsonResponse({ error: "Class must be between 6 and 12." }, 400);
    }
    if (payload.history && (!Array.isArray(payload.history) || payload.history.length > MAX_HISTORY_MESSAGES ||
      payload.history.some((item) => !["user", "model"].includes(item.role) || typeof item.text !== "string" || item.text.length > 4000))) {
      return jsonResponse({ error: "Conversation history is invalid or too long. Start a new chat." }, 400);
    }
    if (payload.image) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(payload.image.mimeType) || typeof payload.image.data !== "string") {
        return jsonResponse({ error: "Only PNG, JPEG and WebP images are supported." }, 400);
      }
      const approxBytes = Math.floor(payload.image.data.length * 0.75);
      if (approxBytes > MAX_IMAGE_BYTES) return jsonResponse({ error: "Please upload an image smaller than 5 MB." }, 413);
    }
    if (mode === "rewrite" && !REWRITE_STYLES.includes(payload.style as (typeof REWRITE_STYLES)[number])) {
      return jsonResponse({ error: "Choose a valid rewrite style." }, 400);
    }
    if (mode === "quiz" && !["easy", "medium", "hard"].includes(payload.difficulty || "medium")) {
      return jsonResponse({ error: "Choose easy, medium or hard difficulty." }, 400);
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) return jsonResponse({ error: NOT_CONFIGURED_MESSAGE }, 503);

    const withinLimit = await checkRateLimit(req).catch(() => false);
    if (!withinLimit) return jsonResponse({ error: "AI request limit reached or rate-limit service unavailable. Please try again in a minute." }, 429);

    const { instruction, json } = buildInstruction(payload);
    const contents: { role: "user" | "model"; parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] }[] = [];
    for (const item of payload.history ?? []) contents.push({ role: item.role, parts: [{ text: item.text }] });
    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [{ text: input }];
    if (payload.image) parts.push({ inlineData: { mimeType: payload.image.mimeType, data: payload.image.data } });
    contents.push({ role: "user", parts });

    const model = await findAvailableModel(apiKey);
    if (!model) return jsonResponse({ error: "No Gemini model with text generation is available for this API key." }, 503);

    const aiResponse = await fetch(GEMINI_ENDPOINT(model), {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: instruction }] },
        contents,
        generationConfig: {
          temperature: mode === "quiz" || mode === "ai-detect" ? 0.2 : 0.45,
          ...(json ? { responseMimeType: "application/json" } : {}),
          maxOutputTokens: mode === "quiz" ? 3000 : 2500,
        },
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      console.error("Gemini provider error", status);
      if (status === 400 || status === 403) return jsonResponse({ error: "Gemini rejected the request or API key. Check the key, model access and request format." }, 503);
      if (status === 404) return jsonResponse({ error: "The selected Gemini model is unavailable for this API key." }, 503);
      if (status === 429) return jsonResponse({ error: "Gemini is temporarily rate-limited. Please try again shortly." }, 429);
      return jsonResponse({ error: "The AI service could not answer right now. Please try again." }, 502);
    }

    const completion = (await aiResponse.json()) as GeminiResponse;
    const text = completion.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!text) return jsonResponse({ error: "The AI service returned an empty answer. Please try again." }, 502);
    return jsonResponse({ text, model });
  } catch (error) {
    console.error("ai-study-assistant failed", error);
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return jsonResponse({ error: "The AI request timed out. Please try again." }, 504);
    }
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});
