import "server-only";
import { supabasePublicRequest } from "@/lib/supabase/rest";

export type MarketplaceProduct = {
  id: string;
  title: string;
  slug: string;
  description: string;
  priceCents: number;
  inventory: number | null;
  images: string[];
};

type ProductRow = { id: string; title: string; slug: string; description: string; price_cents: number; inventory: number | null; images: unknown };

function safeImages(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && /^https:\/\//.test(item)).slice(0, 6);
}

export async function listMarketplaceProducts(limit = 60): Promise<MarketplaceProduct[]> {
  const rows = await supabasePublicRequest<ProductRow[]>(`products?status=eq.published&select=id,title,slug,description,price_cents,inventory,images&order=created_at.desc&limit=${Math.max(1, Math.min(limit, 100))}`);
  return rows.map((row) => ({ id: row.id, title: row.title, slug: row.slug, description: row.description, priceCents: row.price_cents, inventory: row.inventory, images: safeImages(row.images) }));
}

