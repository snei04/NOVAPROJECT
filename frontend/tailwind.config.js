/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        success: colors.green,
        primary: {
          DEFAULT: '#0080C9', // IMEVI Principal
          50: '#e0f2fe',
          100: '#bae6fd',
          200: '#7dd3fc',
          300: '#38bdf8',
          400: '#0ea5e9',
          500: '#0080C9', // Base
          600: '#0284c7',
          700: '#003D7B', // IMEVI Secundario (usado como tono oscuro del primario)
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          DEFAULT: '#003D7B', // IMEVI Secundario
        },
        danger: colors.red,
        // Colores específicos de la marca para uso directo
        imevi: {
          main: '#0080C9',
          dark: '#003D7B'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Calibri', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        body: ['Calibri', 'Open Sans', 'sans-serif'],
        heading: ['Ample Soft', 'Montserrat', 'sans-serif']
      },
      container: {
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1024px',
          '2xl': '1536px',
        },
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
