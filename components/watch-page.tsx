"use client";
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useState } from "react";
import { ModuleShell } from "@/components/module-shell";
import type { WatchCard, WatchDetails } from "@/lib/tmdb/types";

type WatchPageProps = { ready: boolean; initialTitles: WatchCard[]; initialError?: string; tmdbLogoUrl?: string };

function year(date: string | null) { return date ? date.slice(0, 4) : "Data não informada"; }

export function WatchPage({ ready, initialTitles, initialError, tmdbLogoUrl }: WatchPageProps) {
  const [titles, setTitles] = useState(initialTitles);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(initialError || "");
  const [selected, setSelected] = useState<WatchDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  useEffect(() => {
    if (!ready) return;
    fetch("/api/watch/saved").then((response) => response.json()).then((data: { saved?: Array<{ media_type: string; tmdb_id: number }> }) => {
      setSaved((data.saved || []).map((item) => `${item.media_type}:${item.tmdb_id}`));
    }).catch(() => undefined);
  }, [ready]);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (query.trim().length < 2 || !ready) return;
    setLoading(true); setMessage(""); setSearched(true);
    try {
      const response = await fetch(`/api/watch/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json() as { results?: WatchCard[]; error?: string };
      if (!response.ok) throw new Error(data.error || "Busca indisponível.");
      setTitles(data.results || []);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Busca indisponível."); }
    finally { setLoading(false); }
  }

  async function openTitle(item: WatchCard) {
    setDetailsLoading(true); setMessage("");
    try {
      const response = await fetch(`/api/watch/title/${item.mediaType}/${item.id}`);
      const data = await response.json() as { details?: WatchDetails; error?: string };
      if (!response.ok || !data.details) throw new Error(data.error || "Detalhes indisponíveis.");
      setSelected(data.details);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Detalhes indisponíveis."); }
    finally { setDetailsLoading(false); }
  }

  async function toggleSave(item: WatchCard) {
    const key = `${item.mediaType}:${item.id}`;
    const removing = saved.includes(key);
    const response = await fetch("/api/watch/saved", { method: removing ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(item) });
    if (response.ok) setSaved((current) => removing ? current.filter((value) => value !== key) : [...current, key]);
    else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setMessage(data.error || "Entre na sua conta para salvar títulos.");
    }
  }

  return <ModuleShell active="/videos" eyebrow="NEXUS WATCH" title="Filmes e séries, sem catálogo inventado." description="Pesquise títulos reais, veja informações e confira onde assistir legalmente no Brasil.">
    {!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Catálogo aguardando ativação</strong><p>A integração está pronta, mas permanece isolada até o token do TMDB e a feature flag serem configurados no servidor.</p></div></section> : <>
      <form className="watch-search" onSubmit={search}><label htmlFor="watch-query">Buscar filme ou série</label><div><input id="watch-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex.: Cidade de Deus" minLength={2} maxLength={100}/><button disabled={loading || query.trim().length < 2}>{loading ? "Buscando…" : "Buscar"}</button></div></form>
      <div className="watch-heading"><div><span>{searched ? "RESULTADOS" : "EM ALTA HOJE"}</span><h2>{searched ? `Busca por “${query.trim()}”` : "O que o público está assistindo"}</h2></div><small>Dados e disponibilidade: TMDB • Região Brasil</small></div>
      {message && <div className="inline-alert">{message}</div>}
      {titles.length ? <div className="watch-grid">{titles.map((item) => { const key = `${item.mediaType}:${item.id}`; return <article key={key}>
        <button className="watch-poster" onClick={() => openTitle(item)} aria-label={`Ver detalhes de ${item.title}`}>{item.posterUrl ? <img src={item.posterUrl} alt="" loading="lazy"/> : <span>Sem pôster</span>}<em>{item.mediaType === "movie" ? "FILME" : "SÉRIE"}</em></button>
        <div><button className="watch-title" onClick={() => openTitle(item)}>{item.title}</button><p>{year(item.date)}{item.rating !== null ? ` • ★ ${item.rating.toFixed(1)}` : ""}</p></div>
        <button className="watch-save" onClick={() => toggleSave(item)} aria-label={saved.includes(key) ? "Remover dos salvos" : "Salvar título"}>{saved.includes(key) ? "◆" : "◇"}</button>
      </article>; })}</div> : !loading && <div className="empty-catalog">Nenhum título encontrado para esta busca.</div>}
      <footer className="tmdb-credit">{tmdbLogoUrl && <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer"><img src={tmdbLogoUrl} alt="TMDB"/></a>}<span>Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. A disponibilidade é informativa e pode mudar.</span></footer>
    </>}
    {detailsLoading && <div className="modal-backdrop"><div className="watch-loading">Carregando detalhes…</div></div>}
    {selected && <div className="modal-backdrop" onMouseDown={() => setSelected(null)}><section className="watch-modal" onMouseDown={(event) => event.stopPropagation()}><button className="watch-modal-close" onClick={() => setSelected(null)}>×</button>{selected.backdropUrl && <img className="watch-backdrop" src={selected.backdropUrl} alt=""/>}<div className="watch-modal-content"><span>{selected.mediaType === "movie" ? "FILME" : "SÉRIE"} • {year(selected.date)}</span><h2>{selected.title}</h2><p>{selected.overview}</p><small>{selected.genres.join(" • ")}{selected.runtimeMinutes ? ` • ${selected.runtimeMinutes} min` : ""}{selected.seasons ? ` • ${selected.seasons} temporada${selected.seasons === 1 ? "" : "s"}` : ""}</small><ProviderGroup title="Streaming" items={selected.providers.streaming}/><ProviderGroup title="Aluguel" items={selected.providers.rent}/><ProviderGroup title="Compra" items={selected.providers.buy}/>{!selected.providers.streaming.length && !selected.providers.rent.length && !selected.providers.buy.length && <div className="provider-empty">Nenhum provedor informado para o Brasil neste momento.</div>}{selected.providers.link && <a className="provider-link" href={selected.providers.link} target="_blank" rel="noreferrer">Ver disponibilidade atualizada no TMDB ↗</a>}</div></section></div>}
  </ModuleShell>;
}

function ProviderGroup({ title, items }: { title: string; items: WatchDetails["providers"]["streaming"] }) {
  if (!items.length) return null;
  return <div className="provider-group"><strong>{title}</strong><div>{items.map((provider) => <span key={provider.providerId}>{provider.logoUrl && <img src={provider.logoUrl} alt=""/>}{provider.name}</span>)}</div></div>;
}
