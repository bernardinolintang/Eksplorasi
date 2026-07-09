import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Status palette — green=visited, amber=want, grey=none
        visited: "#16a34a",
        want: "#f59e0b",
        none: "#9ca3af",
      },
    },
  },
  plugins: [],
} satisfies Config;
