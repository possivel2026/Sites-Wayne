import type { MetadataRoute } from "next";
import { listPublishedWayneSites } from "@/lib/supabase-admin";

const routes = ["", "/servicos", "/criar-site", "/explorar", "/videos", "/ia", "/comunidades", "/marketplace", "/sites", "/barbearia-wayne", "/aprender", "/jogos", "/planos", "/termos", "/privacidade"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  const base = configured && !configured.includes("localhost") ? configured.replace(/\/$/, "") : "https://sites-wayne.vercel.app";
  const core: MetadataRoute.Sitemap = routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "daily" : "weekly", priority: route === "" ? 1 : .8 }));
  try {
    const sites = await listPublishedWayneSites(1000);
    return [...core, ...sites.map((site) => ({ url: `${base}/clientes/${site.slug}`, lastModified: new Date(site.updated_at), changeFrequency: "weekly" as const, priority: .7 }))];
  } catch { return core; }
}
