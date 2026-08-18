"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { ModuleShell } from "@/components/module-shell";
import type { MarketplaceProduct } from "@/lib/marketplace";

type CartItem = { product: MarketplaceProduct; quantity: number };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function MarketplacePage({ ready, products, initialError }: { ready: boolean; products: MarketplaceProduct[]; initialError?: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialError || "");
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0), [cart]);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  function add(product: MarketplaceProduct) {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) return current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item);
      return [...current, { product, quantity: 1 }];
    });
    setDrawer(true); setMessage("");
  }

  function remove(id: string) { setCart((current) => current.filter((item) => item.product.id !== id)); }

  async function checkout() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/marketplace/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })) }) });
      const data = await response.json() as { checkoutUrl?: string; error?: string };
      if (!response.ok || !data.checkoutUrl) throw new Error(data.error || "Não foi possível iniciar o pagamento.");
      window.location.assign(data.checkoutUrl);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Pagamento indisponível."); setDrawer(false); }
    finally { setLoading(false); }
  }

  return <ModuleShell active="/marketplace" eyebrow="NEXUS MARKET" title="Produtos reais. Pagamento conferido no servidor." description="Os anúncios abaixo vêm do banco publicado; preço, estoque e total são recalculados antes de abrir o Mercado Pago." action={ready ? <button className="cart-button" onClick={() => setDrawer(true)}>Carrinho <span>{count}</span></button> : undefined}>
    {!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Marketplace aguardando ativação</strong><p>A vitrine e o checkout real estão implementados, mas só serão abertos quando Supabase, Mercado Pago, webhook e feature flag estiverem configurados.</p></div></section> : <>
      <div className="market-banner"><div><span>VENDA NO NEXUS</span><strong>Somente ofertas publicadas.</strong><p>Produtos sem vendedor e status válido nunca aparecem na vitrine.</p></div><a href="/conta">Área do cliente</a></div>
      {message && <div className="inline-alert">{message}</div>}
      {products.length ? <div className="product-grid live-products">{products.map((product) => <article key={product.id}><div className="product-art violet">{product.images[0] ? <img src={product.images[0]} alt="" loading="lazy"/> : <span>▣</span>}<em>OFERTA ATIVA</em></div><span>Produto publicado</span><h2>{product.title}</h2><p><small>{product.description.slice(0, 120)}</small></p><div><strong>{money.format(product.priceCents / 100)}</strong><button disabled={product.inventory === 0} onClick={() => add(product)}>{product.inventory === 0 ? "Sem estoque" : "Adicionar"}</button></div></article>)}</div> : <div className="empty-catalog">Nenhuma oferta real foi publicada ainda.</div>}
    </>}
    {drawer && <div className="drawer-backdrop" onMouseDown={() => setDrawer(false)}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><header><strong>Seu carrinho</strong><button onClick={() => setDrawer(false)}>×</button></header>{cart.length ? <>{cart.map((item) => <article key={item.product.id}><div className="mini-product violet">▣</div><p><strong>{item.product.title}</strong><small>{item.quantity} × {money.format(item.product.priceCents / 100)}</small></p><button onClick={() => remove(item.product.id)}>Remover</button></article>)}<div className="cart-total"><span>Total conferido no checkout</span><strong>{money.format(total / 100)}</strong></div><button className="checkout-button" onClick={checkout} disabled={loading}>{loading ? "Abrindo Mercado Pago…" : "Pagar com Mercado Pago"}</button><small>Você precisa entrar. O navegador nunca define preços ou status de pagamento.</small></> : <div className="empty-cart"><span>▣</span><strong>Seu carrinho está vazio</strong><small>Adicione uma oferta publicada para continuar.</small></div>}</aside></div>}
  </ModuleShell>;
}

