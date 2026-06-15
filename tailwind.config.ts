import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm, clinical palette: slate neutrals + a restrained medical teal.
        brand: {
          50: "#eef7f7",
          100: "#d6ecec",
          200: "#aedbdb",
          300: "#7cc3c4",
          400: "#4ba6a8",
          500: "#2f8a8c",
          600: "#256d70",
          700: "#205659",
          800: "#1d474a",
          900: "#1a3c3f",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      maxWidth: {
        app: "480px",
      },
    },
  },
  plugins: [],
};

export default config;
