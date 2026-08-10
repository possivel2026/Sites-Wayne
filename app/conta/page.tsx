import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/account-panel";
import { ModuleShell } from "@/components/module-shell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) redirect("/entrar");
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect("/entrar?next=/conta");

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/entrar?next=/conta");
  const user = userData.user;
  const { data: profile } = await supabase.from("profiles").select("display_name, username").eq("id", user.id).maybeSingle();
  const displayName = profile?.display_name || user.user_metadata?.display_name || user.email?.split("@")[0] || "Membro Nexus";

  return <ModuleShell active="" eyebrow="ÁREA PROTEGIDA" title="Sua conta Nexus." description="Gerencie seu acesso e confira os dados reais vinculados à sua sessão."><AccountPanel email={user.email || "E-mail não disponível"} displayName={displayName} username={profile?.username} createdAt={user.created_at} /></ModuleShell>;
}
