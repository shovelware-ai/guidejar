import { NextResponse } from "next/server";
import { translateStep, openaiIsConfigured } from "@/lib/server/openai";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ configured: openaiIsConfigured() });
}

export async function POST(req: Request) {
  if (!openaiIsConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 503 },
    );
  }
  let body: {
    targetLanguage?: string;
    title?: string;
    description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const targetLanguage = (body.targetLanguage ?? "").trim();
  if (!targetLanguage) {
    return NextResponse.json(
      { error: "targetLanguage is required" },
      { status: 400 },
    );
  }
  try {
    const out = await translateStep({
      targetLanguage,
      title: body.title ?? "",
      description: body.description ?? "",
    });
    return NextResponse.json(out);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Translation failed" },
      { status: 500 },
    );
  }
}
