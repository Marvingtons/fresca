"use client";

import { createElement, useEffect, useRef, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { introIsPlaying } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * The site's one text reveal. Three variants, timings in app/globals.css
 * ("reveal system"):
 *
 *   lines  headings. Each line sits in an overflow mask and rises from 100% to 0
 *          while fading in: 900ms, 80ms between lines.
 *   fade   paragraphs, captions, labels. Opacity plus 12px of travel, 600ms.
 *          `index` delays it by 60ms steps inside a group; `stagger` animates
 *          the direct children in turn instead of the element itself.
 *   rule   hairlines. scaleX 0 to 1 from the left, 800ms. Colour is currentColor.
 *
 * Every variant plays once, when the element's top is 20% up the viewport, and
 * never again. Anything already in view on load plays on load, after the intro.
 * Under prefers-reduced-motion nothing is split, observed or hidden.
 *
 * The hidden state lives in CSS behind `(scripting: enabled)`, so the markup is
 * final and the page reads normally without JavaScript. Nothing here changes an
 * element's box: masks clip, lines and fades use transform and opacity only.
 */

type Variant = "lines" | "fade" | "rule";

type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  variant: Variant;
  /** Element to render. Defaults to div. */
  as?: ElementType;
  children?: ReactNode;
  /**
   * lines only: the lines, already known. Rendered as masks on the server, so
   * nothing is measured. Use it when the breaks are fixed and each line is
   * guaranteed to fit. Without it the text is split where it actually wraps and
   * re-split on resize.
   */
  lines?: ReactNode[];
  /** fade only: position in a group. Each step waits 60ms longer. */
  index?: number;
  /** fade only: reveal the direct children one after another, not the element. */
  stagger?: boolean;
  /** "x" for content that enters a pinned section sideways. Defaults to "y". */
  axis?: "x" | "y";
};

const reveal = (el: Element) => el.setAttribute("data-revealed", "");

/** Elements in view on load wait for the intro (html.intro) to finish. */
function afterIntro(run: () => void) {
  if (!introIsPlaying()) return run();
  const watcher = new MutationObserver(() => {
    if (introIsPlaying()) return;
    watcher.disconnect();
    run();
  });
  watcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
}

// One observer per axis for the whole page. "y" is the rule: the element's top
// is 20% up the viewport. "x" is for content that enters a pinned section
// sideways (the (04) Approach cards) and never moves vertically, so it uses the
// right edge instead.
const MARGIN = { y: "0px 0px -20% 0px", x: "0px -10% 0px 0px" };
const observers: Partial<Record<keyof typeof MARGIN, IntersectionObserver>> = {};

function observe(el: Element, axis: keyof typeof MARGIN) {
  const observer = (observers[axis] ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        afterIntro(() => reveal(entry.target));
      }
    },
    { rootMargin: MARGIN[axis] },
  ));
  observer.observe(el);
  return () => observer.unobserve(el);
}

export default function Reveal({ variant, as = "div", children, lines, index, stagger, axis = "y", style, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const measured = variant === "lines" && !lines;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    if (stagger) Array.from(el.children).forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));

    if (!measured) return observe(el, axis);

    // Free-running text: split where it wraps. SplitText is loaded on demand so
    // it stays out of the first bundle, and re-splits itself when the width or
    // the font changes. New lines inherit the revealed (or hidden) state from CSS.
    let cancelled = false;
    let stop: (() => void) | undefined;
    let split: { revert: () => void } | undefined;
    Promise.all([import("gsap"), import("gsap/SplitText")]).then(([{ gsap }, { SplitText }]) => {
      if (cancelled) return;
      gsap.registerPlugin(SplitText);
      // A text-indent would be inherited by every word SplitText measures and
      // move the breaks. Hang the first line with a margin on its .rv-line instead.
      el.style.textIndent = "0";
      split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "rv-line",
        autoSplit: true,
        aria: "none", // lines keep their text, so it reads as written
        onSplit: (self) => {
          self.lines.forEach((line, i) => (line as HTMLElement).style.setProperty("--i", String(i)));
          el.setAttribute("data-split", "");
        },
      });
      stop = observe(el, axis);
    });
    return () => {
      cancelled = true;
      stop?.();
      split?.revert();
      el.style.textIndent = "";
    };
  }, [measured, stagger, axis]);

  const content = lines
    ? lines.map((line, i) => (
        <span key={i} className="rv-line-mask">
          <span className="rv-line" style={{ "--i": i } as CSSProperties}>
            {line}
          </span>
          {i < lines.length - 1 && " "}
        </span>
      ))
    : children;

  return createElement(
    as,
    {
      ...rest,
      ref,
      "data-reveal": variant,
      "data-split": lines ? "" : undefined,
      "data-stagger": stagger ? "" : undefined,
      style: index == null ? style : ({ ...style, "--i": index } as CSSProperties),
    },
    content,
  );
}
