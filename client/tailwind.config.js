/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}",'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
        colors:{
          'primary': {
            DEFAULT: '#6965DB',
            50: '#FAFAFE',
            100: '#EAE9FA',
            200: '#CAC8F2',
            300: '#A9A7EA',
            400: '#8986E3',
            500: '#6965DB',
            600: '#3D38D0',
            700: '#2C27A8',
            800: '#201D7B',
            900: '#14124D'
          },
        }
    },
  },
  plugins: [require('flowbite/plugin')],
}
