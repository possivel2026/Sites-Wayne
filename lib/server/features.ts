import "server-only";

export type FeatureName = "watch" | "auth" | "marketplace" | "starkia";

export type FeatureStatus = {
  enabled: boolean;
  ready: boolean;
  missing: string[];
};

function enabled(name: string) {
  return process.env[name]?.trim().toLowerCase() === "true";
}

function watchStatus(): FeatureStatus {
  const base = status("NEXUS_WATCH_ENABLED", ["TMDB_ACCESS_TOKEN", "NEXT_PUBLIC_TMDB_LOGO_URL"]);
  const licensed = enabled("TMDB_COMMERCIAL_APPROVED");
  const missing = licensed ? base.missing : [...base.missing, "TMDB_COMMERCIAL_APPROVED=true"];
  return { enabled: base.enabled, ready: base.enabled && licensed && base.missing.length === 0, missing };
}

function present(name: string) {
  return Boolean(process.env[name]?.trim());
}

function status(flag: string, requirements: string[]): FeatureStatus {
  const missing = requirements.filter((name) => !present(name));
  const isEnabled = enabled(flag);
  return { enabled: isEnabled, ready: isEnabled && missing.length === 0, missing };
}

export function getFeatureStatus(name: FeatureName): FeatureStatus {
  switch (name) {
    case "watch":
      return watchStatus();
    case "auth":
      return status("AUTH_ENABLED", ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
    case "marketplace":
      return status("MARKETPLACE_ENABLED", [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "MERCADO_PAGO_ACCESS_TOKEN",
        "MERCADO_PAGO_WEBHOOK_SECRET",
      ]);
    case "starkia":
      return status("STARKIA_ENABLED", [
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "STARKIA_RELAY_SECRET",
      ]);
  }
}

export function publicFeatureSummary() {
  return {
    watch: getFeatureStatus("watch").ready,
    auth: getFeatureStatus("auth").ready,
    marketplace: getFeatureStatus("marketplace").ready,
    starkia: getFeatureStatus("starkia").ready,
  };
}
