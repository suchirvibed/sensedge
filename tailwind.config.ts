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
          dark: "#c94e00",
          tint: "#fff3ec",
        },
        bg: {
          page: "#f0efe8",
          white: "#ffffff",
          dark: "#17191a",
          darker: "#111115",
        },
        text: {
          primary: "#17191a",
          body: "#444444",
          muted: "#666666",
          hint: "#999999",
        },
        border: {
          DEFAULT: "#e8e8ec",
          dark: "#2a2a2e",
        },
        tint: {
          blue: "#e8f4ff",
          blueText: "#1a6bc4",
          purple: "#f0eeff",
          purpleText: "#5b4ec8",
          green: "#eef7e8",
          greenText: "#2d7a1a",
          amber: "#fff8e6",
          amberText: "#9a6700",
          red: "#fff0f3",
          redText: "#c0003c",
        },
        canvas: "#0a0a0f",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        btn: "5px",
        badge: "20px",
        input: "6px",
      },
      maxWidth: {
        container: "1200px",
      },
      spacing: {
        section: "100px",
        nav: "88px",
      },
      boxShadow: {
        card: "4px 4px 24px rgba(0,0,0,0.07)",
        hover: "4px 10px 32px rgba(0,0,0,0.12)",
      },
      transitionDuration: {
        DEFAULT: "300ms",
      },
      animation: {
        ticker: "ticker 30s linear infinite",
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
