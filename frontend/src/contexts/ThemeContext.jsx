import { theme as antdTheme } from 'antd';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const toggleTheme = (checked) => {
        setIsDark(checked);
        localStorage.setItem('theme', checked ? 'dark' : 'light');
    };

    const themeAlgorithm = isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm;

    return <ThemeContext.Provider value={{ isDark, toggleTheme, themeAlgorithm }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
