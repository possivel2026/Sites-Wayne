"use client";

import { FormEvent, useMemo, useState } from "react";
import { evaluateSiteAudit, siteAuditCriteria, SiteAuditAnswers, SiteAuditValue } from "@/lib/site-audit";
import styles from "@/app/auditoria/auditoria.module.css";

const publicWhatsAppNumber = "5537999584722";
const whatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || publicWhatsAppNumber;
const answerOptions: { value: SiteAuditValue; label: string; caption: string }[] = [
  { value: 0, label: "Não", caption: "Ausente" },
  { value: 1, label: "Em parte", caption: "Inconsistente" },
  { value: 2, label: "Sim", caption: "Resolvido" },
];

export function SiteAudit() {
  const [answers, setAnswers] = useState<SiteAuditAnswers>({});
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => evaluateSiteAudit(answers), [answers]);

  function choose(id: typeof siteAuditCriteria[number]["id"], value: SiteAuditValue) {
    setAnswers((current) => ({ ...current, [id]: value }));
    setShowResult(false);
    setCopied(false);
  }

  function submitAudit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!result.complete) return;
    setShowResult(true);
    window.setTimeout(() => document.getElementById("resultado-auditoria")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  }

  function resultMessage() {
    const priorities = result.priorities.length
      ? result.priorities.map((criterion) => `- ${criterion.title}`).join("\n")
      : "- Manter consistência e testar melhorias com dados reais";
    return [
      "Diagnóstico de site — Sites Wayne",
      `Código: AUD-${Date.now().toString(36).slice(-7).toUpperCase()}`,
      `Pontuação: ${result.score}/${result.maxScore} (${result.percentage}%)`,
      `Estágio: ${result.stage}`,
      `Recomendação inicial: ${result.recommendation}`,
      "Prioridades:",
      priorities,
      "",
      "Quero revisar este diagnóstico antes de contratar qualquer serviço.",
    ].join("\n");
  }

  function continueOnWhatsApp() {
    window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(resultMessage())}`, "_blank", "noopener,noreferrer");
  }

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(resultMessage());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function resetAudit() {
    setAnswers({});
    setShowResult(false);
    setCopied(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className={styles.audit} aria-labelledby="audit-title">
      <header className={styles.auditHeader}>
        <div>
          <span>AVALIAÇÃO</span>
          <h2 id="audit-title">Marque o estado real do seu site.</h2>
        </div>
        <div className={styles.progress} aria-label={`${result.answered} de ${siteAuditCriteria.length} critérios respondidos`}>
          <p><strong>{result.answered}</strong> / {siteAuditCriteria.length}</p>
          <div><span style={{ width: `${(result.answered / siteAuditCriteria.length) * 100}%` }} /></div>
        </div>
      </header>

      <form onSubmit={submitAudit}>
        <div className={styles.questions}>
          {siteAuditCriteria.map((criterion) => (
            <fieldset className={answers[criterion.id] !== undefined ? styles.answered : ""} key={criterion.id}>
              <legend><span>{criterion.number}</span>{criterion.title}</legend>
              <h3>{criterion.question}</h3>
              <p>{criterion.detail}</p>
              <div className={styles.options}>
                {answerOptions.map((option) => (
                  <button
                    aria-pressed={answers[criterion.id] === option.value}
                    className={answers[criterion.id] === option.value ? styles.selected : ""}
                    key={option.value}
                    onClick={() => choose(criterion.id, option.value)}
                    type="button"
                  >
                    <strong>{option.label}</strong>
                    <small>{option.caption}</small>
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className={styles.submitBar}>
          <p>{result.complete ? "Diagnóstico pronto para ser calculado." : `Faltam ${siteAuditCriteria.length - result.answered} critérios.`}</p>
          <button disabled={!result.complete} type="submit">GERAR MEU DIAGNÓSTICO</button>
        </div>
      </form>

      {showResult && result.complete && (
        <section className={styles.result} id="resultado-auditoria" aria-live="polite">
          <div className={styles.score}>
            <span>PONTUAÇÃO</span>
            <strong>{result.score}<small>/{result.maxScore}</small></strong>
            <em>{result.percentage}%</em>
          </div>
          <div className={styles.resultCopy}>
            <span>{result.stage.toUpperCase()}</span>
            <h2>{result.headline}</h2>
            <p>{result.summary}</p>
            <div className={styles.priorities}>
              <strong>PRÓXIMAS PRIORIDADES</strong>
              <ol>
                {result.priorities.length
                  ? result.priorities.map((criterion) => <li key={criterion.id}>{criterion.title}</li>)
                  : <li>Preservar a base e medir melhorias com dados reais.</li>}
              </ol>
            </div>
            <p className={styles.recommendation}>Caminho inicial sugerido: <strong>{result.recommendation}</strong></p>
            <div className={styles.actions}>
              <button onClick={continueOnWhatsApp} type="button">REVISAR NO WHATSAPP</button>
              <button className={styles.secondaryAction} onClick={copyResult} type="button">{copied ? "RESULTADO COPIADO" : "COPIAR RESULTADO"}</button>
              <button className={styles.reset} onClick={resetAudit} type="button">Refazer</button>
            </div>
            <small>Você revisa a mensagem antes de enviá-la. O Nexus não armazena as respostas desta auditoria.</small>
          </div>
        </section>
      )}
    </section>
  );
}
