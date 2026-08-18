"use client";

import { ErrorScreen } from "@/components/error-screen";
import "./globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="pt-BR"><body><ErrorScreen code="500" title="O Nexus encontrou uma falha." description="Nenhum dado precisa ser reenviado agora. Tente carregar a interface novamente." retry={reset} /></body></html>;
}
