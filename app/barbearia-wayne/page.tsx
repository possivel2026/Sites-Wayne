"use client";

import { FormEvent, useState } from "react";
import styles from "./barbearia.module.css";

const services = [
  { icon: "✂", title: "Corte masculino", text: "Técnica, estilo e acabamento para um visual impecável." },
  { icon: "◉", title: "Barba completa", text: "Modelagem, alinhamento e cuidados para uma barba em alta." },
  { icon: "◆", title: "Corte + barba", text: "A combinação completa para renovar seu estilo com precisão." },
];

export default function BarbeariaWaynePage() {
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);

  function prepareBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      "Solicitação de agendamento — Barbearia Wayne",
      `Nome: ${data.get("name")}`,
      `Data: ${data.get("date")}`,
      `Horário: ${data.get("time")}`,
      `Serviço: ${data.get("service")}`,
    ].join("\n");
    setSummary(message);
    setCopied(false);
  }

  async function copyBooking() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  return (
    <main className={styles.site}>
      <header className={styles.header}>
        <a className={styles.brand} href="#inicio" aria-label="Barbearia Wayne, início">
          <span className={styles.miniMark}>BW</span>
          <span>BARBEARIA WAYNE</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#inicio">Início</a>
          <a href="#servicos">Serviços</a>
          <a href="#experiencia">Experiência</a>
          <a href="#agendamento">Agendamento</a>
        </nav>
        <a className={styles.headerCta} href="#agendamento">AGENDAR HORÁRIO</a>
      </header>

      <section className={styles.hero} id="inicio">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>BARBEARIA PREMIUM</p>
          <h1>Seu estilo começa<br />no corte certo</h1>
          <p className={styles.lead}>Cortes precisos, barba bem cuidada e atendimento com hora marcada. Tudo pensado para realçar sua melhor versão.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href="#agendamento">AGENDAR AGORA</a>
            <a className={styles.secondary} href="#servicos">VER SERVIÇOS</a>
          </div>
          <div className={styles.heroProof}>
            <span>◇ <small>Excelência<br />em cada detalhe</small></span>
            <span>◷ <small>Atendimento<br />com hora marcada</small></span>
            <span>☆ <small>Foco na sua<br />melhor versão</small></span>
          </div>
        </div>

        <div className={styles.emblem} aria-hidden="true">
          <div className={styles.emblemGlow} />
          <div className={styles.emblemOuter}>
            <span className={styles.razor}>— ◇ —</span>
            <strong>BW</strong>
            <span className={styles.scissors}>✂</span>
          </div>
        </div>
      </section>

      <section className={styles.trust} aria-label="Diferenciais">
        <article><b>▣</b><span>Atendimento com<br />hora marcada</span></article>
        <article><b>♙</b><span>Profissionais<br />experientes</span></article>
        <article><b>▥</b><span>Produtos<br />selecionados</span></article>
        <article><b>▱</b><span>Ambiente<br />confortável</span></article>
      </section>

      <section className={styles.services} id="servicos">
        <div className={styles.sectionTitle}>
          <p>NOSSOS SERVIÇOS</p>
          <h2>Serviços</h2>
          <i />
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article key={service.title}>
              <span className={styles.serviceIcon}>{service.icon}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <a href="#agendamento">AGENDAR <b>→</b></a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.experience} id="experiencia">
        <div>
          <p className={styles.eyebrow}>PADRÃO WAYNE</p>
          <h2>Uma experiência feita<br />nos detalhes</h2>
          <p>Mais que um corte, oferecemos um momento só seu. Do atendimento ao acabamento, cada detalhe é pensado para superar expectativas.</p>
          <ul>
            <li>Atendimento pontual e personalizado</li>
            <li>Higiene e cuidado em cada etapa</li>
            <li>Estilo alinhado ao seu perfil</li>
          </ul>
        </div>
        <div className={styles.pole} aria-hidden="true">
          <span />
          <i />
          <b />
        </div>
      </section>

      <section className={styles.booking} id="agendamento">
        <div>
          <p className={styles.eyebrow}>RESERVE SEU MOMENTO</p>
          <h2>Agende seu horário</h2>
          <p>Preencha os dados para preparar sua solicitação. Nenhuma informação é enviada sem sua ação.</p>
        </div>
        <form onSubmit={prepareBooking}>
          <label>Nome completo<input name="name" autoComplete="name" required /></label>
          <label>Data desejada<input name="date" type="date" required /></label>
          <label>Horário<input name="time" type="time" required /></label>
          <label>Serviço
            <select name="service" required defaultValue="">
              <option value="" disabled>Selecione</option>
              <option>Corte masculino</option>
              <option>Barba completa</option>
              <option>Corte + barba</option>
            </select>
          </label>
          <button type="submit">PREPARAR AGENDAMENTO</button>
        </form>
        {summary && (
          <div className={styles.bookingResult} role="status">
            <pre>{summary}</pre>
            <button type="button" onClick={copyBooking}>{copied ? "PEDIDO COPIADO" : "COPIAR PEDIDO"}</button>
          </div>
        )}
      </section>

      <footer>
        <a className={styles.brand} href="#inicio"><span className={styles.miniMark}>BW</span><span>BARBEARIA WAYNE</span></a>
        <p>Estilo, precisão e atendimento profissional.</p>
        <small>© {new Date().getFullYear()} Barbearia Wayne.</small>
      </footer>
    </main>
  );
}
