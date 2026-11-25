import { site } from "@/content/site";

/**
 * The FRESCA INTERIOR DESIGN wordmark, set in type until the logo is decided.
 * One line of 18px from 768px up; under 768px, FRESCA (14px) over INTERIOR DESIGN (8px).
 * Used by the header (over the hero, on the ivory bar and over the open menu) and the preloader.
 * Color comes from the parent.
 */
export default function Lockup({ className = "" }: { className?: string }) {
  const [name, descriptor] = site.lockup;
  // Each line pulls back its own trailing letter-spacing, so the text centres on its axis.
  // On one line only the last word's pull-back applies.
  return (
    <span
      className={`block text-center font-cormorant text-[14px] font-medium uppercase leading-none tracking-[.22em] min-[768px]:whitespace-nowrap min-[768px]:text-[18px] ${className}`}
    >
      <span className="block [margin-right:-.22em] min-[768px]:inline min-[768px]:[margin-right:0]">{name}</span>{" "}
      <span className="mt-[6px] block text-[8px] [margin-right:-.22em] min-[768px]:mt-0 min-[768px]:inline min-[768px]:text-[18px]">
        {descriptor}
      </span>
    </span>
  );
}
