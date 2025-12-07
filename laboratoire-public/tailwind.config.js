/******** Tailwind config pour LANEMA ********/
/**
 * Palette inspirée du logo :
 * - primaire: dégradé bleu (#0072C6 → #00A0E3)
 * - fond: blanc
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        lanema: {
          blue: {
            50: '#e0f2ff',
            100: '#b3deff',
            200: '#80c8ff',
            300: '#4db2ff',
            400: '#1a9cff',
            500: '#0084e0', // bleu principal
            600: '#006bb3',
            700: '#005387',
            800: '#003b5b',
            900: '#002330',
          },
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 18px 45px rgba(15, 23, 42, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
      },
    },
  },
  plugins: [],
}
