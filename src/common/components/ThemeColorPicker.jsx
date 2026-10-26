import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeColorPicker = ({ className = '', showModeToggle = false }) => {
    const { theme, setTheme, themes, themeMode, setThemeMode, isDark } = useTheme();

    return (
        <div className={`space-y-2.5 ${className}`}>
            {showModeToggle && (
                <div className="pb-2 mb-2 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[11px] font-bold tracking-wider text-slate-400">
                        Theme Mode
                    </span>
                    <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-white/10">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setThemeMode('dark');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
 isDark ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
                        >
                            Dark
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setThemeMode('light');
                            }}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
 !isDark ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
                        >
                            Light
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                {themes.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setTheme(t.id);
                            }}
                            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-all duration-150 cursor-pointer border text-left ${
 isSelected
 ? 'font-bold shadow-xs'
 : 'border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
 }`}
                            style={
                                isSelected
                                    ? {
                                          borderColor: t.primary,
                                          backgroundColor: isDark ? `${t.primary}25` : `${t.primary}12`,
                                          color: isDark ? '#ffffff' : t.primaryHover || t.primary
                                      }
                                    : {}
                            }
                        >
                            <span
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white/20"
                                style={{
                                    background: t.gradientFrom && t.gradientTo
                                        ? `linear-gradient(135deg, ${t.gradientFrom}, ${t.gradientTo})`
                                        : t.primary
                                }}
                            />
                            <span className="truncate">{t.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ThemeColorPicker;
