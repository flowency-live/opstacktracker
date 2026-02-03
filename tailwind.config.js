/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // RAGB status colors (dark theme optimized)
        status: {
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#22c55e',
          blue: '#3b82f6',
        },
        // Dark theme background colors (MS Teams inspired)
        surface: {
          primary: '#1f1f1f',
          secondary: '#292929',
          tertiary: '#333333',
          hover: '#3d3d3d',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
          tertiary: '#808080',
        },
      },
    },
  },
  plugins: [],
};
