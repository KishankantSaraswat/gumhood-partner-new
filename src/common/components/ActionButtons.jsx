import React from 'react';
import { Pencil, Trash2, Eye } from 'lucide-react';

/**
 * ActionButtons - Circular action buttons (Edit, Delete, View)
 * Matches the reference design in Runwaybites / Master tables.
 *
 * @param {() => void} [onEdit]
 * @param {() => void} [onDelete]
 * @param {() => void} [onView]
 * @param {boolean} [canEdit=true]
 * @param {boolean} [canDelete=true]
 * @param {boolean} [canView=false]
 * @param {string} [editTooltip='Edit record']
 * @param {string} [deleteTooltip='Delete record']
 * @param {string} [viewTooltip='View details']
 * @param {string} [className='']
 */
export const ActionButtons = ({
    onEdit,
    onDelete,
    onView,
    canEdit = true,
    canDelete = true,
    canView = false,
    editTooltip = 'Edit',
    deleteTooltip = 'Delete',
    viewTooltip = 'View',
    className = ''
}) => {
    return (
        <div className={`inline-flex items-center gap-1.5 justify-center ${className}`}>
            {onView && canView && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    title={viewTooltip}
                    className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/20 text-slate-500 dark:text-slate-400 hover:text-sky-600 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-500/10 flex items-center justify-center transition-all duration-150 focus:outline-none"
                >
                    <Eye className="w-3 h-3" />
                </button>
            )}

            {onEdit && canEdit && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    title={editTooltip}
                    className="w-7 h-7 rounded-full border border-slate-200 dark:border-white/20 bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 flex items-center justify-center transition-all duration-150 shadow-2xs focus:outline-none cursor-pointer"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
            )}

            {onDelete && canDelete && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    title={deleteTooltip}
                    className="w-7 h-7 rounded-full border border-rose-200 dark:border-rose-500/30 bg-white dark:bg-white/5 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center justify-center transition-all duration-150 shadow-2xs focus:outline-none cursor-pointer"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default ActionButtons;

