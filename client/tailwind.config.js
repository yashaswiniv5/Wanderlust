/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0F766E', // Teal 700
                secondary: '#0EA5E9', // Sky 500
                accent: '#F59E0B', // Amber 500
                dark: '#1E293B',
                light: '#F8FAFC',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
