/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Merienda"', "cursive"], // Override default sans with Merienda
      },
    },
  },
  plugins: [],
};
