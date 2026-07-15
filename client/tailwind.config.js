/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Deep plum-indigo ground, not the generic near-black
        ink: {
          50: "#f3f1f8",
          100: "#e3ddf0",
          400: "#8b7fb8",
          600: "#584a86",
          800: "#241d38",
          900: "#171226",
          950: "#0f0b1a",
        },
        // Signature accent: warm ember (sent messages / primary actions)
        ember: {
          400: "#ff9466",
          500: "#ff7a47",
          600: "#e85f2e",
        },
        // Secondary accent: signal mint (delivered / online / read state)
        signal: {
          400: "#5eead4",
          500: "#2dd4bf",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        bubble: "1.1rem",
      },
      keyframes: {
        pulseDot: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.4 },
        },
      },
      animation: {
        pulseDot: "pulseDot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
