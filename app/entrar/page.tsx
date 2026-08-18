import { AuthPage } from "@/components/auth-pages";
import { getFeatureStatus } from "@/lib/server/features";
import { getOAuthProviders } from "@/lib/supabase/auth";

export default function LoginPage() { return <AuthPage mode="login" ready={getFeatureStatus("auth").ready} providers={getOAuthProviders()} />; }
