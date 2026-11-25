/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07070A',
          900: '#0D0D12',
          850: '#121218',
          800: '#171720',
          750: '#1E1E2A',
          700: '#272736',
          600: '#343446',
          500: '#4E4E63',
        },
        brand: {
          DEFAULT: '#FF5B26',
          50: '#FFF2EC',
          100: '#FFE2D4',
          200: '#FFC2A8',
          300: '#FFA078',
          400: '#FF7D47',
          500: '#FF5B26',
          600: '#E64410',
          700: '#BD3306',
          800: '#942603',
          900: '#731E01',
        },
        accent: {
          orange: '#FF7A00',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
          sky: '#0EA5E9',
          purple: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-orange': '0 0 25px -5px rgba(255, 91, 38, 0.45)',
        'glow-subtle': '0 0 20px -3px rgba(255, 91, 38, 0.2)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'mesh-glow': 'radial-gradient(circle at 10% 20%, rgba(255, 91, 38, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%)',
      }
    },
  },
  plugins: [],
}
