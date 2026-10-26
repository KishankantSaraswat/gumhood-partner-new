import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    RefreshCw, ArrowLeft, Eye, EyeOff, Users, ShieldCheck, X, Shield, Key, Server,
    Mail, Phone, Globe, Edit2, Trash2, Building2, UserCheck, Lock, CheckCircle2,
    Upload, Image as ImageIcon
} from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog,
    AnimatedTabs,
    FormFooter,
    SearchableSelect,
    sanitizeText,
    getImageUrl
} from '../../../common';
import api from '../../../common/utils/api';
import { useCompanyMasterLogic } from './companyMaster.logic';

export const CompanyMasterPage = () => {
    const navigate = useNavigate();
    const {
        viewMode,
        setViewMode,
        companies,
        loading,
        submitting,
        filterName,
        setFilterName,
        filterContact,
        setFilterContact,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        filteredCompanies,
        paginatedCompanies,
        editingId,
        formTab,
        setFormTab,
        formData,
        errors,
        showSmtpPassword,
        setShowSmtpPassword,
        showMasterPassword,
        setShowMasterPassword,
        handleInputChange,
        handleOpenCreate,
        handleOpenEdit,
        handleOpenManageModal,
        handleSubmit,
        loadCompanies,
        deleteModal,
        setDeleteModal,
        handleDeleteClick,
        handleConfirmDelete,
        isDeleting,
        manageModalCompany,
        setManageModalCompany,
        manageActiveTab,
        setManageActiveTab,
        companyUsers,
        companyGroups,
        editingUserId,
        newUserForm,
        setNewUserForm,
        userFormErrors,
        creatingUser,
        handleEditUser,
        handleResetUserForm,
        handleCreateOrUpdateUser,
        newGroupForm,
        setNewGroupForm,
        groupFormErrors,
        creatingGroup,
        handleCreateGroup,
        handleToggleRight,
        formTabs
    } = useCompanyMasterLogic();

    const [uploadingLogo, setUploadingLogo] = React.useState(false);
    const [uploadingBg, setUploadingBg] = React.useState(false);

    const handleUploadFile = async (file, fieldKey, setUploading) => {
        if (!file) return;
        try {
            setUploading(true);
            const res = await api.upload(file);
            const uploadedUrl = res.url || res.fileUrl || res.path || (res.data && (res.data.url || res.data.fileUrl || res.data.path));
            if (uploadedUrl) {
                handleInputChange(fieldKey, uploadedUrl);
            }
        } catch (err) {
            console.error('File upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    // Columns config for DataTable
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '140px',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleOpenManageModal(row)}
                        className="px-2 py-0.5 rounded-lg border border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-all cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                        title="Manage Staff & Roles"
                    >
                        <Users className="w-3 h-3" />
                        <span>Staff</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/admin/company-permissions?companyId=${row.id}`)}
                        className="px-2 py-0.5 rounded-lg border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                        title="Manage Company Permissions"
                    >
                        <Shield className="w-3 h-3" />
                        <span>Rights</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:border-orange-500 transition-all cursor-pointer"
                        title="Edit Company"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteClick(row)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-white/10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        title="Delete Company"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        },
        {
            key: 'name',
            title: 'Company Name',
            align: 'left',
            sortable: true,
            render: (row) => (
                <div className="py-0.5">
                    <button
                        type="button"
                        onClick={() => handleOpenEdit(row)}
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline text-left transition-colors text-xs cursor-pointer block"
                    >
                        {row.name || 'Unnamed Company'}
                    </button>
                    {row.address && (
                        <p className="text-[11px] text-slate-400 truncate max-w-[240px] mt-0.5">
                            {row.address}
                        </p>
                    )}
                </div>
            )
        },
        {
            key: 'contact',
            title: 'Contact',
            align: 'left',
            render: (row) => (
                <div className="space-y-0.5 text-xs">
                    {row.email && (
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{row.email}</span>
                        </div>
                    )}
                    {row.mobile_no && (
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{row.mobile_no}</span>
                        </div>
                    )}
                    {!row.email && !row.mobile_no && <span className="text-slate-400 text-xs">—</span>}
                </div>
            )
        },
        {
            key: 'website',
            title: 'Website',
            align: 'left',
            render: (row) => row.website ? (
                <a 
                    href={row.website.startsWith('http') ? row.website : `https://${row.website}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold hover:underline text-xs"
                >
                    <Globe className="w-3 h-3" />
                    <span className="truncate max-w-[160px]">{row.website}</span>
                </a>
            ) : (
                <span className="text-slate-400 text-xs">—</span>
            )
        },
        {
            key: 'status',
            title: 'Status',
            align: 'left',
            sortable: true,
            width: '120px',
            render: (row) => {
                const isActive = Number(row.status) === 1 || row.status === true;
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
    ], [handleOpenManageModal, handleOpenEdit, handleDeleteClick]);


    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5 w-full">
            {/* Top Bar with PageTabs: All Companies | Add Company */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <PageTabs
                    activeTab={viewMode}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingId) {
                                handleOpenCreate();
                            } else {
                                setViewMode('form');
                            }
                        } else {
                            setViewMode('list');
                        }
                    }}
                    isEditing={Boolean(editingId)}
                    listLabel="All Companies"
                    addLabel="Add Company"
                    editLabel="Edit Company"
                    extraTabs={[]}
                    layoutId="company-master-tabs"
                />

                {viewMode === 'list' && (
                    <button
                        type="button"
                        onClick={loadCompanies}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-500' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                )}
            </div>

            {/* TAB 1: LIST VIEW */}
            {viewMode === 'list' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-2.5">
                    {/* Collapsible FilterPanel */}
                    <div className="shrink-0">
                        <FilterPanel
                            title="Filters"
                            onApply={() => pagination.resetPagination()}
                            onReset={() => {
                                setFilterName('');
                                setFilterContact('');
                                setStatusFilter('all');
                                pagination.resetPagination();
                            }}
                        >
                            <div>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Company Name"
                                    value={filterName}
                                    onChange={(e) => setFilterName(e.target.value)}
                                />
                            </div>

                            <div>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Email or Phone"
                                    value={filterContact}
                                    onChange={(e) => setFilterContact(e.target.value)}
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

                    {/* DataTable (scroll strictly isolated inside data table) */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="company-master-table"
                            columns={columns}
                            data={paginatedCompanies}
                            loading={loading}
                            emptyMessage="No client companies found."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredCompanies.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredCompanies.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [10, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: FORM VIEW (Add / Edit Company) */}
            {viewMode === 'form' && (
                <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-hidden" autoComplete="off">
                    {/* Main Form Fields Card */}
                    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
                        {/* Animated Sub-Tabs for configuration categories */}
                        <div className="shrink-0 pb-3 border-b border-slate-100 dark:border-white/5">
                            <AnimatedTabs
                                tabs={formTabs}
                                activeTab={formTab}
                                onChange={setFormTab}
                            />
                        </div>

                        {/* Scrollable Form Body */}
                        <div className="space-y-3.5 flex-1 overflow-y-auto py-2.5 pr-1 custom-scrollbar">
                            {/* CATEGORY A: Company Basic Details */}
                            {formTab === 'basic' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div 
                                        className="p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors"
                                        style={{
                                            backgroundColor: 'var(--color-primary-light, rgba(249, 115, 22, 0.08))',
                                            borderColor: 'color-mix(in srgb, var(--app-primary, #f97316) 25%, transparent)'
                                        }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <Building2 className="w-4 h-4 shrink-0" style={{ color: 'var(--app-primary, #f97316)' }} />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Category A &bull; Company Basic Details</h4>
                                                <p className="text-[11px] text-slate-400">Core organizational information, contacts, and public profile</p>
                                            </div>
                                        </div>
                                        <span 
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                                            style={{
                                                backgroundColor: 'var(--color-primary-light, rgba(249, 115, 22, 0.1))',
                                                color: 'var(--app-primary, #f97316)',
                                                borderColor: 'color-mix(in srgb, var(--app-primary, #f97316) 20%, transparent)'
                                            }}
                                        >
                                            Category A
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Company Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', sanitizeText(e.target.value))}
                                                placeholder="e.g. FitZone Enterprises"
                                                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${errors.name ? 'border-rose-400' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium`}
                                            />
                                            {errors.name && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Parent Client ID (Optional)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.client_id || ''}
                                                onChange={(e) => handleInputChange('client_id', e.target.value)}
                                                placeholder="e.g. 1001"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Official Email Address
                                            </label>
                                            <input
                                                type="email"
                                                maxLength={100}
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', sanitizeText(e.target.value))}
                                                placeholder="contact@company.com"
                                                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${errors.email ? 'border-rose-400' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono`}
                                            />
                                            {errors.email && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Phone Number (mobile_no)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={25}
                                                value={formData.mobile_no}
                                                onChange={(e) => handleInputChange('mobile_no', sanitizeText(e.target.value))}
                                                placeholder="+91 9876543210"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Official Website URL
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={150}
                                                value={formData.website}
                                                onChange={(e) => handleInputChange('website', sanitizeText(e.target.value))}
                                                placeholder="https://company.com"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Company Status
                                            </label>
                                            <SearchableSelect
                                                options={[
                                                    { value: 1, label: '1 - Active' },
                                                    { value: 0, label: '0 - Inactive' }
                                                ]}
                                                value={formData.status}
                                                onChange={(val) => handleInputChange('status', Number(val))}
                                                placeholder="Select status..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                                                <span>Company Logo</span>
                                                {uploadingLogo && <span className="text-[10px] text-orange-500 font-semibold animate-pulse">Uploading...</span>}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={250}
                                                    value={formData.companylogo}
                                                    onChange={(e) => handleInputChange('companylogo', sanitizeText(e.target.value))}
                                                    placeholder="URL or upload file..."
                                                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 font-mono"
                                                />
                                                <label 
                                                    className="px-3 py-2 rounded-xl border border-dashed text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0"
                                                    style={{
                                                        borderColor: 'color-mix(in srgb, var(--app-primary, #f97316) 40%, transparent)',
                                                        backgroundColor: 'var(--color-primary-light, rgba(249, 115, 22, 0.1))',
                                                        color: 'var(--app-primary, #f97316)'
                                                    }}
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>{uploadingLogo ? '...' : 'Upload'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingLogo}
                                                        onChange={(e) => handleUploadFile(e.target.files?.[0], 'companylogo', setUploadingLogo)}
                                                    />
                                                </label>
                                                {formData.companylogo && (
                                                    <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
                                                        <img src={getImageUrl(formData.companylogo)} alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                                                <span>Background Image</span>
                                                {uploadingBg && <span className="text-[10px] text-orange-500 font-semibold animate-pulse">Uploading...</span>}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    maxLength={250}
                                                    value={formData.backgroundImage}
                                                    onChange={(e) => handleInputChange('backgroundImage', sanitizeText(e.target.value))}
                                                    placeholder="URL or upload background..."
                                                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 font-mono"
                                                />
                                                <label className="px-3 py-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shrink-0">
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>{uploadingBg ? '...' : 'Upload'}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingBg}
                                                        onChange={(e) => handleUploadFile(e.target.files?.[0], 'backgroundImage', setUploadingBg)}
                                                    />
                                                </label>
                                                {formData.backgroundImage && (
                                                    <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 bg-slate-900 flex items-center justify-center">
                                                        <img src={getImageUrl(formData.backgroundImage)} alt="Background" className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Office / Physical Address
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', sanitizeText(e.target.value))}
                                            placeholder="Level / Building / Street address..."
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* CATEGORY B: First Master User Credentials */}
                            {formTab === 'master_user' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <Key className="w-4 h-4 text-indigo-500 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Category B &bull; First Master User Credentials</h4>
                                                <p className="text-[11px] text-slate-400">Created automatically in <code className="text-indigo-400 font-mono">client_company_user</code> as primary company administrator</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            Category B
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Master User Full Name (userName)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={formData.userName}
                                                onChange={(e) => handleInputChange('userName', sanitizeText(e.target.value))}
                                                placeholder={formData.name || 'Company owner full name'}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Defaults to Company Name if omitted</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Display Handle (username)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={50}
                                                value={formData.username}
                                                onChange={(e) => handleInputChange('username', sanitizeText(e.target.value))}
                                                placeholder="e.g. fitzone_admin"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Unique handle (defaults to email prefix)</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Login ID (login_id)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={formData.login_id}
                                                onChange={(e) => handleInputChange('login_id', sanitizeText(e.target.value))}
                                                placeholder={formData.username || 'e.g. fitzone_admin'}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Credential used at login</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Master User Email (userEmail)
                                            </label>
                                            <input
                                                type="email"
                                                maxLength={100}
                                                value={formData.userEmail}
                                                onChange={(e) => handleInputChange('userEmail', sanitizeText(e.target.value))}
                                                placeholder={formData.email || 'admin@company.com'}
                                                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${errors.userEmail ? 'border-rose-400' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono`}
                                            />
                                            {errors.userEmail ? (
                                                <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.userEmail}</p>
                                            ) : (
                                                <p className="text-[10px] text-slate-400 mt-1">Defaults to Company Email</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Master Password (password)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showMasterPassword ? 'text' : 'password'}
                                                    value={formData.password}
                                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                                    placeholder="Company@123"
                                                    className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMasterPassword(!showMasterPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                                    title={showMasterPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showMasterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">Default: "Company@123" (auto-hashed with bcrypt)</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Master Phone (phone)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={25}
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', sanitizeText(e.target.value))}
                                                placeholder={formData.mobile_no || '+91 9876543210'}
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Defaults to Company Mobile Number</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CATEGORY C: SMTP & Email Settings */}
                            {formTab === 'smtp' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Category C &bull; SMTP & Email Settings</h4>
                                                <p className="text-[11px] text-slate-400">Configure outbound SMTP mail server, ports, credentials, and SSL transport</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                            Category C
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                SMTP Sender Email
                                            </label>
                                            <input
                                                type="email"
                                                maxLength={100}
                                                value={formData.smtp_email}
                                                onChange={(e) => handleInputChange('smtp_email', sanitizeText(e.target.value))}
                                                placeholder="notifications@company.com"
                                                className={`w-full px-3.5 py-2 text-xs rounded-xl border ${errors.smtp_email ? 'border-rose-400' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono`}
                                            />
                                            {errors.smtp_email && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.smtp_email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                SMTP Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showSmtpPassword ? 'text' : 'password'}
                                                    value={formData.smtp_password}
                                                    onChange={(e) => handleInputChange('smtp_password', e.target.value)}
                                                    placeholder="App password or secret"
                                                    className="w-full pl-3.5 pr-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                                    title={showSmtpPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showSmtpPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                SMTP Host Server (smtp_email_server)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={formData.smtp_email_server}
                                                onChange={(e) => handleInputChange('smtp_email_server', sanitizeText(e.target.value))}
                                                placeholder="smtp.gmail.com"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                SMTP Port (smtp_port)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={10}
                                                value={formData.smtp_port}
                                                onChange={(e) => handleInputChange('smtp_port', e.target.value)}
                                                placeholder="587"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                SMTP CC Email (smtp_cc_email)
                                            </label>
                                            <input
                                                type="email"
                                                maxLength={100}
                                                value={formData.smtp_cc_email}
                                                onChange={(e) => handleInputChange('smtp_cc_email', sanitizeText(e.target.value))}
                                                placeholder="cc-archive@company.com"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Alternative Email Server (emailserver)
                                            </label>
                                            <input
                                                type="text"
                                                maxLength={100}
                                                value={formData.emailserver}
                                                onChange={(e) => handleInputChange('emailserver', sanitizeText(e.target.value))}
                                                placeholder="e.g. mail.internal.corp"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* SMTP SSL / TLS Toggles */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                        <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-blue-500/50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={Number(formData.enable_ssl) === 1}
                                                onChange={(e) => handleInputChange('enable_ssl', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable SSL / TLS (enable_ssl)</span>
                                        </label>

                                        <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-blue-500/50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={Number(formData.verify_ssl) === 1}
                                                onChange={(e) => handleInputChange('verify_ssl', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Verify SSL Certificate (verify_ssl)</span>
                                        </label>

                                        <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-blue-500/50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={Number(formData.cc_to_smtp_email) === 1}
                                                onChange={(e) => handleInputChange('cc_to_smtp_email', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">CC to SMTP Sender (cc_to_smtp_email)</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* CATEGORY D: Operational & Admin Policies */}
                            {formTab === 'policies' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <Shield className="w-4 h-4 text-purple-500 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Category D &bull; Operational & Admin Policies</h4>
                                                <p className="text-[11px] text-slate-400">Configure table grid limits, assignment gaps, session timeouts, and password security policies</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                            Category D
                                        </span>
                                    </div>

                                    {/* Operational Limits */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Default Page Size (pagesize)
                                            </label>
                                            <SearchableSelect
                                                options={[
                                                    { value: '10', label: '10 rows per page' },
                                                    { value: '25', label: '25 rows per page' },
                                                    { value: '50', label: '50 rows per page' },
                                                    { value: '100', label: '100 rows per page' }
                                                ]}
                                                value={formData.pagesize || '10'}
                                                onChange={(val) => handleInputChange('pagesize', val)}
                                                placeholder="Select page size"
                                                searchPlaceholder="Search page size..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Mail Assignment Limit (mailassignlimit)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.mailassignlimit}
                                                onChange={(e) => handleInputChange('mailassignlimit', e.target.value)}
                                                placeholder="e.g. 50"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Assignment Time Gap (assigntimegap)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.assigntimegap}
                                                onChange={(e) => handleInputChange('assigntimegap', e.target.value)}
                                                placeholder="e.g. 5 mins"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Session Timeout (auto_logout_session_time)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.auto_logout_session_time}
                                                onChange={(e) => handleInputChange('auto_logout_session_time', e.target.value)}
                                                placeholder="00:30:00"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Date Difference (date_difference)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.date_difference}
                                                onChange={(e) => handleInputChange('date_difference', e.target.value)}
                                                placeholder="31"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                            <p className="text-[10px] text-slate-400 mt-1">Default date range view in days</p>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Password Expiry Days (admin_reset_password_days)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.admin_reset_password_days}
                                                onChange={(e) => handleInputChange('admin_reset_password_days', e.target.value)}
                                                placeholder="90"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                                Max OTP Attempts (otp_attempt_count)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.otp_attempt_count}
                                                onChange={(e) => handleInputChange('otp_attempt_count', e.target.value)}
                                                placeholder="5"
                                                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Security & Authentication Policy Toggles */}
                                    <div className="pt-2">
                                        <h5 className="text-[11px] font-bold text-slate-500 tracking-wider mb-2.5">Security & Password Policies</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.auto_generate_password) === 1}
                                                    onChange={(e) => handleInputChange('auto_generate_password', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Auto-generate passwords (auto_generate_password)</span>
                                            </label>

                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.admin_change_password) === 1}
                                                    onChange={(e) => handleInputChange('admin_change_password', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Force password change on 1st login (admin_change_password)</span>
                                            </label>

                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.admin_reset_password) === 1}
                                                    onChange={(e) => handleInputChange('admin_reset_password', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable periodic password expiry (admin_reset_password)</span>
                                            </label>

                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.admin_previous_password_reused) === 1}
                                                    onChange={(e) => handleInputChange('admin_previous_password_reused', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Disallow reusing old passwords (admin_previous_password_reused)</span>
                                            </label>

                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.admin_enable_otp) === 1}
                                                    onChange={(e) => handleInputChange('admin_enable_otp', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable 2FA / OTP for Admin (admin_enable_otp)</span>
                                            </label>

                                            <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-purple-500/50 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={Number(formData.agent_enable_otp) === 1}
                                                    onChange={(e) => handleInputChange('agent_enable_otp', e.target.checked ? 1 : 0)}
                                                    className="w-4 h-4 rounded text-purple-500 focus:ring-purple-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                                />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable 2FA / OTP for Staff (agent_enable_otp)</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CATEGORY E: Portal & Branding */}
                            {formTab === 'portal' && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5">
                                            <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Category E &bull; Portal & Branding</h4>
                                                <p className="text-[11px] text-slate-400">Configure member self-service portal, custom domains, captcha, and banner JSON</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                            Category E
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                            Allowed Portal Subdomains / Domains (client_portal_domains)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={250}
                                            value={formData.client_portal_domains}
                                            onChange={(e) => handleInputChange('client_portal_domains', sanitizeText(e.target.value))}
                                            placeholder="subdomain.gymshood.com, portal.fitzone.com"
                                            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                        <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-emerald-500/50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={Number(formData.allowSelfServicePortal) === 1}
                                                onChange={(e) => handleInputChange('allowSelfServicePortal', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                            />
                                            <div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Allow Self-Service Portal (allowSelfServicePortal)</span>
                                                <span className="text-[10px] text-slate-400">1 = Enabled, 0 = Disabled</span>
                                            </div>
                                        </label>

                                        <label className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer hover:border-emerald-500/50 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={Number(formData.hide_captcha) === 1}
                                                onChange={(e) => handleInputChange('hide_captcha', e.target.checked ? 1 : 0)}
                                                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 dark:border-white/20 cursor-pointer"
                                            />
                                            <div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Hide Captcha on Login (hide_captcha)</span>
                                                <span className="text-[10px] text-slate-400">1 = Hide Captcha, 0 = Show Captcha</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                                                Promotional & Dashboard Banners JSON (bannerJson)
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const sample = [
                                                        { id: "banner_1", title: "Welcome to our Gym", active: true, imageUrl: "https://example.com/banner.jpg" }
                                                    ];
                                                    handleInputChange('bannerJson', JSON.stringify(sample, null, 2));
                                                }}
                                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                            >
                                                Insert Sample JSON
                                            </button>
                                        </div>
                                        <textarea
                                            rows={5}
                                            value={formData.bannerJson}
                                            onChange={(e) => handleInputChange('bannerJson', e.target.value)}
                                            placeholder='[{"id": "banner_1", "title": "Welcome", "imageUrl": "..."}]'
                                            className={`w-full p-3.5 text-xs rounded-xl border ${errors.bannerJson ? 'border-rose-400' : 'border-slate-200 dark:border-white/10'} bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono resize-y`}
                                        />
                                        {errors.bannerJson && <p className="text-[11px] text-rose-500 font-semibold mt-1">{errors.bannerJson}</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Separate Bottom Action Footer (Matches Reference Image & Theme) */}
                    <div className="shrink-0">
                        <FormFooter
                            onSubmit={handleSubmit}
                            onCancel={() => setViewMode('list')}
                            isSubmitting={submitting}
                            isEdit={Boolean(editingId)}
                            saveLabel="Save"
                            updateLabel="Update"
                        />
                    </div>
                </form>
            )}

            {/* Modal for Managing Company Users and Role Rights */}
            {manageModalCompany && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151926] rounded-2xl shadow-xl border border-slate-200/80 dark:border-white/10 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                        {manageModalCompany.name} &bull; Staff & Rights
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Manage company users, user groups, and granular page permissions
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setManageModalCompany(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex items-center gap-4 px-4 pt-3 border-b border-slate-100 dark:border-white/10 bg-white dark:bg-[#151926]">
                            <button
                                type="button"
                                onClick={() => setManageActiveTab('users')}
                                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
 manageActiveTab === 'users'
 ? 'border-orange-500 text-orange-600 dark:text-orange-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
                            >
                                <Users className="w-3.5 h-3.5" />
                                <span>Company Staff ({companyUsers.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setManageActiveTab('groups')}
                                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
 manageActiveTab === 'groups'
 ? 'border-orange-500 text-orange-600 dark:text-orange-400'
 : 'border-transparent text-slate-400 hover:text-slate-600'
 }`}
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Role Groups & Page Rights ({companyGroups.length})</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {manageActiveTab === 'users' && (
                                <div className="space-y-4">
                                    {/* User Create / Edit Card */}
                                    <form onSubmit={handleCreateOrUpdateUser} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                                {editingUserId ? 'Edit Staff Member' : 'Register New Staff / Owner'}
                                            </p>
                                            {editingUserId && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetUserForm}
                                                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                                >
                                                    Cancel Edit
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newUserForm.name}
                                                    onChange={(e) => setNewUserForm({ ...newUserForm, name: sanitizeText(e.target.value) })}
                                                    placeholder="John Doe"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500"
                                                />
                                                {userFormErrors.name && <p className="text-[10px] text-rose-500 mt-0.5">{userFormErrors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    value={newUserForm.email}
                                                    onChange={(e) => setNewUserForm({ ...newUserForm, email: sanitizeText(e.target.value) })}
                                                    placeholder="user@company.com"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono"
                                                />
                                                {userFormErrors.email && <p className="text-[10px] text-rose-500 mt-0.5">{userFormErrors.email}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Mobile Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newUserForm.phone}
                                                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: sanitizeText(e.target.value) })}
                                                    placeholder="9876543210"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Password {editingUserId ? '(Leave blank to keep)' : '*'}
                                                </label>
                                                <input
                                                    type="password"
                                                    value={newUserForm.password}
                                                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                                    placeholder="••••••••"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Assigned Role Group
                                                </label>
                                                <SearchableSelect
                                                    options={companyGroups.map((g) => ({
                                                        value: g.id,
                                                        label: g.group_name
                                                    }))}
                                                    value={newUserForm.groupId}
                                                    onChange={(val) => setNewUserForm({ ...newUserForm, groupId: val })}
                                                    placeholder="Select Role Group"
                                                    searchPlaceholder="Search role group..."
                                                />
                                            </div>

                                            <div className="flex items-center gap-4 pt-4 select-none">
                                                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUserForm.isCompanyOwner}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, isCompanyOwner: e.target.checked })}
                                                        className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                    />
                                                    <span>Company Owner</span>
                                                </label>

                                                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={newUserForm.status}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, status: e.target.checked })}
                                                        className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                    />
                                                    <span>Active</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={creatingUser}
                                                className="px-4 py-1.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
                                            >
                                                {creatingUser ? 'Saving...' : editingUserId ? 'Update User' : 'Add User'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Existing Company Users List */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Registered Staff in {manageModalCompany.name}
                                        </p>
                                        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-bold text-[10px]">
                                                    <tr>
                                                        <th className="py-2 px-3">Name</th>
                                                        <th className="py-2 px-3">Contact</th>
                                                        <th className="py-2 px-3">Role Group</th>
                                                        <th className="py-2 px-3">Type</th>
                                                        <th className="py-2 px-3 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                    {companyUsers.map((u) => (
                                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5">
                                                            <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-100">
                                                                {u.name}
                                                            </td>
                                                            <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                                                                {u.email} {u.phone && `• ${u.phone}`}
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-semibold text-[10px]">
                                                                    {u.group_name || companyGroups.find(g => g.id === Number(u.groupId))?.group_name || 'General Staff'}
                                                                </span>
                                                            </td>
                                                            <td className="py-2 px-3">
                                                                {u.isCompanyOwner ? (
                                                                    <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                                                        Owner
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-slate-400">Staff</span>
                                                                )}
                                                            </td>
                                                            <td className="py-2 px-3 text-right">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleEditUser(u)}
                                                                    className="p-1 rounded-md text-slate-500 hover:text-orange-500 hover:bg-orange-500/10 cursor-pointer"
                                                                    title="Edit User"
                                                                >
                                                                    <Edit2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {companyUsers.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">
                                                                No users registered for this company yet.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {manageActiveTab === 'groups' && (
                                <div className="space-y-4">
                                    {/* Create Role Group Form */}
                                    <form onSubmit={handleCreateGroup} className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl space-y-3">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Create Custom Role Group & Granular Permissions
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Group / Role Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newGroupForm.group_name}
                                                    onChange={(e) => setNewGroupForm({ ...newGroupForm, group_name: sanitizeText(e.target.value) })}
                                                    placeholder="e.g. Frontdesk Supervisor"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500"
                                                />
                                                {groupFormErrors.group_name && <p className="text-[10px] text-rose-500 mt-0.5">{groupFormErrors.group_name}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                                    Allowed IP (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={newGroupForm.allow_ip}
                                                    onChange={(e) => setNewGroupForm({ ...newGroupForm, allow_ip: sanitizeText(e.target.value) })}
                                                    placeholder="e.g. 192.168.1.1"
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 font-mono"
                                                />
                                            </div>
                                        </div>

                                        {/* Page Rights Checkbox Matrix */}
                                        <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#151926]">
                                            <div className="px-3 py-2 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-slate-300 ">
                                                Granular Page Rights Configuration
                                            </div>
                                            <table className="w-full text-left text-xs">
                                                <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 text-slate-400 font-bold text-[10px] ">
                                                    <tr>
                                                        <th className="py-2 px-3">Module / Page</th>
                                                        <th className="py-2 px-3 text-center">View</th>
                                                        <th className="py-2 px-3 text-center">Add</th>
                                                        <th className="py-2 px-3 text-center">Edit</th>
                                                        <th className="py-2 px-3 text-center">Delete</th>
                                                        <th className="py-2 px-3 text-center">Excel Export</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                    {newGroupForm.rights.map((r, idx) => (
                                                        <tr key={r.page_id} className="hover:bg-slate-50/60 dark:hover:bg-white/5">
                                                            <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-200">{r.page_name}</td>
                                                            <td className="py-2 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={r.view_right}
                                                                    onChange={() => handleToggleRight(idx, 'view_right')}
                                                                    className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={r.add_right}
                                                                    onChange={() => handleToggleRight(idx, 'add_right')}
                                                                    className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={r.edit_right}
                                                                    onChange={() => handleToggleRight(idx, 'edit_right')}
                                                                    className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={r.delete_right}
                                                                    onChange={() => handleToggleRight(idx, 'delete_right')}
                                                                    className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                            <td className="py-2 px-3 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={r.excel_right}
                                                                    onChange={() => handleToggleRight(idx, 'excel_right')}
                                                                    className="h-3.5 w-3.5 text-orange-500 rounded cursor-pointer"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={creatingGroup}
                                                className="px-4 py-1.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold transition-opacity cursor-pointer disabled:opacity-60"
                                            >
                                                {creatingGroup ? 'Saving Role...' : 'Save Role & Rights'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Existing Groups */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Existing Groups in Company</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {companyGroups.map((g) => (
                                                <div key={g.id} className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{g.group_name}</p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {g.allow_ip ? `IP: ${g.allow_ip}` : 'No IP restriction'}
                                                        </p>
                                                    </div>
                                                    <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">
                                                        Configured
                                                    </span>
                                                </div>
                                            ))}
                                            {companyGroups.length === 0 && (
                                                <p className="text-xs text-slate-400 italic">No groups defined yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setManageModalCompany(null)}
                                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Company?"
                message={`Are you sure you want to permanently delete company "${deleteModal.name}"? This action will remove company settings and associations.`}
                confirmText="Delete Company"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default CompanyMasterPage;
