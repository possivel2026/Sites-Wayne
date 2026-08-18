"use client";

import { FormEvent, useState } from "react";
import { ModuleShell } from "@/components/module-shell";
import styles from "./servicos.module.css";

const packages = [
  {
    name: "Essencial",
    price: "R$ 297",
    description: "Para validar uma oferta e começar a receber contatos.",
    features: ["Página de alta conversão", "Versão para celular", "CTA para WhatsApp", "SEO básico"],
    featured: false,
  },
  {
    name: "Profissional",
    price: "R$ 697",
    description: "Para negócios que precisam apresentar serviços com autoridade.",
    features: ["Estrutura expandida", "Formulário de briefing", "Identidade visual aplicada", "Revisão técnica antes da entrega"],
    featured: true,
  },
  {
    name: "Growth",
    price: "R$ 1.497",
    description: "Para transformar o site em uma operação de aquisição.",
    features: ["Landing page de campanha", "Captação de leads", "Preparação para analytics", "Plano de evolução de 30 dias"],
    featured: false,
  },
] as const;

type PackageName = (typeof packages)[number]["name"] | "Preciso de orientação";

const publicWhatsAppNumber = "5537999584722";
const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || publicWhatsAppNumber;
const packagePrices: Record<PackageName, string> = {
  Essencial: "a partir de R$ 297",
  Profissional: "a partir de R$ 697",
  Growth: "a partir de R$ 1.497",
  "Preciso de orientação": "definido após o diagnóstico",
};

