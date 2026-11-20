import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aispry: {
          orange: "#f48220",
          amber: "#f59e0b",
          blue: "#127dc2",
          cyan: "#009fce",
          dark: "#03061a",
          royal: "#021945",
          ink950: "#0a0d12",
          ink900: "#0f1318",
          ink800: "#181d27",
          ink700: "#1f2632",
          ink400: "#828ea1",
          ink200: "#b6bfcd",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.04)"
        }
      },
      fontFamily: {
        sans: ["Geist", "-apple-system", "BlinkMacSystemFont", "Inter", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      backgroundImage: {
        "aispry-strip": "linear-gradient(90deg, #f48220 0%, #c2945a 35%, #009fce 100%)",
        "aispry-radial": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(244, 130, 32, 0.15), rgba(0, 159, 206, 0.15), transparent)",
        "hero-gradient": "linear-gradient(90deg, #f48220 0%, #c2945a 35%, #6c8c87 70%, #127dc2 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "wave 1.5s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
