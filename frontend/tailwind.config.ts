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
        bg: {
          primary: "#0A0A0F",
          surface: "#13131A",
          card: "#1C1C27",
        },
        accent: {
          DEFAULT: "#FF4444",
          hover: "#FF2222",
          muted: "#FF444422",
        },
        "text-primary": "#F0F0F0",
        "text-muted": "#6B6B80",
        border: "#2A2A3A",
        success: "#22C55E",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-syne)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
