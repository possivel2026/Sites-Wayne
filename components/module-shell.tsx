"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { ReactNode, useState } from "react";
import { portalNavigation, siteConfig } from "@/config/site";

export function ModuleShell({ active, eyebrow, title, description, children, action }: {
  active: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const [light, setLight] = useState(false);
  const [search, setSearch] = useState(false);
  return (
    <div className="nexus-app module-app" data-theme={light ? "light" : "dark"}>
      <aside className="module-sidebar">
        <a className="brand" href="/" aria-label={`${siteConfig.name} — início`}><span className="brand-mark"><i /><b /></span><span>{siteConfig.shortName}<small>BRASIL</small></span></a>
        <nav aria-label="Navegação principal">
          {portalNavigation.map((item) => <a className={active === item.href ? "active" : ""} href={item.href} key={item.href}><span>{item.icon}</span>{item.label}{item.href === "/ia" && <em>Beta</em>}</a>)}
        </nav>
        <a className="module-plan" href="/planos"><span>✦</span><p><strong>Nexus Pro</strong><small>Acelere tudo que você faz.</small></p><i>→</i></a>
        <div className="module-profile"><span className="avatar avatar-way">MW</span><p><strong>Visitante</strong><small>Modo demonstração</small></p><a href="/entrar">Entrar</a></div>
      </aside>
      <main className="module-main">
        <header className="module-topbar">
          <a className="module-mobile-logo" href="/"><span className="brand-mark"><i /><b /></span><strong>NEXUS</strong></a>
          <button className="module-search" onClick={() => setSearch(true)}><span>⌕</span> Buscar em todo o Nexus <kbd>⌘ K</kbd></button>
          <div><span className="online"><i /> Versão beta</span><button className="icon-button" aria-label="Alternar tema" onClick={() => setLight(!light)}>{light ? "☾" : "☼"}</button><a className="primary-small" href="/entrar">Criar conta</a></div>
        </header>
        <div className="module-content">
          <section className="module-hero"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</section>
          {children}
        </div>
      </main>
      <nav className="mobile-nav" aria-label="Navegação móvel">{portalNavigation.slice(0,5).map((item) => <a className={active === item.href ? "active" : ""} href={item.href} key={item.href}><span>{item.icon}</span>{item.label === "Nexus IA" ? "IA" : item.label}</a>)}</nav>
      {search && <div className="modal-backdrop" onMouseDown={() => setSearch(false)}><section className="quick-search" onMouseDown={(event) => event.stopPropagation()}><button onClick={() => setSearch(false)}>×</button><span>⌕</span><input autoFocus placeholder="Digite o que procura..."/><p>Atalho rápido</p><div>{portalNavigation.slice(1).map((item) => <a href={item.href} key={item.href}><span>{item.icon}</span>{item.label}<i>→</i></a>)}</div></section></div>}
    </div>
  );
}
