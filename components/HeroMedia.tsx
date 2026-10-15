"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { onOpeningDone } from "@/lib/intro";
import { prefersReducedMotion } from "@/lib/motion";

const VIDEO = /\.(mp4|webm|mov|m4v)(\?.*)?$/i;

type HeroMediaProps = {
  /** A still image, or a video file. Swapping in a video is this one prop. */
  src: string;
  /** For a video: the still shown until playback starts (use its first frame). */
  poster?: string;
  alt: string;
  /** object-position, e.g. "47% 100%": the point kept in frame at every crop. */
  focalPoint?: string;
};

/**
 * Full-bleed hero media, cover-fitted to its parent. A still gets a slow 9s
 * settle (1.06 → 1, see .hm-still in globals.css). A video is muted, looping
 * and inline, loads metadata only, and starts playing when the opening's wipe
 * is done; it pauses under reduced motion and whenever it is off screen.
 */
export default function HeroMedia({ src, poster, alt, focalPoint = "50% 50%" }: HeroMediaProps) {
  const isVideo = VIDEO.test(src);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!isVideo || !video) return;
    if (prefersReducedMotion()) {
      video.pause();
      return;
    }
    let opened = false;
    let onScreen = true;
    const sync = () => {
      if (opened && onScreen) video.play().catch(() => {});
      else video.pause();
    };
    const stopWaiting = onOpeningDone(() => {
      opened = true;
      sync();
    });
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    io.observe(video);
    return () => {
      stopWaiting();
      io.disconnect();
    };
  }, [isVideo, src]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: focalPoint }}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    );
  }
  return <Image src={src} alt={alt} fill priority sizes="100vw" quality={85} className="hm-still object-cover" style={{ objectPosition: focalPoint }} />;
}
