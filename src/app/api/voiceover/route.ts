import { NextResponse } from "next/server";
import {
  DEFAULT_VOICE,
  generateSpeech,
  isVoice,
  openaiIsConfigured,
} from "@/lib/server/openai";

export const runtime = "nodejs";

/** Synthesise a voiceover for the editor.
 *  Returns the raw MP3 — the editor stashes the bytes in IndexedDB and
 *  the publish flow uploads them like screenshots. */
export async function POST(req: Request) {
  if (!openaiIsConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 503 },
    );
  }
  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const text = (body.text ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Empty text" }, { status: 400 });
  }
  const voice = isVoice(body.voice) ? body.voice : DEFAULT_VOICE;
  try {
    const mp3 = await generateSpeech(text, voice);
    return new Response(new Uint8Array(mp3), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 },
    );
  }
}

/** Lets the editor light up / dim the voiceover UI without hard-coding env. */
export async function GET() {
  return NextResponse.json({ configured: openaiIsConfigured() });
}
