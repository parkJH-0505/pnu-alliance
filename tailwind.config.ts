import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "charcoal-deep": "var(--charcoal-deep)",
        "gold": "var(--gold)",
        "gold-light": "var(--gold-light)",
        "ivory": "var(--ivory)",
      },
      backgroundImage: {
        "gold-gradient": "var(--gold-gradient)",
      },
    },
  },
  plugins: [],
};

export default config;
