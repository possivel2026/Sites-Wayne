"use client";

import { FormEvent, useState } from "react";
import { ModuleShell } from "@/components/module-shell";

const contentCards = [
  { type: "Vídeo", title: "Nexus Play", meta: "Catálogo em preparação", color: "violet", href: "/videos" },
  { type: "Curso", title: "Área de aprendizagem", meta: "Trilhas em preparação", color: "cyan", href: "/aprender" },
  { type: "Comunidade", title: "Comunidades temáticas", meta: "Inscrições em breve", color: "blue", href: "/comunidades" },
  { type: "Ferramenta IA", title: "Ferramentas Nexus IA", meta: "Disponível em modo beta", color: "pink", href: "/ia" },
  { type: "Produto", title: "Marketplace de criadores", meta: "Ainda sem vendedores cadastrados", color: "orange", href: "/marketplace" },
  { type: "Jogo", title: "Desafios educativos", meta: "Ranking após o lançamento", color: "green", href: "/jogos" },
];

export function ExplorePage() {
  const [filter, setFilter] = useState("Tudo");
  const filters = ["Tudo", "Vídeo", "Curso", "Comunidade", "Ferramenta IA", "Produto", "Jogo"];
  const cards = filter === "Tudo" ? contentCards : contentCards.filter((card) => card.type === filter);
  return <ModuleShell active="/explorar" eyebrow="DESCOBERTA SEM FIM" title="Encontre sua próxima grande ideia." description="Conteúdo, pessoas, ferramentas e oportunidades selecionados para mover você para frente."><div className="filter-row">{filters.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="explore-cards">{cards.map((card, index) => <a href={card.href} key={card.title}><div className={`abstract-cover ${card.color}`}><span>{["▶","▤","◎","✦","▣","♢"][index] || "◇"}</span><i /></div><span className="content-type">{card.type}</span><h2>{card.title}</h2><p>{card.meta}</p><em>Explorar →</em></a>)}</div></ModuleShell>;
}

const videoList = [
  ["Ideias de negócios acessíveis", "Conteúdo demonstrativo", "Em breve", "violet", "Negócios"],
  ["Como estudar melhor usando inteligência artificial", "Conteúdo demonstrativo", "Em breve", "cyan", "Educação"],
  ["Setup creator econômico", "Conteúdo demonstrativo", "Em breve", "pink", "Criadores"],
  ["Como validar uma ideia", "Conteúdo demonstrativo", "Em breve", "orange", "Negócios"],
  ["Primeiros passos em programação", "Conteúdo demonstrativo", "Em breve", "blue", "Tecnologia"],
  ["Organize sua rotina", "Conteúdo demonstrativo", "Em breve", "green", "Educação"],
];

export function VideosPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [category, setCategory] = useState("Para você");
  const visibleVideos = category === "Para você" ? videoList : videoList.filter((video) => video[4] === category);
  return <ModuleShell active="/videos" eyebrow="NEXUS PLAY • EM PREPARAÇÃO" title="Assista menos. Aprenda mais." description="O catálogo será publicado quando houver vídeos reais disponíveis."><div className="filter-row">{["Para você","Negócios","Tecnologia","Educação","Criadores"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="portal-video-grid">{visibleVideos.map((video) => <article key={video[0]}><button className={`portal-video-cover ${video[3]}`} onClick={() => setPlaying(video[0])}><span>▶</span><em>{video[2]}</em></button><div><span className="avatar avatar-way">NB</span><p><strong>{video[0]}</strong><small>{video[1]} • ainda não publicado</small></p></div></article>)}</div>{playing && <div className="modal-backdrop" onMouseDown={() => setPlaying(null)}><section className="video-modal" onMouseDown={(event) => event.stopPropagation()}><button onClick={() => setPlaying(null)}>×</button><div><span>▶</span></div><h2>{playing}</h2><p>Este é somente um espaço demonstrativo. Nenhum vídeo ou número de audiência está sendo apresentado como real.</p></section></div>}</ModuleShell>;
}

const aiTools = ["Assistente de texto", "Resumidor", "Plano de negócio", "Descrição de produto", "Organizador de estudos", "Criador de publicações"];

export function AIPage() {
  const [tool, setTool] = useState(aiTools[0]);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  async function generate(event: FormEvent) {
    event.preventDefault(); if (!prompt.trim()) return; setLoading(true); setResult("");
    try {
      const response = await fetch("/api/ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, tool }) });
      const data = await response.json() as { result?: string; error?: string };
      setResult(data.result || data.error || "Não foi possível gerar o resultado.");
    } catch { setResult("Não foi possível conectar ao assistente. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <ModuleShell active="/ia" eyebrow="NEXUS IA • BETA" title="Transforme intenção em ação." description="Escolha uma ferramenta, descreva o objetivo e receba um ponto de partida estruturado em segundos." action={<div className="usage-pill"><span>β</span><p><strong>Uso de demonstração</strong><small>Limites comerciais ainda não definidos</small></p></div>}><div className="ai-workspace"><aside><p>Ferramentas</p>{aiTools.map((item) => <button className={tool === item ? "active" : ""} onClick={() => {setTool(item);setResult("");}} key={item}><span>{item === "Plano de negócio" ? "↯" : item === "Organizador de estudos" ? "▤" : "✦"}</span>{item}</button>)}</aside><form onSubmit={generate}><div className="workspace-head"><span>✦</span><p><strong>{tool}</strong><small>Modo demonstração seguro</small></p></div><label htmlFor="ai-prompt">O que você quer criar?</label><textarea id="ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={tool === "Plano de negócio" ? "Ex.: quero vender sites para negócios locais..." : "Digite ou cole seu texto aqui..."} /><div className="prompt-suggestions"><span>Tente:</span>{["Melhorar meu texto", "Criar estratégia", "Organizar em etapas"].map((item) => <button type="button" onClick={() => setPrompt(item)} key={item}>{item}</button>)}</div><button className="generate-button" disabled={loading || !prompt.trim()}>{loading ? "Criando..." : "Gerar com Nexus IA"}<span>✦</span></button>{(loading || result) && <div className="ai-output">{loading ? <div className="output-loading"><i/><i/><i/></div> : <><div><span>✦ Resultado</span><button type="button" onClick={() => navigator.clipboard?.writeText(result)}>Copiar</button></div><pre>{result}</pre></>}</div>}</form></div></ModuleShell>;
}

const marketplaceAreas = [
  ["Produtos digitais", "Arquivos e recursos criados pela comunidade", "violet"],
  ["Serviços criativos", "Trabalhos oferecidos por profissionais verificados", "cyan"],
  ["Equipamentos", "Itens publicados por vendedores reais", "blue"],
];

export function MarketplacePage() {
  return <ModuleShell active="/marketplace" eyebrow="NEXUS MARKET • EM PREPARAÇÃO" title="Marketplace ainda sem anúncios reais." description="Produtos e preços só serão exibidos depois que vendedores reais forem cadastrados e verificados." action={<div className="usage-pill"><span>▣</span><p><strong>Sem ofertas ativas</strong><small>Nenhum preço ou avaliação fictícia</small></p></div>}><div className="market-banner"><div><span>VENDA NO NEXUS</span><strong>Área de vendedores em desenvolvimento.</strong><p>O cadastro será aberto após a ativação da autenticação e dos pagamentos.</p></div><button onClick={() => alert("O cadastro de vendedores ainda não está disponível.")}>Saiba mais →</button></div><div className="product-grid">{marketplaceAreas.map((area) => <article key={area[0]}><div className={`product-art ${area[2]}`}><span>▣</span><em>EM PREPARAÇÃO</em></div><span>Categoria planejada</span><h2>{area[0]}</h2><p><small>{area[1]}</small></p><div><strong>Sem ofertas</strong><button disabled>Ainda não disponível</button></div></article>)}</div></ModuleShell>;
}

const learningTracks = [
  ["Negócios digitais", "Conteúdo prático em preparação", "violet"],
  ["Inteligência artificial", "Conteúdo prático em preparação", "cyan"],
  ["Criação de sites", "Conteúdo prático em preparação", "blue"],
  ["Educação financeira", "Conteúdo prático em preparação", "green"],
];

export function LearnPage() {
  return <ModuleShell active="/aprender" eyebrow="NEXUS ACADEMY • EM PREPARAÇÃO" title="Aprenda hoje. Use amanhã." description="As trilhas abaixo são áreas planejadas; cursos reais só aparecerão depois de publicados."><div className="learning-overview"><div><span>▤</span><p><strong>Catálogo em preparação</strong><small>Ainda não há cursos publicados</small></p></div><div><span>◷</span><p><strong>Progresso após o login</strong><small>Sem histórico fictício</small></p></div><div><span>◆</span><p><strong>Certificados planejados</strong><small>Regras ainda em definição</small></p></div></div><div className="course-grid">{learningTracks.map((track) => <article key={track[0]}><div className={`course-cover ${track[2]}`}><span>▤</span><em>EM PREPARAÇÃO</em></div><span>TRILHA PLANEJADA</span><h2>{track[0]}</h2><p>{track[1]}</p><button disabled>Ainda não disponível</button></article>)}</div></ModuleShell>;
}

const communityList = [
  ["Criadores", "Conteúdo, vídeo e economia criativa", "violet"],
  ["Programação", "Código sem complicação", "cyan"],
  ["Empreendedorismo", "Negócios reais com poucos recursos", "orange"],
  ["Estudos", "Rotina, educação e produtividade", "blue"],
  ["Games", "Jogos, campeonatos e amizades", "pink"],
  ["Finanças", "Aprenda a cuidar do seu dinheiro", "green"],
];

export function CommunitiesPage() {
  return <ModuleShell active="/comunidades" eyebrow="JUNTOS VAMOS MAIS LONGE • EM PREPARAÇÃO" title="Encontre pessoas que querem crescer." description="Estas são categorias planejadas. Grupos e contagens reais aparecerão após o lançamento."><div className="community-layout"><div className="community-grid">{communityList.map((community) => <article key={community[0]}><div className={`community-symbol ${community[2]}`}><span>◎</span></div><h2>{community[0]}</h2><p>{community[1]}</p><small><i /> Nenhum grupo publicado</small><button disabled>Em breve</button></article>)}</div><aside className="reputation-card"><span>◆</span><h3>Reputação Nexus</h3><strong>Será ativada no lançamento</strong><p>A pontuação será baseada somente em atividades reais de usuários cadastrados.</p><div><i /></div><small>Sem ranking ou pontuação fictícia</small><button disabled>Em planejamento</button></aside></div></ModuleShell>;
}

const questions = [
  { q: "Qual é o melhor primeiro passo antes de investir em uma ideia?", options: ["Comprar anúncios", "Validar com pessoas reais", "Criar um logotipo", "Abrir uma empresa"], answer: 1 },
  { q: "O que torna um processo escalável?", options: ["Depender sempre do fundador", "Custar mais a cada cliente", "Ser repetível e automatizável", "Não medir resultados"], answer: 2 },
  { q: "Qual métrica mostra se clientes continuam usando um produto?", options: ["Retenção", "Impressões", "Seguidores", "Alcance"], answer: 0 },
];

export function GamesPage() {
  const [index, setIndex] = useState(0); const [score,setScore]=useState(0); const [selected,setSelected]=useState<number|null>(null); const [done,setDone]=useState(false);
  function choose(option:number){if(selected!==null)return;setSelected(option);if(option===questions[index].answer)setScore(score+1)}
  function next(){if(index===questions.length-1){setDone(true)}else{setIndex(index+1);setSelected(null)}}
  function restart(){setIndex(0);setScore(0);setSelected(null);setDone(false)}
  return <ModuleShell active="/jogos" eyebrow="NEXUS GAMES" title="Jogue. Aprenda. Teste suas habilidades." description="Desafios rápidos e originais para aprender enquanto você se diverte."><div className="game-layout"><section className="quiz-card">{done ? <div className="quiz-finish"><span>◆</span><small>DESAFIO CONCLUÍDO</small><h2>{score}/{questions.length}</h2><p>{score===questions.length?"Perfeito. Mentalidade afiada!":"Bom começo. Cada tentativa deixa você melhor."}</p><button onClick={restart}>Jogar novamente</button></div> : <><header><span>DESAFIO EMPREENDEDOR</span><em>{index+1} / {questions.length}</em></header><div className="quiz-progress"><i style={{width:`${((index+1)/questions.length)*100}%`}} /></div><h2>{questions[index].q}</h2><div className="quiz-options">{questions[index].options.map((option,optionIndex)=><button className={selected===null?"":optionIndex===questions[index].answer?"correct":selected===optionIndex?"wrong":""} onClick={()=>choose(optionIndex)} key={option}><span>{String.fromCharCode(65+optionIndex)}</span>{option}</button>)}</div>{selected!==null&&<button className="next-question" onClick={next}>{index===questions.length-1?"Ver resultado":"Próxima pergunta"} →</button>}</>}</section><aside className="games-sidebar"><div><span>♢</span><p><strong>{score} acerto{score === 1 ? "" : "s"}</strong><small>nesta partida</small></p></div><h3>Ranking após o lançamento</h3><article><em>—</em><span className="avatar avatar-way">NB</span><p>Aguardando participantes reais</p><strong>Em breve</strong></article></aside></div></ModuleShell>;
}

export function PlansPage() {
  const plans = [{name:"Gratuito",description:"Possível porta de entrada para conhecer a plataforma.",features:["Recursos ainda em definição","Limites serão publicados no lançamento"]},{name:"Pro",description:"Plano futuro para usuários que precisarem de mais recursos.",features:["Preço ainda não definido","Benefícios em avaliação"]},{name:"Empresas",description:"Possibilidade futura para equipes e operações.",features:["Condições ainda não definidas","Disponibilidade não confirmada"]}];
  return <ModuleShell active="/planos" eyebrow="PLANOS • EM DEFINIÇÃO" title="Nenhum plano pago está disponível ainda." description="Preços, limites e condições só serão publicados quando estiverem oficialmente definidos."><div className="plans-grid">{plans.map((plan,index)=><article key={plan.name}><span>{index===0?"◇":index===1?"✦":"◆"}</span><h2>{plan.name}</h2><p>{plan.description}</p><div><strong>Preço a definir</strong></div><button disabled>Ainda não disponível</button><ul>{plan.features.map((feature)=><li key={feature}><span>•</span>{feature}</li>)}</ul></article>)}</div><p className="plans-note">Esta página apresenta apenas possibilidades de produto, sem oferta comercial ativa.</p></ModuleShell>;
}

export function LoginPage() {
  const [message,setMessage]=useState("");
  function submit(event:FormEvent){event.preventDefault();setMessage("O login real será ativado quando as variáveis do Supabase forem configuradas.")}
  return <ModuleShell active="" eyebrow="SUA CONTA NEXUS" title="Continue de onde parou." description="Entre para acessar seus conteúdos, cursos, produtos e criações."><div className="login-wrap"><form onSubmit={submit}><span className="login-sigil">N</span><h2>Entrar no Nexus</h2><p>Modo demonstração ativo</p><label htmlFor="email">E-mail</label><input id="email" type="email" placeholder="voce@email.com" required/><label htmlFor="password">Senha</label><input id="password" type="password" placeholder="••••••••" required/><button>Entrar</button>{message&&<div className="demo-message">✦ {message}</div>}<small>Ao continuar, você concorda com os Termos e a Política de Privacidade.</small></form><aside><span>✦</span><h2>Um login.<br/>Todo o seu universo.</h2><ul><li>✓ Salve conteúdos e produtos</li><li>✓ Continue seus cursos</li><li>✓ Crie com Nexus IA</li><li>✓ Participe das comunidades</li></ul></aside></div></ModuleShell>;
}
