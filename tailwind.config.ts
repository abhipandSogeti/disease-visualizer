import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#020817",
          900: "#0a1628",
          800: "#0f2040",
          700: "#162a52",
        },
        disease: {
          viral: "#ef4444",
          respiratory: "#f59e0b",
          parasitic: "#22c55e",
          bacterial: "#3b82f6",
          vectorborne: "#14b8a6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
