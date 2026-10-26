import React from 'react';

/**
 * StatusBadge - Standardized status pill with dot indicator
 *
 * @param {boolean|string} status - boolean (true/false) or status string ('active', 'inactive', 'pending', etc.)
 * @param {string} [activeLabel='Active']
 * @param {string} [inactiveLabel='Inactive']
 * @param {'pill'|'badge'} [type='pill']
 * @param {string} [className='']
 */
export const StatusBadge = ({
    status,
    activeLabel = 'Active',
    inactiveLabel = 'Inactive',
    type = 'pill',
    className = ''
}) => {
    const isBool = typeof status === 'boolean';
    const isStatusActive = isBool ? status : (String(status).toLowerCase() === 'active' || String(status).toLowerCase() === 'true');
    const isStatusPending = !isBool && String(status).toLowerCase() === 'pending';

    let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
    let dotClass = 'bg-emerald-500';
    let label = isStatusActive ? activeLabel : inactiveLabel;

    if (isStatusPending) {
        colorClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
        dotClass = 'bg-amber-500';
        label = 'Pending';
    } else if (!isStatusActive) {
        colorClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
        dotClass = 'bg-rose-500';
    }

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colorClasses} select-none ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            <span>{label}</span>
        </span>
    );
};

export default StatusBadge;

