import JsonLd from "@/components/JsonLd";
import { privacyGraph } from "@/lib/structured-data";

export default function PrivacyLd() {
  return <JsonLd graph={privacyGraph()} />;
}
