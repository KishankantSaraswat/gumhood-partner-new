import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, 
    ArrowUp, ArrowDown, ArrowUpDown, Columns3, Check, Loader2, Database
} from 'lucide-react';

/**
 * Enterprise SaaS DataTable
 *
 * Implements sorting, pagination, column visibility toggle,
 * record stats, responsive scrolling, and standardized column alignment.
 */
export const DataTable = ({
    tableId = 'saas-datatable',
    columns = [],
    data = [],
    loading = false,
    emptyMessage = 'No records found.',
    showSno = true,
    snoTitle = 'S.No',
    sorting,
    pagination,
    rowClassName,
    onRowClick,
    toolbarExtra,
    className = ''
}) => {
    // Column visibility state: map of column key -> boolean
    const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
    const [isColMenuOpen, setIsColMenuOpen] = useState(false);
    const colMenuRef = useRef(null);

    // Close column dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (colMenuRef.current && !colMenuRef.current.contains(event.target)) {
                setIsColMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter visible columns
    const visibleColumns = useMemo(() => {
        return columns.filter(col => !hiddenColumns.has(col.key));
    }, [columns, hiddenColumns]);

    const toggleColumn = (key) => {
        setHiddenColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                // Ensure at least 1 column remains visible
                if (visibleColumns.length > 1) {
                    next.add(key);
                }
            }
            return next;
        });
    };

    // Calculate records stats
    const totalRecords = pagination?.totalRecords ?? data.length;
    const currentPage = pagination?.currentPage ?? 1;
    const rowsPerPage = pagination?.rowsPerPage ?? data.length ?? 50;
    const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalRecords / (rowsPerPage || 1)));

    const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endRecord = Math.min(startRecord + data.length - 1, totalRecords);

    // Align class generator
    const getAlignClass = (align) => {
        if (align === 'center') return 'text-center justify-center';
        if (align === 'right') return 'text-right justify-end';
        return 'text-left justify-start';
    };

    return (
        <div className={`flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-300 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden ${className}`}>
            {/* Top Toolbar (Stats, Column Visibility, Rows per page, Pagination) */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 dark:border-white/5 bg-slate-50/70 dark:bg-white/[0.01]">
                {/* Left: Records Stats */}
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startRecord}-{endRecord}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalRecords}</span> records
                </div>

                {/* Right: Controls Toolbar */}
                <div className="flex items-center gap-3">
                    {toolbarExtra}

                    {/* Column Visibility Dropdown */}
                    <div className="relative" ref={colMenuRef}>
                        <button
                            type="button"
                            onClick={() => setIsColMenuOpen(!isColMenuOpen)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                        >
                            <Columns3 className="w-3.5 h-3.5" style={{ color: 'var(--app-primary)' }} />
                            <span>Columns</span>
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
                                {visibleColumns.length}/{columns.length}
                            </span>
                        </button>

                        {isColMenuOpen && (
                            <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-30 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-1 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-white/5">
                                    Toggle Columns
                                </div>
                                <div className="max-h-56 overflow-y-auto py-1">
                                    {columns.map(col => {
                                        const isChecked = !hiddenColumns.has(col.key);
                                        return (
                                            <button
                                                key={col.key}
                                                type="button"
                                                onClick={() => toggleColumn(col.key)}
                                                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                            >
                                                <span className="truncate">{col.title}</span>
                                                <div 
                                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                        isChecked 
                                                            ? 'text-white' 
                                                            : 'border-slate-300 dark:border-white/20'
                                                    }`}
                                                    style={isChecked ? { backgroundColor: 'var(--app-primary)', borderColor: 'var(--app-primary)' } : {}}
                                                >
                                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rows per page selector */}
                    {pagination && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <span>Rows:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => pagination.onRowsPerPageChange?.(Number(e.target.value))}
                                className="px-2 py-1 text-xs font-semibold bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg text-slate-700 dark:text-slate-200 outline-none theme-input cursor-pointer"
                            >
                                {(pagination.rowsPerPageOptions || [10, 25, 50, 100]).map(opt => (
                                    <option key={opt} value={opt} className="bg-white dark:bg-[#121622] text-slate-800 dark:text-slate-100">
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {pagination && (
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => pagination.onPageChange?.(1)}
                                disabled={currentPage <= 1 || loading}
                                title="First Page"
                                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => pagination.onPageChange?.(currentPage - 1)}
                                disabled={currentPage <= 1 || loading}
                                title="Previous Page"
                                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                {currentPage}/{totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => pagination.onPageChange?.(currentPage + 1)}
                                disabled={currentPage >= totalPages || loading}
                                title="Next Page"
                                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => pagination.onPageChange?.(totalPages)}
                                disabled={currentPage >= totalPages || loading}
                                title="Last Page"
                                className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Table Container - ONLY this container scrolls vertically */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#161a26]/95 backdrop-blur-xs border-b border-slate-200 dark:border-white/10 shadow-2xs">
                        <tr className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wider select-none bg-slate-50 dark:bg-[#161a26]">
                            {showSno && (
                                <th className="px-3.5 py-2.5 w-14 text-center font-bold bg-slate-50 dark:bg-[#161a26]">
                                    {snoTitle}
                                </th>
                            )}
                            {visibleColumns.map(col => {
                                const isSortable = col.sortable && sorting?.onSort;
                                const isCurrentSort = sorting?.sortKey === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        style={col.width ? { width: col.width } : undefined}
                                        className={`px-3.5 py-2.5 bg-slate-50 dark:bg-[#161a26] ${isSortable ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-white/5 transition-colors' : ''}`}
                                        onClick={() => isSortable && sorting.onSort(col.key)}
                                    >
                                        <div className={`flex items-center gap-1.5 ${getAlignClass(col.align)}`}>
                                            <span>{col.title}</span>
                                            {isSortable && (
                                                <span className="text-slate-400">
                                                    {isCurrentSort ? (
                                                        sorting.sortDirection === 'asc' ? (
                                                            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: 'var(--app-primary)' }} />
                                                        ) : (
                                                            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" style={{ color: 'var(--app-primary)' }} />
                                                        )
                                                    ) : (
                                                        <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                        {loading ? (
                            <tr>
                                <td 
                                    colSpan={visibleColumns.length + (showSno ? 1 : 0)} 
                                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--app-primary)' }} />
                                        <span className="font-medium text-xs">Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td 
                                    colSpan={visibleColumns.length + (showSno ? 1 : 0)} 
                                    className="py-12 text-center text-slate-400 dark:text-slate-500"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                            <Database className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{emptyMessage}</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => {
                                const actualIndex = (currentPage - 1) * rowsPerPage + index + 1;
                                const customRowClass = rowClassName ? rowClassName(row, index) : '';
                                return (
                                    <tr
                                        key={row.id ?? index}
                                        onClick={() => onRowClick?.(row)}
                                        className={`transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 border-l-[3px] border-l-transparent hover:border-l-[var(--app-primary)] ${
                                            onRowClick ? 'cursor-pointer' : ''
                                        } ${customRowClass}`}
                                    >
                                        {showSno && (
                                            <td className="px-3.5 py-2.5 text-center font-medium text-slate-500 dark:text-slate-400">
                                                {actualIndex}
                                            </td>
                                        )}
                                        {visibleColumns.map(col => (
                                            <td 
                                                key={col.key} 
                                                className={`px-3.5 py-2.5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}`}
                                            >
                                                {col.render 
                                                    ? col.render(row, index, actualIndex) 
                                                    : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '—')}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;

