"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The plan drawing for the "Drawn before it's bought" row, inlined from
 * public/illustrations/fresca-plan-illustration.svg so it takes the site's colours:
 * walls and furniture in var(--ink), door swings and callouts in var(--accent),
 * on the section's own background. Draws on once when it enters the viewport
 * (timings in app/globals.css, .plan-*); renders complete with reduced motion.
 *
 * The schedule labels and the 24'-0" dimension are placeholder copy
 * (content/placeholders.ts).
 */

/** Every stroke gets pathLength=1 so one dash length draws any shape. */
const D = { pathLength: 1 } as const;

const schedule = [
  { n: 1, label: "Island, white oak" },
  { n: 2, label: 'Sofa, linen, 84"' },
  { n: 3, label: "Bed, upholstered" },
];

export default function PlanIllustration() {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center p-[8%]">
      <svg
        ref={ref}
        aria-hidden="true"
        viewBox="0 0 680 460"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`plan h-full w-full ${drawn ? "drawn" : ""}`}
      >
        {/* Walls, door leaves and windows */}
        <g className="plan-walls">
          <path {...D} className="w" d="M60 60H500V400H60Z" />
          <path {...D} className="w" d="M60 230H200M240 230H330M330 230V400" />
          <path {...D} className="w" d="M330 60V150M330 190V230" />
          <path {...D} className="w" d="M200 230V300M200 340V400" />
          <path {...D} className="w" d="M240 230V270" />
          <path {...D} className="w" d="M330 150V110" />
          <path {...D} className="w" d="M200 340V300" />
          <path
            {...D}
            className="w win"
            d="M90 60H180M90 56H180M90 64H180M380 60H470M380 56H470M380 64H470M500 280V360M496 280V360M504 280V360"
          />
        </g>

        {/* Furniture and the dimension line */}
        <g className="plan-furniture">
          <path {...D} className="t" d="M345 75H485V95H345Z" />
          <path {...D} className="t" d="M470 110V215H490V110Z" />
          <rect {...D} className="t island" x="385" y="135" width="60" height="26" />
          <circle {...D} className="t" cx="360" cy="85" r="5" />
          <circle {...D} className="t" cx="372" cy="85" r="5" />
          <rect {...D} className="t" x="90" y="250" width="100" height="26" rx="3" />
          <rect {...D} className="t" x="90" y="276" width="100" height="10" rx="2" />
          <rect className="t rug" x="90" y="300" width="100" height="80" strokeDasharray="2 3" />
          <circle {...D} className="t" cx="140" cy="340" r="14" />
          <rect {...D} className="t" x="90" y="95" width="80" height="110" rx="2" />
          <path {...D} className="t" d="M90 120H170" />
          <rect {...D} className="t" x="200" y="95" width="30" height="20" />
          <rect {...D} className="t" x="200" y="185" width="30" height="20" />
          <rect {...D} className="t" x="250" y="75" width="60" height="26" rx="4" />
          <circle {...D} className="t" cx="265" cy="140" r="7" />
          <rect {...D} className="t" x="255" y="170" width="50" height="40" rx="2" />
          <path {...D} className="dim" d="M60 420H500M60 416V424M500 416V424" />
        </g>

        {/* Door swings, callouts and the dimension label fade in together */}
        <g className="plan-notes">
          <path className="swing" d="M240 270A40 40 0 0 1 200 230" />
          <path className="swing" d="M330 110A40 40 0 0 1 370 150" />
          <path className="swing" d="M200 300A40 40 0 0 1 240 340" />
          <text className="lab" x="263" y="440">
            24&apos;-0&quot;
          </text>
          {[
            [415, 148, 1],
            [140, 263, 2],
            [130, 150, 3],
          ].map(([cx, cy, n]) => (
            <g key={n}>
              <circle className="callout" cx={cx} cy={cy} r="7" />
              <text className="num" x={cx} y={cy + 3} textAnchor="middle">
                {n}
              </text>
            </g>
          ))}
        </g>

        {/* Schedule: header, three rows, footnote, each fading in top to bottom */}
        <g transform="translate(540 70)">
          <g className="plan-row" style={{ "--r": 0 } as React.CSSProperties}>
            <text className="lab" x="0" y="0">
              SCHEDULE
            </text>
            <path className="dim" d="M0 10H120" />
          </g>
          {schedule.map((row, i) => (
            <g key={row.n} className="plan-row" style={{ "--r": i + 1 } as React.CSSProperties} transform={`translate(0 ${24 + i * 30})`}>
              <circle className="callout" cx="6" cy="0" r="6" />
              <text className="num" x="6" y="2.5" textAnchor="middle">
                {row.n}
              </text>
              <text className="lab item" x="20" y="3">
                {row.label}
              </text>
              <path className="dim" d="M0 14H120" />
            </g>
          ))}
          <text className="plan-row lab foot" style={{ "--r": 4 } as React.CSSProperties} x="0" y="130">
            Signed before ordering
          </text>
        </g>
      </svg>
    </div>
  );
}
