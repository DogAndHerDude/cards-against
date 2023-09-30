/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Ar One sans", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};
