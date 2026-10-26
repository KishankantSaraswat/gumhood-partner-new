import React, { useMemo } from 'react';
import { RefreshCw, Eye, EyeOff, Edit2, Trash2, KeyRound, Shield } from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog,
    FormFooter,
    SearchableSelect,
    sanitizeText 
} from '../../../common';
import { useClientUserMasterLogic } from './clientUserMaster.logic';

export const ClientUserMasterPage = ({ onNavigate }) => {
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
        handleCancelForm,
        handleSubmitUserForm,
        handleDeleteUser,
        handleConfirmDelete,
        handleResetFilters,
        filteredUsers,
        paginatedUsers
    } = useClientUserMasterLogic({ onNavigate });

    // Columns config
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '120px',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    {onNavigate && (
                        <button
                            type="button"
                            onClick={() => onNavigate('user-permissions', { userId: row.id })}
                            className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all cursor-pointer"
                            title="Set User Permissions"
                        >
                            <KeyRound className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                        title="Edit User"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteUser(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
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
                    className="font-bold hover:underline text-left transition-colors text-xs cursor-pointer"
                    style={{ color: 'var(--app-primary)' }}
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
                <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
                    {row.login_id || row.username || row.loginId || row.email?.split('@')[0] || '—'}
                </span>
            )
        },
        {
            key: 'email',
            title: 'Email',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="text-slate-600 dark:text-slate-400 text-xs">
                    {row.email || '—'}
                </span>
            )
        },
        {
            key: 'phone',
            title: 'Phone',
            align: 'left',
            sortable: true,
            render: (row) => (
                <span className="text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {row.phone || '—'}
                </span>
            )
        },
        {
            key: 'group',
            title: 'Role / Group',
            align: 'left',
            sortable: true,
            render: (row) => {
                const groupName = row.group?.group_name || row.group_name || groups.find(g => String(g.id) === String(row.groupId || row.group_id))?.group_name || 'Member';
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Shield className="w-3 h-3 text-amber-500" />
                        {groupName}
                    </span>
                );
            }
        },
        {
            key: 'manager',
            title: 'Manager',
            align: 'left',
            sortable: true,
            render: (row) => {
                const manager = users.find(u => String(u.id) === String(row.managerId || row.manager_id)) || row.manager;
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
    ], [groups, users, onNavigate]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs */}
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
                    listLabel="All Staff / Users"
                    addLabel="Add User"
                    editLabel="Edit User"
                    extraTabs={[]}
                    layoutId="client-users-tabs"
                />

                {activeTab === 'list' && (
                    <button
                        type="button"
                        onClick={fetchInitialData}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} style={loading ? { color: 'var(--app-primary)' } : {}} />
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
                                    { value: 'all', label: 'Role / Group: All' },
                                    ...groups.map(g => ({ value: g.id, label: g.group_name }))
                                ]}
                                value={filterGroup}
                                onChange={(val) => setFilterGroup(val || 'all')}
                                placeholder="Role / Group"
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

                    {/* Data Table */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="client-users-table"
                            columns={columns}
                            data={paginatedUsers}
                            loading={loading}
                            emptyMessage="No staff users found."
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
                <form onSubmit={handleSubmitUserForm} className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden" autoComplete="off">
                    {/* Main Form Fields Card */}
                    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1">
                            {/* Row 1: Profile Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* 1. User Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        User Full Name<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: sanitizeText(e.target.value) })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
                                </div>

                                {/* 2. Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Official Email<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    />
                                    {formErrors.email && <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>}
                                </div>

                                {/* 3. Login ID */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Login ID / Handle<span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Unique Login ID"
                                        value={formData.login_id}
                                        onChange={(e) => setFormData({ ...formData, login_id: e.target.value.trim() })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono transition-all"
                                    />
                                    {formErrors.login_id && <p className="text-rose-500 text-[11px] mt-1">{formErrors.login_id}</p>}
                                </div>

                                {/* 4. Phone */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Mobile Phone<span className="text-rose-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.phone_code}
                                            readOnly
                                            className="w-14 px-2 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 text-center font-mono outline-none"
                                        />
                                        <input
                                            type="tel"
                                            maxLength={15}
                                            placeholder="10-digit number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                        />
                                    </div>
                                    {formErrors.phone && <p className="text-rose-500 text-[11px] mt-1">{formErrors.phone}</p>}
                                </div>

                                {/* 5. Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Password {!editingUser && <span className="text-rose-500">*</span>}
                                        {editingUser && <span className="text-slate-400 text-[10px] font-normal ml-1">(Leave blank to keep current)</span>}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder={editingUser ? '••••••••' : 'Enter password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {formErrors.password && <p className="text-rose-500 text-[11px] mt-1">{formErrors.password}</p>}
                                </div>

                                {/* 6. User Group */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Role / Group<span className="text-rose-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={groups.map(g => ({ value: g.id, label: g.group_name }))}
                                        value={formData.groupId}
                                        onChange={(val) => setFormData({ ...formData, groupId: val })}
                                        placeholder="Select User Group"
                                        searchPlaceholder="Search role group..."
                                        required
                                        name="Role / Group"
                                    />
                                    {formErrors.groupId && <p className="text-rose-500 text-[11px] mt-1">{formErrors.groupId}</p>}
                                </div>

                                {/* 7. Manager */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                        Reports To (Manager)
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: '', label: 'No Manager (Top Level)' },
                                            ...users.filter(u => !editingUser || u.id !== editingUser.id).map(u => ({
                                                value: u.id,
                                                label: `${u.name} (${u.email})`
                                            }))
                                        ]}
                                        value={formData.managerId}
                                        onChange={(val) => setFormData({ ...formData, managerId: val })}
                                        placeholder="Select Manager"
                                        searchPlaceholder="Search manager..."
                                        isClearable
                                    />
                                </div>

                                {/* 8. Company Owner Role */}
                                <div className="flex items-center gap-3 pt-6">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isCompanyOwner}
                                            onChange={(e) => setFormData({ ...formData, isCompanyOwner: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                                        <span className="ml-2.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Is Company Owner
                                        </span>
                                    </label>
                                </div>

                                {/* 9. Status */}
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
                                            Account Status ({formData.status ? 'Active' : 'Inactive'})
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Separate Bottom Action Footer (Matches Reference Image) */}
                    <div className="shrink-0">
                        <FormFooter
                            onSubmit={handleSubmitUserForm}
                            onCancel={handleCancelForm}
                            isSubmitting={submitting}
                            isEdit={Boolean(editingUser)}
                            saveLabel="Save"
                            updateLabel="Update"
                        />
                    </div>
                </form>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Delete User"
                message={`Are you sure you want to permanently delete user "${deleteModal.userName}"? This action cannot be undone.`}
                confirmText={isDeleting ? 'Deleting...' : 'Delete User'}
                cancelText="Cancel"
                type="danger"
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
            />
        </div>
    );
};

export default ClientUserMasterPage;

