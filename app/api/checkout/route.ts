import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseSiteOrderInput, slugifyBusiness, waynePackages } from "@/lib/wayne-autopilot";
import { insertWayneOrder, updateWayneOrder } from "@/lib/supabase-admin";

type PreferenceResponse = { id?: string; init_point?: string; sandbox_init_point?: string; message?: string };

export async function POST(request: NextRequest) {
  let json: unknown;
  try { json = await request.json(); } catch { return NextResponse.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = parseSiteOrderInput(json);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "O pagamento automático ainda está sendo ativado.", setupRequired: true }, { status: 503 });
  }

  const { packageId, templateId, siteData, clientName, clientEmail } = parsed.data;
  const selectedPackage = waynePackages[packageId];
  const orderId = randomUUID();
  const slug = `${slugifyBusiness(siteData.businessName)}-${orderId.slice(0, 6)}`;
  const origin = request.nextUrl.origin;

  try {
    await insertWayneOrder({
      id: orderId,
      slug,
      package_id: packageId,
      template_id: templateId,
      amount_cents: selectedPackage.priceCents,
      status: "pending",
      payment_status: "preference_pending",
      client_name: clientName,
      client_email: clientEmail,
      site_data: siteData,
      consent_at: new Date().toISOString(),
    });

    const returnUrl = (status: string) => `${origin}/pedido?id=${orderId}&status=${status}`;
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        "x-idempotency-key": orderId,
      },
      body: JSON.stringify({
        items: [{
          id: packageId,
          title: `Sites Wayne — ${selectedPackage.name}`,
          description: `Criação automática de site no modelo ${templateId}`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: selectedPackage.priceCents / 100,
        }],
        payer: { name: clientName, email: clientEmail },
        external_reference: orderId,
        metadata: { order_id: orderId, site_slug: slug },
        back_urls: { success: returnUrl("success"), pending: returnUrl("pending"), failure: returnUrl("failure") },
        auto_return: "approved",
        notification_url: `${origin}/api/mercado-pago/webhook?source_news=webhooks`,
        statement_descriptor: "WAYNE SITES",
        payment_methods: { installments: 3 },
      }),
    });
    const preference = await response.json() as PreferenceResponse;
    if (!response.ok || !preference.id || !preference.init_point) throw new Error(preference.message || `mercado_pago_${response.status}`);

    await updateWayneOrder(orderId, { provider_preference_id: preference.id, payment_status: "preference_created" });
    const checkoutUrl = process.env.MERCADO_PAGO_TEST_MODE === "true" ? preference.sandbox_init_point || preference.init_point : preference.init_point;
    return NextResponse.json({ orderId, checkoutUrl });
  } catch (error) {
    await updateWayneOrder(orderId, { payment_status: "preference_error" }).catch(() => undefined);
    console.error("wayne_checkout_error", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Não foi possível iniciar o pagamento. Tente novamente." }, { status: 502 });
  }
}
