import React, { useMemo } from 'react';
import { 
    RefreshCw, Eye, Edit2, Trash2, Dumbbell, 
    Calendar, CheckCircle2, XCircle, Clock, ShieldCheck, 
    User, Mail, Phone, Activity, Sparkles, X, HeartPulse
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
import { useClientMemberLogic } from './clientMember.logic';

export const ClientMemberPage = ({ gym, onNavigate }) => {
    const {
        activeTab,
        setActiveTab,
        plans,
        loading,
        submitting,
        filterSearch,
        setFilterSearch,
        filterStatus,
        setFilterStatus,
        filterPlan,
        setFilterPlan,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingMember,
        formData,
        setFormData,
        formErrors,
        viewModal,
        handleViewMember,
        handleCloseViewModal,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchInitialData,
        handleCreateClick,
        handleEditClick,
        handleCancelForm,
        handleSubmitMemberForm,
        handleDeleteMember,
        handleConfirmDelete,
        handleResetFilters,
        filteredMembers,
        paginatedMembers,
        kpiStats
    } = useClientMemberLogic({ gym, onNavigate });

    // Format Currency Helper
    const formatCurrency = (val) => {
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    // Columns config
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '120px',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleViewMember(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 transition-all cursor-pointer"
                        title="View Member Details & Fitness Stats"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                        title="Edit Member"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteMember(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        title="Deactivate Member"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        },
        {
            key: 'name',
            title: 'Member Name',
            align: 'left',
            sortable: true,
            render: (row) => (
                <button
                    type="button"
                    onClick={() => handleEditClick(row)}
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left transition-colors text-xs cursor-pointer flex items-center gap-2"
                >
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold flex items-center justify-center text-[10px] shrink-0 border border-orange-500/20">
                        {row.name ? row.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <span>{row.name || 'Unnamed Member'}</span>
                </button>
            )
        },
        {
            key: 'phone',
            title: 'Mobile Phone',
            align: 'left',
            sortable: false,
            render: (row) => (
                <span className="text-slate-700 dark:text-slate-300 text-xs font-mono">
                    {row.phone || '—'}
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
            key: 'planName',
            title: 'Membership Plan',
            align: 'left',
            sortable: true,
            render: (row) => {
                const plan = row.plan;
                if (!plan) {
                    return (
                        <span className="text-slate-400 dark:text-slate-500 text-xs italic">
                            No Active Plan
                        </span>
                    );
                }
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                            {plan.planName}
                        </span>
                        <span className="text-[10px] text-amber-500 font-medium">
                            {plan.remainingDays > 0 ? `${plan.remainingDays} days remaining` : 'Expired'}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'fitness',
            title: 'Fitness Metrics',
            align: 'left',
            render: (row) => {
                const fp = row.fitnessProfile;
                if (!fp || (!fp.age && !fp.weight && !fp.height)) {
                    return <span className="text-slate-400 text-xs">—</span>;
                }
                return (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                        {fp.gender && <span className="capitalize font-medium">{fp.gender}</span>}
                        {fp.age && <span>• {fp.age}y</span>}
                        {fp.weight && <span>• {fp.weight}kg</span>}
                        {fp.height && <span>• {fp.height}cm</span>}
                    </div>
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
                const isActive = row.status === 'active';
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
    ], [handleViewMember, handleEditClick, handleDeleteMember]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <PageTabs
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingMember) {
                                handleCreateClick();
                            } else {
                                setActiveTab('form');
                            }
                        } else {
                            handleCancelForm();
                        }
                    }}
                    isEditing={Boolean(editingMember)}
                    listLabel="All Members"
                    addLabel="Add Member"
                    editLabel="Edit Member"
                    extraTabs={[]}
                    layoutId="client-members-tabs"
                />

                {activeTab === 'list' && (
                    <div className="flex items-center gap-2">
                        {/* KPI mini counter pill */}
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
                            <span className="text-slate-500">Active: <strong className="text-emerald-500">{kpiStats.activeCount}</strong></span>
                            <span className="text-slate-300 dark:text-white/20">|</span>
                            <span className="text-slate-500">Total: <strong className="text-slate-800 dark:text-white">{kpiStats.total}</strong></span>
                        </div>

                        <button
                            type="button"
                            onClick={fetchInitialData}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
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
                            {/* Search Name, Email, Phone */}
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Search by name, email, phone..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                            />

                            {/* Plan Filter */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'All Plans' },
                                    ...plans.map((p) => ({ value: p.id, label: p.name }))
                                ]}
                                value={filterPlan}
                                onChange={(val) => setFilterPlan(val || 'all')}
                                placeholder="Filter Plan..."
                                searchPlaceholder="Search plan..."
                            />

                            {/* Status */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'Status: All' },
                                    { value: 'active', label: 'Active Members' },
                                    { value: 'inactive', label: 'Inactive Members' }
                                ]}
                                value={filterStatus}
                                onChange={(val) => setFilterStatus(val || 'all')}
                                placeholder="Filter Status..."
                                searchPlaceholder="Search status..."
                            />
                        </FilterPanel>
                    </div>

                    {/* Data Table */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="client-members-table"
                            columns={columns}
                            data={paginatedMembers}
                            loading={loading}
                            emptyMessage="No gym members found."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredMembers.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredMembers.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [15, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: ADD / EDIT MEMBER FORM */}
            {activeTab === 'form' && (
                <>
                    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl p-3.5 sm:p-4.5 shadow-xs overflow-hidden">
                        <form onSubmit={handleSubmitMemberForm} className="flex flex-col flex-1 h-full overflow-hidden" autoComplete="off">
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                            {/* Section 1: Member Credentials & Contact Details */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Personal & Contact Information</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {/* 1. Member Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Full Name<span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: sanitizeText(e.target.value) })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                        {formErrors.name && <p className="text-rose-500 text-[11px] mt-1">{formErrors.name}</p>}
                                    </div>

                                    {/* 2. Email Address */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Email Address<span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="member@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value.trim() })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                        {formErrors.email && <p className="text-rose-500 text-[11px] mt-1">{formErrors.email}</p>}
                                    </div>

                                    {/* 3. Mobile Phone */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Mobile Phone<span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            maxLength={15}
                                            placeholder="10-digit phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                        />
                                        {formErrors.phone && <p className="text-rose-500 text-[11px] mt-1">{formErrors.phone}</p>}
                                    </div>

                                    {/* 4. Password */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Login Password {!editingMember && <span className="text-slate-400 text-[10px] font-normal">(Auto-generated if left blank)</span>}
                                            {editingMember && <span className="text-slate-400 text-[10px] font-normal ml-1">(Leave blank to keep current)</span>}
                                        </label>
                                        <input
                                            type="password"
                                            placeholder={editingMember ? '••••••••' : 'Enter password (optional)'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                        />
                                        {formErrors.password && <p className="text-rose-500 text-[11px] mt-1">{formErrors.password}</p>}
                                    </div>

                                    {/* 5. Membership Status */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Status
                                        </label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'active', label: 'Active' },
                                                { value: 'inactive', label: 'Inactive / Suspended' }
                                            ]}
                                            value={formData.status}
                                            onChange={(val) => setFormData({ ...formData, status: val })}
                                            placeholder="Select Status"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Fitness Profile & Biometrics */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Fitness Profile & Biometrics (Optional)</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                    {/* Gender */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Gender
                                        </label>
                                        <SearchableSelect
                                            options={[
                                                { value: 'male', label: 'Male' },
                                                { value: 'female', label: 'Female' },
                                                { value: 'other', label: 'Other' }
                                            ]}
                                            value={formData.gender}
                                            onChange={(val) => setFormData({ ...formData, gender: val })}
                                            placeholder="Select Gender"
                                        />
                                    </div>

                                    {/* Age */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Age (Years)
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="120"
                                            placeholder="e.g. 25"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                        {formErrors.age && <p className="text-rose-500 text-[11px] mt-1">{formErrors.age}</p>}
                                    </div>

                                    {/* Height */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 175"
                                            value={formData.height}
                                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                    </div>

                                    {/* Weight */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 70"
                                            value={formData.weight}
                                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Membership Plan Assignment */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                                    <Dumbbell className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Gym Membership Plan Assignment</span>
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                    {/* Plan Selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Membership Plan
                                        </label>
                                        <SearchableSelect
                                            options={[
                                                { value: '', label: 'No Plan (Assign Later)' },
                                                ...plans.map((p) => ({
                                                    value: p.id,
                                                    label: `${p.name} - ${formatCurrency(p.price)} (${p.planType})`
                                                }))
                                            ]}
                                            value={formData.planId}
                                            onChange={(val) => setFormData({ ...formData, planId: val })}
                                            placeholder="Select Plan"
                                            searchPlaceholder="Search plans..."
                                            isClearable
                                        />
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                        />
                                    </div>

                                    {/* Expiry / Extend Date (For edit) */}
                                    {editingMember && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Plan Expiry Date
                                            </label>
                                            <input
                                                type="date"
                                                value={formData.expiryDate}
                                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Separate Bottom Action Footer (Matches Reference Image) */}
                <div className="shrink-0">
                    <FormFooter
                        onSubmit={handleSubmitMemberForm}
                        onCancel={handleCancelForm}
                        isSubmitting={submitting}
                        isEdit={Boolean(editingMember)}
                        saveLabel="Register Member"
                        updateLabel="Update Member"
                    />
                </div>
            </>
        )}

            {/* Member Details Audit Modal */}
            {viewModal.isOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center font-bold">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Member Profile & Audit
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Member ID: {viewModal.member?.id}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseViewModal}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {viewModal.loading ? (
                            <div className="py-10 flex flex-col items-center justify-center text-center">
                                <RefreshCw className="w-6 h-6 text-orange-500 animate-spin mb-2" />
                                <span className="text-xs text-slate-400">Loading member profile...</span>
                            </div>
                        ) : (
                            <div className="space-y-3.5 text-xs">
                                {/* Profile Card */}
                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
                                        {viewModal.details?.name ? viewModal.details.name.charAt(0).toUpperCase() : 'M'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
                                            {viewModal.details?.name || viewModal.member?.name}
                                        </h4>
                                        <div className="flex flex-col gap-0.5 mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                {viewModal.details?.email || viewModal.member?.email}
                                            </span>
                                            <span className="flex items-center gap-1.5 font-mono">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                {viewModal.details?.phone || viewModal.member?.phone || 'No phone'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fitness Biometrics */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Fitness Profile
                                    </span>
                                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                                            <span className="text-[10px] text-slate-400 block">Gender</span>
                                            <span className="font-bold capitalize">{viewModal.details?.fitnessProfile?.gender || '—'}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                                            <span className="text-[10px] text-slate-400 block">Age</span>
                                            <span className="font-bold">{viewModal.details?.fitnessProfile?.age ? `${viewModal.details.fitnessProfile.age}y` : '—'}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                                            <span className="text-[10px] text-slate-400 block">Weight</span>
                                            <span className="font-bold">{viewModal.details?.fitnessProfile?.weight ? `${viewModal.details.fitnessProfile.weight}kg` : '—'}</span>
                                        </div>
                                        <div className="p-2 rounded-lg bg-white dark:bg-white/5">
                                            <span className="text-[10px] text-slate-400 block">Height</span>
                                            <span className="font-bold">{viewModal.details?.fitnessProfile?.height ? `${viewModal.details.fitnessProfile.height}cm` : '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Plan */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                                        Current Membership Subscription
                                    </span>
                                    {viewModal.details?.plans && viewModal.details.plans.length > 0 ? (
                                        <div className="space-y-1.5">
                                            {viewModal.details.plans.slice(0, 3).map((p, idx) => (
                                                <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-200/50 dark:border-white/5 last:border-0">
                                                    <div>
                                                        <span className="font-bold text-slate-800 dark:text-slate-100">{p.plan?.name || 'Membership Plan'}</span>
                                                        <span className="block text-[10px] text-slate-400">
                                                            Purchased: {new Date(p.purchaseDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono font-bold text-amber-500">{formatCurrency(p.amountDeducted)}</span>
                                                        <span className={`block text-[10px] ${p.isExpired ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                            {p.isExpired ? 'Expired' : 'Active'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-slate-400 text-xs italic">No subscription history found.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={handleCloseViewModal}
                                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete / Deactivate Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Deactivate Member"
                message={`Are you sure you want to remove/deactivate member "${deleteModal.memberName}"? This will deactivate their gym membership and expire active plans.`}
                confirmText={isDeleting ? 'Deactivating...' : 'Deactivate Member'}
                cancelText="Cancel"
                type="danger"
                onConfirm={handleConfirmDelete}
                onClose={() => setDeleteModal({ isOpen: false, memberId: null, memberName: '' })}
            />
        </div>
    );
};

export default ClientMemberPage;
