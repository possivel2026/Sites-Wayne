import { NextRequest, NextResponse } from "next/server";
import { getWayneOrderById } from "@/lib/supabase-admin";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  try {
    const order = await getWayneOrderById(id);
    if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    return NextResponse.json({
      id: order.id,
      businessName: order.site_data.businessName,
      status: order.status,
      paymentStatus: order.payment_status,
      siteUrl: order.status === "published" ? `/clientes/${order.slug}` : null,
      healthStatus: order.last_health_status,
      updatedAt: order.updated_at,
    });
  } catch {
    return NextResponse.json({ error: "Acompanhamento indisponível." }, { status: 503 });
  }
}
