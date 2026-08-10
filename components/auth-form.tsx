"use client";

import { FormEvent, useState } from "react";
import { safeNextPath } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "signin" | "signup" | "recover";

function translateAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Já existe uma conta com este e-mail.";
  if (normalized.includes("password") && normalized.includes("characters")) return "A senha não atende aos requisitos de segurança.";
  if (normalized.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return "Não foi possível concluir. Verifique os dados e tente novamente.";
}

export function AuthForm({ nextPath, initialError }: { nextPath?: string; initialError?: string }) {
  const [mode, setMode] = useState<Mode>("signin");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(initialError ? { type: "error", text: initialError } : null);
  const destination = safeNextPath(nextPath);
  const configured = isSupabaseConfigured();

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setFeedback(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!configured) {
      setFeedback({ type: "error", text: "O Supabase ainda precisa ser conectado nas configurações da Vercel." });
      return;
    }

    if (mode !== "recover" && password.length < 8) {
      setFeedback({ type: "error", text: "Use uma senha com pelo menos 8 caracteres." });
      return;
    }

    if (mode === "signup") {
      if (displayName.trim().length < 2 || displayName.trim().length > 80) {
        setFeedback({ type: "error", text: "Informe um nome entre 2 e 80 caracteres." });
        return;
      }
      if (password !== confirmPassword) {
        setFeedback({ type: "error", text: "As senhas não são iguais." });
        return;
      }
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        window.location.assign(destination);
        return;
      }

      if (mode === "signup") {
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", destination);
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
            emailRedirectTo: callback.toString(),
          },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign(destination);
          return;
        }
        setFeedback({ type: "success", text: "Conta criada. Abra o e-mail de confirmação para ativá-la." });
      }

      if (mode === "recover") {
        const callback = new URL("/auth/callback", window.location.origin);
        callback.searchParams.set("next", "/redefinir-senha");
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: callback.toString(),
        });
        if (error) throw error;
        setFeedback({ type: "success", text: "Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha." });
      }
    } catch (error) {
      setFeedback({
        type: "error",
        text: translateAuthError(error instanceof Error ? error.message : ""),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form onSubmit={submit}>
        <span className="login-sigil" aria-hidden="true">N</span>
        <h2>{mode === "signin" ? "Entrar no Nexus" : mode === "signup" ? "Criar sua conta" : "Recuperar senha"}</h2>
        <p>{configured ? "Autenticação protegida pelo Supabase" : "Conexão com Supabase pendente"}</p>

        <div className="auth-tabs" aria-label="Escolha entre entrar e criar conta">
          <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>Entrar</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>Criar conta</button>
        </div>

        {mode === "signup" && <><label htmlFor="display-name">Seu nome</label><input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" minLength={2} maxLength={80} required /></>}
        <label htmlFor="email">E-mail</label>
        <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="voce@email.com" required />

        {mode !== "recover" && <><label htmlFor="password">Senha</label><input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="Mínimo de 8 caracteres" minLength={8} required /></>}
        {mode === "signup" && <><label htmlFor="confirm-password">Confirmar senha</label><input id="confirm-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} required /></>}

        {mode === "signin" && <button className="auth-link" type="button" onClick={() => switchMode("recover")}>Esqueci minha senha</button>}
        {mode === "recover" && <button className="auth-link" type="button" onClick={() => switchMode("signin")}>Voltar para entrar</button>}
        <button className="auth-submit" disabled={loading || !configured}>{loading ? "Aguarde..." : mode === "signin" ? "Entrar" : mode === "signup" ? "Criar conta" : "Enviar link seguro"}</button>

        {feedback && <div className={`auth-feedback ${feedback.type}`} role="status" aria-live="polite">{feedback.type === "success" ? "✓" : "!"} {feedback.text}</div>}
        {!configured && <div className="auth-setup-note">Adicione <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> na Vercel.</div>}
        <small>Ao continuar, você concorda com os <a href="/termos">Termos</a> e a <a href="/privacidade">Política de Privacidade</a>.</small>
      </form>
      <aside>
        <span>✦</span><h2>Um login.<br />Todo o seu universo.</h2>
        <ul><li>✓ Sessão segura e persistente</li><li>✓ Confirmação por e-mail</li><li>✓ Recuperação de senha</li><li>✓ Dados protegidos por RLS</li></ul>
      </aside>
    </div>
  );
}
