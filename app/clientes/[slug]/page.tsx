import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedWayneSite } from "@/lib/supabase-admin";
import styles from "./site.module.css";

export const dynamic = "force-dynamic";

async function findSite(slug: string) {
  if (!/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  try { return await getPublishedWayneSite(slug); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const site = await findSite(slug);
  if (!site) return { title: "Site não encontrado — Sites Wayne", robots: { index: false, follow: false } };
  const data = site.site_data;
  return {
    title: `${data.businessName} — ${data.businessType}`,
    description: `${data.headline} Atendimento em ${data.city}.`,
    openGraph: { title: data.businessName, description: data.headline, type: "website", locale: "pt_BR" },
  };
}

export default async function ClientSitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await findSite(slug);
  if (!site) notFound();
  const data = site.site_data;
  const whatsappUrl = `https://wa.me/${data.publicWhatsApp}?text=${encodeURIComponent(`Olá! Conheci ${data.businessName} pelo site e gostaria de mais informações.`)}`;
  return (
    <div className={`${styles.site} ${styles[site.template_id]}`}>
      <header>
        <Link href={`/clientes/${slug}`}><strong>{data.businessName}</strong><small>{data.businessType}</small></Link>
        <a href={whatsappUrl} rel="noreferrer" target="_blank">Falar agora <span>↗</span></a>
      </header>
      <main>
        <section className={styles.hero}>
          <div>
            <span>ATENDIMENTO EM {data.city.toLocaleUpperCase("pt-BR")}</span>
            <h1>{data.headline}</h1>
            <p>{data.businessName} oferece atendimento claro, contato rápido e soluções pensadas para quem valoriza confiança.</p>
            <a href={whatsappUrl} rel="noreferrer" target="_blank">CHAMAR NO WHATSAPP <b>→</b></a>
          </div>
          <aside aria-label="Destaque"><i /><strong>{data.businessName.slice(0, 2).toUpperCase()}</strong><span>{data.businessType}</span></aside>
        </section>
        <section className={styles.services}>
          <header><span>O QUE FAZEMOS</span><h2>Serviços em destaque</h2></header>
          <div>{data.services.map((service, index) => <article key={service}><b>{String(index + 1).padStart(2, "0")}</b><h3>{service}</h3><p>Fale diretamente com nossa equipe para saber detalhes, disponibilidade e condições.</p></article>)}</div>
        </section>
        <section className={styles.contact}>
          <span>PRONTO PARA CONVERSAR?</span><h2>Atendimento simples e direto.</h2><p>Envie uma mensagem e explique o que você precisa.</p>
          <a href={whatsappUrl} rel="noreferrer" target="_blank">PEDIR INFORMAÇÕES <b>↗</b></a>
        </section>
      </main>
      <footer><strong>{data.businessName}</strong><span>{data.city}</span><small>Site criado por <a href="/servicos">Sites Wayne</a></small></footer>
    </div>
  );
}
