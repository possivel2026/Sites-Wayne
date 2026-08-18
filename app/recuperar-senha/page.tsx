import { AuthPage } from "@/components/auth-pages";
import { getFeatureStatus } from "@/lib/server/features";
export default function RecoveryPage() { return <AuthPage mode="recover" ready={getFeatureStatus("auth").ready} />; }

