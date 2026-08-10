import type { MetadataRoute } from "next";

const routes = ["", "/explorar", "/videos", "/ia", "/comunidades", "/marketplace", "/aprender", "/jogos", "/planos", "/termos", "/privacidade"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://nexus-brasil.mhxzwayyn.chatgpt.site";
  return routes.map((route) => ({ url: `${base}${route}`, lastModified: new Date(), changeFrequency: route === "" ? "daily" : "weekly", priority: route === "" ? 1 : .8 }));
}
