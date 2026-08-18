"use client";

import { useEffect, useState } from "react";
import { ModuleShell } from "@/components/module-shell";

type Order = { id: string; status: string; total_cents: number; order_items?: Array<{ title_snapshot: string; unit_price_cents: number; quantity: number }> };
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function MarketplaceOrderStatus({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState(id ? "Consultando o pagamento…" : "Pedido inválido.");
  useEffect(() => {
    let active = true; let timer: number | undefined;
    async function load() {
      const response = await fetch(`/api/marketplace/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
      const data = await response.json() as { order?: Order; error?: string };
      if (!active) return;
      if (!response.ok || !data.order) { setMessage(data.error || "Pedido não encontrado."); return; }
      setOrder(data.order); setMessage("");
      if (["pending", "processing"].includes(data.order.status)) timer = window.setTimeout(load, 5_000);
    }
    if (id) load();
    return () => { active = false; if (timer) window.clearTimeout(timer); };
  }, [id]);
  return <ModuleShell active="/marketplace" eyebrow="STATUS DO PEDIDO" title="Pagamento verificado pelo servidor." description="A confirmação depende do webhook assinado e da consulta direta ao Mercado Pago."><div className="market-order-card">{message ? <p>{message}</p> : order && <><span className={`order-state ${order.status}`}>{label(order.status)}</span><h2>{money.format(order.total_cents / 100)}</h2><small>Pedido {order.id}</small><div>{(order.order_items || []).map((item) => <p key={item.title_snapshot}><strong>{item.title_snapshot}</strong><span>{item.quantity} × {money.format(item.unit_price_cents / 100)}</span></p>)}</div>{order.status === "pending" && <em>Aguardando confirmação do provedor. Esta página será atualizada automaticamente.</em>}{order.status === "paid" && <em>Pagamento aprovado. O vendedor já pode iniciar o atendimento.</em>}<a href="/marketplace">Voltar ao marketplace</a></>}</div></ModuleShell>;
}

function label(status: string) {
  return ({ pending: "AGUARDANDO PAGAMENTO", paid: "PAGAMENTO APROVADO", processing: "EM PROCESSAMENTO", completed: "CONCLUÍDO", cancelled: "CANCELADO", refunded: "REEMBOLSADO" } as Record<string,string>)[status] || status.toUpperCase();
}
