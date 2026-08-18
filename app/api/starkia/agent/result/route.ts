import { NextRequest, NextResponse } from "next/server";
import { completeStarkiaTask } from "@/lib/supabase-admin";
import { getFeatureStatus } from "@/lib/server/features";
import { bodyWithinLimit } from "@/lib/server/http";
import { bearerToken, hashDeviceToken } from "@/lib/starkia/relay";
import { isUuid } from "@/lib/validation";

export async function POST(request: NextRequest) {
  if (!getFeatureStatus("starkia").ready) return NextResponse.json({ error: "relay_disabled" }, { status: 503 });
  if (!bodyWithinLimit(request, 65_536)) return NextResponse.json({ error: "body_too_large" }, { status: 413 });
  const token = bearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { taskId?: unknown; success?: unknown; result?: unknown; errorCode?: unknown };
  if (!isUuid(body.taskId) || typeof body.success !== "boolean") return NextResponse.json({ error: "invalid_result" }, { status: 400 });
  const result = body.result && typeof body.result === "object" && !Array.isArray(body.result) ? body.result as Record<string, unknown> : null;
  const errorCode = typeof body.errorCode === "string" ? body.errorCode.slice(0, 80) : null;
  try {
    const completed = await completeStarkiaTask(hashDeviceToken(token), body.taskId, body.success, result, errorCode);
    return completed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "task_not_found" }, { status: 404 });
  } catch { return NextResponse.json({ error: "unauthorized" }, { status: 401 }); }
}
