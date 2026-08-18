import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceOrderById } from "@/lib/supabase-admin";
import { getUserFromAccessToken, readSessionTokens } from "@/lib/supabase/auth";
import { isUuid } from "@/lib/validation";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  const { accessToken } = await readSessionTokens();
  if (!accessToken) return NextResponse.json({ error: "Entre para ver o pedido." }, { status: 401 });
  try {
    const user = await getUserFromAccessToken(accessToken);
    const order = await getMarketplaceOrderById(id);
    if (!order || order.buyer_id !== user.id) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    return NextResponse.json({ order }, { headers: { "cache-control": "no-store" } });
  } catch { return NextResponse.json({ error: "Não foi possível consultar o pedido." }, { status: 502 }); }
}
