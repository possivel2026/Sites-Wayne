"use client";

import { FormEvent, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";

type NavItem = { label: string; icon: string; id: string; href: string };

const navItems: NavItem[] = [
  { label: "Início", icon: "⌂", id: "inicio", href: "/" },
  { label: "Explorar", icon: "◇", id: "explorar", href: "/explorar" },
  { label: "Vídeos", icon: "▶", id: "videos", href: "/videos" },
  { label: "Nexus IA", icon: "✦", id: "ia", href: "/ia" },
  { label: "Comunidades", icon: "◎", id: "comunidades", href: "/comunidades" },
  { label: "Marketplace", icon: "▣", id: "marketplace", href: "/marketplace" },
  { label: "Aprender", icon: "▤", id: "aprender", href: "/aprender" },
  { label: "Jogos", icon: "♢", id: "jogos", href: "/jogos" },
];

const plannedTopics = [
  ["Inteligência Artificial", "Tema em preparação"],
  ["Renda digital", "Tema em preparação"],
  ["Educação", "Tema em preparação"],
  ["Games BR", "Tema em preparação"],
];

const searchData = [
  { type: "IA", title: "Ferramentas de produtividade", detail: "Disponível em modo beta" },
  { type: "Curso", title: "Área de aprendizagem", detail: "Catálogo em preparação" },
  { type: "Comunidade", title: "Comunidades temáticas", detail: "Inscrições em breve" },
  { type: "Produto", title: "Marketplace de criadores", detail: "Ainda sem vendedores cadastrados" },
  { type: "Vídeo", title: "Nexus Play", detail: "Catálogo em preparação" },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className="brand" href="#inicio" aria-label={`${siteConfig.name} — início`}>
      <span className="brand-mark" aria-hidden="true"><i /><b /></span>
      {!compact && <span>{siteConfig.shortName}<small>BRASIL</small></span>}
    </a>
  );
}

