"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/app/pedido/pedido.module.css";

type Order = {
  businessName: string;
  status: "pending" | "paid" | "published" | "cancelled" | "refunded";
  paymentStatus: string;
  siteUrl: string | null;
  updatedAt: string;
};

const messages: Record<Order["status"], { title: string; detail: string }> = {
  pending: { title: "Aguardando confirmação", detail: "O pagamento ainda está sendo analisado pelo Mercado Pago." },
  paid: { title: "Pagamento aprovado", detail: "Estamos concluindo a publicação automática." },
  published: { title: "Site publicado", detail: "Tudo certo. Seu novo endereço já está disponível." },
  cancelled: { title: "Pagamento não concluído", detail: "Volte ao configurador para iniciar uma nova tentativa." },
  refunded: { title: "Pagamento estornado", detail: "O site saiu do ar após a atualização do pagamento." },
};

export function OrderStatus({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const validOrderId = /^[0-9a-f-]{36}$/i.test(orderId);

  useEffect(() => {
    if (!validOrderId) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const response = await fetch(`/api/pedidos/${orderId}`, { cache: "no-store" });
        const result = await response.json() as Order & { error?: string };
        if (!response.ok) throw new Error(result.error || "Não foi possível consultar o pedido.");
        if (!active) return;
        setOrder(result);
        setError("");
        if (result.status === "pending" || result.status === "paid") timer = setTimeout(refresh, 4000);
      } catch (requestError) {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : "Acompanhamento indisponível.");
        timer = setTimeout(refresh, 8000);
      }
    }
    refresh();
    return () => { active = false; clearTimeout(timer); };
  }, [orderId, validOrderId]);

  if (!validOrderId) return <section className={styles.status}><span className={styles.error}>!</span><h2>Link inválido.</h2><p>Este endereço não identifica um pedido do Sites Wayne.</p><Link href="/criar-site">Voltar ao configurador</Link></section>;
  if (error && !order) return <section className={styles.status}><span className={styles.error}>!</span><h2>Não conseguimos acompanhar agora.</h2><p>{error}</p><Link href="/criar-site">Voltar ao configurador</Link></section>;
  if (!order) return <section className={styles.status}><span className={styles.loader} /><h2>Consultando o pagamento...</h2><p>Você pode manter esta página aberta.</p></section>;
  const copy = messages[order.status];
  return (
    <section className={styles.status}>
      <span className={order.status === "published" ? styles.success : styles.loader}>{order.status === "published" ? "✓" : ""}</span>
      <small>{order.businessName}</small>
      <h2>{copy.title}</h2>
      <p>{copy.detail}</p>
      {order.siteUrl ? <Link className={styles.primary} href={order.siteUrl}>ABRIR MEU SITE <b>↗</b></Link> : <div className={styles.progress}><i /><span>Atualização automática ativa</span></div>}
      <em>Última atualização: {new Date(order.updatedAt).toLocaleString("pt-BR")}</em>
    </section>
  );
}
