import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#F8F7FF",
        surface: "#FFFFFF",
        "surface-soft": "#F3F0FF",
        primary: "#6D28D9",
        "primary-dark": "#4C1D95",
        "accent-gold": "#F59E0B",
        "accent-green": "#22C55E",
        "text-dark": "#1F1F1F",
        "text-muted": "#6B7280",
        border: "#E5E7EB",
        danger: "#EF4444",
        success: "#16A34A",
        "player-red": "#EF4444",
        "player-blue": "#3B82F6",
        "player-green": "#22C55E",
        "player-yellow": "#EAB308",
        "safe-sq": "#F59E0B",
        "home-centre": "#6D28D9",
        "move-valid": "#BCA2FF",
        "move-invalid": "#FCA5A5",
        "dice-border": "#6D28D9",
        "dice-glow": "#BCA2FF",
        "tx-pending": "#F59E0B",
        "tx-ok": "#22C55E",
        "tx-fail": "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "pulse-glow": "pulseGlow 1.5s ease-in-out infinite",
        "bounce-in": "bounceIn 0.4s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(109,40,217,0)" },
          "50%": { boxShadow: "0 0 16px 4px rgba(109,40,217,0.4)" },
        },
        bounceIn: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "80%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
