"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    if (!isSupabaseConfigured()) return setFeedback("O Supabase ainda não foi conectado.");
    if (password.length < 8) return setFeedback("Use pelo menos 8 caracteres.");
    if (password !== confirm) return setFeedback("As senhas não são iguais.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setFeedback("O link expirou ou a senha não pôde ser alterada. Solicite outro link.");
    setFeedback("Senha atualizada. Redirecionando para sua conta...");
    window.setTimeout(() => window.location.assign("/conta"), 1200);
  }

  return <div className="reset-card"><span className="login-sigil">N</span><h2>Crie uma nova senha</h2><p>O link recebido por e-mail abre uma sessão temporária segura.</p><form onSubmit={submit}><label htmlFor="new-password">Nova senha</label><input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required /><label htmlFor="new-password-confirm">Confirmar senha</label><input id="new-password-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} minLength={8} required /><button disabled={loading}>{loading ? "Salvando..." : "Atualizar senha"}</button>{feedback && <div className="auth-feedback" role="status">{feedback}</div>}</form></div>;
}
