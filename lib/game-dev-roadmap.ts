export const gameDevPhases = [
  {
    id: "base",
    number: "01",
    title: "Base jogável",
    objective: "Entender o mínimo necessário e terminar um protótipo pequeno.",
    missions: [
      {
        id: "logic",
        title: "Lógica antes da linguagem",
        description: "Aprenda variáveis, funções, estados, orientação a objetos, estruturas de dados e algoritmos dentro de uma mecânica simples.",
        skills: ["Blueprints", "OOP", "Estruturas", "Algoritmos"],
        deliverable: "Protótipo com início, objetivo e fim.",
      },
      {
        id: "math",
        title: "Matemática que aparece na tela",
        description: "Use vetores, matrizes e trigonometria apenas quando movimento, câmera, direção ou rotação exigirem.",
        skills: ["Vetores", "Matrizes", "Trigonometria"],
        deliverable: "Movimento e câmera controláveis.",
      },
      {
        id: "versioning",
        title: "Projeto recuperável",
        description: "Organize arquivos e registre cada avanço com Git. Um projeto sem histórico não está pronto para crescer.",
        skills: ["Git", "GitHub", "Documentação"],
        deliverable: "Repositório privado ou público com README.",
      },
    ],
  },
  {
    id: "development",
    number: "02",
    title: "Desenvolvimento",
    objective: "Transformar a ideia em uma experiência curta que outra pessoa consegue jogar.",
    missions: [
      {
        id: "engine",
        title: "Motor e greybox",
        description: "Comece no Unreal Engine com Blueprints. C++ entra quando uma limitação real justificar a complexidade.",
        skills: ["Unreal Engine", "Blueprints", "C++ depois"],
        deliverable: "Fase cinza jogável sem arte final.",
      },
      {
        id: "gameplay",
        title: "Loop principal",
        description: "Feche mecânicas, física, entrada e animação em um ciclo que possa ser testado repetidamente.",
        skills: ["Mecânicas", "Física", "Input", "Animação"],
        deliverable: "Vertical slice de cinco minutos.",
      },
      {
        id: "visuals",
        title: "Arte com função",
        description: "Modele no Blender somente o necessário e aplique materiais e luz para orientar leitura, ritmo e atmosfera.",
        skills: ["Blender", "3D/2D", "Materiais", "Iluminação"],
        deliverable: "Kit visual original dentro da fase.",
      },
    ],
  },
  {
    id: "production",
    number: "03",
    title: "Produção",
    objective: "Trocar aparência de teste por uma build estável e apresentável.",
    missions: [
      {
        id: "audio",
        title: "Som e ritmo",
        description: "Use efeitos e música próprios ou licenciados. O áudio precisa confirmar ações e reforçar o clima do jogo.",
        skills: ["Efeitos", "Música", "Licenças"],
        deliverable: "Passe completo de áudio sem conteúdo irregular.",
      },
      {
        id: "networking",
        title: "Multiplayer sem atalho",
        description: "Estude rede e sincronização somente depois que o jogo funcionar bem sozinho. Multiplayer multiplica falhas e custo.",
        skills: ["Networking", "Sincronização", "Sistemas"],
        deliverable: "Teste controlado ou decisão documentada de adiar.",
      },
      {
        id: "quality",
        title: "Qualidade da build",
        description: "Teste, depure e meça desempenho nos equipamentos-alvo antes de acrescentar novos recursos.",
        skills: ["Testes", "Debug", "Otimização"],
        deliverable: "Build reproduzível com checklist aprovado.",
      },
    ],
  },
  {
    id: "release",
    number: "04",
    title: "Lançamento",
    objective: "Empacotar um produto pequeno, demonstrável e legalmente publicável.",
    missions: [
      {
        id: "product",
        title: "Um produto, não dez ideias",
        description: "Escolha uma saída: mini-jogo, pacote de assets ou protótipo para cliente. Defina escopo, licença e critério de pronto.",
        skills: ["Escopo", "Produto", "Licenciamento"],
        deliverable: "Uma oferta clara com demonstração real.",
      },
      {
        id: "portfolio",
        title: "Portfólio verificável",
        description: "Registre processo, decisões e resultado. Game jam é útil quando termina em uma build e um estudo de caso.",
        skills: ["Game jam", "Portfólio", "Apresentação"],
        deliverable: "Página com vídeo curto, imagens e build.",
      },
      {
        id: "publishing",
        title: "Publicação consciente",
        description: "Compare Steam, Google Play e App Store somente após revisar taxas, contas, classificação, privacidade e suporte.",
        skills: ["Steam", "Google Play", "App Store"],
        deliverable: "Checklist de loja e plano de suporte, sem pagamento automático.",
      },
    ],
  },
] as const;

export type GameDevMission = (typeof gameDevPhases)[number]["missions"][number];
export type GameDevMissionId = GameDevMission["id"];
export const gameDevMissions = gameDevPhases.flatMap<GameDevMission>((phase) => [...phase.missions]);

export function getGameDevProgress(completed: readonly string[]) {
  const validIds = new Set(gameDevMissions.map((mission) => mission.id));
  const uniqueCompleted = new Set(completed.filter((id) => validIds.has(id as GameDevMissionId)));
  const completedCount = uniqueCompleted.size;
  const total = gameDevMissions.length;
  const nextMission = gameDevMissions.find((mission) => !uniqueCompleted.has(mission.id)) ?? null;

  return {
    completedCount,
    total,
    percentage: Math.round((completedCount / total) * 100),
    nextMission,
    complete: completedCount === total,
  };
}
