"use client";

import { FormEvent, useMemo, useState } from "react";
import { ModuleShell } from "@/components/module-shell";

const contentCards = [
  { type: "Vídeo", title: "7 negócios para começar com pouco", meta: "84 mil visualizações", color: "violet", href: "/videos" },
  { type: "Curso", title: "Venda seu primeiro produto digital", meta: "Grátis • 12 aulas", color: "cyan", href: "/aprender" },
  { type: "Comunidade", title: "Criadores do Brasil", meta: "12,4 mil membros", color: "blue", href: "/comunidades" },
  { type: "Ferramenta IA", title: "Gerador de plano de negócio", meta: "Nexus IA • Gratuito", color: "pink", href: "/ia" },
  { type: "Produto", title: "Kit creator compacto", meta: "R$ 189,90", color: "orange", href: "/marketplace" },
  { type: "Jogo", title: "Desafio Empreendedor", meta: "2,8 mil jogando", color: "green", href: "/jogos" },
];

export function ExplorePage() {
  const [filter, setFilter] = useState("Tudo");
  const filters = ["Tudo", "Vídeo", "Curso", "Comunidade", "Ferramenta IA", "Produto", "Jogo"];
  const cards = filter === "Tudo" ? contentCards : contentCards.filter((card) => card.type === filter);
  return <ModuleShell active="/explorar" eyebrow="DESCOBERTA SEM FIM" title="Encontre sua próxima grande ideia." description="Conteúdo, pessoas, ferramentas e oportunidades selecionados para mover você para frente."><div className="filter-row">{filters.map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><div className="explore-cards">{cards.map((card, index) => <a href={card.href} key={card.title}><div className={`abstract-cover ${card.color}`}><span>{["▶","▤","◎","✦","▣","♢"][index] || "◇"}</span><i /></div><span className="content-type">{card.type}</span><h2>{card.title}</h2><p>{card.meta}</p><em>Explorar →</em></a>)}</div></ModuleShell>;
}

const videoList = [
  ["7 negócios para começar com menos de R$ 100", "Caio Mendes", "14:22", "84 mil", "violet"],
  ["Como estudar melhor usando inteligência artificial", "Nina Castro", "08:41", "51 mil", "cyan"],
  ["Meu setup creator barato e completo", "Leo Tech", "11:08", "37 mil", "pink"],
  ["Do zero aos primeiros 100 clientes", "Bruna Sales", "19:30", "29 mil", "orange"],
  ["O código que mudou minha carreira", "Lucas Dev", "16:12", "22 mil", "blue"],
  ["Organize sua semana em 15 minutos", "Clara Lima", "09:05", "18 mil", "green"],
];

export function VideosPage() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [category, setCategory] = useState("Para você");
  return <ModuleShell active="/videos" eyebrow="NEXUS PLAY" title="Assista menos. Aprenda mais." description="Vídeos escolhidos pelo valor que entregam — não pelo tempo que prendem você."><div className="filter-row">{["Para você","Negócios","Tecnologia","Educação","Criadores"].map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div><div className="portal-video-grid">{videoList.map((video) => <article key={video[0]}><button className={`portal-video-cover ${video[4]}`} onClick={() => setPlaying(video[0])}><span>▶</span><em>{video[2]}</em></button><div><span className="avatar avatar-way">{video[1].split(" ").map((part) => part[0]).join("")}</span><p><strong>{video[0]}</strong><small>{video[1]} • {video[3]} views</small></p></div></article>)}</div>{playing && <div className="modal-backdrop" onMouseDown={() => setPlaying(null)}><section className="video-modal" onMouseDown={(event) => event.stopPropagation()}><button onClick={() => setPlaying(null)}>×</button><div><span>▶</span></div><h2>{playing}</h2><p>Reprodução demonstrativa. A integração de streaming será ativada quando o armazenamento de vídeos for configurado.</p></section></div>}</ModuleShell>;
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
  return <ModuleShell active="/ia" eyebrow="NEXUS IA • BETA" title="Transforme intenção em ação." description="Escolha uma ferramenta, descreva o objetivo e receba um ponto de partida estruturado em segundos." action={<div className="usage-pill"><span>7</span><p><strong>de 10 usos grátis</strong><small>Renova amanhã</small></p></div>}><div className="ai-workspace"><aside><p>Ferramentas</p>{aiTools.map((item) => <button className={tool === item ? "active" : ""} onClick={() => {setTool(item);setResult("");}} key={item}><span>{item === "Plano de negócio" ? "↯" : item === "Organizador de estudos" ? "▤" : "✦"}</span>{item}</button>)}</aside><form onSubmit={generate}><div className="workspace-head"><span>✦</span><p><strong>{tool}</strong><small>Modo demonstração seguro</small></p></div><label htmlFor="ai-prompt">O que você quer criar?</label><textarea id="ai-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={tool === "Plano de negócio" ? "Ex.: quero vender sites para negócios locais..." : "Digite ou cole seu texto aqui..."} /><div className="prompt-suggestions"><span>Tente:</span>{["Melhorar meu texto", "Criar estratégia", "Organizar em etapas"].map((item) => <button type="button" onClick={() => setPrompt(item)} key={item}>{item}</button>)}</div><button className="generate-button" disabled={loading || !prompt.trim()}>{loading ? "Criando..." : "Gerar com Nexus IA"}<span>✦</span></button>{(loading || result) && <div className="ai-output">{loading ? <div className="output-loading"><i/><i/><i/></div> : <><div><span>✦ Resultado</span><button type="button" onClick={() => navigator.clipboard?.writeText(result)}>Copiar</button></div><pre>{result}</pre></>}</div>}</form></div></ModuleShell>;
}

const products = [
  ["Kit creator compacto", "Áudio & vídeo", "189,90", "4,9", "violet"],
  ["Template Negócio Pro", "Produto digital", "39,90", "4,8", "cyan"],
  ["Mentoria Primeira Venda", "Serviço", "97,00", "4,9", "pink"],
  ["Pack Social 2026", "Design", "29,90", "4,7", "orange"],
  ["Mini ring light USB", "Equipamento", "54,90", "4,6", "blue"],
  ["Planilha Financeira Pro", "Produtividade", "19,90", "4,9", "green"],
];

export function MarketplacePage() {
  const [cart, setCart] = useState<string[]>([]);
  const [drawer, setDrawer] = useState(false);
  const total = useMemo(() => products.filter((product) => cart.includes(product[0])).reduce((sum, product) => sum + Number(product[2].replace(",",".")), 0), [cart]);
  function add(name: string) { setCart((current) => current.includes(name) ? current : [...current,name]); setDrawer(true); }
  return <ModuleShell active="/marketplace" eyebrow="NEXUS MARKET" title="Boas ideias encontram bons compradores." description="Produtos, serviços e recursos digitais de criadores brasileiros verificados." action={<button className="cart-button" onClick={() => setDrawer(true)}>▣ Carrinho <span>{cart.length}</span></button>}><div className="market-banner"><div><span>VENDA NO NEXUS</span><strong>Transforme seu talento em renda.</strong><p>Cadastre seu primeiro produto gratuitamente.</p></div><button onClick={() => alert("Cadastro de vendedor disponível após configurar autenticação.")}>Começar a vender →</button></div><div className="product-grid">{products.map((product) => <article key={product[0]}><div className={`product-art ${product[4]}`}><span>{product[1] === "Serviço" ? "◎" : "▣"}</span><em>DESTAQUE</em></div><span>{product[1]}</span><h2>{product[0]}</h2><p>★ {product[3]} <small>• vendedor verificado</small></p><div><strong>R$ {product[2]}</strong><button onClick={() => add(product[0])}>{cart.includes(product[0]) ? "Adicionado ✓" : "Adicionar"}</button></div></article>)}</div>{drawer && <div className="drawer-backdrop" onMouseDown={() => setDrawer(false)}><aside className="cart-drawer" onMouseDown={(event) => event.stopPropagation()}><header><strong>Seu carrinho</strong><button onClick={() => setDrawer(false)}>×</button></header>{cart.length ? <>{cart.map((name) => {const product=products.find((item)=>item[0]===name)!;return <article key={name}><span className={`mini-product ${product[4]}`}>▣</span><p><strong>{name}</strong><small>R$ {product[2]}</small></p><button onClick={() => setCart((current)=>current.filter((item)=>item!==name))}>Remover</button></article>})}<div className="cart-total"><span>Total</span><strong>R$ {total.toFixed(2).replace(".",",")}</strong></div><button className="checkout-button" onClick={() => alert("Checkout demonstrativo. Configure o Mercado Pago para receber pagamentos reais.")}>Continuar para pagamento</button><small>Pagamento seguro em modo demonstração</small></> : <div className="empty-cart"><span>▣</span><strong>Seu carrinho está vazio</strong><small>Explore produtos feitos por criadores brasileiros.</small></div>}</aside></div>}</ModuleShell>;
}

const courses = [
  ["Primeira venda pela internet", "Marina Souza", "12 aulas", "35%", "violet"],
  ["IA prática para estudar melhor", "Nina Castro", "8 aulas", "0%", "cyan"],
  ["Sites que vendem", "Lucas Dev", "16 aulas", "72%", "blue"],
  ["Finanças para começar", "Rafael Lima", "10 aulas", "0%", "green"],
];

export function LearnPage() {
  const [enrolled, setEnrolled] = useState<string[]>([courses[0][0], courses[2][0]]);
  return <ModuleShell active="/aprender" eyebrow="NEXUS ACADEMY" title="Aprenda hoje. Use amanhã." description="Trilhas curtas, práticas e criadas por quem já fez — para você avançar de verdade."><div className="learning-overview"><div><span>▤</span><p><strong>2 cursos em andamento</strong><small>Continue de onde parou</small></p></div><div><span>◷</span><p><strong>4h 28min</strong><small>Tempo de aprendizado</small></p></div><div><span>◆</span><p><strong>Nível 7</strong><small>1.240 pontos Nexus</small></p></div></div><div className="course-grid">{courses.map((course) => <article key={course[0]}><div className={`course-cover ${course[4]}`}><span>▤</span><em>{course[2]}</em></div><span>CURSO PRÁTICO</span><h2>{course[0]}</h2><p>por {course[1]}</p>{enrolled.includes(course[0]) ? <><div className="progress"><i style={{width:course[3]}} /></div><small>{course[3]} concluído</small><button>Continuar curso →</button></> : <button onClick={() => setEnrolled((current)=>[...current,course[0]])}>Começar grátis →</button>}</article>)}</div></ModuleShell>;
}

const communityList = [
  ["Criadores do Brasil", "Conteúdo, vídeo e economia criativa", "12,4 mil", "violet"],
  ["Programadores iniciantes", "Código sem complicação", "9,8 mil", "cyan"],
  ["Empreendedores do zero", "Negócios reais com poucos recursos", "8,1 mil", "orange"],
  ["Estudo inteligente", "Rotina, ENEM e produtividade", "6,7 mil", "blue"],
  ["Gamers BR", "Jogos, campeonatos e amizades", "15,2 mil", "pink"],
  ["Finanças sem tabu", "Aprenda a cuidar do seu dinheiro", "5,9 mil", "green"],
];

export function CommunitiesPage() {
  const [joined, setJoined] = useState<string[]>([]);
  return <ModuleShell active="/comunidades" eyebrow="JUNTOS VAMOS MAIS LONGE" title="Encontre pessoas que querem crescer." description="Comunidades moderadas para trocar experiência, colaborar e construir oportunidades."><div className="community-layout"><div className="community-grid">{communityList.map((community) => <article key={community[0]}><div className={`community-symbol ${community[3]}`}><span>◎</span></div><h2>{community[0]}</h2><p>{community[1]}</p><small><i /> {community[2]} membros</small><button className={joined.includes(community[0]) ? "joined" : ""} onClick={()=>setJoined((current)=>current.includes(community[0])?current.filter((item)=>item!==community[0]):[...current,community[0]])}>{joined.includes(community[0]) ? "Participando ✓" : "Participar"}</button></article>)}</div><aside className="reputation-card"><span>◆</span><h3>Sua reputação Nexus</h3><strong>Nível 1</strong><p>Participe de discussões úteis e ajude outros membros para ganhar pontos.</p><div><i /></div><small>0 / 100 pontos</small><button>Ver como funciona →</button></aside></div></ModuleShell>;
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
  return <ModuleShell active="/jogos" eyebrow="NEXUS GAMES" title="Jogue. Aprenda. Suba no ranking." description="Desafios rápidos e originais para testar habilidades enquanto você se diverte."><div className="game-layout"><section className="quiz-card">{done ? <div className="quiz-finish"><span>◆</span><small>DESAFIO CONCLUÍDO</small><h2>{score}/{questions.length}</h2><p>{score===questions.length?"Perfeito. Mentalidade afiada!":"Bom começo. Cada tentativa deixa você melhor."}</p><button onClick={restart}>Jogar novamente</button></div> : <><header><span>DESAFIO EMPREENDEDOR</span><em>{index+1} / {questions.length}</em></header><div className="quiz-progress"><i style={{width:`${((index+1)/questions.length)*100}%`}} /></div><h2>{questions[index].q}</h2><div className="quiz-options">{questions[index].options.map((option,optionIndex)=><button className={selected===null?"":optionIndex===questions[index].answer?"correct":selected===optionIndex?"wrong":""} onClick={()=>choose(optionIndex)} key={option}><span>{String.fromCharCode(65+optionIndex)}</span>{option}</button>)}</div>{selected!==null&&<button className="next-question" onClick={next}>{index===questions.length-1?"Ver resultado":"Próxima pergunta"} →</button>}</>}</section><aside className="games-sidebar"><div><span>♢</span><p><strong>+{score*100} pontos</strong><small>nesta partida</small></p></div><h3>Ranking da semana</h3>{[["1","Ana Clara","2.840"],["2","Pedro Lima","2.610"],["3","João Vitor","2.390"]].map((rank)=><article key={rank[0]}><em>{rank[0]}</em><span className="avatar avatar-way">{rank[1].split(" ").map(v=>v[0]).join("")}</span><p>{rank[1]}</p><strong>{rank[2]}</strong></article>)}</aside></div></ModuleShell>;
}

export function PlansPage() {
  const [annual,setAnnual]=useState(true);
  const plans = [{name:"Gratuito",price:"0",description:"Para conhecer o ecossistema.",features:["10 usos de IA por dia","Comunidades e conteúdo","1 produto no marketplace","Cursos gratuitos"]},{name:"Pro",price:annual?"19,90":"24,90",description:"Para quem quer acelerar.",features:["100 usos de IA por dia","Cursos Pro incluídos","10 produtos no marketplace","Perfil e conteúdo em destaque","Analytics de criador"]},{name:"Empresas",price:annual?"79,90":"99,90",description:"Para equipes e operações.",features:["IA com limites ampliados","Até 5 membros","Produtos ilimitados","Painel avançado","Suporte prioritário"]}];
  return <ModuleShell active="/planos" eyebrow="PLANOS SIMPLES" title="Invista no seu próximo nível." description="Comece grátis e evolua somente quando o Nexus já estiver gerando valor para você."><div className="billing-toggle"><span>Mensal</span><button className={annual?"annual":""} onClick={()=>setAnnual(!annual)}><i /></button><span>Anual <em>economize 20%</em></span></div><div className="plans-grid">{plans.map((plan,index)=><article className={index===1?"featured":""} key={plan.name}>{index===1&&<em>MAIS ESCOLHIDO</em>}<span>{index===0?"◇":index===1?"✦":"◆"}</span><h2>{plan.name}</h2><p>{plan.description}</p><div><small>R$</small><strong>{plan.price}</strong><em>/mês</em></div><button onClick={()=>alert(`${plan.name}: pagamento em modo demonstração. Configure o Mercado Pago para ativar.`)}>{index===0?"Começar grátis":"Escolher "+plan.name}</button><ul>{plan.features.map((feature)=><li key={feature}><span>✓</span>{feature}</li>)}</ul></article>)}</div><p className="plans-note">Sem fidelidade • Cancele quando quiser • Pagamento seguro via Mercado Pago quando configurado</p></ModuleShell>;
}

export function LoginPage() {
  const [message,setMessage]=useState("");
  function submit(event:FormEvent){event.preventDefault();setMessage("O login real será ativado quando as variáveis do Supabase forem configuradas.")}
  return <ModuleShell active="" eyebrow="SUA CONTA NEXUS" title="Continue de onde parou." description="Entre para acessar seus conteúdos, cursos, produtos e criações."><div className="login-wrap"><form onSubmit={submit}><span className="login-sigil">N</span><h2>Entrar no Nexus</h2><p>Modo demonstração ativo</p><label htmlFor="email">E-mail</label><input id="email" type="email" placeholder="voce@email.com" required/><label htmlFor="password">Senha</label><input id="password" type="password" placeholder="••••••••" required/><button>Entrar</button>{message&&<div className="demo-message">✦ {message}</div>}<small>Ao continuar, você concorda com os Termos e a Política de Privacidade.</small></form><aside><span>✦</span><h2>Um login.<br/>Todo o seu universo.</h2><ul><li>✓ Salve conteúdos e produtos</li><li>✓ Continue seus cursos</li><li>✓ Crie com Nexus IA</li><li>✓ Participe das comunidades</li></ul></aside></div></ModuleShell>;
}
