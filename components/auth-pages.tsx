"use client";

import { FormEvent, useEffect, useState } from "react";
import { ModuleShell } from "@/components/module-shell";

type Mode = "login" | "signup" | "recover";

export function AuthPage({ mode, ready, providers = [] }: { mode: Mode; ready: boolean; providers?: string[] }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [oauthConsent, setOAuthConsent] = useState(false);
  const copy = mode === "login"
    ? { eyebrow: "SUA CONTA NEXUS", title: "Continue de onde parou.", heading: "Entrar no Nexus", action: "Entrar" }
    : mode === "signup"
      ? { eyebrow: "CRIE SUA CONTA", title: "Seu universo começa aqui.", heading: "Criar conta Nexus", action: "Criar conta" }
      : { eyebrow: "RECUPERE O ACESSO", title: "Vamos colocar você de volta.", heading: "Recuperar senha", action: "Enviar instruções" };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(""); setError(false);
    const values = new FormData(event.currentTarget);
    const body = Object.fromEntries(values.entries());
    try {
      const response = await fetch(`/api/auth/${mode === "signup" ? "signup" : mode === "recover" ? "recover" : "login"}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json() as { error?: string; message?: string; confirmationRequired?: boolean };
      if (!response.ok) throw new Error(data.error || "Não foi possível continuar.");
      if (mode === "login") window.location.assign("/conta");
      else if (mode === "signup" && !data.confirmationRequired) window.location.assign("/conta");
      else setMessage(mode === "signup" ? "Conta criada. Verifique seu e-mail para confirmar o acesso." : data.message || "Confira seu e-mail.");
    } catch (caught) { setError(true); setMessage(caught instanceof Error ? caught.message : "Não foi possível continuar."); }
    finally { setLoading(false); }
  }

  return <ModuleShell active="" eyebrow={copy.eyebrow} title={copy.title} description="Autenticação protegida pelo Supabase, com sessão em cookies seguros no servidor.">
    {!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Autenticação aguardando ativação</strong><p>O fluxo real está implementado, mas o login permanece bloqueado até as variáveis do Supabase e a feature flag serem configuradas.</p></div></section> : <div className="login-wrap"><form onSubmit={submit}><span className="login-sigil">N</span><h2>{copy.heading}</h2><p>Conexão segura ativa</p>
      {mode === "signup" && <><label htmlFor="displayName">Nome</label><input id="displayName" name="displayName" autoComplete="name" minLength={2} maxLength={80} required/></>}
      <label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" placeholder="voce@email.com" required/>
      {mode !== "recover" && <><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} maxLength={128} placeholder="Mínimo de 8 caracteres" required/></>}
      {mode === "signup" && <label className="auth-consent"><input type="checkbox" name="acceptedTerms" value="true" required/><span>Li e aceito os <a href="/termos" target="_blank">Termos</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label>}
      <button disabled={loading}>{loading ? "Processando…" : copy.action}</button>
      {message && <div className={error ? "auth-message error" : "auth-message"}>{message}</div>}
      {mode === "login" && <div className="auth-links"><a href="/recuperar-senha">Esqueci minha senha</a><a href="/cadastro">Criar conta</a></div>}
      {mode !== "login" && <div className="auth-links"><a href="/entrar">Já tenho conta</a></div>}
      {mode === "login" && providers.length > 0 && <div className="oauth-list"><label className="auth-consent"><input type="checkbox" checked={oauthConsent} onChange={(event) => setOAuthConsent(event.target.checked)}/><span>Li e aceito os <a href="/termos" target="_blank">Termos</a> e a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</span></label><span>ou continue com</span>{providers.map((provider) => <a key={provider} aria-disabled={!oauthConsent} href={`/api/auth/oauth?provider=${provider}&accepted=1`} onClick={(event) => { if (!oauthConsent) event.preventDefault(); else sessionStorage.setItem("nexus_oauth_terms", "true"); }}>{provider === "google" ? "Google" : provider === "github" ? "GitHub" : "Microsoft"}</a>)}</div>}
      <small>Ao continuar, você concorda com os Termos e a Política de Privacidade.</small>
    </form><aside><span>✦</span><h2>Uma conta.<br/>Todo o seu universo.</h2><ul><li>✓ Salve filmes e séries</li><li>✓ Acompanhe seus pedidos</li><li>✓ Conecte seus dispositivos</li><li>✓ Controle sua privacidade</li></ul></aside></div>}
  </ModuleShell>;
}

export function AuthCallbackPage() {
  const [message, setMessage] = useState("Validando sua sessão…");
  useEffect(() => {
    async function validate() {
      await Promise.resolve();
      const params = new URLSearchParams(window.location.hash.slice(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const expiresIn = Number(params.get("expires_in") || 3_600);
      if (!accessToken || !refreshToken) { setMessage("O link de autenticação é inválido ou expirou."); return; }
      window.history.replaceState({}, "", "/auth/callback");
      const acceptedTerms = sessionStorage.getItem("nexus_oauth_terms") === "true";
      sessionStorage.removeItem("nexus_oauth_terms");
      const response = await fetch("/api/auth/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken, refreshToken, expiresIn, acceptedTerms }) });
      if (!response.ok) { setMessage("Não foi possível validar esta sessão."); return; }
      window.location.replace("/conta");
    }
    validate().catch(() => setMessage("Não foi possível validar esta sessão."));
  }, []);
  return <ModuleShell active="" eyebrow="AUTENTICAÇÃO" title="Conectando sua conta." description="Aguarde enquanto validamos o acesso com segurança."><div className="auth-callback">{message}</div></ModuleShell>;
}

export function ResetPasswordPage({ ready }: { ready: boolean }) {
  const [accessToken, setAccessToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { async function readToken() { await Promise.resolve(); const params = new URLSearchParams(window.location.hash.slice(1)); setAccessToken(params.get("access_token") || ""); window.history.replaceState({}, "", "/redefinir-senha"); } readToken().catch(() => undefined); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage("");
    const password = String(new FormData(event.currentTarget).get("password") || "");
    const response = await fetch("/api/auth/update-password", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessToken, password }) });
    const data = await response.json() as { error?: string };
    setMessage(response.ok ? "Senha atualizada. Você já pode entrar." : data.error || "Não foi possível atualizar a senha."); setLoading(false);
  }
  return <ModuleShell active="" eyebrow="NOVA SENHA" title="Proteja sua conta." description="Defina uma nova senha com pelo menos oito caracteres.">{!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Autenticação indisponível</strong></div></section> : <div className="login-wrap auth-single"><form onSubmit={submit}><h2>Redefinir senha</h2><label htmlFor="password">Nova senha</label><input id="password" name="password" type="password" minLength={8} maxLength={128} autoComplete="new-password" required/><button disabled={loading || !accessToken}>{loading ? "Atualizando…" : "Atualizar senha"}</button>{!accessToken && <div className="auth-message error">O link é inválido ou não contém uma sessão de recuperação.</div>}{message && <div className="auth-message">{message}</div>}<div className="auth-links"><a href="/entrar">Voltar ao login</a></div></form></div>}</ModuleShell>;
}

export function AccountPage({ ready }: { ready: boolean }) {
  const [state, setState] = useState<{ loading: boolean; email?: string; name?: string; authenticated?: boolean }>({ loading: true });
  useEffect(() => { fetch("/api/auth/session").then((response) => response.json()).then((data: { authenticated?: boolean; user?: { email?: string; user_metadata?: { display_name?: string; full_name?: string } } }) => setState({ loading: false, authenticated: data.authenticated, email: data.user?.email, name: data.user?.user_metadata?.display_name || data.user?.user_metadata?.full_name })).catch(() => setState({ loading: false, authenticated: false })); }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.replace("/"); }
  return <ModuleShell active="" eyebrow="MINHA CONTA" title="Seu espaço no Nexus." description="Sessão e recursos pessoais protegidos pelo Supabase.">{!ready ? <section className="feature-unavailable"><span>◷</span><div><strong>Conta indisponível até a ativação do Supabase</strong></div></section> : state.loading ? <div className="auth-callback">Carregando sua conta…</div> : !state.authenticated ? <div className="account-card"><h2>Sessão encerrada</h2><p>Entre para acessar seus dados.</p><a href="/entrar">Entrar</a></div> : <div className="account-card"><span className="account-avatar">{(state.name || state.email || "N").slice(0, 1).toUpperCase()}</span><h2>{state.name || "Conta Nexus"}</h2><p>{state.email}</p><div><a href="/videos">Meus títulos</a><a href="/marketplace">Meus pedidos</a><a href="/automacoes">Meus dispositivos</a></div><button onClick={logout}>Sair com segurança</button></div>}</ModuleShell>;
}
