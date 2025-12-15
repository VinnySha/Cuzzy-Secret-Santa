/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        snow: "snow 15s linear infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        snow: {
          "0%": { transform: "translateY(-100vh) rotate(0deg)" },
          "100%": { transform: "translateY(100vh) rotate(360deg)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-10px) rotate(-5deg)" },
          "75%": { transform: "translateX(10px) rotate(5deg)" },
        },
      },
    },
  },
  plugins: [],
};
