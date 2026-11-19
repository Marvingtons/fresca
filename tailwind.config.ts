import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // The design has a single breakpoint: ≤860px is mobile, md: is desktop.
    // Use max-md: for mobile-only overrides.
    screens: { md: "861px" },
    extend: {
      colors: {
        ground: "#F4F2EB",
        "ground-2": "#E7E4DB",
        ink: "#1D1C1A",
        body: "#4A4740",
        muted: "#6B665C",
        // muted, darkened just enough to pass 4.5:1 on ground-2.
        "muted-2": "#68635A",
        line: "rgba(29,28,26,.14)",
        accent: "#2B3A55",
        "on-dark": "#CFC9BC",
        gold: "#C9A86A",
        panel: "#141311",
        error: "#E9B4A2",
        // Placeholder markers only (CLAUDE.md brand terracotta).
        terracotta: "#B5593A",
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
