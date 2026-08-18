import { AccountPage } from "@/components/auth-pages";
import { getFeatureStatus } from "@/lib/server/features";
export default function MyAccountPage() { return <AccountPage ready={getFeatureStatus("auth").ready} />; }
