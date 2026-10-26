import React, { createContext, useContext, useEffect, useState } from 'react';

export const THEMES = [
    {
        id: 'base',
        name: 'Base (GymOS Gold)',
        primary: '#f59e0b',
        primaryHover: '#d97706',
        gradientFrom: '#fde047',
        gradientTo: '#ea580c',
        ringColor: 'rgba(245, 158, 11, 0.45)',
        previewColor: '#f59e0b'
    },
    {
        id: 'yellow',
        name: 'Yellow',
        primary: '#eab308',
        primaryHover: '#ca8a04',
        gradientFrom: '#eab308',
        gradientTo: '#ca8a04',
        ringColor: 'rgba(234, 179, 8, 0.35)',
        previewColor: '#eab308'
    },
    {
        id: 'green',
        name: 'Green',
        primary: '#10b981',
        primaryHover: '#059669',
        gradientFrom: '#10b981',
        gradientTo: '#059669',
        ringColor: 'rgba(16, 185, 129, 0.35)',
        previewColor: '#10b981'
    },
    {
        id: 'blue',
        name: 'Blue',
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        gradientFrom: '#3b82f6',
        gradientTo: '#2563eb',
        ringColor: 'rgba(59, 130, 246, 0.35)',
        previewColor: '#3b82f6'
    },
    {
        id: 'orange',
        name: 'Orange',
        primary: '#f97316',
        primaryHover: '#ea580c',
        gradientFrom: '#f97316',
        gradientTo: '#ea580c',
        ringColor: 'rgba(249, 115, 22, 0.35)',
        previewColor: '#f97316'
    },
    {
        id: 'red',
        name: 'Red',
        primary: '#ef4444',
        primaryHover: '#dc2626',
        gradientFrom: '#ef4444',
        gradientTo: '#dc2626',
        ringColor: 'rgba(239, 68, 68, 0.35)',
        previewColor: '#ef4444'
    },
    {
        id: 'violet',
        name: 'Violet',
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        gradientFrom: '#8b5cf6',
        gradientTo: '#7c3aed',
        ringColor: 'rgba(139, 92, 246, 0.35)',
        previewColor: '#8b5cf6'
    }
];

const ThemeContext = createContext({
    theme: 'base',
    currentThemeConfig: THEMES[0],
    setTheme: () => {},
    themeMode: 'dark',
    isDark: true,
    setThemeMode: () => {},
    toggleThemeMode: () => {}
});

export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        const saved = localStorage.getItem('gym_app_theme');
        if (saved === 'gold' || saved === 'orange') return 'base';
        return saved || 'base';
    });

    const [themeMode, setThemeModeState] = useState(() => {
        return localStorage.getItem('gym_theme_mode') || 'dark';
    });

    const currentThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];
    const isDark = themeMode === 'dark';

    const setTheme = (newThemeId) => {
        const found = THEMES.find((t) => t.id === newThemeId);
        if (found) {
            setThemeState(found.id);
            localStorage.setItem('gym_app_theme', found.id);
        }
    };

    const setThemeMode = (mode) => {
        if (mode === 'dark' || mode === 'light') {
            setThemeModeState(mode);
            localStorage.setItem('gym_theme_mode', mode);
        }
    };

    const toggleThemeMode = () => {
        const next = themeMode === 'dark' ? 'light' : 'dark';
        setThemeModeState(next);
        localStorage.setItem('gym_theme_mode', next);
    };

    useEffect(() => {
        // Apply CSS custom properties dynamically on document root
        const root = document.documentElement;
        root.style.setProperty('--app-primary', currentThemeConfig.primary);
        root.style.setProperty('--app-primary-hover', currentThemeConfig.primaryHover);
        root.style.setProperty('--app-primary-from', currentThemeConfig.gradientFrom);
        root.style.setProperty('--app-primary-to', currentThemeConfig.gradientTo);
        root.style.setProperty('--app-primary-ring', currentThemeConfig.ringColor);
        root.style.setProperty('--grad-primary-from', currentThemeConfig.gradientFrom);
        root.style.setProperty('--grad-primary-to', currentThemeConfig.gradientTo);
        root.style.setProperty('--shadow-primary', `0 6px 18px -2px ${currentThemeConfig.ringColor}`);
        root.style.setProperty('--color-surface', isDark ? '#0b0f19' : '#ffffff');
        root.style.setProperty('--color-primary', currentThemeConfig.primary);
        root.style.setProperty('--color-primary-hover', currentThemeConfig.primaryHover);
        root.style.setProperty('--color-primary-light', `${currentThemeConfig.primary}18`);
        root.style.setProperty('--color-primary-glow', currentThemeConfig.ringColor);
        root.style.setProperty(
            '--gradient-primary',
            `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.primary} 45%, ${currentThemeConfig.gradientTo} 100%)`
        );
        root.style.setProperty(
            '--gradient-gold',
            `linear-gradient(135deg, #fde047 0%, #fb923c 45%, #f97316 75%, #ea580c 100%)`
        );

        // Remove old theme-* classes on root
        THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
        root.classList.add(`theme-${currentThemeConfig.id}`);
        root.setAttribute('data-theme', currentThemeConfig.id);

        // Apply dark/light theme mode
        root.classList.remove('dark', 'light');
        root.classList.add(themeMode);
        root.setAttribute('data-theme-mode', themeMode);
    }, [currentThemeConfig, themeMode]);

    return (
        <ThemeContext.Provider value={{
            theme,
            currentThemeConfig,
            setTheme,
            themes: THEMES,
            themeMode,
            isDark,
            setThemeMode,
            toggleThemeMode
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

