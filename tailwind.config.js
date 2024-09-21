/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./<custom directory>/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/(auth)/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./assets/fonts/**/*.{ttf,woff,woff2,eot,svg,otf}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#23F0C7",
      },
      fontFamily: {
        PeydaRegular: ["PeydaRegular"],
        PeydaSemiBold: ["PeydaSemiBold"],
        PeydaBlack: ["PeydaBlack"],
      },
    },
  },
  plugins: [],
};
