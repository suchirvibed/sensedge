import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#E85D04",
          dark: "#c44e00",
          tint: "#fff4ec",
          ring: "#ffd8bf",
        },
        bg: {
          page: "#fafaf9",     // cool near-white, replaces the warm beige
          subtle: "#f5f5f4",   // subtle surface for sections that need contrast
          white: "#ffffff",
          dark: "#0a0a0a",     // near-black, tighter than the old #17191a
          darker: "#000000",   // true black for hero/cta dark sections
        },
        text: {
          primary: "#0a0a0a",
          body: "#4b4b4b",
          muted: "#737373",    // neutral-500, much cleaner than warm grey
          hint: "#a3a3a3",
        },
        border: {
          DEFAULT: "#e5e5e5",  // neutral-200
          subtle: "#f0f0ef",
          dark: "#1c1c1c",
          strong: "#262626",
        },
        tint: {
          blue: "#eef4ff",
          blueText: "#1f4fa8",
          purple: "#f1efff",
          purpleText: "#4c45a8",
          green: "#ecf6e6",
          greenText: "#246a14",
          amber: "#fff5db",
          amberText: "#84520b",
          red: "#ffefef",
          redText: "#b00020",
        },
        canvas: "#0a0a0f",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
        btn: "8px",          // softer than 5px — modern but not pill
        badge: "999px",      // pill chips
        input: "8px",
      },
      maxWidth: {
        container: "1200px",
      },
      spacing: {
        section: "120px",    // more breathing room
        nav: "72px",         // tighter nav
      },
      boxShadow: {
        // Lighter, more refined — flat with definition
        card: "0 1px 2px rgba(0,0,0,0.04), 0 1px 1px rgba(0,0,0,0.02)",
        hover: "0 4px 16px -4px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)",
        ring: "0 0 0 1px rgba(0,0,0,0.06)",
      },
      transitionDuration: {
        DEFAULT: "200ms",     // snappier
      },
      animation: {
        ticker: "ticker 40s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
