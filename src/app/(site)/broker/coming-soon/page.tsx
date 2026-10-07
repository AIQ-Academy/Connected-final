import { redirect } from "next/navigation";

/** Legacy path — canonical coming-soon lives at `/trading/coming-soon`. */
export default function BrokerComingSoonLegacyRedirect() {
  redirect("/trading/coming-soon");
}
