/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#7c3aed",
        background: "#ffffff",
        foreground: "#0f172a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        muted: {
          foreground: "#64748b",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        primary: {
          DEFAULT: "#7c3aed",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#f4f4f5",
          foreground: "#18181b",
        },
      },
    },
  },
  plugins: [],
}
