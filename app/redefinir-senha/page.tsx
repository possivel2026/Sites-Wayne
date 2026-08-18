import { ResetPasswordPage } from "@/components/auth-pages";
import { getFeatureStatus } from "@/lib/server/features";
export default function ResetPage() { return <ResetPasswordPage ready={getFeatureStatus("auth").ready} />; }

