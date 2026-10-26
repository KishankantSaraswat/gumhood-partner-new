import React from 'react';
import { motion } from 'framer-motion';

export const ProfileTabs = ({
    tabs = [],
    activeTab,
    onChange
}) => {
    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar select-none">
            {tabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onChange(tab.id)}
                        className={`relative px-3.5 py-1.5 rounded-2xl font-bold text-xs whitespace-nowrap flex items-center gap-1.5 transition-colors duration-200 cursor-pointer ${
 isActive
 ? 'text-white'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
 }`}
                    >
                        {/* Smooth hardware-accelerated animated sliding indicator */}
                        {isActive && (
                            <motion.div
                                layoutId="profile-tab-pill-indicator"
                                className="absolute inset-0 rounded-2xl z-0"
                                style={{
                                    background: 'linear-gradient(135deg, var(--grad-primary-from, #f97316) 0%, var(--grad-primary-to, #ea580c) 100%)',
                                    boxShadow: '0 4px 14px rgba(249, 115, 22, 0.4)'
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 450,
                                    damping: 35
                                }}
                            />
                        )}

                        {IconComponent && (
                            <IconComponent className={`w-3.5 h-3.5 relative z-10 transition-colors ${
 isActive ? 'text-white' : 'text-slate-400'
 }`} />
                        )}

                        <span className="relative z-10">{tab.label}</span>

                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`relative z-10 px-1.5 py-0.2 rounded-md text-[10px] font-black transition-colors ${
 isActive 
 ? 'bg-white/25 text-white' 
 : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
 }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default ProfileTabs;

