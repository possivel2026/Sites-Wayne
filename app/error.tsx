"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(JSON.stringify({ level: "error", service: "web", message: "route_error", digest: error.digest || "unavailable" })); }, [error]);
  return <ErrorScreen code={error.digest || "500"} title="Algo não funcionou como esperado." description="A falha foi isolada e o restante do Nexus continua disponível." retry={reset} />;
}
