// tailwind.config.js (or tailwind.config.ts if you prefer)
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // If you have a root index.html (Vite usually injects into a template)
    "./app/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in your app directory
    "./app/components/**/*.{js,ts,jsx,tsx}", // Be explicit if needed
  ],
  theme: {
    extend: {
      // Your theme extensions from app.css can also go here if preferred,
      // or you can keep them in app.css with @theme.
      // Example:
      // colors: {
      //   background: 'oklch(1 0 0)',
      //   foreground: 'oklch(0.145 0 0)',
      //   // ... and so on for your color palette
      // },
      // borderRadius: {
      //  DEFAULT: '0.625rem', // for --radius
      //  // ... and so on
      // }
    },
  },
  plugins: [
    // any Tailwind plugins you might be using, e.g., require('@tailwindcss/forms')
  ],
};