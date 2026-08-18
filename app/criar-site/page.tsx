"use client";

import { FormEvent, useMemo, useState } from "react";
import { ModuleShell } from "@/components/module-shell";
import { formatBRL, WaynePackageId, WayneTemplateId, waynePackages, wayneTemplates } from "@/lib/wayne-autopilot";
import styles from "./criar-site.module.css";

type CheckoutResponse = { checkoutUrl?: string; error?: string; setupRequired?: boolean };

const initialServices = ["Atendimento personalizado", "Orçamento rápido", "Qualidade garantida"];

export default function CreateSitePage() {
  const [packageId, setPackageId] = useState<WaynePackageId>("profissional");
  const [templateId, setTemplateId] = useState<WayneTemplateId>("luxo");
  const [businessName, setBusinessName] = useState("Seu Negócio");
  const [businessType, setBusinessType] = useState("Serviços profissionais");
  const [headline, setHeadline] = useState("Uma solução confiável, feita perto de você.");
  const [city, setCity] = useState("Sua cidade");
  const [services, setServices] = useState(initialServices);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedPackage = waynePackages[packageId];
  const previewServices = useMemo(() => services.filter(Boolean), [services]);

  function updateService(index: number, value: string) {
    setServices((current) => current.map((service, serviceIndex) => serviceIndex === index ? value : service));
  }

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          packageId,
          templateId,
          businessName,
          businessType,
          headline,
          city,
          publicWhatsApp: form.get("publicWhatsApp"),
          services,
          clientName: form.get("clientName"),
          clientEmail: form.get("clientEmail"),
          acceptedTerms: form.get("acceptedTerms") === "on",
        }),
      });
      const result = await response.json() as CheckoutResponse;
      if (!response.ok || !result.checkoutUrl) throw new Error(result.error || "Não foi possível abrir o pagamento.");
      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível abrir o pagamento.");
      setLoading(false);
    }
  }

  return (
    <ModuleShell
      active="/servicos"
      eyebrow="WAYNE AUTOPILOT"
      title="Configure. Pague. Receba seu site."
      description="Escolha um dos três modelos, confira a prévia e siga para o Mercado Pago. Após a aprovação, o endereço do site é publicado automaticamente."
    >
      <form className={styles.builder} onSubmit={startCheckout}>
        <div className={styles.controls}>
          <section className={styles.step}>
            <header><b>01</b><div><span>PACOTE</span><h2>Escolha a estrutura</h2></div></header>
            <div className={styles.options}>
              {Object.values(waynePackages).map((item) => (
                <button className={packageId === item.id ? styles.selected : ""} key={item.id} onClick={() => setPackageId(item.id)} type="button">
                  <span>{item.name}</span><strong>{formatBRL(item.priceCents)}</strong><small>{item.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.step}>
            <header><b>02</b><div><span>MODELO</span><h2>Defina o visual</h2></div></header>
            <div className={styles.templates}>
              {Object.values(wayneTemplates).map((item) => (
                <button className={`${styles.template} ${styles[item.id]} ${templateId === item.id ? styles.selected : ""}`} key={item.id} onClick={() => setTemplateId(item.id)} type="button">
                  <i /><span>{item.name}</span><small>{item.description}</small>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.step}>
            <header><b>03</b><div><span>CONTEÚDO PÚBLICO</span><h2>Personalize o site</h2></div></header>
            <div className={styles.fields}>
              <label>Nome do negócio<input maxLength={80} onChange={(event) => setBusinessName(event.target.value)} required value={businessName} /></label>
              <label>Tipo de negócio<input maxLength={80} onChange={(event) => setBusinessType(event.target.value)} required value={businessType} /></label>
              <label className={styles.wide}>Frase principal<input maxLength={150} onChange={(event) => setHeadline(event.target.value)} required value={headline} /></label>
              <label>Cidade / região<input maxLength={80} onChange={(event) => setCity(event.target.value)} required value={city} /></label>
              <label>WhatsApp comercial<input inputMode="numeric" name="publicWhatsApp" pattern="[0-9 ()+\-]{12,20}" placeholder="55 37 99999-9999" required /></label>
              {services.map((service, index) => <label className={index === 2 ? styles.wide : ""} key={index}>Serviço {index + 1}<input maxLength={80} onChange={(event) => updateService(index, event.target.value)} required={index < 2} value={service} /></label>)}
            </div>
          </section>

          <section className={styles.step}>
            <header><b>04</b><div><span>ENTREGA E PAGAMENTO</span><h2>Dados do responsável</h2></div></header>
            <div className={styles.fields}>
              <label>Nome completo<input autoComplete="name" maxLength={80} name="clientName" required /></label>
              <label>E-mail de acompanhamento<input autoComplete="email" maxLength={160} name="clientEmail" required type="email" /></label>
            </div>
            <label className={styles.consent}><input name="acceptedTerms" required type="checkbox" /> Autorizo a publicação dos dados marcados como públicos e aceito os <a href="/termos" target="_blank">termos</a> e a <a href="/privacidade" target="_blank">política de privacidade</a>.</label>
            <div className={styles.checkout}>
              <div><span>TOTAL</span><strong>{formatBRL(selectedPackage.priceCents)}</strong><small>Pagamento processado pelo Mercado Pago</small></div>
              <button disabled={loading} type="submit">{loading ? "ABRINDO PAGAMENTO..." : "IR PARA PAGAMENTO SEGURO"}<span>→</span></button>
            </div>
            {message && <p className={styles.error} role="alert">{message}</p>}
          </section>
        </div>

        <aside className={`${styles.preview} ${styles[templateId]}`}>
          <div className={styles.previewBar}><span>PRÉVIA AO VIVO</span><i>siteswayne.com/clientes/...</i></div>
          <div className={styles.previewPage}>
            <nav><strong>{businessName || "Seu Negócio"}</strong><span>{businessType || "Seu segmento"}</span></nav>
            <main>
              <span>ATENDIMENTO EM {city || "SUA CIDADE"}</span>
              <h2>{headline || "Sua frase principal aparece aqui."}</h2>
              <p>{businessName || "Seu negócio"} apresenta seus serviços com clareza e facilita o contato pelo WhatsApp.</p>
              <button type="button">FALAR NO WHATSAPP</button>
            </main>
            <div className={styles.previewCards}>{previewServices.slice(0, 3).map((service) => <article key={service}>{service}</article>)}</div>
          </div>
          <p>A prévia representa o modelo escolhido. O endereço final é liberado após a confirmação automática do pagamento.</p>
        </aside>
      </form>
    </ModuleShell>
  );
}
