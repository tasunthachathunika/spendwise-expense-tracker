/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        'hover-fine': { raw: '(hover: hover) and (pointer: fine)' },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        cream: {
          DEFAULT: "rgb(var(--cream) / <alpha-value>)",
          band: "rgb(var(--cream-band) / <alpha-value>)",
          hover: "rgb(var(--cream-hover) / <alpha-value>)",
        },
        "cream-band": "rgb(var(--cream-band) / <alpha-value>)",
        "cream-hover": "rgb(var(--cream-hover) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          light: "rgb(var(--line-light) / <alpha-value>)",
        },
        "line-light": "rgb(var(--line-light) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          body: "rgb(var(--ink-body) / <alpha-value>)",
          soft: "rgb(var(--ink-soft) / <alpha-value>)",
          muted: "rgb(var(--ink-soft) / <alpha-value>)",
        },
        "ink-body": "rgb(var(--ink-body) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        "ink-muted": "rgb(var(--ink-soft) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)",
          dark: "rgb(var(--brand-dark) / <alpha-value>)",
          light: "rgb(var(--brand-light) / <alpha-value>)",
          soft: "var(--brand-soft)",
        },
        "brand-dark": "rgb(var(--brand-dark) / <alpha-value>)",
        "brand-light": "rgb(var(--brand-light) / <alpha-value>)",
        "brand-soft": "var(--brand-soft)",
        income: "rgb(var(--income) / <alpha-value>)",
        expense: "rgb(var(--expense) / <alpha-value>)",
        warn: "rgb(var(--warn) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        bg: {
          primary: "rgb(var(--cream) / <alpha-value>)",
          secondary: "rgb(var(--cream-band) / <alpha-value>)",
          card: "rgb(var(--card) / <alpha-value>)",
          hover: "rgb(var(--cream-hover) / <alpha-value>)",
        },
      },
      contrast: {
        105: "1.05",
      },
      saturate: {
        110: "1.1",
      },
      gradientColorStopPositions: {
        "50%": "50%",
        "52%": "52%",
        "58%": "58%",
      },
    },
  },
  plugins: [],
};
