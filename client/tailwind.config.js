/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#ffffff',
          300: '#af3131',
          400: '#af3131',
          500: '#af3131',
          600: '#af3131',
          700: '#af3131',
          800: '#af3131',
          900: '#000000',
        },
        secondary: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#464544',
          300: '#464544',
          400: '#464544',
          500: '#464544',
          600: '#464544',
          700: '#464544',
          800: '#000000',
          900: '#000000',
        },
        accent: {
          50: '#af3131',
          100: '#af3131',
          200: '#af3131',
          300: '#af3131',
          400: '#af3131',
          500: '#af3131',
          600: '#af3131',
          700: '#af3131',
          800: '#af3131',
          900: '#af3131',
        },
        gray: {
          50: '#ffffff',
          100: '#ffffff',
          200: '#464544',
          300: '#464544',
          400: '#464544',
          500: '#464544',
          600: '#464544',
          700: '#000000',
          800: '#000000',
          900: '#000000',
        }
      },
      fontFamily: {
        'persian': ['Vazir', 'Tahoma', 'Arial', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}