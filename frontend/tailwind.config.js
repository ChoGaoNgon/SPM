module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                accent: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                },
            },
            backgroundColor: {
                dark: '#0f172a',
                'dark-secondary': '#1e293b',
                'dark-tertiary': '#334155',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(90deg, rgba(0, 98, 245, 1) 5%, rgba(115, 201, 255, 1) 99%)',
                'secondary-gradient': 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
            },
            textColor: {
                dark: '#f1f5f9',
                'dark-secondary': '#cbd5e1',
            },
            borderColor: {
                dark: '#334155',
                'dark-secondary': '#1e293b',
            },
            boxShadow: {
                'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            },
        },
    },
    plugins: [],
};
