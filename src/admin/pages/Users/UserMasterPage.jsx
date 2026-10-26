import React, { useMemo } from 'react';
import { RefreshCw, ArrowLeft, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog,
    SearchableSelect,
    sanitizeText 
} from '../../../common';
import { useUserMasterLogic } from './userMaster.logic';

export const UserMasterPage = () => {
    const {
        activeTab,
        setActiveTab,
        users,
        groups,
        loading,
        submitting,
        filterUsername,
        setFilterUsername,
        filterLoginId,
        setFilterLoginId,
        filterPhone,
        setFilterPhone,
        filterGroup,
        setFilterGroup,
        filterManager,
        setFilterManager,
        filterStatus,
        setFilterStatus,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingUser,
        setEditingUser,
        formData,
        setFormData,
        formErrors,
        showPassword,
        setShowPassword,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchInitialData,
        handleCreateClick,
        handleEditClick,
        handleSubmitUserForm,
        handleDeleteUser,
        handleConfirmDelete,
        handleResetFilters,
        filteredUsers,
        paginatedUsers
    } = useUserMasterLogic();

    // Columns config matching Runwaybites styling
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '90px',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                        title="Edit User"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteUser(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                        title="Delete User"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        },
        {
            key: 'name',
            title: 'User Name',
            align: 'left',
            sortable: true,
            render: (row) => (
                <button
                    type="button"
                    onClick={() => handleEditClick(row)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left transition-colors text-xs cursor-pointer"
                >
                    {row.name || 'Unnamed User'}
                </button>
            )
        },
        {
            key: 'login_id',
            title: 'Login ID',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {row.login_id || row.username || row.email?.split('@')[0] || row.name}
                </span>
            )
        },
        {
            key: 'email',
            title: 'Email Id',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {row.email}
                </span>
            )
        },
        {
            key: 'phone',
            title: 'Phone No.',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {row.phone || '—'}
                </span>
            )
        },
        {
            key: 'group_id',
            title: 'User Group',
            align: 'left',
            sortable: true,
            render: (row) => {
                const group = groups.find(g => String(g.id) === String(row.group_id)) || row.group;
                return (
                    <span className="text-slate-700 dark:text-slate-300 font-medium text-xs">
                        {group?.group_name || '—'}
                    </span>
                );
            }
        },
        {
            key: 'manager_id',
            title: 'Manager',
            align: 'left',
            sortable: true,
            render: (row) => {
                const manager = users.find(u => String(u.id) === String(row.manager_id)) || row.manager;
                return (
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                        {manager?.name || '—'}
                    </span>
                );
            }
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
    ], [groups, users, handleEditClick, handleDeleteUser]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs strictly matching Runwaybites: All Users | Add User */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <PageTabs
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingUser) {
                                handleCreateClick();
                            } else {
                                setActiveTab('form');
                            }
                        } else {
                            setEditingUser(null);
                            setActiveTab('list');
                        }
                    }}
                    isEditing={Boolean(editingUser)}
                    listLabel="All Users"
                    addLabel="Add User"
                    editLabel="Edit User"
                    extraTabs={[]}
                    layoutId="users-roles-tabs"
                />

                {activeTab === 'list' && (
                    <button
                        type="button"
                        onClick={fetchInitialData}
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
                            onApply={fetchInitialData}
                            onReset={handleResetFilters}
                        >
                            {/* Username */}
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Username"
                                value={filterUsername}
                                onChange={(e) => setFilterUsername(e.target.value)}
                            />

                            {/* Login ID */}
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Login ID"
                                value={filterLoginId}
                                onChange={(e) => setFilterLoginId(e.target.value)}
                            />

                            {/* Phone */}
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Phone"
                                value={filterPhone}
                                onChange={(e) => setFilterPhone(e.target.value)}
                            />

                            {/* User Group */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'User Group: All' },
                                    ...groups.map(g => ({ value: g.id, label: g.group_name }))
                                ]}
                                value={filterGroup}
                                onChange={(val) => setFilterGroup(val || 'all')}
                                placeholder="User Group"
                                searchPlaceholder="Search group..."
                            />

                            {/* Manager */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Manager: All' },
                                    ...users.map(u => ({ value: u.id, label: u.name }))
                                ]}
                                value={filterManager}
                                onChange={(val) => setFilterManager(val || 'all')}
                                placeholder="Manager"
                                searchPlaceholder="Search manager..."
                            />

                            {/* Status */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Status: All' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' }
                                ]}
                                value={filterStatus}
                                onChange={(val) => setFilterStatus(val || 'all')}
                                placeholder="Status"
                                searchPlaceholder="Search status..."
                            />
                        </FilterPanel>
                    </div>

                    {/* Data Table with isolated scroll */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="admin-users-table"
                            columns={columns}
                            data={paginatedUsers}
                            loading={loading}
                            emptyMessage="No users found."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredUsers.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredUsers.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [15, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: ADD / EDIT USER FORM */}
            {activeTab === 'form' && (
                <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl p-3.5 sm:p-4.5 shadow-xs overflow-hidden">
                    <form onSubmit={handleSubmitUserForm} className="flex flex-col flex-1 h-full overflow-hidden" autoComplete="off">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1">
                            {/* Row 1: 6 Columns Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                                {/* 1. User Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        User Name<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="User Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: sanitizeText(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
                                </div>

                                {/* 2. Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Email<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: sanitizeText(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.email && <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>}
                                </div>

                                {/* 3. Phone No. */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Phone No.<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all">
                                        <select
                                            value={formData.phone_code || '+91'}
                                            onChange={(e) => setFormData({ ...formData, phone_code: e.target.value })}
                                            className="bg-slate-50 dark:bg-[#1a1f2e] text-slate-700 dark:text-slate-200 text-xs px-2 py-2 outline-none border-r border-slate-200 dark:border-white/10 cursor-pointer font-semibold"
                                        >
                                            <option value="+91">+91 (IN)</option>
                                            <option value="+1">+1 (US)</option>
                                            <option value="+44">+44 (UK)</option>
                                            <option value="+971">+971 (AE)</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Enter phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: sanitizeText(e.target.value) })}
                                            className="w-full px-2.5 py-2 text-xs bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none"
                                        />
                                    </div>
                                    {formErrors.phone && <p className="text-rose-500 text-[11px] mt-1">{formErrors.phone}</p>}
                                </div>

                                {/* 4. Login ID */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Login ID<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Login ID"
                                        value={formData.login_id}
                                        onChange={(e) => setFormData({ ...formData, login_id: sanitizeText(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.login_id && <p className="text-rose-500 text-[11px] mt-1">{formErrors.login_id}</p>}
                                </div>

                                {/* 5. Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Password<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Set Password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    {formErrors.password && <p className="text-rose-500 text-[11px] mt-1">{formErrors.password}</p>}
                                </div>

                                {/* 6. User Group */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        User Group<span className="text-rose-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={groups.map(g => ({ value: g.id, label: g.group_name }))}
                                        value={formData.group_id}
                                        onChange={(val) => setFormData({ ...formData, group_id: val })}
                                        placeholder="Select User Group"
                                        searchPlaceholder="Search role group..."
                                        required
                                        name="User Group"
                                    />
                                    {formErrors.group_id && <p className="text-rose-500 text-[11px] mt-1">{formErrors.group_id}</p>}
                                </div>
                            </div>

                            {/* Row 2: Manager */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Manager
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: '', label: 'Default (Self/Creator)' },
                                            ...users.filter(u => !editingUser || u.id !== editingUser.id).map(u => ({
                                                value: u.id,
                                                label: `${u.name} (${u.email})`
                                            }))
                                        ]}
                                        value={formData.manager_id}
                                        onChange={(val) => setFormData({ ...formData, manager_id: val })}
                                        placeholder="Select Manager"
                                        searchPlaceholder="Search manager..."
                                        isClearable
                                    />
                                </div>
                            </div>

                            {/* Row 3: Checkboxes (Master, Active, Enable Notifications) */}
                            <div className="flex flex-wrap items-center gap-6 pt-2 select-none">
                                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_master}
                                        onChange={(e) => setFormData({ ...formData, is_master: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                    />
                                    <span>Master</span>
                                </label>

                                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                    />
                                    <span>Active</span>
                                </label>

                                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={formData.enable_notifications}
                                        onChange={(e) => setFormData({ ...formData, enable_notifications: e.target.checked })}
                                        className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                    />
                                    <span>Enable Notifications</span>
                                </label>
                            </div>
                        </div>

                        {/* Bottom Footer matching Runwaybites screenshot 2 */}
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
                onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete User?"
                message={`Are you sure you want to delete user "${deleteModal.userName}"? This action cannot be undone.`}
                confirmText="Delete User"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default UserMasterPage;
