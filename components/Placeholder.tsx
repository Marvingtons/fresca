import { Fragment } from "react";

const TOKEN = /(\[PLACEHOLDER:[^\]]*\])/;

/**
 * Renders copy, showing any `[PLACEHOLDER: ...]` inside it in terracotta so
 * missing content cannot pass for final.
 */
export default function Copy({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) =>
        TOKEN.test(part) ? (
          <span key={i} className="placeholder">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
