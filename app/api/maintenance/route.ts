import { NextRequest, NextResponse } from "next/server";
import { listPublishedWayneSites, updateWayneOrder } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : request.nextUrl.origin);
  try {
    const sites = await listPublishedWayneSites(100);
    const checkedAt = new Date().toISOString();
    const results = await Promise.all(sites.map(async (site) => {
      let status = "offline";
      try {
        const response = await fetch(`${baseUrl}/clientes/${site.slug}`, { redirect: "manual", cache: "no-store" });
        status = response.ok ? "online" : `http_${response.status}`;
      } catch { status = "offline"; }
      await updateWayneOrder(site.id, { last_health_status: status, last_health_check_at: checkedAt });
      return { slug: site.slug, status };
    }));
    return NextResponse.json({ checkedAt, sites: results.length, results });
  } catch (error) {
    console.error("wayne_maintenance_error", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Falha na manutenção automática." }, { status: 500 });
  }
}
