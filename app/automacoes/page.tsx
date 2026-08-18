import { StarkiaPage } from "@/components/starkia-page";
import { getFeatureStatus } from "@/lib/server/features";
export default function AutomationsPage() { return <StarkiaPage ready={getFeatureStatus("starkia").ready} />; }

