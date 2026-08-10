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

const trends = [
  ["Inteligência Artificial", "18,4 mil posts"],
  ["Renda digital", "12,7 mil posts"],
  ["ENEM 2026", "9,2 mil posts"],
  ["Games BR", "7,8 mil posts"],
];

const searchData = [
  { type: "IA", title: "Gerador de plano de negócios", detail: "Ferramenta Nexus" },
  { type: "Curso", title: "Primeira venda pela internet", detail: "38 min • Gratuito" },
  { type: "Comunidade", title: "Criadores do Brasil", detail: "12,4 mil membros" },
  { type: "Produto", title: "Kit creator compacto", detail: "R$ 189,90" },
  { type: "Vídeo", title: "7 negócios para começar do zero", detail: "14 min" },
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
            <span className="online"><i /> 48 mil online</span>
            <button className="icon-button" aria-label="Alternar tema" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☼" : "☾"}</button>
            <button className="icon-button notification-button" aria-label="Ver notificações" onClick={() => setNoticeOpen(!noticeOpen)}>♢<i /></button>
            <button className="primary-small" onClick={() => notify("Cadastro liberado em modo demonstração")}>Criar conta</button>
          </div>
          {noticeOpen && (
            <div className="notification-popover">
              <div><strong>Notificações</strong><button onClick={() => setNoticeOpen(false)}>×</button></div>
              <article><span>✦</span><p><b>Bem-vindo ao Nexus</b><small>Seu novo universo digital começa aqui.</small></p></article>
              <article><span>◎</span><p><b>Comunidade em alta</b><small>Criadores do Brasil ganhou 840 membros.</small></p></article>
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
                <div className="face-stack"><span>AV</span><span>JS</span><span>MP</span><span>+8k</span></div>
                <p><strong>8.420 novos membros</strong><small>entraram esta semana</small></p>
              </div>
            </div>
            <div className="hero-visual" aria-label="Visão da atividade no Nexus Brasil">
              <div className="orb orb-one" /><div className="orb orb-two" />
              <div className="visual-grid" />
              <div className="float-card creator-card"><span className="avatar avatar-lia">LA</span><p><small>Criadora em destaque</small><strong>Lia Alves <i>✓</i></strong><em>+12,8k seguidores</em></p><button onClick={() => notify("Agora você segue Lia Alves")}>Seguir</button></div>
              <div className="float-card ai-card"><span>✦</span><p><small>Nexus IA</small><strong>Seu plano está pronto</strong></p><i>→</i></div>
              <div className="float-card trend-card"><div><span>↗</span><small>Tendência agora</small></div><strong>#RendaDigital</strong><p>12,7 mil publicações</p><div className="mini-chart"><i /><i /><i /><i /><i /></div></div>
              <div className="center-sigil"><div><span>N</span></div><i /><i /><i /></div>
              <div className="activity-pill"><i /> ATIVIDADE AO VIVO</div>
            </div>
          </section>

          <section className="quick-stats" aria-label="Estatísticas da plataforma">
            <article><span>◎</span><p><strong>+120 mil</strong><small>membros conectados</small></p></article>
            <article><span>▶</span><p><strong>2,4 milhões</strong><small>conteúdos descobertos</small></p></article>
            <article><span>✦</span><p><strong>390 mil</strong><small>criações com IA</small></p></article>
            <article><span>↗</span><p><strong>R$ 8,7 mi</strong><small>gerados por criadores</small></p></article>
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
                  <div><span className="avatar avatar-lia">RA</span><p><strong>Rafael Andrade</strong><small>Há 18 min • 6 min de leitura</small></p><button className={saved.includes("story") ? "saved" : ""} aria-label="Salvar matéria" onClick={() => toggleSaved("story")}>{saved.includes("story") ? "✓" : "◇"}</button></div>
                </div>
              </article>
              <article className="pulse-card">
                <div className="card-title"><div><span>↗</span><strong>Nexus Pulse</strong></div><small><i /> AO VIVO</small></div>
                <p>O que está movimentando o Brasil agora.</p>
                <ol>{trends.map((trend, index) => <li key={trend[0]}><em>0{index + 1}</em><p><strong>#{trend[0].replaceAll(" ", "")}</strong><small>{trend[1]}</small></p><span>{index === 0 ? "+42%" : index === 1 ? "+28%" : index === 2 ? "+19%" : "+12%"}</span></li>)}</ol>
                <button onClick={() => setSearchOpen(true)}>Explorar tendências <span>→</span></button>
              </article>
            </div>
          </section>

          <section className="section" id="videos">
            <div className="section-head"><div><span className="section-kicker red">EM ALTA</span><h2>Vídeos que valem seu tempo</h2></div><button onClick={() => notify("Feed de vídeos aberto em modo demo")}>Ver todos <span>→</span></button></div>
            <div className="video-grid">
              {[
                ["negócios", "7 negócios para começar com menos de R$ 100", "Caio Mendes", "14:22", "84 mil"],
                ["estudo", "Como estudar melhor usando IA", "Nina Castro", "08:41", "51 mil"],
                ["creator", "Meu setup creator barato e completo", "Leo Tech", "11:08", "37 mil"],
              ].map((video, index) => (
                <article className="video-card" key={video[0]}>
                  <button className={`video-thumb thumb-${index + 1}`} aria-label={`Reproduzir ${video[1]}`} onClick={() => notify(`Reproduzindo: ${video[1]}`)}><span className="play">▶</span><em>{video[3]}</em><i>{index === 0 ? "RENDA" : index === 1 ? "ESTUDOS" : "TECH"}</i></button>
                  <div className="video-info"><span className={`avatar avatar-${index + 1}`}>{video[2].split(" ").map((v) => v[0]).join("")}</span><p><strong>{video[1]}</strong><small>{video[2]} · {video[4]} views</small></p><button aria-label="Mais opções">•••</button></div>
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
                ["◎", "Comunidades", "Encontre sua turma", "12 mil grupos", "purple"],
                ["▣", "Marketplace", "Compre e venda fácil", "+48 mil ofertas", "blue"],
                ["▤", "Aprender", "Cursos que dão resultado", "1.200 aulas", "cyan"],
                ["♢", "Jogos", "Desafie e conquiste", "Ranking ao vivo", "pink"],
              ].map((item) => <article id={item[1].toLocaleLowerCase("pt-BR")} key={item[1]}><span className={`eco-icon ${item[4]}`}>{item[0]}</span><p><strong>{item[1]}</strong><small>{item[2]}</small></p><em>{item[3]}</em><button onClick={() => notify(`${item[1]} disponível em modo demonstração`)}>→</button></article>)}
            </div>
          </section>

          <section className="community-cta">
            <div><span>✦</span><span>◎</span><span>↗</span></div>
            <p><span className="section-kicker cyan">O NEXUS É FEITO POR PESSOAS</span><strong>Seu espaço já está pronto.<br />Só falta você.</strong><small>Crie seu perfil, encontre sua comunidade e comece a construir.</small></p>
            <button className="primary-button" onClick={() => notify("Criação de conta iniciada em modo demonstração")}>Criar minha conta grátis <span>→</span></button>
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
