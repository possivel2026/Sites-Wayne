"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AccountPanel({ email, displayName, username, createdAt }: { email: string; displayName: string; username?: string | null; createdAt?: string }) {
  const [leaving, setLeaving] = useState(false);

  async function signOut() {
    setLeaving(true);
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return <section className="account-card"><div className="account-avatar">{displayName.slice(0, 2).toUpperCase()}</div><div className="account-identity"><span>CONTA NEXUS</span><h2>{displayName}</h2><p>{email}</p>{username && <small>@{username}</small>}</div><div className="account-security"><article><span>✓</span><p><strong>Sessão ativa</strong><small>Protegida por cookies seguros do Supabase</small></p></article><article><span>⌁</span><p><strong>Membro desde</strong><small>{createdAt ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(new Date(createdAt)) : "Cadastro confirmado"}</small></p></article></div><div className="account-actions"><a href="/redefinir-senha">Alterar senha</a><button onClick={signOut} disabled={leaving}>{leaving ? "Saindo..." : "Sair da conta"}</button></div></section>;
}
