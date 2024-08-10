/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode : "class",
  theme: {
    extend: {
      fontFamily:{
        'tilt-neon': ['Tilt Neon', 'sans-serif'],
        'open-sans': ['Open Sans', 'sans-serif'],
        'pt-sans': ['PT Sans', 'sans-serif'],
        'oswald': ['Oswald', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

//Color hammer: bg-[#fc4b08]