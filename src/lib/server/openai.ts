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

/** Voiceover is opt-in: if no key is set, the server returns 503 and the
 *  editor disables the UI rather than failing later in the OpenAI client. */
export function tts_isConfigured(): boolean {
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
