import { useState } from 'react';

/**
 * useSorting Hook for data tables
 *
 * @param {Object} [options]
 * @param {string} [options.initialSortKey='']
 * @param {'asc'|'desc'} [options.initialSortDirection='asc']
 */
export const useSorting = (options = {}) => {
    const [sortKey, setSortKey] = useState(options.initialSortKey || '');
    const [sortDirection, setSortDirection] = useState(options.initialSortDirection || 'asc');

    const handleSort = (key) => {
        if (sortKey === key) {
            // Toggle direction or reset
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortKey('');
                setSortDirection('asc');
            }
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    };

    return {
        sortKey,
        sortDirection,
        setSortKey,
        setSortDirection,
        handleSort
    };
};

export default useSorting;

