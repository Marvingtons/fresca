import type { CSSProperties } from "react";
import type { ApproachDrawingKind } from "@/content/site";

/**
 * Line drawings for the (04) Approach cards, from the v6 design source. Each
 * draws once, like a plotter, when its card gains `.drawn` (components/Approach.tsx;
 * timings in app/globals.css, "approach drawings"):
 *
 *   .wall    walls and carcasses        0 to 700ms     stroke-dashoffset
 *   .fx      fixtures (and .fd, dashed)  700 to 1200ms
 *   .tk      dimension tick marks        appear at 1200ms
 *   .dm      dimension lines             1200 to 1600ms, drawn out from their first tick
 *   label    letters                     1600 to 1900ms, one after another
 *
 * Every stroke has pathLength 1, so one dash of length 1 covers it whatever its size.
 */

const LABELS_AT = 1600;
const LABELS_FOR = 300;
const LETTER = 80; // each letter's own fade

/** A label set letter by letter: the one letter stagger on the site, because it imitates a plotter. */
function Label({ x, y, children }: { x: number; y: number; children: string }) {
  const letters = [...children];
  const step = (LABELS_FOR - LETTER) / Math.max(letters.length - 1, 1);
  return (
    <text className="lbl" x={x} y={y}>
      {letters.map((c, i) => (
        <tspan key={i} style={{ "--d": `${Math.round(LABELS_AT + i * step)}ms` } as CSSProperties}>
          {c}
        </tspan>
      ))}
    </text>
  );
}

function Plan() {
  return (
    <>
      <rect className="dw wall" pathLength={1} x="10" y="10" width="340" height="180" />
      <path className="dw wall" pathLength={1} d="M260 190 V150 M260 150 A40 40 0 0 1 300 190" />
      <path className="dw fx" pathLength={1} d="M10 34 H350 M34 34 V190" />
      <rect className="dw fx" pathLength={1} x="196" y="13" width="44" height="18" />
      <circle className="dw fx" pathLength={1} cx="208" cy="22" r="4" />
      <circle className="dw fx" pathLength={1} cx="228" cy="22" r="4" />
      <rect className="dw fx" pathLength={1} x="14" y="90" width="16" height="34" rx="3" />
      <rect className="dw fx" pathLength={1} x="140" y="92" width="130" height="44" />
      <path className="tk" d="M294 34 H306 M294 92 H306" />
      <path className="dw dm" pathLength={1} d="M300 34 V92" />
      <path className="tk" d="M140 154 V166 M270 154 V166" />
      <path className="dw dm" pathLength={1} d="M140 160 H270" />
      <Label x={160} y={118}>ISLAND</Label>
      <Label x={60} y={60}>KITCHEN · PLAN</Label>
    </>
  );
}

function Elevation() {
  return (
    <>
      <path className="dw wall" pathLength={1} d="M4 190 H356" />
      <rect className="dw wall" pathLength={1} x="20" y="118" width="320" height="72" />
      <rect className="dw wall" pathLength={1} x="20" y="20" width="112" height="66" />
      <rect className="dw wall" pathLength={1} x="228" y="20" width="112" height="66" />
      <path className="dw fx" pathLength={1} d="M100 118 V190 M180 118 V190 M260 118 V190" />
      <rect className="dw fx" pathLength={1} x="14" y="110" width="332" height="8" />
      <path className="dw fx" pathLength={1} d="M76 20 V86" />
      <path className="dw fx" pathLength={1} d="M284 20 V86" />
      <path className="dw fx" pathLength={1} d="M160 20 H200 L216 80 H144 Z" />
      <path className="tk" d="M344 110 H356 M344 190 H356" />
      <path className="dw dm" pathLength={1} d="M350 110 V190" />
      <path className="tk" d="M2 86 H14 M2 110 H14" />
      <path className="dw dm" pathLength={1} d="M8 86 V110" />
      <Label x={140} y={14}>KITCHEN · ELEVATION A</Label>
    </>
  );
}

function Ceiling() {
  return (
    <>
      <rect className="dw wall" pathLength={1} x="10" y="10" width="340" height="180" />
      <rect className="fd" x="120" y="96" width="160" height="48" />
      <circle className="fd" cx="160" cy="120" r="26" />
      <circle className="fd" cx="200" cy="120" r="26" />
      <circle className="fd" cx="240" cy="120" r="26" />
      <circle className="dw fx" pathLength={1} cx="160" cy="120" r="8" />
      <path className="dw fx" pathLength={1} d="M154 114 L166 126 M166 114 L154 126" />
      <circle className="dw fx" pathLength={1} cx="200" cy="120" r="8" />
      <path className="dw fx" pathLength={1} d="M194 114 L206 126 M206 114 L194 126" />
      <circle className="dw fx" pathLength={1} cx="240" cy="120" r="8" />
      <path className="dw fx" pathLength={1} d="M234 114 L246 126 M246 114 L234 126" />
      <circle className="dw fx" pathLength={1} cx="50" cy="50" r="4" />
      <circle className="dw fx" pathLength={1} cx="50" cy="150" r="4" />
      <circle className="dw fx" pathLength={1} cx="310" cy="50" r="4" />
      <circle className="dw fx" pathLength={1} cx="310" cy="150" r="4" />
      <path className="tk" d="M160 74 V86 M200 74 V86" />
      <path className="dw dm" pathLength={1} d="M160 80 H200" />
      <Label x={128} y={168}>REFLECTED CEILING PLAN</Label>
    </>
  );
}

const DRAWINGS = { plan: Plan, elevation: Elevation, ceiling: Ceiling };

export default function ApproachDrawing({ kind }: { kind: ApproachDrawingKind }) {
  const Drawing = DRAWINGS[kind];
  return (
    <svg className="ap-draw" viewBox="0 0 360 200" aria-hidden="true">
      <Drawing />
    </svg>
  );
}
