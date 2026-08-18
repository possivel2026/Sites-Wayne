import type { Metadata } from "next";
import { ModuleShell } from "@/components/module-shell";
import { OrderStatus } from "@/components/order-status";

export const metadata: Metadata = {
  title: "Acompanhar pedido — Sites Wayne",
  description: "Acompanhe a confirmação do pagamento e a publicação automática do seu site.",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id = "" } = await searchParams;
  return (
    <ModuleShell
      active="/servicos"
      eyebrow="ENTREGA AUTOMÁTICA"
      title="Seu pedido está em processamento."
      description="A página atualiza sozinha. Assim que o Mercado Pago confirmar a aprovação, o link definitivo aparece aqui."
    >
      <OrderStatus orderId={id} />
    </ModuleShell>
  );
}
