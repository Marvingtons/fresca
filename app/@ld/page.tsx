import JsonLd from "@/components/JsonLd";
import { homeGraph } from "@/lib/structured-data";

/** Home page structured data (rendered in <head> by the root layout). */
export default function HomeLd() {
  return <JsonLd graph={homeGraph()} />;
}
