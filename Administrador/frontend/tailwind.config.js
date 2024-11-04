// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#009FDB',   // Celeste
        secondary: '#FFA500', // Naranja
        hover: '#FFB800',     // Color de hover
      },
    },
  },
  plugins: [],
};
