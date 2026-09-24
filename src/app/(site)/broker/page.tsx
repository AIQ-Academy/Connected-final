import { redirect } from "next/navigation";

/** Legacy path — canonical live-trading marketing lives at `/trading`. */
export default function BrokerLegacyRedirect() {
  redirect("/trading");
}
