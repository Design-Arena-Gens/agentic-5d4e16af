import { NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/core";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runAgent(body);
    return NextResponse.json({ status: "ok", result });
  } catch (error) {
    console.error("Agent error", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 },
    );
  }
}

export const runtime = "edge";
