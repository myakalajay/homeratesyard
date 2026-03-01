/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  darkMode: "class",

  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./layouts/**/*.{js,jsx,ts,tsx}",
    "./modules/**/*.{js,jsx,ts,tsx}",
  ],

  safelist: [
    "bg-primary",
    "bg-secondary",
    "text-danger",
    "border-brand",
  ],

  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
        "3xl": "1600px",
        "4xl": "1800px",
      },
    },

    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        display: ["SF Pro Display", "Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", ...defaultTheme.fontFamily.mono],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
      },

      colors: {
        background: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          muted: "#F1F5F9",
          inverted: "#0F172A",
        },

        content: {
          DEFAULT: "#0F172A",
          subtle: "#334155",
          muted: "#64748B",
          inverted: "#FFFFFF",
          brand: "#DC2626",
        },

        border: {
          DEFAULT: "#E2E8F0",
          subtle: "#F1F5F9",
          strong: "#CBD5E1",
          brand: "#FECACA",
        },

        primary: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          active: "#991B1B",
          subtle: "#FEF2F2",
          text: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#EA580C",
          hover: "#C2410C",
          active: "#9A3412",
          subtle: "#FFF7ED",
          text: "#FFFFFF",
        },

        success: {
          DEFAULT: "#10B981",
          subtle: "#ECFDF5",
          text: "#065F46",
        },

        warning: {
          DEFAULT: "#F59E0B",
          subtle: "#FFFBEB",
          text: "#92400E",
        },

        danger: {
          DEFAULT: "#EF4444",
          subtle: "#FEF2F2",
          text: "#991B1B",
        },
      },

      boxShadow: {
        xs: "0 1px 2px rgba(15,23,42,.05)",
        "inner-border": "inset 0 0 0 1px #E2E8F0",
        "glow-primary": "0 0 20px -5px rgba(220,38,38,.3)",
      },

      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.25rem",
      },

      spacing: {
        "4.5": "1.125rem",
        "18": "4.5rem",
      },

      animation: {
        "accordion-down": "accordion-down .2s ease-out",
        "accordion-up": "accordion-up .2s ease-out",
        "fade-in": "fade-in .3s cubic-bezier(.16,1,.3,1)",
        "slide-in-right": "slide-in-right .4s cubic-bezier(.16,1,.3,1)",
        "scroll-left": "scroll-left 40s linear infinite",
        "scroll-right": "scroll-right 40s linear infinite",
      },

      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms")({ strategy: "class" }),
    require("@tailwindcss/typography"),

    plugin(function ({ addUtilities, addBase }) {
      addBase({
        /* remove number arrows */
        'input[type="number"]::-webkit-inner-spin-button, input[type="number"]::-webkit-outer-spin-button':
          { WebkitAppearance: "none", margin: 0 },

        'input[type="number"]': { MozAppearance: "textfield" },
      });

      addUtilities({
        ".flex-center": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },

        ".text-balance": {
          textWrap: "balance",
          overflowWrap: "anywhere",
        },

        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          scrollbarWidth: "none",
        },

        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none",
        },

        ".bg-glass": {
          background: "rgba(255,255,255,.7)",
          backdropFilter: "blur(12px)",
        },

        ".will-transform": {
          willChange: "transform",
        },
      });
    }),
  ],
};