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
          blue: "#2563eb",
          cyan: "#06b6d4",
          indigo: "#6366f1",
          purple: "#a855f7",
          dark: "#050814",
          surface: "#0c1322",
          card: "#111a2e",
          border: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(255, 255, 255, 0.04)"
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
        "aispry-glow": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59, 130, 246, 0.25), rgba(99, 102, 241, 0.1), transparent)",
        "card-gradient": "linear-gradient(180deg, rgba(17, 26, 46, 0.8) 0%, rgba(12, 19, 34, 0.95) 100%)",
      },
      boxShadow: {
        "glow-blue": "0 0 40px -10px rgba(59, 130, 246, 0.4)",
        "glow-indigo": "0 0 40px -10px rgba(99, 102, 241, 0.4)",
        "glow-cyan": "0 0 30px -5px rgba(6, 182, 212, 0.3)",
        "glass-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
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
