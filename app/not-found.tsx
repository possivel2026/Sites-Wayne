import { ErrorScreen } from "@/components/error-screen";

export default function NotFound() {
  return <ErrorScreen code="404" title="Esta página não existe." description="O endereço pode ter mudado ou o conteúdo ainda não foi publicado." />;
}
