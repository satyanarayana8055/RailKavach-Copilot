import type { Config } from "tailwindcss";

/**
 * AiSPRY design tokens — values taken from aispry.ai production CSS.
 * Rule: orange (#f48220) is a FILL/accent colour; for orange TEXT on light
 * surfaces use `orange-ink` (#c2410c) to meet WCAG AA.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: { DEFAULT: "#f48220", ink: "#c2410c", hover: "#d97612", soft: "#fef0e0" },
        amber: { DEFAULT: "#f59e0b", ink: "#b45309", soft: "#fef3c7" },
        blue: { DEFAULT: "#127dc2", ink: "#0e639b", soft: "#e6f2fa" },
        cyan: { DEFAULT: "#009fce", ink: "#00739a", soft: "#e0f5fb" },
        navy: "#03061a",
        royal: "#021945",
        ink: {
          950: "#0a0d12",
          900: "#0f1318",
          850: "#131820",
          800: "#181d27",
          700: "#1f2632",
          600: "#2a3242",
          500: "#6b7689",
          400: "#828ea1",
          300: "#8995a8",
          200: "#b6bfcd",
          100: "#dde2ea",
        },
        paper: { DEFAULT: "#f9f6f0", 2: "#efe9dc" },
        ok: { DEFAULT: "#10b981", ink: "#047857", soft: "#e7f7f0" },
        danger: { DEFAULT: "#e5484d", ink: "#b42318", soft: "#fdecec" },
        violet: { DEFAULT: "#8b5cf6", ink: "#6d28d9", soft: "#f1ebfe" },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "SF Mono", "monospace"],
        deva: ["var(--font-deva)", "var(--font-geist-sans)", "sans-serif"],
      },
      borderRadius: { btn: "6px", card: "12px", panel: "16px" },
      boxShadow: {
        card: "0 1px 2px rgba(15,19,24,.04), 0 1px 1px rgba(15,19,24,.03)",
        lift: "0 12px 32px -12px rgba(15,19,24,.18), 0 2px 6px rgba(15,19,24,.05)",
        glow: "0 0 0 1px rgba(244,130,32,.35), 0 10px 40px -10px rgba(244,130,32,.45)",
        nav: "0 8px 20px rgba(0,0,0,.18)",
      },
      backgroundImage: {
        "brand-x": "linear-gradient(90deg, #f48220 0%, #009fce 100%)",
        "brand-spectrum": "linear-gradient(90deg, #f48220 0%, #c2945a 35%, #6c8c87 70%, #127dc2 100%)",
      },
      transitionTimingFunction: { brand: "cubic-bezier(.2,.6,.2,1)" },
      keyframes: {
        wave: { "0%,100%": { transform: "scaleY(.25)" }, "50%": { transform: "scaleY(1)" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(400%)" } },
        "fade-up": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        ping2: { "0%": { transform: "scale(1)", opacity: ".7" }, "100%": { transform: "scale(2.4)", opacity: "0" } },
        flow: { to: { strokeDashoffset: "-28" } },
        travel: { "0%": { left: "0%", opacity: "0" }, "10%": { opacity: "1" }, "90%": { opacity: "1" }, "100%": { left: "100%", opacity: "0" } },
        approach: { "0%": { transform: "translateX(0)" }, "70%,100%": { transform: "translateX(var(--stop))" } },
        progress: { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(300%)" } },
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
      },
      animation: {
        wave: "wave 1.1s ease-in-out infinite",
        scan: "scan 2.6s linear infinite",
        "fade-up": "fade-up .5s cubic-bezier(.2,.6,.2,1) both",
        ping2: "ping2 1.8s cubic-bezier(0,0,.2,1) infinite",
        approach: "approach 7s cubic-bezier(.2,.6,.2,1) infinite both",
        progress: "progress 1.2s linear infinite",
        flow: "flow 1s linear infinite",
        travel: "travel 4s cubic-bezier(.2,.6,.2,1) infinite",
        blink: "blink 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
