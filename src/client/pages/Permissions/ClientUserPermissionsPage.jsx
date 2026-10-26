import React from 'react';
import { 
    RefreshCw, ChevronRight, ChevronDown, Loader2, UserCheck
} from 'lucide-react';
import { SearchableSelect } from '../../../common';
import { useClientUserPermissionsLogic } from './clientUserPermissions.logic';

export const ClientUserPermissionsPage = ({ initialUserId }) => {
    const {
        users,
        selectedUserId,
        permissions,
        loading,
        saving,
        flatDisplayRows,
        hasUnsavedChanges,
        handleUserChange,
        toggleExpand,
        handleRightChange,
        isColumnAllSelected,
        handleColumnToggle,
        handleSaveChanges
    } = useClientUserPermissionsLogic({ initialUserId });

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-3">
            {/* Top Toolbar */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#121622] px-4 py-2.5 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
                {/* Left: User Selector Dropdown */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                        <UserCheck className="w-4 h-4 text-amber-500" />
                        <span>Staff User:</span>
                    </div>
                    <SearchableSelect
                        options={users.map(u => ({
                            value: String(u.id),
                            label: `${u.name} (${u.email || u.login_id || u.username})`
                        }))}
                        value={selectedUserId}
                        onChange={handleUserChange}
                        disabled={loading || saving}
                        placeholder="Select Staff User"
                        searchPlaceholder="Search user..."
                        className="min-w-[240px]"
                    />

                    {hasUnsavedChanges && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                            Unsaved Changes
                        </span>
                    )}
                </div>

                {/* Right: Save Changes Button */}
                <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={saving || !selectedUserId}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs bg-[#f97316] hover:bg-[#ea580c] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <span>Save Permissions</span>
                    )}
                </button>
            </div>

            {/* Table Container - Strictly Isolated Vertical Scroll */}
            <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        {/* Sticky Header with Column Select-All Checkboxes */}
                        <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-[#161a26]/95 backdrop-blur-xs border-b border-slate-200 dark:border-white/10 shadow-2xs">
                            <tr className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tracking-wider select-none bg-slate-50 dark:bg-[#161a26]">
                                <th className="px-3 py-2.5 w-14 text-center font-bold">
                                    S.No
                                </th>
                                <th className="px-4 py-2.5 font-bold">
                                    Page / Menu Feature
                                </th>
                                {['view', 'add', 'edit', 'delete', 'excel', 'all'].map((action) => {
                                    const isChecked = isColumnAllSelected(action);
                                    const label = action === 'all' ? 'All' : action.charAt(0).toUpperCase() + action.slice(1);
                                    return (
                                        <th key={action} className="px-3 py-2.5 w-20 text-center font-bold">
                                            <div className="inline-flex items-center justify-center gap-1.5 cursor-pointer" onClick={() => handleColumnToggle(action)}>
                                                <span>{label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleColumnToggle(action)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-slate-400">
                                        <RefreshCw className="w-6 h-6 mx-auto animate-spin mb-2 text-orange-500" />
                                        <p className="text-xs font-medium">Loading permissions matrix...</p>
                                    </td>
                                </tr>
                            ) : flatDisplayRows.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-16 text-center text-slate-400 italic">
                                        No client menus found for this company.
                                    </td>
                                </tr>
                            ) : (
                                flatDisplayRows.map((row) => {
                                    const sId = String(row.id);
                                    const p = permissions[sId] || { view: false, add: false, edit: false, delete: false, excel: false };
                                    const isRowAllChecked = p.view && p.add && p.edit && p.delete && p.excel;

                                    return (
                                        <tr 
                                            key={row.id}
                                            className="transition-colors border-l-[3px] border-l-transparent hover:border-l-orange-500 hover:bg-[#fff9f5] dark:hover:bg-white/[0.03]"
                                        >
                                            {/* S.No */}
                                            <td className="px-3 py-2.5 text-center font-medium text-slate-400">
                                                {row.sNo}
                                            </td>

                                            {/* Page / Menu Name */}
                                            <td className="px-4 py-2.5">
                                                <div 
                                                    className="flex items-center gap-2"
                                                    style={{ paddingLeft: `${row.level * 20}px` }}
                                                >
                                                    {row.hasChildren ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleExpand(row.id)}
                                                            className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                                        >
                                                            {row.isExpanded ? (
                                                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                                            ) : (
                                                                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="w-4 h-4 inline-block" />
                                                    )}
                                                    <span className={`font-semibold ${row.hasChildren ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {row.name}
                                                    </span>
                                                    {row.code && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            ({row.code})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* View Right */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(p.view)}
                                                    onChange={(e) => handleRightChange(row.id, 'view', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* Add Right */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(p.add)}
                                                    onChange={(e) => handleRightChange(row.id, 'add', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* Edit Right */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(p.edit)}
                                                    onChange={(e) => handleRightChange(row.id, 'edit', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* Delete Right */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(p.delete)}
                                                    onChange={(e) => handleRightChange(row.id, 'delete', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* Excel Right */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(p.excel)}
                                                    onChange={(e) => handleRightChange(row.id, 'excel', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>

                                            {/* Row Select All */}
                                            <td className="px-3 py-2.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(isRowAllChecked)}
                                                    onChange={(e) => handleRightChange(row.id, 'all', e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 text-orange-500 focus:ring-orange-400 cursor-pointer"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientUserPermissionsPage;

