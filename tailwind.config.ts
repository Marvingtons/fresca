import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // The design has a single breakpoint: ≤860px is mobile, md: is desktop.
    // Use max-md: for mobile-only overrides.
    screens: { md: "861px" },
    extend: {
      colors: {
        // Two fields only: cream (everything) and navy (Approach and the Contact
        // footer). Terracotta is the single action color in both.
        ground: "#F4F2EB",
        plaster: "#EFE8DC", // opening veil only: warm ivory
        navy: "#2B3A55",
        ink: "#1D1C1A",
        body: "#4A4740",
        muted: "#6B665C",
        line: "rgba(29,28,26,.14)",
        "line-dark": "rgba(244,242,235,.16)",
        "on-dark": "#CFC9BC",
        ochre: "#C9A86A", // drawing annotations only (dimensions, callouts), never actions
        error: "#E9B4A2",
        terracotta: "#A9502F",
      },
      fontFamily: {
        serif: ["var(--serif)"],
        sans: ["var(--sans)"],
        mono: ["var(--mono)"],
      },
      spacing: {
        pad: "var(--pad)",
      },
      transitionTimingFunction: {
        curtain: "cubic-bezier(.76,0,.24,1)",
      },
      keyframes: {
        cue: { from: { top: "-100%" }, to: { top: "100%" } },
      },
      animation: {
        cue: "cue 2s cubic-bezier(.6,0,.2,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
