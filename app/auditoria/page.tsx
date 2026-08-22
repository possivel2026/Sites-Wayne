import type { Metadata } from "next";
import Link from "next/link";
import { ModuleShell } from "@/components/module-shell";
import { SiteAudit } from "@/components/site-audit";
import styles from "./auditoria.module.css";

export const metadata: Metadata = {
  title: "Auditoria gratuita de site — Sites Wayne",
  description: "Avalie identidade, mensagem, confiança e estrutura do seu site em dez critérios. O diagnóstico acontece no seu dispositivo e não armazena respostas.",
};

export default function AuditPage() {
  return (
    <ModuleShell
      active="/servicos"
      eyebrow="SITES WAYNE • AUDITORIA"
      title="Seu site parece uma marca ou apenas mais um template?"
      description="Responda dez critérios objetivos e receba um diagnóstico priorizado. Gradiente, serifas ou botões não são defeitos por si só; o problema é quando nada forma uma identidade convincente."
      action={<Link className={styles.heroLink} href="/servicos">VER PACOTES <span>→</span></Link>}
    >
      <section className={styles.intro} aria-labelledby="audit-intro-title">
        <div>
          <span>DIAGNÓSTICO PRIVADO</span>
          <h2 id="audit-intro-title">Dez decisões que separam acabamento de aparência genérica.</h2>
          <p>As respostas ficam somente neste navegador. Nenhum endereço, e-mail ou dado pessoal é solicitado para gerar o resultado.</p>
        </div>
        <dl>
          <div><dt>10</dt><dd>critérios</dd></div>
          <div><dt>2 min</dt><dd>tempo médio</dd></div>
          <div><dt>0</dt><dd>dados armazenados</dd></div>
        </dl>
      </section>

      <SiteAudit />

      <section className={styles.method} aria-labelledby="method-title">
        <span>MÉTODO WAYNE</span>
        <h2 id="method-title">Visual é uma parte. Conversão exige sistema.</h2>
        <div>
          <article><b>01</b><h3>Mensagem</h3><p>Quem é o cliente, qual problema será resolvido e por que agir agora.</p></article>
          <article><b>02</b><h3>Confiança</h3><p>Provas verificáveis, domínio coerente, autoria e informações completas.</p></article>
          <article><b>03</b><h3>Decisão</h3><p>Estrutura que reduz dúvida e leva para uma ação comercial específica.</p></article>
        </div>
      </section>

      <p className={styles.note}>O resultado é uma triagem inicial, não uma promessa de vendas. Tráfego, oferta, atendimento e execução continuam determinando o desempenho comercial.</p>
    </ModuleShell>
  );
}
