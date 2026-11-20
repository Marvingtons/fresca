/**
 * The plan drawing for the "Drawn before it's bought" row, inlined from
 * public/illustrations/fresca-plan-illustration.svg so it takes the site's colours:
 * walls and furniture in var(--ink), door swings and callouts in var(--accent),
 * on the section's own background. Draws on once when it enters the viewport
 * (PromisesMotion adds .drawn; timings in app/globals.css, .plan-*); renders
 * complete with reduced motion.
 *
 * Two drawings share the plan, each with a viewBox cropped to its content and
 * rendered at the full width of the media box: from 1024px the schedule sits
 * beside the plan (walls span 80% of the width), below that it sits under it.
 *
 * The schedule labels and the 24'-0" dimension are placeholder copy
 * (content/placeholders.ts).
 */

/** Every stroke gets pathLength=1 so one dash length draws any shape. */
const D = { pathLength: 1 } as const;

const schedule = [
  { n: 1, item: "Island", spec: "white oak" },
  { n: 2, item: "Sofa", spec: 'linen, 84"' },
  { n: 3, item: "Bed", spec: "upholstered" },
];
const FOOTNOTE = ["Signed before", "ordering"];

const row = (r: number) => ({ "--r": r }) as React.CSSProperties;
const svgProps = {
  "aria-hidden": true,
  preserveAspectRatio: "xMidYMid meet",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** The plan itself: walls x 60 to 500, drawing y 55 to 444 with the dimension label. */
function Plan() {
  return (
    <>
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
    </>
  );
}

function Callout({ n }: { n: number }) {
  return (
    <>
      <circle className="callout" cx="6" cy="0" r="6" />
      <text className="num" x="6" y="2.5" textAnchor="middle">
        {n}
      </text>
    </>
  );
}

export default function PlanIllustration() {
  const cls = "plan h-auto w-full";

  return (
    <div data-plan>
      {/* 1024px and up: schedule beside the plan, item and finish on two lines. */}
      <svg {...svgProps} viewBox="58 54 546 391" className={`${cls} hidden min-[1024px]:block`}>
        <Plan />
        <g transform="translate(520 70)">
          <g className="plan-row" style={row(0)}>
            <text className="lab" x="0" y="0">
              SCHEDULE
            </text>
            <path className="dim" d="M0 10H83" />
          </g>
          {schedule.map((line, i) => (
            <g key={line.n} className="plan-row" style={row(i + 1)} transform={`translate(0 ${26 + i * 38})`}>
              <Callout n={line.n} />
              <text className="lab item" x="20" y="3">
                {line.item}
              </text>
              <text className="lab foot" x="20" y="15">
                {line.spec}
              </text>
              <path className="dim" d="M0 25H83" />
            </g>
          ))}
          <g className="plan-row" style={row(4)}>
            {FOOTNOTE.map((text, i) => (
              <text key={text} className="lab foot" x="0" y={150 + i * 12}>
                {text}
              </text>
            ))}
          </g>
        </g>
      </svg>

      {/* Under 1024px: the plan at full width, schedule in three columns below it. */}
      <svg {...svgProps} viewBox="58 54 448 490" className={`${cls} plan-below min-[1024px]:hidden`}>
        <Plan />
        <g transform="translate(60 474)">
          <g className="plan-row" style={row(0)}>
            <text className="lab" x="0" y="0">
              SCHEDULE
            </text>
            <path className="dim" d="M0 10H440" />
          </g>
          {schedule.map((line, i) => (
            <g key={line.n} className="plan-row" style={row(i + 1)} transform={`translate(${i * 150} 30)`}>
              <Callout n={line.n} />
              <text className="lab item" x="18" y="3.5">
                {line.item}, {line.spec}
              </text>
            </g>
          ))}
          <g className="plan-row" style={row(4)}>
            <path className="dim" d="M0 46H440" />
            <text className="lab foot" x="0" y="64">
              {FOOTNOTE.join(" ")}
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}
