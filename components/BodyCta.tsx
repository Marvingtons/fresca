import type { ReactNode } from "react";

/**
 * The call to action for body sections: an underlined text link with an arrow
 * that steps right on hover (`.body-cta` in app/globals.css). The header has
 * its own, smaller version in components/Navigation.tsx.
 */
export default function BodyCta({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} className={`body-cta ${className}`}>
      <span className="body-cta-label">{children}</span>
      <span className="body-cta-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