function createLeadCode() {
  return `WAYNE-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export default function ServicesPage() {
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageName>("Profissional");

  const instantContact = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(
    "Olá! Vim pelo Sites Wayne e quero entender qual site faz mais sentido para meu negócio.",
  )}`;

  function choosePackage(packageName: PackageName) {
    setSelectedPackage(packageName);
    setSummary("");
    setCopied(false);
  }

  function prepareBriefing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const packageName = String(data.get("package")) as PackageName;
    const maintenance = data.get("maintenance") === "on" ? "Sim" : "Ainda não";
    const source = new URLSearchParams(window.location.search).get("utm_source") || "acesso direto";
    const message = [
      "Pedido de diagnóstico — Sites Wayne",
      `Código: ${createLeadCode()}`,
      `Nome: ${data.get("name")}`,
      `Negócio: ${data.get("business")}`,
      `Objetivo: ${data.get("goal")}`,
      `Pacote de interesse: ${packageName}`,
      `Investimento de referência: ${packagePrices[packageName]}`,
      `Prazo desejado: ${data.get("timeline")}`,
      `Interesse em manutenção: ${maintenance}`,
      `Contato: ${data.get("contact")}`,
      `Origem: ${source}`,
      "",
      "Quero confirmar escopo, prazo e valor antes de contratar.",
    ].join("\n");
    setSummary(message);
    setCopied(false);
  }

  async function continueRequest() {
    if (whatsAppNumber) {
      window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(summary)}`, "_blank", "noopener,noreferrer");
      return;
    }
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <ModuleShell
      active="/servicos"
      eyebrow="SITES WAYNE • SERVIÇOS"
      title="Seu negócio merece um site que gere contatos."
      description="Sites rápidos, responsivos e construídos para transformar interesse em conversa comercial — sem números inventados e sem promessas de resultado garantido."
      action={<a className="primary-button" href={instantContact} target="_blank" rel="noreferrer">Falar no WhatsApp <span>→</span></a>}
    >
      <section className={styles.proof} aria-label="Projeto em destaque">
        <div>
          <span>PROJETO PUBLICADO</span>
          <h2>Barbearia Wayne</h2>
          <p>Um exemplo completo de presença digital para negócio local, com serviços, diferenciais, experiência mobile e preparação de agendamento.</p>
          <a href="/barbearia-wayne">Ver projeto <b>↗</b></a>
        </div>
        <div className={styles.proofMark} aria-hidden="true"><span>BW</span><i /><b /></div>
      </section>

      <section className={styles.section} aria-labelledby="offers-title">
        <header>
          <span>OFERTA DE LANÇAMENTO</span>
          <h2 id="offers-title">Escolha o ponto de partida.</h2>
          <p>Valores iniciais. O escopo, o prazo e o preço final são confirmados no diagnóstico.</p>
        </header>
        <div className={styles.packages}>
          {packages.map((item) => (
            <article className={item.featured ? styles.featured : ""} key={item.name}>
              {item.featured && <em>MAIS INDICADO</em>}
              <span>{item.name}</span>
              <h3><small>a partir de</small>{item.price}</h3>
              <p>{item.description}</p>
              <ul>{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              <a href="#diagnostico" onClick={() => choosePackage(item.name)}>Quero este pacote <b>→</b></a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.recurring} aria-label="Planos de continuidade">
        <div><span>RECORRÊNCIA</span><h2>Depois de publicar, continue melhorando.</h2><p>A manutenção transforma uma venda única em acompanhamento contínuo e mantém o projeto atualizado.</p></div>
        <article><strong>Wayne Care</strong><b>R$ 79<small>/mês</small></b><p>Pequenos ajustes, verificação mensal e suporte organizado.</p></article>
        <article><strong>Wayne Growth</strong><b>R$ 197<small>/mês</small></b><p>Evolução de conteúdo, relatório simples e prioridade de atendimento.</p></article>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <header><span>PROCESSO ENXUTO</span><h2 id="process-title">Quatro etapas. Nenhuma surpresa.</h2></header>
        <ol>
          <li><b>01</b><div><strong>Diagnóstico</strong><p>Objetivo, público e oferta.</p></div></li>
          <li><b>02</b><div><strong>Proposta</strong><p>Escopo, prazo e valor definidos.</p></div></li>
          <li><b>03</b><div><strong>Construção</strong><p>Desenvolvimento e revisão técnica.</p></div></li>
          <li><b>04</b><div><strong>Publicação</strong><p>Entrega validada e próximos passos.</p></div></li>
        </ol>
      </section>

      <section className={styles.briefing} id="diagnostico">
        <div>
          <span>DIAGNÓSTICO INICIAL</span>
          <h2>Prepare seu pedido em menos de dois minutos.</h2>
          <p>As informações permanecem no seu dispositivo até você decidir copiar ou enviar a mensagem.</p>
        </div>
        <form onSubmit={prepareBriefing}>
          <label>Seu nome<input name="name" autoComplete="name" required /></label>
          <label>Tipo de negócio<input name="business" placeholder="Ex.: barbearia, loja, assistência" required /></label>
          <label>Principal objetivo<select name="goal" defaultValue="" required><option value="" disabled>Selecione</option><option>Receber pedidos no WhatsApp</option><option>Apresentar serviços</option><option>Captar orçamentos</option><option>Vender um produto digital</option></select></label>
          <label>Pacote de interesse<select name="package" value={selectedPackage} onChange={(event) => choosePackage(event.target.value as PackageName)}><option>Essencial</option><option>Profissional</option><option>Growth</option><option>Preciso de orientação</option></select></label>
          <label>Prazo desejado<select name="timeline" defaultValue="Em até 30 dias"><option>O quanto antes</option><option>Em até 15 dias</option><option>Em até 30 dias</option><option>Estou pesquisando</option></select></label>
          <label className={styles.full}>Seu WhatsApp ou e-mail<input name="contact" autoComplete="tel" required /></label>
          <label className={`${styles.full} ${styles.check}`}><input name="maintenance" type="checkbox" /> Quero conhecer também os planos de manutenção mensal.</label>
          <button className={styles.full} type="submit">PREPARAR PEDIDO</button>
        </form>
        {summary && (
          <div className={styles.result} role="status">
            <pre>{summary}</pre>
            <div className={styles.resultActions}>
              <button type="button" onClick={continueRequest}>CONTINUAR NO WHATSAPP</button>
              <button className={styles.copyButton} type="button" onClick={async () => { await navigator.clipboard.writeText(summary); setCopied(true); }}>{copied ? "PEDIDO COPIADO" : "COPIAR PEDIDO"}</button>
            </div>
            <small>Você revisa a mensagem antes de enviá-la. O site não armazena seus dados.</small>
          </div>
        )}
      </section>

      <p className={styles.disclaimer}>Os valores apresentados são referências iniciais, não constituem promessa de faturamento e podem mudar conforme o escopo. A contratação só ocorre após confirmação expressa das condições.</p>
    </ModuleShell>
  );
}
