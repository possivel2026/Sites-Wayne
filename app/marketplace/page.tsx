import { MarketplacePage } from "@/components/marketplace-page";
import { listMarketplaceProducts, type MarketplaceProduct } from "@/lib/marketplace";
import { getFeatureStatus } from "@/lib/server/features";

export const revalidate = 300;

export default async function MarketPage() {
  if (!getFeatureStatus("marketplace").ready) return <MarketplacePage ready={false} products={[]} />;
  let products: MarketplaceProduct[] = [];
  let initialError: string | undefined;
  try { products = await listMarketplaceProducts(); }
  catch { initialError = "A vitrine não respondeu agora. Nenhuma oferta foi simulada."; }
  return <MarketplacePage ready products={products} initialError={initialError} />;
}
