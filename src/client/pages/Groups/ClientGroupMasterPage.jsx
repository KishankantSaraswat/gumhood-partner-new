import React, { useMemo } from 'react';
import { 
    Edit2, Trash2, KeyRound, 
    RefreshCw, Shield
} from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog,
    FormFooter,
    SearchableSelect,
    sanitizeText 
} from '../../../common';
import { useClientGroupMasterLogic } from './clientGroupMaster.logic';

export const ClientGroupMasterPage = ({ onNavigate }) => {
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
        handleCancelForm,
        handleSubmitForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleResetFilters,
        filteredGroups,
        paginatedGroups
    } = useClientGroupMasterLogic({ onNavigate });

    // Columns config
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '120px',
            render: (row) => {
                const isMaster = row.group_name?.toLowerCase() === 'master' || row.group_name?.toLowerCase() === 'owner';
                return (
                    <div className="flex items-center justify-center gap-1.5">
                        {onNavigate && (
                            <button
                                type="button"
                                onClick={() => onNavigate('group-permissions', { groupId: row.id })}
                                className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
                                title="Set Group Permissions"
                            >
                                <KeyRound className="w-3.5 h-3.5" />
                            </button>
                        )}
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
                            title={isMaster ? 'Master role group cannot be deleted' : 'Delete Group'}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                );
            }
        },
        {
            key: 'group_name',
            title: 'Group / Role Name',
            align: 'left',
            sortable: true,
            render: (row) => (
                <button
                    type="button"
                    onClick={() => handleEditClick(row)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left transition-colors text-xs cursor-pointer flex items-center gap-1.5"
                >
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    <span>{row.group_name}</span>
                </button>
            )
        },
        {
            key: 'allow_ip',
            title: 'Allowed IP Address',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {row.allow_ip || 'Any (All IPs Allowed)'}
                </span>
            )
        },
        {
            key: 'status',
            title: 'Status',
            align: 'left',
            sortable: true,
            width: '100px',
            render: (row) => {
                const isActive = row.status !== false && row.status !== 0;
                return (
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
 isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
 }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {isActive ? 'Active' : 'Inactive'}
                    </span>
                );
            }
        }
    ], [onNavigate]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs */}
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
                    listLabel="All Roles & Groups"
                    addLabel="Add Group"
                    editLabel="Edit Group"
                    extraTabs={[]}
                    layoutId="client-groups-tabs"
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
                            onApply={fetchGroups}
                            onReset={handleResetFilters}
                        >
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Group Name"
                                value={groupNameFilter}
                                onChange={(e) => setGroupNameFilter(e.target.value)}
                            />

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
                        </FilterPanel>
                    </div>

                    {/* Data Table */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="client-groups-table"
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
                                rowsPerPageOptions: [15, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: ADD / EDIT GROUP FORM */}
            {activeTab === 'form' && (
                <form onSubmit={handleSubmitForm} className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden" autoComplete="off">
                    {/* Main Form Fields Card */}
                    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Group Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Group / Role Name<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Club Managers, Front Desk, Trainers"
                                        value={formData.group_name}
                                        onChange={(e) => setFormData({ ...formData, group_name: sanitizeText(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.group_name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.group_name}</p>}
                                </div>

                                {/* Allowed IP */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Allowed IP Address (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 192.168.1.1 (leave empty for any)"
                                        value={formData.allow_ip}
                                        onChange={(e) => setFormData({ ...formData, allow_ip: e.target.value.trim() })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono transition-all"
                                    />
                                </div>

                                {/* Status */}
                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                                        <span className="ml-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Status ({formData.status ? 'Active' : 'Inactive'})
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separate Bottom Action Footer (Matches Reference Image) */}
                    <div className="shrink-0">
                        <FormFooter
                            onSubmit={handleSubmitForm}
                            onCancel={handleCancelForm}
                            isSubmitting={submitting}
                            isEdit={Boolean(editingGroup)}
                            saveLabel="Save"
                            updateLabel="Update"
                        />
                    </div>
                </form>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Delete User Group"
                message={`Are you sure you want to delete role group "${deleteModal.groupName}"? Users assigned to this group will lose their role permissions.`}
                confirmText={isDeleting ? 'Deleting...' : 'Delete Group'}
                cancelText="Cancel"
                type="danger"
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, groupId: null, groupName: '' })}
            />
        </div>
    );
};

export default ClientGroupMasterPage;