export function NexusHome() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    if (!normalized) return searchData;
    return searchData.filter((item) =>
      `${item.type} ${item.title} ${item.detail}`.toLocaleLowerCase("pt-BR").includes(normalized),
    );
  }, [query]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function toggleSaved(item: string) {
    setSaved((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
    notify(saved.includes(item) ? "Removido dos salvos" : "Salvo na sua coleção");
  }

  function submitNewsletter(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return notify("Digite um e-mail válido");
    notify("Você entrou na lista Nexus!");
    setEmail("");
  }

  return (
    <div className="nexus-app" data-theme={theme}>
      <aside className="sidebar">
        <Logo />
        <nav aria-label="Navegação principal">
          <p className="nav-label">Descobrir</p>
          {navItems.slice(0, 5).map((item, index) => (
            <a className={index === 0 ? "active" : ""} href={item.href} key={item.id}>
              <span>{item.icon}</span>{item.label}{item.id === "ia" && <em>Beta</em>}
            </a>
          ))}
          <p className="nav-label nav-label-spaced">Fazer</p>
          {navItems.slice(5).map((item) => (
            <a href={item.href} key={item.id}><span>{item.icon}</span>{item.label}</a>
          ))}
        </nav>
        <div className="upgrade-card">
          <span className="spark">✦</span>
          <strong>Desbloqueie o Pro</strong>
          <p>Mais IA, destaque e benefícios.</p>
          <button onClick={() => { window.location.href = "/planos"; }}>Ver planos</button>
        </div>
        <div className="sidebar-user">
          <span className="avatar avatar-way">MW</span>
          <span><strong>Visitante</strong><small>Conta gratuita</small></span>
          <button aria-label="Abrir menu do perfil" onClick={() => notify("Entre para personalizar seu Nexus")}>•••</button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="mobile-logo"><Logo /></div>
          <button className="global-search" onClick={() => setSearchOpen(true)} aria-label="Abrir busca global">
            <span aria-hidden="true">⌕</span><span>Busque vídeos, pessoas, produtos e mais...</span><kbd>⌘ K</kbd>
          </button>
          <div className="top-actions">
            <span className="online"><i /> Versão beta</span>
            <button className="icon-button" aria-label="Alternar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☼" : "☾"}</button>
            <button className="icon-button notification-button" aria-label="Ver notificações" onClick={() => setNoticeOpen(!noticeOpen)}>♢<i /></button>
            <button className="primary-small" onClick={() => notify("O cadastro ainda está em preparação")}>Criar conta</button>
          </div>
          {noticeOpen && (
            <div className="notification-popover">
              <div><strong>Notificações</strong><button onClick={() => setNoticeOpen(false)}>×</button></div>
              <article><span>✦</span><p><b>Bem-vindo ao Nexus</b><small>Seu novo universo digital começa aqui.</small></p></article>
              <article><span>◎</span><p><b>Recursos em implantação</b><small>Dados reais serão exibidos após o lançamento.</small></p></article>
            </div>
          )}
        </header>

        <div className="page-content">
          <section className="hero" id="inicio">
            <div className="hero-copy">
              <div className="eyebrow"><span>✦</span> O ecossistema digital do Brasil</div>
              <h1>Tudo que move você,<br /><span>conectado.</span></h1>
              <p>Descubra ideias, crie com inteligência artificial, aprenda novas habilidades e transforme seu talento em oportunidade.</p>
              <div className="hero-actions">
                <a className="primary-button" href="#explorar">Explorar agora <span>→</span></a>
                <a className="secondary-button" href="/ia"><span>✦</span> Conhecer Nexus IA</a>
              </div>
              <div className="social-proof">
                <div className="face-stack"><span>IA</span><span>ED</span><span>MK</span><span>+</span></div>
                <p><strong>Plataforma em fase beta</strong><small>aguardando os primeiros dados reais</small></p>
              </div>
            </div>
            <div className="hero-visual" aria-label="Visão da atividade no Nexus Brasil">
              <div className="orb orb-one" /><div className="orb orb-two" />
              <div className="visual-grid" />
              <div className="float-card creator-card"><span className="avatar avatar-lia">NB</span><p><small>Perfis de criadores</small><strong>Em preparação</strong><em>Sem números inventados</em></p><button onClick={() => notify("Perfis reais serão exibidos após o cadastro")}>Em breve</button></div>
              <div className="float-card ai-card"><span>✦</span><p><small>Nexus IA</small><strong>Seu plano está pronto</strong></p><i>→</i></div>
              <div className="float-card trend-card"><div><span>↗</span><small>Tendências</small></div><strong>Dados reais em breve</strong><p>Exibidos após o lançamento</p><div className="mini-chart"><i /><i /><i /><i /><i /></div></div>
              <div className="center-sigil"><div><span>N</span></div><i /><i /><i /></div>
              <div className="activity-pill"><i /> PAINEL DEMONSTRATIVO</div>
            </div>
          </section>

          <section className="quick-stats" aria-label="Estado dos recursos da plataforma">
            <article><span>◎</span><p><strong>Em breve</strong><small>membros reais</small></p></article>
            <article><span>▶</span><p><strong>Preparando</strong><small>catálogo de conteúdo</small></p></article>
            <article><span>✦</span><p><strong>Beta</strong><small>ferramentas de IA</small></p></article>
            <article><span>↗</span><p><strong>Planejado</strong><small>recursos para criadores</small></p></article>
          </section>

          <section className="section" id="explorar">
            <div className="section-head"><div><span className="section-kicker">SEU NEXUS</span><h2>Descubra algo novo hoje</h2></div><button onClick={() => setSearchOpen(true)}>Ver tudo <span>→</span></button></div>
            <div className="discovery-grid">
              <article className="feature-story">
                <div className="story-art"><div className="planet"><i /><span>BR</span></div><div className="story-stars" /></div>
                <div className="story-overlay">
                  <span className="tag tag-purple">CRIATIVIDADE</span>
                  <h3>O futuro já começou — e ele está sendo criado aqui.</h3>
                  <p>Conheça os brasileiros transformando ideias em negócios reais.</p>
                  <div><span className="avatar avatar-lia">NB</span><p><strong>Equipe Nexus Brasil</strong><small>Conteúdo editorial em preparação</small></p><button className={saved.includes("story") ? "saved" : ""} aria-label="Salvar matéria" onClick={() => toggleSaved("story")}>{saved.includes("story") ? "✓" : "◇"}</button></div>
                </div>
              </article>
              <article className="pulse-card">
                <div className="card-title"><div><span>↗</span><strong>Nexus Pulse</strong></div><small><i /> EM PREPARAÇÃO</small></div>
                <p>Temas que poderão ser acompanhados quando houver dados reais.</p>
                <ol>{plannedTopics.map((topic, index) => <li key={topic[0]}><em>0{index + 1}</em><p><strong>#{topic[0].replaceAll(" ", "")}</strong><small>{topic[1]}</small></p><span>—</span></li>)}</ol>
                <button onClick={() => setSearchOpen(true)}>Explorar tendências <span>→</span></button>
              </article>
            </div>
          </section>

          <section className="section" id="videos">
            <div className="section-head"><div><span className="section-kicker red">EM PREPARAÇÃO</span><h2>Vídeos que valem seu tempo</h2></div><button onClick={() => notify("O catálogo será publicado quando houver vídeos reais")}>Ver todos <span>→</span></button></div>
            <div className="video-grid">
              {[
                ["negócios", "Ideias de negócios acessíveis", "Conteúdo demonstrativo", "Em breve"],
                ["estudo", "Como estudar melhor usando IA", "Conteúdo demonstrativo", "Em breve"],
                ["creator", "Setup creator econômico", "Conteúdo demonstrativo", "Em breve"],
              ].map((video, index) => (
                <article className="video-card" key={video[0]}>
                  <button className={`video-thumb thumb-${index + 1}`} aria-label={`Prévia de ${video[1]}`} onClick={() => notify("Este vídeo ainda não foi publicado")}><span className="play">▶</span><em>{video[3]}</em><i>{index === 0 ? "RENDA" : index === 1 ? "ESTUDOS" : "TECH"}</i></button>
                  <div className="video-info"><span className={`avatar avatar-${index + 1}`}>NB</span><p><strong>{video[1]}</strong><small>{video[2]} · ainda não publicado</small></p><button aria-label="Mais opções">•••</button></div>
                </article>
              ))}
            </div>
          </section>

          <section className="section" id="ia">
            <div className="ai-hub">
              <div className="ai-intro"><span className="section-kicker cyan">NEXUS IA</span><h2>Uma ideia. Dez caminhos.<br /><em>Infinitas possibilidades.</em></h2><p>Ferramentas inteligentes para acelerar seus estudos, conteúdo e negócios.</p><button className="primary-button" onClick={() => notify("Central Nexus IA aberta em modo demonstração")}>Abrir central de IA <span>→</span></button></div>
              <div className="ai-tools">
                {[["✎", "Assistente de texto", "Escreva melhor e mais rápido"], ["↯", "Plano de negócio", "Da ideia à estratégia"], ["▤", "Organizador de estudos", "Plano sob medida"], ["◎", "Creator de conteúdo", "Posts que conectam"]].map((tool) => <button key={tool[1]} onClick={() => notify(`${tool[1]} aberto em modo demonstração`)}><span>{tool[0]}</span><p><strong>{tool[1]}</strong><small>{tool[2]}</small></p><i>→</i></button>)}
              </div>
            </div>
          </section>

          <section className="section ecosystem" id="comunidades">
            <div className="section-head"><div><span className="section-kicker">UM ECOSSISTEMA COMPLETO</span><h2>Seu próximo passo começa aqui</h2></div></div>
            <div className="ecosystem-grid">
              {[
                ["◎", "Comunidades", "Encontre sua turma", "Inscrições em breve", "purple"],
                ["▣", "Marketplace", "Compre e venda fácil", "Vendedores em breve", "blue"],
                ["▤", "Aprender", "Cursos que dão resultado", "Catálogo em preparação", "cyan"],
                ["♢", "Jogos", "Desafie e conquiste", "Ranking após o lançamento", "pink"],
              ].map((item) => <article id={item[1].toLocaleLowerCase("pt-BR")} key={item[1]}><span className={`eco-icon ${item[4]}`}>{item[0]}</span><p><strong>{item[1]}</strong><small>{item[2]}</small></p><em>{item[3]}</em><button onClick={() => notify(`${item[1]} disponível em modo demonstração`)}>→</button></article>)}
            </div>
          </section>

          <section className="community-cta">
            <div><span>✦</span><span>◎</span><span>↗</span></div>
            <p><span className="section-kicker cyan">O NEXUS É FEITO POR PESSOAS</span><strong>Seu espaço está sendo preparado.</strong><small>Contas e comunidades serão abertas quando as integrações reais estiverem prontas.</small></p>
            <button className="primary-button" onClick={() => notify("Você está conhecendo a versão beta do Nexus")}>Conhecer a versão beta <span>→</span></button>
          </section>

          <footer>
            <div><Logo /><p>{siteConfig.description}</p></div>
            <form onSubmit={submitNewsletter}><label htmlFor="newsletter">Receba ideias que valem seu tempo.</label><div><input id="newsletter" value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="seu@email.com" /><button aria-label="Assinar newsletter">→</button></div></form>
          <nav aria-label="Links do rodapé"><a href="/explorar">Explorar</a><a href="/ia">Nexus IA</a><a href="/comunidades">Comunidades</a><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a></nav>
            <small>© 2026 {siteConfig.name}. Feito para quem faz acontecer.</small>
          </footer>
        </div>
      </main>

          <nav className="mobile-nav" aria-label="Navegação móvel">{navItems.slice(0, 5).map((item, index) => <a className={index === 0 ? "active" : ""} href={item.href} key={item.id}><span>{item.icon}</span>{item.label === "Nexus IA" ? "IA" : item.label}</a>)}</nav>

      {searchOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <section className="search-modal" role="dialog" aria-modal="true" aria-label="Busca global" onMouseDown={(event) => event.stopPropagation()}>
            <div className="search-input"><span>⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você quer encontrar?" /><kbd onClick={() => setSearchOpen(false)}>ESC</kbd></div>
            <div className="search-filters"><button className="active">Todos</button><button>Vídeos</button><button>Pessoas</button><button>Produtos</button><button>Cursos</button></div>
            <div className="search-results"><p>{query ? `Resultados para “${query}”` : "Descobertas para você"}</p>{results.length ? results.map((item) => <button key={item.title} onClick={() => { setSearchOpen(false); notify(`${item.title} aberto em modo demo`); }}><span>{item.type.slice(0, 1)}</span><p><strong>{item.title}</strong><small>{item.type} · {item.detail}</small></p><i>↗</i></button>) : <div className="empty-search"><span>◇</span><strong>Nada encontrado</strong><small>Tente palavras como IA, curso ou negócio.</small></div>}</div>
          </section>
        </div>
      )}
      {toast && <div className="toast"><span>✓</span>{toast}</div>}
    </div>
  );
}
