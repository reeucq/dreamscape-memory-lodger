/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "omori-black": "#1a1a1a",
        "omori-white": "#f2f2f2",
        "omori-red": "#ff6b6b",
        "omori-blue": "#4ea8de",
        "omori-yellow": "#ffd93d",
      },
      fontFamily: {
        omori: ["Omori", "monospace"], // Or any pixel-style font
      },
      boxShadow: {
        omori: "4px 4px 0px rgba(0, 0, 0, 0.2)",
        "omori-hover": "6px 6px 0px #2D2D2D",
      },
      animation: {
        "fade-in-down": "fadeInDown 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "bounce-slow": "bounce 3s infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        fadeInDown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
      },
    },
  }, // add tailwind scrollbar plugin without require directive
  plugins: [require("tailwind-scrollbar")],
};
