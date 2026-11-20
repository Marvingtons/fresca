import { Fragment } from "react";

/** Matches a "[PLACEHOLDER: ...]" marker inside a copy string. */
const PLACEHOLDER = /(\[PLACEHOLDER:[^\]]*\])/;

const isPlaceholder = (text: string) => PLACEHOLDER.test(text);

/**
 * Renders a copy string, showing any [PLACEHOLDER: ...] marker in terracotta so
 * missing client content is visible on the page (see CLAUDE.md and
 * content/placeholders.ts).
 */
export default function Copy({ text }: { text: string }) {
  return (
    <>
      {text.split(PLACEHOLDER).map((part, i) =>
        isPlaceholder(part) ? (
          <mark key={i} className="placeholder">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
