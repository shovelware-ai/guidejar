import OpenAI from "openai";

/** The six voices we expose in the UI. OpenAI supports more; this is a clean
 *  default subset that maps 1:1 to the names users see in docs. */
export const VOICES = [
  "alloy",
  "echo",
  "fable",
  "onyx",
  "nova",
  "shimmer",
] as const;
export type Voice = (typeof VOICES)[number];
export const DEFAULT_VOICE: Voice = "alloy";

export function isVoice(v: unknown): v is Voice {
  return typeof v === "string" && (VOICES as readonly string[]).includes(v);
}

/** AI features (voiceover, translation) are opt-in: if no key is set, the
 *  server returns 503 and the editor disables the UI rather than failing
 *  later in the OpenAI client. */
export function openaiIsConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

let cachedClient: OpenAI | null = null;
function client(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return cachedClient;
}

/**
 * Generate spoken audio from text. Returns MP3 bytes.
 * `text` is hard-capped here (4096 chars matches OpenAI's TTS limit) to give
 * a clearer error than the API would.
 */
export async function generateSpeech(
  text: string,
  voice: Voice = DEFAULT_VOICE,
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Nothing to read aloud.");
  if (trimmed.length > 4096) {
    throw new Error("Voiceover text is too long (max 4096 characters).");
  }
  const res = await client().audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice,
    input: trimmed,
    response_format: "mp3",
  });
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

/**
 * Translate a step's title + description into the target language.
 * Both fields go in one call so the model can preserve a consistent tone.
 * The JSON-shaped response is parsed; on parse failure we surface a clear
 * error rather than feeding garbage back to the caller.
 */
export async function translateStep(args: {
  targetLanguage: string;
  title: string;
  description: string;
}): Promise<{ title: string; description: string }> {
  const { targetLanguage, title, description } = args;
  if (!title.trim() && !description.trim()) {
    return { title: "", description: "" };
  }
  const completion = await client().chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You translate short UI walkthrough copy. Return JSON with keys `title` and `description` only — no extra commentary. Preserve placeholders, button names, and product names verbatim. Match the source's tone and brevity.",
      },
      {
        role: "user",
        content: JSON.stringify({
          target_language: targetLanguage,
          title,
          description,
        }),
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content ?? "{}";
  let parsed: { title?: unknown; description?: unknown };
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Translation model returned malformed JSON.");
  }
  return {
    title: typeof parsed.title === "string" ? parsed.title : title,
    description:
      typeof parsed.description === "string" ? parsed.description : description,
  };
}
