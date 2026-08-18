import { ErrorScreen } from "@/components/error-screen";

export default function OfflinePage() {
  return <ErrorScreen code="OFFLINE" title="Você está sem conexão." description="Reconecte-se à internet e tente novamente. Nenhuma operação financeira será repetida automaticamente." />;
}
