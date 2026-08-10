import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { ModuleShell } from "@/components/module-shell";
import { safeNextPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims?.sub) redirect(nextPath);
  }

  const initialError = params.erro === "link-invalido" ? "O link de autenticação expirou ou já foi usado. Solicite um novo." : undefined;
  return <ModuleShell active="" eyebrow="SUA CONTA NEXUS" title="Continue de onde parou." description="Entre ou crie sua conta para acessar seus dados com segurança."><AuthForm nextPath={nextPath} initialError={initialError} /></ModuleShell>;
}
