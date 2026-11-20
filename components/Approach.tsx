import { approach } from "@/content/site";
import ApproachDrawing from "./ApproachDrawing";
import Photo from "./Photo";
import { ApproachMotion } from "./SectionMotion";


// Pinned horizontal layout only on desktop with motion (`md:motion-safe:`);
// otherwise the panels stack vertically.
export default function Approach() {


  return (
    <section
     
      id="approach"
      aria-label="My approach"
      className="blueprint relative py-24 text-ground md:motion-safe:h-svh md:motion-safe:overflow-hidden md:motion-safe:py-0"
    >
      <div className="pointer-events-none relative flex flex-col justify-center px-pad pb-14 md:motion-safe:absolute md:motion-safe:inset-0 md:motion-safe:pb-0">
        <hgroup>
          <h2 className="cap ap-l mb-7 block text-on-dark">{approach.eyebrow}</h2>
          <p className="font-serif text-[clamp(48px,7vw,120px)] font-normal leading-[.95]">
            <span className="ap-l block">{approach.heading[0]}</span>{" "}
            <span className="ap-r block text-right italic">{approach.heading[1]}</span>
          </p>
        </hgroup>
      </div>

      {/* Playhead: fixed at the center under the panels, reading the ruler position. */}
      <div className="ap-head-r" aria-hidden="true">
        <span className="ap-read">0′–0″</span>
        <i />
        <b />
      </div>

      <div className="ap-track relative flex flex-col gap-[72px] px-pad md:motion-safe:absolute md:motion-safe:left-0 md:motion-safe:top-1/2 md:motion-safe:origin-[0_50%] md:motion-safe:-translate-y-1/2 md:motion-safe:flex-row md:motion-safe:gap-[4vw] md:motion-safe:pl-[6vw] md:motion-safe:pr-[8vw]">
        {approach.panels.map((panel, i) => (
          <div
            key={panel.title}
            data-panel
            className="grid grid-cols-1 items-end gap-7 min-[768px]:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)] md:motion-safe:flex-[0_0_min(78vw,980px)]"
          >
            <div>
              <ApproachDrawing kind={panel.drawing} />
              <span className="font-serif text-[30px] italic text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mb-3.5 mt-2 font-serif text-[clamp(48px,5vw,84px)] font-normal leading-[.95]">{panel.title}</h3>
              <p className="max-w-[340px] text-on-dark">{panel.text}</p>
            </div>
            {/* Photo 4:5 and drawing 16:10 in every panel, both plain rectangles. The
                drawing overlaps the photo's lower left; the bottom padding is its overhang. */}
            <div className="relative pb-[16%] w-full md:motion-safe:max-w-[calc(min(62vh,560px)/1.06)] md:motion-safe:justify-self-end">
              <div className="relative ml-auto aspect-[4/5] w-[72%] overflow-hidden">
                <Photo src={panel.photo.src} alt={panel.photo.alt} sizes="(min-width: 861px) min(36vw, 380px), (min-width: 768px) 40vw, 66vw" box={4 / 5} />
              </div>
              <div className="absolute bottom-0 left-0 aspect-[16/10] w-[56%] overflow-hidden">
                <Photo src={panel.board.src} alt={panel.board.alt} sizes="(min-width: 861px) min(28vw, 296px), (min-width: 768px) 31vw, 52vw" box={16 / 10} />
              </div>
            </div>
          </div>
        ))}
        {/* Moves and scales with the track. Labels are generated in JS. */}
        <div className="ap-ruler" aria-hidden="true" />
      </div>
      <ApproachMotion />
    </section>
  );
}
