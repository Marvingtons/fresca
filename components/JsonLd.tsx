import type { Graph } from "@/lib/structured-data";

/** One schema.org graph as an inline JSON-LD script. `<` is escaped so text can't close the tag. */
export default function JsonLd({ graph }: { graph: Graph }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />;
}
