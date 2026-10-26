import React, { useMemo } from 'react';
import { 
    Edit2, Trash2, KeyRound, 
    RefreshCw, ArrowLeft, ChevronRight
} from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog,
    SearchableSelect,
    sanitizeText 
} from '../../../common';
import { useUserGroupMasterLogic } from './userGroupMaster.logic';

export const UserGroupMasterPage = ({ onNavigate }) => {
    const {
        activeTab,
        setActiveTab,
        groups,
        loading,
        submitting,
        groupNameFilter,
        setGroupNameFilter,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingGroup,
        setEditingGroup,
        formData,
        setFormData,
        formErrors,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchGroups,
        handleCreateClick,
        handleEditClick,
        handleSubmitForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleResetFilters,
        filteredGroups,
        paginatedGroups
    } = useUserGroupMasterLogic();

    // Columns config for DataTable matching Runwaybites screenshot
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '90px',
            render: (row) => {
                const isMaster = row.group_name?.toLowerCase() === 'master' || row.id === 1;
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleEditClick(row)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer"
                            title="Edit Group"
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDeleteClick(row)}
                            disabled={isMaster}
                            className={`p-1 rounded-lg border border-slate-200 dark:border-white/10 transition-all ${
 isMaster
 ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
 : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer'
 }`}
                            title={isMaster ? 'Master group cannot be deleted' : 'Delete Group'}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            }
        },
        {
            key: 'group_name',
            title: 'Group Name',
            align: 'left',
            sortable: true,
            render: (row) => (
                <button
                    type="button"
                    onClick={() => handleEditClick(row)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left transition-colors text-xs cursor-pointer"
                >
                    {row.group_name}
                </button>
            )
        },
        {
            key: 'status',
            title: 'Status',
            align: 'left',
            sortable: true,
            width: '120px',
            render: (row) => {
                const isActive = row.status !== false && row.status !== 0;
                return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold border ${
 isActive 
 ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
 : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
 }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            }
        }
    ], [groups, handleEditClick, handleDeleteClick]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs strictly matching Runwaybites: All Groups | Add Group */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <PageTabs
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingGroup) {
                                handleCreateClick();
                            } else {
                                setActiveTab('form');
                            }
                        } else {
                            setEditingGroup(null);
                            setActiveTab('list');
                        }
                    }}
                    isEditing={Boolean(editingGroup)}
                    listLabel="All Groups"
                    addLabel="Add Group"
                    editLabel="Edit Group"
                    extraTabs={[]}
                    layoutId="user-groups-tabs"
                />

                {activeTab === 'list' && (
                    <button
                        type="button"
                        onClick={fetchGroups}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                )}
            </div>

            {/* TAB 1: LIST VIEW */}
            {activeTab === 'list' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-2.5">
                    {/* Collapsible Filters Panel */}
                    <div className="shrink-0">
                        <FilterPanel
                            title="Filters"
                            onApply={() => pagination.resetPagination()}
                            onReset={handleResetFilters}
                        >
                            <div>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Group Name"
                                    value={groupNameFilter}
                                    onChange={(e) => setGroupNameFilter(e.target.value)}
                                />
                            </div>

                            <div>
                                <SearchableSelect
                                    options={[
                                        { value: 'all', label: 'Status: All' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' }
                                    ]}
                                    value={statusFilter}
                                    onChange={(val) => setStatusFilter(val || 'all')}
                                    placeholder="Status"
                                    searchPlaceholder="Search status..."
                                />
                            </div>
                        </FilterPanel>
                    </div>

                    {/* DataTable (scroll only in data table) */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="user-groups-table"
                            columns={columns}
                            data={paginatedGroups}
                            loading={loading}
                            emptyMessage="No user groups found."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredGroups.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredGroups.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [10, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: FORM VIEW (Add / Edit Group) */}
            {activeTab === 'form' && (
                <div className="saas-card flex flex-col flex-1 overflow-hidden p-3.5 sm:p-4.5">
                    <form onSubmit={handleSubmitForm} className="flex flex-col flex-1" autoComplete="off">
                        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                            {/* Row 1: Group Name & Allow IP */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Group Name<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter group name"
                                        maxLength={60}
                                        value={formData.group_name}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            group_name: sanitizeText(e.target.value) 
                                        })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                                    />
                                    {formErrors.group_name && (
                                        <p className="text-rose-500 text-[11px] mt-1">{formErrors.group_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Allow IP
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Allow IP (optional, comma-separated)"
                                        value={formData.allow_ip}
                                        onChange={(e) => setFormData({ 
                                            ...formData, 
                                            allow_ip: sanitizeText(e.target.value) 
                                        })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                    />
                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                        Leave empty to allow all IP addresses
                                    </span>
                                </div>
                            </div>

                            {/* Row 2: Status Checkbox */}
                            <div className="flex items-center gap-6 pt-1 select-none">
                                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                    />
                                    <span>Active</span>
                                </label>
                            </div>

                            {/* Granular Permissions Matrix link if Editing */}
                            {editingGroup && onNavigate && (
                                <div className="mt-4 p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 dark:text-orange-400">
                                            Group Permissions Matrix
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Configure View, Add, Edit, Delete, Excel capabilities for this group
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate('group-permissions', { groupId: editingGroup.id })}
                                        className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/25 transition-all cursor-pointer"
                                    >
                                        <KeyRound className="w-3.5 h-3.5" />
                                        <span>Configure Permissions</span>
                                        <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Bottom Footer matching Runwaybites standard */}
                        <div className="mt-auto pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-white/5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('list')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>LIST</span>
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold text-white bg-[#ea580c] hover:bg-[#c2410c] active:scale-95 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <span>Save</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, groupId: null, groupName: '' })}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete User Group?"
                message={`Are you sure you want to delete "${deleteModal.groupName}"? Users assigned to this group will lose their default permissions.`}
                confirmText="Delete Group"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default UserGroupMasterPage;
