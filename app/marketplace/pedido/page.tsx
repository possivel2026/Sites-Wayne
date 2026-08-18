import { MarketplaceOrderStatus } from "@/components/marketplace-order-status";
export default async function OrderPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) { const { id } = await searchParams; return <MarketplaceOrderStatus id={id || ""} />; }

