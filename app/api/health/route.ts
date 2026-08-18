import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { publicFeatureSummary } from "@/lib/server/features";

export const dynamic = "force-dynamic";

export function GET() {
  const checks = {
    application: "operational",
    database: isSupabaseConfigured() ? "configured" : "inactive",
    payments: process.env.MERCADO_PAGO_ACCESS_TOKEN && process.env.MERCADO_PAGO_WEBHOOK_SECRET ? "configured" : "inactive",
    artificialIntelligence: process.env.AI_API_URL && process.env.AI_API_KEY ? "configured" : "inactive",
  } as const;
  const features = publicFeatureSummary();
  const limited = checks.database === "inactive" || checks.payments === "inactive";
  return NextResponse.json({ status: limited ? "limited" : "operational", timestamp: new Date().toISOString(), checks, features }, {
    headers: { "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}
