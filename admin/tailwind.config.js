/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // 分类渐变色
    'from-orange-400', 'to-red-500',
    'from-red-400', 'to-pink-500',
    'from-pink-400', 'to-purple-500',
    'from-yellow-400', 'to-orange-500',
    'from-blue-400', 'to-cyan-500',
    'from-green-400', 'to-teal-500',
    'from-purple-400', 'to-indigo-500',
    'from-gray-400', 'to-gray-500',
    'from-teal-400', 'to-blue-500',
    'from-indigo-400', 'to-purple-500',
    'from-cyan-400', 'to-blue-500',
    'from-rose-400', 'to-pink-500',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
