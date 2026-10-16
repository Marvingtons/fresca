"use client";

import { useEffect, useRef, useState } from "react";
import { onOpeningDone } from "@/lib/intro";
import type { HeroMediaSources } from "@/lib/media/hero";

/** AV1 in WebM; anything but "" means the browser will try it. */
const AV1 = 'video/webm; codecs="av01.0.08M.10"';

/**
 * Full-bleed hero film over a server-rendered poster.
 *
 * - The poster (<picture>, webp with jpg fallback) is the first painted frame.
 * - No video element exists until the opening has finished (onOpeningDone;
 *   immediate on later visits), so nothing loads or decodes during it. Then the
 *   source is picked: over 768px, AV1 WebM where supported, else the 1080 MP4;
 *   768px and under, the 720 MP4. Under reduced motion or Save-Data no video
 *   element is ever created. If play() rejects (e.g. iOS Low Power Mode) the
 *   poster just stays.
 * - Pauses when the hero is fully off screen or the tab is hidden.
 * - Fades in over 400ms on `playing`, so poster → film is invisible.
 * The file is a seamless loop: plain `loop`, no restart or `ended` handling.
 */
export default function HeroMedia({ media, alt, onVideo }: { media: HeroMediaSources; alt: string; onVideo?: (video: HTMLVideoElement | null) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  // Choose the source (or none) once the opening is done.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    if (reduce || saveData) return;
    return onOpeningDone(() => {
      if (window.matchMedia("(min-width: 769px)").matches) {
        setSrc(document.createElement("video").canPlayType(AV1) ? media.webm1080 : media.mp41080);
      } else {
        setSrc(media.mp4720);
      }
    });
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!src || !video) return;
    onVideo?.(video);
    // React does not reliably reflect `muted` to the DOM, and iOS will not
    // autoplay without it: set the property and the attribute ourselves.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");

    let onScreen = true;
    const sync = () => {
      if (onScreen && document.visibilityState === "visible") {
        video.muted = true;
        video.play().catch(() => {}); // rejected: leave the poster, no UI
      } else {
        video.pause();
      }
    };
    sync();
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(video);
    const onPlaying = () => setPlaying(true);
    video.addEventListener("playing", onPlaying);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      video.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", sync);
      onVideo?.(null);
    };
  }, [src, onVideo]);

  return (
    <>
      <picture>
        <source srcSet={media.posterWebp} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img on purpose: server-rendered first frame, no optimizer */}
        <img src={media.posterJpg} alt={alt} decoding="async" className="hero-poster absolute inset-0 h-full w-full object-cover" />
      </picture>
      {src && (
        <video
          ref={videoRef}
          className={`hero-video absolute inset-0 h-full w-full object-cover transition-opacity duration-[400ms] ${playing ? "opacity-100" : "opacity-0"}`}
          src={src}
          poster={media.posterWebp}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </>
  );
}
