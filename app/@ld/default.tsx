import JsonLd from "@/components/JsonLd";
import { siteGraph } from "@/lib/structured-data";

/** Any future route without its own entry here: the business and the website only.
 *  (The 404 renders no slot, so it has no graph; it is noindex anyway.) */
export default function SiteLd() {
  return <JsonLd graph={siteGraph()} />;
}
