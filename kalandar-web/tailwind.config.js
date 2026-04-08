/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kalandar: {
          antrasit: '#0F0F12', // Daha derin zemin
          siyah: '#000000',
          kirmizi: '#8E052C',  // İŞTE O ASİL BORDO BURADA! 🍷
          beyaz: '#FFFFFF',
        }
      }
    },
  },
  plugins: [],
}