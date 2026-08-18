import { NextRequest, NextResponse } from "next/server";
import { claimStarkiaTask } from "@/lib/supabase-admin";
import { getFeatureStatus } from "@/lib/server/features";
import { clientIp } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { bearerToken, hashDeviceToken } from "@/lib/starkia/relay";

export async function POST(request: NextRequest) {
  if (!getFeatureStatus("starkia").ready) return NextResponse.json({ error: "relay_disabled" }, { status: 503 });
  const usage = rateLimit(`starkia-poll:${clientIp(request)}`, 120, 60_000);
  if (!usage.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "retry-after": String(usage.retryAfterSeconds) } });
  const token = bearerToken(request.headers.get("authorization"));
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try { return NextResponse.json(await claimStarkiaTask(hashDeviceToken(token)), { headers: { "cache-control": "no-store" } }); }
  catch { return NextResponse.json({ error: "unauthorized" }, { status: 401 }); }
}

