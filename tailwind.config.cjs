/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 🟢 Light/Dark theme ke liye zaroori hai
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0a",
        panel: "#121212",
        border: "#27272a",
        accent: "#ffffff",
        "text-main": "#ffffff",
        "text-muted": "#a1a1aa",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 60px rgba(255,255,255,0.06)"
      }
    },
  },
  plugins: [],
};
