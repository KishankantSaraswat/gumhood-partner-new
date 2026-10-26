import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '', showLabel = true }) => {
    const { themeMode, setThemeMode, isDark } = useTheme();

    return (
        <div
            className={`inline-flex items-center p-1 rounded-xl glass-pill-dark border border-amber-500/25 transition-all shadow-xs ${className}`}
            role="group"
            aria-label="Theme mode switcher"
        >
            <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
 isDark
 ? 'gold-gradient-btn text-slate-950 font-black shadow-md scale-[1.02]'
 : 'text-slate-400 hover:text-slate-200'
 }`}
                title="Switch to Dark Theme"
                aria-pressed={isDark}
            >
                <Moon className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="hidden sm:inline">Dark</span>}
            </button>

            <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
 !isDark
 ? 'gold-gradient-btn text-slate-950 font-black shadow-md scale-[1.02]'
 : 'text-slate-400 hover:text-slate-200'
 }`}
                title="Switch to Light Theme"
                aria-pressed={!isDark}
            >
                <Sun className="w-3.5 h-3.5 shrink-0" />
                {showLabel && <span className="hidden sm:inline">Light</span>}
            </button>
        </div>
    );
};

export default ThemeToggle;

