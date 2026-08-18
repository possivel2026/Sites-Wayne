import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseSiteOrderInput, slugifyBusiness, waynePackages } from "@/lib/wayne-autopilot";
import { insertWayneOrder, updateWayneOrder } from "@/lib/supabase-admin";
import { apiError, bodyWithinLimit, clientIp, fetchWithTimeout, isSameOrigin, requestId } from "@/lib/server/http";
import { log } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rate-limit";

type PreferenceResponse = { id?: string; init_point?: string; sandbox_init_point?: string; message?: string };

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!isSameOrigin(request)) return apiError("Origem não autorizada.", 403, id, "origin_denied");
  if (!bodyWithinLimit(request, 32_768)) return apiError("Solicitação muito grande.", 413, id, "body_too_large");
  const usage = rateLimit(`checkout:${clientIp(request)}`, 5, 15 * 60_000);
  if (!usage.allowed) return NextResponse.json({ error: "Muitas tentativas. Aguarde antes de tentar novamente.", code: "rate_limited", requestId: id }, { status: 429, headers: { "retry-after": String(usage.retryAfterSeconds) } });
  let json: unknown;
  try { json = await request.json(); } catch { return apiError("Dados inválidos.", 400, id, "invalid_json"); }
  const parsed = parseSiteOrderInput(json);
  if (!parsed.ok) return apiError(parsed.error, 400, id, "invalid_order");

  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "O pagamento automático ainda está sendo ativado.", setupRequired: true, requestId: id }, { status: 503, headers: { "cache-control": "no-store" } });
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
    const response = await fetchWithTimeout("https://api.mercadopago.com/checkout/preferences", {
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
    }, 12_000);
    const preference = await response.json() as PreferenceResponse;
    if (!response.ok || !preference.id || !preference.init_point) throw new Error(preference.message || `mercado_pago_${response.status}`);

    await updateWayneOrder(orderId, { provider_preference_id: preference.id, payment_status: "preference_created" });
    const checkoutUrl = process.env.MERCADO_PAGO_TEST_MODE === "true" ? preference.sandbox_init_point || preference.init_point : preference.init_point;
    return NextResponse.json({ orderId, checkoutUrl, requestId: id }, { headers: { "cache-control": "no-store", "x-request-id": id } });
  } catch (error) {
    await updateWayneOrder(orderId, { payment_status: "preference_error" }).catch(() => undefined);
    log("error", "wayne-checkout", "preference_creation_failed", { requestId: id, orderId, error });
    return apiError("Não foi possível iniciar o pagamento. Tente novamente.", 502, id, "checkout_unavailable");
  }
}
