import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Status palette: green=visited, amber=want, grey=none
        visited: "#15803d",
        want: "#d97706",
        none: "#4b5563",
      },
    },
  },
  plugins: [],
} satisfies Config;
