import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0f1e",
        "bg-2": "#0f1729",
        panel: "#111827",
        border: "rgba(255, 255, 255, 0.16)",
        glass: "rgba(255, 255, 255, 0.07)",
        "glass-strong": "rgba(255, 255, 255, 0.11)",
        cyan: "#22d3ee",
        mint: "#10e5a0",
        "term-green": "#10e5a0",
        "term-cyan": "#22d3ee",
        "term-red": "#f43f5e",
        "term-dim": "#8b93a7",
      },
      fontFamily: {
        mono: [
          "'JetBrains Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      boxShadow: {
        "glow-cyan": "0 0 18px rgba(34, 211, 238, 0.45)",
        "glow-mint": "0 0 18px rgba(16, 229, 160, 0.45)",
        "glow-red": "0 0 18px rgba(244, 63, 94, 0.4)",
        glass:
          "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 14px 35px rgba(2, 6, 23, 0.35)",
      },
      borderRadius: {
        DEFAULT: "6px",
      },
      keyframes: {
        "signal-pulse": {
          "0%, 100%": { opacity: "0.5", transform: "scale(0.94)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
      },
      animation: {
        "signal-pulse": "signal-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;