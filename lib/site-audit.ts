export const siteAuditCriteria = [
  {
    id: "identity",
    number: "01",
    title: "Identidade visual",
    question: "A página parece pertencer somente à sua marca?",
    detail: "Cor, composição e elementos gráficos precisam formar um sistema próprio. Gradiente não é o problema; usar o mesmo visual de qualquer template é.",
  },
  {
    id: "cta",
    number: "02",
    title: "Ação principal",
    question: "O visitante entende exatamente o que acontece ao clicar?",
    detail: "Um CTA forte promete uma ação concreta, como pedir orçamento, reservar horário ou comprar — não apenas “saiba mais”.",
  },
  {
    id: "favicon",
    number: "03",
    title: "Favicon e aba",
    question: "A aba do navegador exibe nome e ícone da marca?",
    detail: "Título, descrição e favicon próprios sinalizam acabamento e tornam o site reconhecível entre várias abas.",
  },
  {
    id: "ownership",
    number: "04",
    title: "Autoria e independência",
    question: "O site está livre de selos, textos ou URLs do construtor?",
    detail: "A tecnologia pode ser qualquer uma. O cliente, porém, deve enxergar sua empresa — não a ferramenta usada para montá-la.",
  },
  {
    id: "typography",
    number: "05",
    title: "Tipografia",
    question: "Os textos são legíveis e possuem uma hierarquia consistente?",
    detail: "Fonte serifada ou sem serifa funciona quando tamanho, contraste, peso e espaçamento obedecem à mesma direção visual.",
  },
  {
    id: "proof",
    number: "06",
    title: "Prova real",
    question: "Depoimentos, resultados e projetos podem ser verificados?",
    detail: "Prova social inventada destrói confiança. Um projeto publicado ou um depoimento identificável vale mais que números sem origem.",
  },
  {
    id: "domain",
    number: "07",
    title: "Endereço",
    question: "O domínio é curto, confiável e coerente com a marca?",
    detail: "Um subdomínio gratuito pode validar a oferta. Depois da primeira receita, um domínio próprio aumenta memorização e credibilidade.",
  },
  {
    id: "copy",
    number: "08",
    title: "Texto comercial",
    question: "A mensagem fala de um problema e de um público específicos?",
    detail: "Frases genéricas como “transforme sua presença digital” dizem pouco. Boa copy mostra para quem é, o que resolve e qual é o próximo passo.",
  },
  {
    id: "footer",
    number: "09",
    title: "Rodapé e confiança",
    question: "Contato, autoria, privacidade e informações essenciais estão visíveis?",
    detail: "O rodapé fecha a experiência. Ele precisa orientar, identificar a operação e oferecer acesso aos documentos aplicáveis.",
  },
  {
    id: "structure",
    number: "10",
    title: "Estrutura de decisão",
    question: "As seções conduzem da dúvida até a ação sem distrações?",
    detail: "A ordem deve acompanhar a decisão do cliente: problema, solução, evidência, oferta, objeções e ação.",
  },
] as const;

export type SiteAuditCriterionId = (typeof siteAuditCriteria)[number]["id"];
export type SiteAuditValue = 0 | 1 | 2;
export type SiteAuditAnswers = Partial<Record<SiteAuditCriterionId, SiteAuditValue>>;

export type SiteAuditResult = {
  answered: number;
  complete: boolean;
  maxScore: number;
  score: number;
  percentage: number;
  stage: "Reconstrução" | "Correção" | "Otimização";
  recommendation: "Profissional" | "Essencial" | "Wayne Care";
  headline: string;
  summary: string;
  priorities: typeof siteAuditCriteria[number][];
};

export function evaluateSiteAudit(answers: SiteAuditAnswers): SiteAuditResult {
  const answeredCriteria = siteAuditCriteria.filter((criterion) => answers[criterion.id] !== undefined);
  const score = answeredCriteria.reduce((total, criterion) => total + (answers[criterion.id] ?? 0), 0);
  const maxScore = siteAuditCriteria.length * 2;
  const percentage = Math.round((score / maxScore) * 100);
  const priorities = siteAuditCriteria
    .filter((criterion) => (answers[criterion.id] ?? 2) < 2)
    .sort((first, second) => (answers[first.id] ?? 0) - (answers[second.id] ?? 0))
    .slice(0, 3);

  if (score <= 8) {
    return {
      answered: answeredCriteria.length,
      complete: answeredCriteria.length === siteAuditCriteria.length,
      maxScore,
      score,
      percentage,
      stage: "Reconstrução",
      recommendation: "Profissional",
      headline: "A base precisa trabalhar antes do acabamento.",
      summary: "Há sinais de que estrutura, mensagem e confiança precisam ser reorganizadas em conjunto. Corrigir apenas cores ou botões não resolverá o gargalo.",
      priorities,
    };
  }

  if (score <= 15) {
    return {
      answered: answeredCriteria.length,
      complete: answeredCriteria.length === siteAuditCriteria.length,
      maxScore,
      score,
      percentage,
      stage: "Correção",
      recommendation: "Essencial",
      headline: "Existe uma boa base, mas ela ainda perde oportunidades.",
      summary: "O site já comunica parte do valor. Uma intervenção focada nos pontos mais fracos pode melhorar clareza e encaminhamento sem reconstruir tudo.",
      priorities,
    };
  }

  return {
    answered: answeredCriteria.length,
    complete: answeredCriteria.length === siteAuditCriteria.length,
    maxScore,
    score,
    percentage,
    stage: "Otimização",
    recommendation: "Wayne Care",
    headline: "A presença digital está consistente.",
    summary: "O próximo ganho tende a vir de testes, conteúdo real e manutenção contínua — não de uma troca visual completa.",
    priorities,
  };
}
