import { useState, useMemo } from 'react';

/**
 * usePagination Hook for client & server data tables
 *
 * @param {Object} options
 * @param {number} [options.initialPage=1]
 * @param {number} [options.initialRowsPerPage=50]
 */
export const usePagination = (options = {}) => {
    const [currentPage, setCurrentPage] = useState(options.initialPage || 1);
    const [rowsPerPage, setRowsPerPage] = useState(options.initialRowsPerPage || 50);

    const handlePageChange = (newPage) => {
        if (newPage >= 1) {
            setCurrentPage(newPage);
        }
    };

    const handleRowsPerPageChange = (newRowsPerPage) => {
        setRowsPerPage(Number(newRowsPerPage));
        setCurrentPage(1); // Reset to page 1 on limit change
    };

    const resetPagination = () => {
        setCurrentPage(1);
    };

    return {
        currentPage,
        rowsPerPage,
        setCurrentPage,
        setRowsPerPage,
        handlePageChange,
        handleRowsPerPageChange,
        resetPagination
    };
};

export default usePagination;

