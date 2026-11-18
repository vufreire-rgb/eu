import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: "#14283F", 700: "#1d3a5a", 600: "#27496f", 50: "#eef2f7" },
        brand: { DEFAULT: "#2563EB", 600: "#1d4fd0", 50: "#eaf1ff", 100: "#d6e4ff" },
        surface: "#F4F6F9",
        ok: { DEFAULT: "#16a34a", 50: "#e8f7ee", 700: "#15803d" },
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 2px rgba(20,40,63,.05), 0 4px 16px rgba(20,40,63,.05)",
        pop: "0 8px 32px rgba(20,40,63,.18)",
      },
      keyframes: {
        fadeUp: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
        pop: { "0%": { opacity: "0", transform: "scale(.96)" }, "100%": { opacity: "1", transform: "none" } },
        slideIn: { "0%": { opacity: "0", transform: "translateX(24px)" }, "100%": { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
      },
      animation: {
        "fade-up": "fadeUp .35s ease-out both",
        pop: "pop .2s ease-out both",
        "slide-in": "slideIn .3s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
