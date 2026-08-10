import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  const loginUrl = new URL("/entrar", request.url);
  loginUrl.searchParams.set("erro", "link-invalido");
  return NextResponse.redirect(loginUrl);
}
