import React, { useMemo } from 'react';
import { 
    LayoutDashboard, Users, Dumbbell, Calendar, Wallet, Coins, Bell, Settings, 
    FileText, BarChart3, Shield, CheckCheck, Building2, Activity, MapPin, Tag, Loader2
} from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    StatusBadge, 
    ActionButtons, 
    ConfirmDialog
} from '../../../common';
import { useGlobalMenuMasterLogic } from './globalMenuMaster.logic';

// Icon Map for dynamic lookup and presets
const POPULAR_ICONS = [
    { name: 'layout-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { name: 'users', icon: Users, label: 'Users' },
    { name: 'dumbbell', icon: Dumbbell, label: 'Gym/Fitness' },
    { name: 'calendar', icon: Calendar, label: 'Calendar' },
    { name: 'wallet', icon: Wallet, label: 'Wallet/Billing' },
    { name: 'coins', icon: Coins, label: 'Finance/Pricing' },
    { name: 'bell', icon: Bell, label: 'Notifications' },
    { name: 'settings', icon: Settings, label: 'Settings' },
    { name: 'file-text', icon: FileText, label: 'Reports/Files' },
    { name: 'bar-chart', icon: BarChart3, label: 'Analytics' },
    { name: 'shield', icon: Shield, label: 'Security' },
    { name: 'building', icon: Building2, label: 'Company' },
    { name: 'check-check', icon: CheckCheck, label: 'Attendance' },
    { name: 'map-pin', icon: MapPin, label: 'Location' },
    { name: 'activity', icon: Activity, label: 'Activity' }
];

export const renderMenuIcon = (iconName, className = "w-4 h-4") => {
    if (!iconName) return <Tag className={className} />;
    const cleanName = iconName.toLowerCase().replace(/^(fas|far|fal|fad)\s+fa-/, '').replace(/^fa-/, '');
    const found = POPULAR_ICONS.find(item => item.name === cleanName || cleanName.includes(item.name));
    if (found) {
        const IconComponent = found.icon;
        return <IconComponent className={className} />;
    }
    return <Tag className={className} />;
};

export const GlobalMenuMasterPage = () => {
    const {
        activeTab,
        setActiveTab,
        loading,
        nameFilter,
        setNameFilter,
        urlFilter,
        setUrlFilter,
        parentFilter,
        setParentFilter,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingMenu,
        formData,
        setFormData,
        formErrors,
        submitting,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchMenus,
        flatMenuList,
        parentOptions,
        filteredRecords,
        paginatedRecords,
        handleResetFilters,
        handleOpenCreateForm,
        handleOpenEditForm,
        handleFormSubmit,
        handlePromptDelete,
        handleConfirmDelete
    } = useGlobalMenuMasterLogic();

    // Columns definition for DataTable matching exact reference screenshot
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Actions',
            align: 'center',
            width: '90px',
            render: (row) => (
                <ActionButtons
                    onEdit={() => handleOpenEditForm(row)}
                    onDelete={() => handlePromptDelete(row)}
                    editTooltip="Edit Menu"
                    deleteTooltip="Delete Menu"
                />
            )
        },
        {
            key: 'menu_details',
            title: 'Menu Details',
            align: 'left',
            sortable: true,
            render: (row) => {
                const name = row.menu_name || row.menuName;
                const route = row.route;
                const isClient = Boolean(row.is_client_menu ?? row.isClientMenu);
                return (
                    <div className="py-0.5">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleOpenEditForm(row)}
                                className="font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-left transition-colors cursor-pointer block"
                            >
                                {name}
                            </button>
                            {isClient && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
                                    Client
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {route}
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'section',
            title: 'Section',
            align: 'left',
            sortable: true,
            render: (row) => (
                <div className="py-0.5">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                        {row.parentName || 'Config'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                        Priority: {row.parentPriority ?? 8}
                    </div>
                </div>
            )
        },
        {
            key: 'sort_order',
            title: 'Menu Priority',
            align: 'left',
            sortable: true,
            width: '130px',
            render: (row) => (
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">
                    {row.menuPriority ?? row.sort_order ?? row.sortOrder ?? 1}
                </span>
            )
        },
        {
            key: 'status',
            title: 'Status',
            align: 'left',
            sortable: true,
            width: '110px',
            render: (row) => {
                const active = row.is_active ?? row.isActive ?? true;
                return <StatusBadge status={active} />;
            }
        }
    ], [flatMenuList, handleOpenEditForm, handlePromptDelete]);

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-2.5">
            {/* Standard PageTabs Navigation */}
            <div className="shrink-0">
                <PageTabs
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingMenu) {
                                handleOpenCreateForm();
                            } else {
                                setActiveTab('form');
                            }
                        } else {
                            setActiveTab('list');
                        }
                    }}
                    isEditing={Boolean(editingMenu)}
                    listLabel="All Menus"
                    addLabel="Add Menu"
                    editLabel="Edit Menu"
                    layoutId="global-menus-tabs"
                />
            </div>

            {/* TAB 1: LIST VIEW */}
            {activeTab === 'list' && (
                <div className="flex-1 min-h-0 flex flex-col overflow-hidden space-y-2.5">
                    {/* Collapsible Filter Panel matching reference screenshot */}
                    <div className="shrink-0">
                        <FilterPanel
                            title="Filters"
                            onApply={fetchMenus}
                            onReset={handleResetFilters}
                        >
                            {/* 1. Menu Name */}
                            <input
                                type="text"
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Menu Name"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                            />

                            {/* 2. Menu URL */}
                            <input
                                type="text"
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                placeholder="Menu URL"
                                value={urlFilter}
                                onChange={(e) => setUrlFilter(e.target.value)}
                            />

                            {/* 3. Select Parent */}
                            <select
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                                value={parentFilter}
                                onChange={(e) => setParentFilter(e.target.value)}
                            >
                                <option value="all">Select Parent</option>
                                <option value="">Root Only (No Parent)</option>
                                {parentOptions.map(p => (
                                    <option key={p.id} value={String(p.id)}>{p.prefix} {p.name}</option>
                                ))}
                            </select>

                            {/* 4. Status */}
                            <select
                                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FilterPanel>
                    </div>

                    {/* Standard DataTable - ONLY inner table scrolls */}
                    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                        <DataTable
                            tableId="global-menus-table"
                            columns={columns}
                            data={paginatedRecords}
                            loading={loading}
                            emptyMessage="No menu items found."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredRecords.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredRecords.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [10, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: FORM VIEW (Add / Edit Menu) */}
            {activeTab === 'form' && (
                <div className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm p-4 overflow-y-auto">
                    <form onSubmit={handleFormSubmit} autoComplete="off">
                        {/* Row 1: 5 Columns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* 1. Menu Name* */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Menu Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Menu Name"
                                    value={formData.menuName}
                                    onChange={(e) => setFormData({ ...formData, menuName: e.target.value })}
                                />
                                {formErrors.menuName && <p className="text-red-500 text-[11px] mt-1">{formErrors.menuName}</p>}
                            </div>

                            {/* 2. Menu URL* */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Menu URL <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-mono"
                                    placeholder="/admin/path"
                                    value={formData.route}
                                    onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                />
                                {formErrors.route && <p className="text-red-500 text-[11px] mt-1">{formErrors.route}</p>}
                            </div>

                            {/* 3. Section Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Section Name
                                </label>
                                <select
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                                    value={formData.sectionName}
                                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                                >
                                    <option value="">Select Section</option>
                                    <option value="Config">Config</option>
                                    <option value="Main">Main</option>
                                    <option value="Reports">Reports</option>
                                    <option value="Finance & Accounting">Finance & Accounting</option>
                                    <option value="Stock & Procurement">Stock & Procurement</option>
                                    <option value="Master">Master</option>
                                    <option value="Scheduler">Scheduler</option>
                                    <option value="Settings">Settings</option>
                                </select>
                            </div>

                            {/* 4. Parent Menu */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Parent Menu
                                </label>
                                <select
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151926] text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                >
                                    <option value="">Leave empty if root menu</option>
                                    {parentOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.prefix} {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* 5. Icon */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Icon
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Lucide icon name (e.g., Users)"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Row 2: 6 Columns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center mt-5">
                            {/* 1. Master Name* */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Master Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                                    placeholder="Master Name"
                                    value={formData.masterName}
                                    onChange={(e) => setFormData({ ...formData, masterName: e.target.value })}
                                />
                                {formErrors.masterName && <p className="text-red-500 text-[11px] mt-1">{formErrors.masterName}</p>}
                            </div>

                            {/* 2. Menu Priority */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Menu Priority
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-right pr-4 font-mono"
                                    value={formData.menuPriority}
                                    onChange={(e) => setFormData({ ...formData, menuPriority: Number(e.target.value) || 0 })}
                                />
                            </div>

                            {/* 3. Section Priority */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                                    Section Priority
                                </label>
                                <input
                                    type="number"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-slate-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-right pr-4 font-mono"
                                    value={formData.sectionPriority}
                                    onChange={(e) => setFormData({ ...formData, sectionPriority: Number(e.target.value) || 0 })}
                                />
                            </div>

                            {/* 4. Active Checkbox */}
                            <div className="flex items-center gap-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="menu-active-checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 accent-orange-500 cursor-pointer"
                                />
                                <label htmlFor="menu-active-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                                    Active
                                </label>
                            </div>

                            {/* 5. App Menu Checkbox */}
                            <div className="flex items-center gap-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="menu-app-checkbox"
                                    checked={formData.isAppMenu}
                                    onChange={(e) => setFormData({ ...formData, isAppMenu: e.target.checked })}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 accent-orange-500 cursor-pointer"
                                />
                                <label htmlFor="menu-app-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                                    App Menu
                                </label>
                            </div>

                            {/* 6. Client Menu Checkbox */}
                            <div className="flex items-center gap-2 pt-5">
                                <input
                                    type="checkbox"
                                    id="menu-client-checkbox"
                                    checked={formData.isClientMenu}
                                    onChange={(e) => setFormData({ ...formData, isClientMenu: e.target.checked })}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 accent-orange-500 cursor-pointer"
                                />
                                <label htmlFor="menu-client-checkbox" className="text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                                    Client Menu
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex items-center justify-end gap-3 mt-8 pt-5 border-t border-slate-100 dark:border-white/5">
                            <button
                                type="button"
                                onClick={() => setActiveTab('list')}
                                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 shadow-sm shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>Save</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, menuId: null, menuName: '', hasChildren: false })}
                onConfirm={handleConfirmDelete}
                loading={isDeleting}
                title="Delete Global Menu"
                message={
                    deleteModal.hasChildren
                        ? `Warning: "${deleteModal.menuName}" contains nested submenus. Deleting it will re-assign or remove all child items. Are you sure you wish to proceed?`
                        : `Are you sure you want to permanently remove "${deleteModal.menuName}" from global menus?`
                }
                type="danger"
                confirmText="Delete Menu"
                cancelText="Cancel"
            />
        </div>
    );
};

export default GlobalMenuMasterPage;
