import { NextRequest, NextResponse } from "next/server";
import { getFeatureStatus } from "@/lib/server/features";
import { apiError, bodyWithinLimit, clientIp, fetchWithTimeout, isSameOrigin, requestId } from "@/lib/server/http";
import { log } from "@/lib/server/logger";
import { rateLimit } from "@/lib/server/rate-limit";
import { createMarketplaceOrder, transitionMarketplaceOrder, updateMarketplaceOrder } from "@/lib/supabase-admin";
import { getUserFromAccessToken, readSessionTokens } from "@/lib/supabase/auth";
import { parseMarketplaceCart } from "@/lib/validation";

type Preference = { id?: string; init_point?: string; sandbox_init_point?: string; message?: string };

export async function POST(request: NextRequest) {
  const id = requestId(request);
  if (!getFeatureStatus("marketplace").ready) return apiError("O checkout ainda não foi ativado.", 503, id, "marketplace_disabled");
  if (!isSameOrigin(request)) return apiError("Origem não autorizada.", 403, id, "origin_denied");
  if (!bodyWithinLimit(request, 16_384)) return apiError("Solicitação muito grande.", 413, id, "body_too_large");
  const usage = rateLimit(`market-checkout:${clientIp(request)}`, 5, 15 * 60_000);
  if (!usage.allowed) return apiError("Muitas tentativas. Aguarde antes de tentar novamente.", 429, id, "rate_limited");
  const { accessToken } = await readSessionTokens();
  if (!accessToken) return apiError("Entre na sua conta para comprar.", 401, id, "auth_required");
  let user;
  try { user = await getUserFromAccessToken(accessToken); }
  catch { return apiError("Sua sessão expirou. Entre novamente.", 401, id, "session_expired"); }

  const body = await request.json().catch(() => ({})) as { items?: unknown };
  const parsedCart = parseMarketplaceCart(body.items);
  if (!parsedCart.ok) return apiError("Carrinho inválido.", 400, id, "invalid_cart");
  const items = parsedCart.items;

  let order: Awaited<ReturnType<typeof createMarketplaceOrder>> | null = null;
  try {
    const commission = Number(process.env.MARKETPLACE_COMMISSION_PERCENT || 8);
    order = await createMarketplaceOrder(user.id, items, Number.isFinite(commission) ? commission : 8);
    const origin = request.nextUrl.origin;
    const response = await fetchWithTimeout("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`, "content-type": "application/json", "x-idempotency-key": order.id },
      body: JSON.stringify({
        items: (order.items || []).map((item) => ({ id: item.product_id, title: item.title, quantity: item.quantity, currency_id: "BRL", unit_price: item.unit_price_cents / 100 })),
        payer: user.email ? { email: user.email } : undefined,
        external_reference: order.id,
        metadata: { order_id: order.id, kind: "marketplace" },
        back_urls: { success: `${origin}/marketplace/pedido?id=${order.id}`, pending: `${origin}/marketplace/pedido?id=${order.id}`, failure: `${origin}/marketplace/pedido?id=${order.id}` },
        auto_return: "approved",
        expires: true,
        expiration_date_to: new Date(Date.now() + 30 * 60_000).toISOString(),
        notification_url: `${origin}/api/mercado-pago/webhook?source_news=webhooks`,
        statement_descriptor: "NEXUS MARKET",
      }),
    }, 12_000);
    const preference = await response.json() as Preference;
    if (!response.ok || !preference.id || !preference.init_point) throw new Error(preference.message || `mercado_pago_${response.status}`);
    await updateMarketplaceOrder(order.id, { provider_reference: preference.id });
    const checkoutUrl = process.env.MERCADO_PAGO_TEST_MODE === "true" ? preference.sandbox_init_point || preference.init_point : preference.init_point;
    return NextResponse.json({ orderId: order.id, checkoutUrl, requestId: id }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    if (order) await transitionMarketplaceOrder(order.id, "cancelled").catch(() => undefined);
    log("error", "marketplace-checkout", "preference_creation_failed", { requestId: id, orderId: order?.id, error });
    return apiError("Não foi possível iniciar o pagamento. Nenhuma aprovação foi registrada.", 502, id, "checkout_unavailable");
  }
}
