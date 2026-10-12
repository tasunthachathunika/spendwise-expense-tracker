/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        cream: { DEFAULT: "#fdf9ef", band: "#f6f0dd", hover: "#faf5e6" },
        line: {
          DEFAULT: "var(--border)",
          light: "var(--border-light)",
        },
        ink: {
          DEFAULT: "var(--text-primary)",
          body: "var(--text-secondary)",
          soft: "var(--text-muted)",
          muted: "var(--text-muted)",
        },
        brand: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
          light: "var(--accent-light)",
          soft: "var(--accent-soft)",
        },
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          card: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
        },
        income: "var(--green)",
        expense: "var(--red)",
        warn: "var(--amber)",
        info: "var(--blue)",
      },
    },
  },
  plugins: [],
};
