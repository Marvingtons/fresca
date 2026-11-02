"use client";

import { useEffect, useRef } from "react";
import { heroFilm, type FilmSource } from "@/content/media";
import { prefersReducedMotion } from "@/lib/motion";

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * The hero film, layered over the poster. It has no sources until `ready` (the
 * preloader has finished), so it never competes with the intro for bandwidth.
 * It stays invisible until its first "playing" event, so the poster is never
 * replaced by a black frame. Reduced motion or Save-Data: never requested.
 */
export default function HeroFilm({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!ready || !video) return;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    if (prefersReducedMotion() || connection?.saveData) return;

    const small = window.innerWidth < 768 || /^(slow-2g|2g|3g)$/.test(connection?.effectiveType ?? "");
    const files: FilmSource[] = small ? [heroFilm.mp4720] : [heroFilm.webm1080, heroFilm.mp41080];
    for (const file of files) {
      const source = document.createElement("source");
      source.src = file.src;
      source.type = file.type;
      video.append(source);
    }

    let onScreen = true;
    let blocked = false; // autoplay refused (Low Power Mode etc.): keep the poster
    const play = () => {
      if (blocked) return;
      video.play().catch((error: DOMException) => {
        if (error.name === "NotAllowedError") blocked = true;
      });
    };
    const sync = () => (onScreen && !document.hidden ? play() : video.pause());
    const reveal = () => video.classList.remove("opacity-0");

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(video.closest("section") ?? video);
    video.addEventListener("playing", reveal, { once: true });
    document.addEventListener("visibilitychange", sync);

    video.muted = true; // the property, not just the attribute, is what allows autoplay
    video.load();
    play();

    return () => {
      observer.disconnect();
      video.removeEventListener("playing", reveal);
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [ready]);

  return (
    <video
      ref={ref}
      muted
      playsInline
      loop
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-[400ms] ease-out"
    />
  );
}
