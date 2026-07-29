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
        blue: {
          DEFAULT: "#1D6FFF",
          dark: "#0A3FCC",
          light: "#60AFFF",
          pale: "#EBF2FF",
        },
        navy: "#0D1B3E",
        gray: {
          50: "#F8FAFF",
          100: "#EEF2FA",
          400: "#94A3B8",
          700: "#334155",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-space-grotesk)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "10px",
      },
      animation: {
        "slide-from-left": "slideFromLeft 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-from-right": "slideFromRight 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-from-bottom": "slideFromBottom 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-from-top": "slideFromTop 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "scale-fade-in": "scaleFadeIn 1.0s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pop-in": "popIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-down": "fadeInDown 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-left": "fadeInLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-in-right": "fadeInRight 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "float-in": "floatIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "pulse-glow": "pulseGlow 2s infinite",
        shimmer: "shimmer 2s linear infinite",
        "shimmer-border": "shimmerBorder 2s linear infinite",
        "stretch-in": "stretchIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "swing-in": "swingIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "rotate-in": "rotateIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "bounce-in": "bounceIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "float-particle": "floatParticle linear infinite",
        "float-icon": "floatIcon 3s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },
      keyframes: {
        slideFromLeft: {
          "0%": { opacity: "0", transform: "translateX(-80px) scale(0.94) rotate(-1deg)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1) rotate(0deg)" },
        },
        slideFromRight: {
          "0%": { opacity: "0", transform: "translateX(80px) scale(0.94) rotate(1deg)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1) rotate(0deg)" },
        },
        slideFromBottom: {
          "0%": { opacity: "0", transform: "translateY(60px) scale(0.92)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        slideFromTop: {
          "0%": { opacity: "0", transform: "translateY(-40px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        scaleFadeIn: {
          "0%": { opacity: "0", transform: "scale(0.82) rotate(-1.5deg)" },
          "60%": { opacity: "0.9", transform: "scale(1.03) rotate(0.5deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.3) rotate(-8deg)" },
          "60%": { opacity: "0.9", transform: "scale(1.12) rotate(2deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0deg)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        fadeInRight: {
          "0%": { opacity: "0", transform: "translateX(40px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(80px) scale(0.88) rotate(2deg)" },
          "60%": { opacity: "0.8", transform: "translateY(-6px) scale(1.02) rotate(-0.5deg)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1) rotate(0deg)" },
        },
        pulseGlow: {
          "0%": { boxShadow: "0 0 0 0 rgba(29, 111, 255, 0.5)" },
          "70%": { boxShadow: "0 0 0 12px rgba(29, 111, 255, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(29, 111, 255, 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-300% center" },
          "100%": { backgroundPosition: "300% center" },
        },
        shimmerBorder: {
          "0%": { backgroundPosition: "-300% 0" },
          "100%": { backgroundPosition: "300% 0" },
        },
        stretchIn: {
          "0%": { opacity: "0", transform: "scaleX(0.2) scaleY(0.6)" },
          "50%": { opacity: "0.8", transform: "scaleX(1.04) scaleY(0.94)" },
          "100%": { opacity: "1", transform: "scaleX(1) scaleY(1)" },
        },
        swingIn: {
          "0%": { opacity: "0", transform: "rotate(-15deg) scale(0.8) translateY(-25px)" },
          "60%": { opacity: "0.9", transform: "rotate(3deg) scale(1.04) translateY(4px)" },
          "100%": { opacity: "1", transform: "rotate(0deg) scale(1) translateY(0)" },
        },
        rotateIn: {
          "0%": { opacity: "0", transform: "rotate(-180deg) scale(0.2)" },
          "60%": { opacity: "0.8", transform: "rotate(10deg) scale(1.05)" },
          "100%": { opacity: "1", transform: "rotate(0deg) scale(1)" },
        },
        bounceIn: {
          "0%": { opacity: "0", transform: "scale(0.3) translateY(40px)" },
          "50%": { opacity: "0.9", transform: "scale(1.08) translateY(-8px)" },
          "70%": { transform: "scale(0.96) translateY(4px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        floatParticle: {
          "0%": { transform: "translateY(100vh) scale(0) rotate(0deg)", opacity: "0" },
          "15%": { opacity: "0.7", transform: "translateY(80vh) scale(0.5) rotate(90deg)" },
          "50%": { opacity: "1", transform: "translateY(50vh) scale(1) rotate(180deg)" },
          "85%": { opacity: "0.7", transform: "translateY(20vh) scale(0.5) rotate(270deg)" },
          "100%": { transform: "translateY(-10vh) scale(0) rotate(360deg)", opacity: "0" },
        },
        floatIcon: {
          "0%": { transform: "translateY(0) rotate(0deg) scale(1)" },
          "30%": { transform: "translateY(-6px) rotate(6deg) scale(1.08)" },
          "60%": { transform: "translateY(-3px) rotate(-3deg) scale(1.04)" },
          "100%": { transform: "translateY(0) rotate(0deg) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
