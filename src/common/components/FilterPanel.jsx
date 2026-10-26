import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, RotateCcw, Check } from 'lucide-react';

/**
 * FilterPanel - Collapsible master search filter card
 * Matches the reference design in Runwaybites / Master tables.
 *
 * @param {string} [title='Filters']
 * @param {React.ReactNode} [icon]
 * @param {boolean} [isCollapsible=true]
 * @param {boolean} [defaultExpanded=true]
 * @param {() => void} [onApply]
 * @param {() => void} [onReset]
 * @param {string} [applyText='Apply']
 * @param {string} [resetText='Reset']
 * @param {React.ReactNode} children - Form inputs / controls
 * @param {string} [className='']
 */
export const FilterPanel = ({
    title = 'Filters',
    icon,
    isCollapsible = true,
    defaultExpanded = true,
    onApply,
    onReset,
    applyText = 'Apply',
    resetText = 'Reset',
    children,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && onApply) {
            e.preventDefault();
            onApply();
        }
    };

    return (
        <div className={`bg-white dark:bg-[#121622] border border-slate-300 dark:border-white/10 rounded-2xl shadow-xs transition-all duration-200 ${className}`}>
            {/* Header */}
            <div 
                className={`flex items-center justify-between px-4 py-2.5 ${isExpanded ? 'border-b border-slate-200 dark:border-white/5' : ''} ${isCollapsible ? 'cursor-pointer select-none' : ''}`}
                onClick={() => isCollapsible && setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span 
                        className="w-5 h-5 rounded-md flex items-center justify-center transition-colors"
                        style={{
                            backgroundColor: 'var(--color-primary-light, rgba(249, 115, 22, 0.15))',
                            color: 'var(--app-primary, #f97316)'
                        }}
                    >
                        {icon || <Search className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wider">
                        {title}
                    </span>
                </div>

                {isCollapsible && (
                    <button
                        type="button"
                        aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
                        className="p-1 rounded-md transition-colors cursor-pointer"
                        style={{ color: 'var(--app-primary, #f97316)' }}
                    >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {/* Collapsible Body */}
            {isExpanded && (
                <div className="p-3 sm:p-3.5 space-y-2.5" onKeyDown={handleKeyDown}>
                    {/* Inputs Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                        {children}
                    </div>

                    {/* Action Triggers */}
                    {(onApply || onReset) && (
                        <div className="flex items-center justify-end gap-2 pt-1">
                            {onReset && (
                                <button
                                    type="button"
                                    onClick={onReset}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-xs cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3 text-slate-500" />
                                    <span>{resetText}</span>
                                </button>
                            )}

                            {onApply && (
                                <button
                                    type="button"
                                    onClick={onApply}
                                    className="btn-theme-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-150 cursor-pointer"
                                    style={{
                                        background: 'var(--gradient-primary, var(--app-primary))',
                                        boxShadow: 'var(--shadow-primary)'
                                    }}
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{applyText}</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FilterPanel;

