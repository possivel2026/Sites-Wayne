"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function identity(user: User | null) {
  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Visitante";
  const initials = name.split(/\s+/).slice(0, 2).map((part: string) => part[0]).join("").toUpperCase() || "NB";
  return { name, initials };
}

function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function SidebarAuth({ variant }: { variant: "home" | "module" }) {
  const { user, loading } = useCurrentUser();
  const { name, initials } = identity(user);
  const className = variant === "home" ? "sidebar-user" : "module-profile";

  return <div className={className}><span className="avatar avatar-way">{loading ? "…" : initials}</span><span><strong>{loading ? "Carregando" : name}</strong><small>{user ? "Conta ativa" : "Visitante"}</small></span><a href={user ? "/conta" : "/entrar"}>{user ? "Conta" : "Entrar"}</a></div>;
}

export function HeaderAuth() {
  const { user, loading } = useCurrentUser();
  return <a className="primary-small" href={user ? "/conta" : "/entrar"}>{loading ? "Conta" : user ? "Minha conta" : "Criar conta"}</a>;
}
