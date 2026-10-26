import React from 'react';

export function AnimatedTabs({
  tabs = [],
  activeTab,
  onChange,
  label,
  labelIcon: LabelIcon,
  className = '',
}) {
  const safeTabs = Array.isArray(tabs) ? tabs : [];
  const activeIndex = safeTabs.findIndex((t) => t.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  const tabCount = safeTabs.length || 1;
  const tabWidthPercent = 100 / tabCount;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <span className="text-[11px] font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
          {LabelIcon && <LabelIcon className="w-3.5 h-3.5 text-purple-600" />}
          {label}
        </span>
      )}
      <div className="flex w-full items-center p-1 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs relative overflow-hidden">
        {/* Hardware-accelerated CSS sliding pill */}
        <div
          className="absolute top-1 bottom-1 rounded-xl shadow-xs transition-transform duration-250 ease-in-out pointer-events-none"
          style={{
            width: `calc(${tabWidthPercent}% - 8px)`,
            left: '4px',
            transform: `translateX(calc(${safeIndex * 100}% + ${safeIndex * 8}px))`,
            background: 'var(--gradient-primary, var(--app-primary, #f97316))',
            boxShadow: '0 4px 14px var(--color-primary-glow, rgba(249, 115, 22, 0.45))',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}
        />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex-1 py-2 rounded-xl font-extrabold tracking-tight whitespace-nowrap z-10 transition-colors duration-200 cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-1.5 select-none ${
 isActive ? 'text-white drop-shadow-xs' : 'text-slate-500 hover:text-slate-800'
 }`}
            >
              {tab.dot && <span className={`w-2 h-2 rounded-full ${tab.dot} shrink-0`} />}
              {IconComponent && (
                <IconComponent
                  className={`w-3.5 h-3.5 relative z-10 transition-colors duration-200 ${
 isActive ? 'text-white' : 'text-slate-400'
 }`}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AnimatedTabs;
