import React, { useMemo } from 'react';
import { 
    RefreshCw, Edit2, Trash2, Tag, Calendar, Clock, Sparkles, 
    Check, X, Plus, AlertTriangle, ShieldCheck, Power, Coins, 
    ArrowUpRight, DollarSign, Layers, FileText, Dumbbell, Crown, 
    CheckCircle2, Flame, Building2
} from 'lucide-react';
import { 
    PageTabs, 
    FilterPanel, 
    DataTable, 
    ConfirmDialog, 
    FormFooter,
    SearchableSelect 
} from '@/common';
import { useClientPlanMasterLogic, POPULAR_FEATURES } from './plans.logic';
import { PlanInput } from './components/PlanInput';

export const ClientPlanMasterPage = ({ gym, onNavigate }) => {
    const {
        activeTab,
        setActiveTab,
        plans,
        loading,
        submitting,
        filterSearch,
        setFilterSearch,
        filterPlanType,
        setFilterPlanType,
        filterStatus,
        setFilterStatus,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingPlan,
        formData,
        setFormData,
        formErrors,
        customBenefitInput,
        setCustomBenefitInput,
        computedNetPrice,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchPlans,
        handleCreateClick,
        handleEditClick,
        handleCancelForm,
        handleToggleFeature,
        handleAddCustomBenefit,
        handleRemoveFeature,
        handleSubmitPlanForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleToggleStatus,
        handleResetFilters,
        filteredPlans,
        paginatedPlans
    } = useClientPlanMasterLogic({ gym, onNavigate });

    // Table Columns Configuration
    const columns = useMemo(() => [
        {
            key: 'actions',
            title: 'Action',
            align: 'center',
            width: '110px',
            render: (row) => (
                <div className="flex items-center justify-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => handleEditClick(row)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer"
                        title="Edit Plan"
                    >
                        <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 transition-all cursor-pointer ${
 row.isActive !== false
 ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20'
 : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10'
 }`}
                        title={row.isActive !== false ? 'Deactivate Plan' : 'Activate Plan'}
                    >
                        <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleDeleteClick(row)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                        title="Delete Plan"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        },
        {
            key: 'name',
            title: 'Plan Details',
            align: 'left',
            sortable: true,
            render: (row) => {
                const planType = (row.planType || 'monthly').toUpperCase();
                return (
                    <div className="flex flex-col py-1">
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-xs">
                                {row.name}
                            </span>
                            <span className="px-2 py-0.5 text-[9px] font-black tracking-wider rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                {planType}
                            </span>
                        </div>
                        {row.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                {row.description}
                            </p>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'price',
            title: 'Price & Terms',
            align: 'left',
            sortable: true,
            width: '160px',
            render: (row) => {
                const basePrice = Number(row.price) || 0;
                const discount = Number(row.discountPercent) || 0;
                const netPrice = discount > 0 ? Math.max(0, basePrice - (basePrice * discount) / 100) : basePrice;

                return (
                    <div className="flex flex-col py-1">
                        <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-slate-900 dark:text-white">
                                ₹{netPrice.toLocaleString('en-IN')}
                            </span>
                            {discount > 0 && (
                                <span className="text-[10px] text-slate-400 line-through">
                                    ₹{basePrice.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>
                        {discount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {discount}% Special Discount
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'validity',
            title: 'Validity',
            align: 'center',
            sortable: true,
            width: '120px',
            render: (row) => (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-orange-500" />
                    <span>{row.validity || 0} Days</span>
                </div>
            )
        },
        {
            key: 'duration',
            title: 'Daily Limit',
            align: 'center',
            sortable: true,
            width: '120px',
            render: (row) => (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>{row.duration || 1.5} Hrs</span>
                </div>
            )
        },
        {
            key: 'features',
            title: 'Included Benefits',
            align: 'left',
            render: (row) => {
                const list = Array.isArray(row.features) 
                    ? row.features 
                    : (row.features?.split(',') || []);
                const cleanList = list.map(f => f.trim()).filter(Boolean);

                if (cleanList.length === 0) {
                    return <span className="text-xs text-slate-400 italic">Standard gym access</span>;
                }

                const visible = cleanList.slice(0, 2);
                const extraCount = cleanList.length - 2;

                return (
                    <div className="flex flex-wrap items-center gap-1.5 py-1">
                        {visible.map((feat, idx) => (
                            <span 
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
                            >
                                <Check className="w-2.5 h-2.5 text-emerald-500" />
                                {feat}
                            </span>
                        ))}
                        {extraCount > 0 && (
                            <span 
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-200 dark:bg-white/10"
                                title={cleanList.slice(2).join(', ')}
                            >
                                +{extraCount} more
                            </span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'status',
            title: 'Status',
            align: 'center',
            width: '100px',
            sortable: true,
            render: (row) => {
                const isActive = row.isActive !== false;
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
    ], [handleEditClick, handleDeleteClick, handleToggleStatus]);

    // Frequency Presets
    const FREQUENCY_OPTIONS = [
        { id: 'daily', label: 'Daily Pass', days: '1', icon: Flame },
        { id: 'monthly', label: 'Monthly Pass', days: '30', icon: Calendar },
        { id: 'quarterly', label: 'Quarterly', days: '90', icon: Sparkles },
        { id: 'yearly', label: 'Annual VIP', days: '365', icon: Crown },
    ];

    const FREQUENCY_SELECT_OPTIONS = [
        { value: 'daily', label: 'Daily Pass (1 Day)' },
        { value: 'monthly', label: 'Monthly Plan (30 Days)' },
        { value: 'quarterly', label: 'Quarterly Plan (90 Days)' },
        { value: 'yearly', label: 'Yearly Package (365 Days)' }
    ];

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-3 w-full">
            {/* Top Bar with PageTabs */}
            <div className="shrink-0 flex flex-wrap items-center justify-between gap-3">
                <PageTabs
                    activeTab={activeTab}
                    onTabChange={(tabId) => {
                        if (tabId === 'add' || tabId === 'form') {
                            if (!editingPlan) {
                                handleCreateClick();
                            } else {
                                setActiveTab('form');
                            }
                        } else {
                            handleCancelForm();
                        }
                    }}
                    isEditing={Boolean(editingPlan)}
                    listLabel={`All Plans (${plans.length})`}
                    addLabel="Add Plan"
                    editLabel="Edit Plan"
                    extraTabs={[]}
                    layoutId="client-plans-tabs"
                />

                {activeTab === 'list' && (
                    <button
                        type="button"
                        onClick={fetchPlans}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Reload Plans"
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
                            title="Filter Plans"
                            onApply={fetchPlans}
                            onReset={handleResetFilters}
                        >
                            {/* Search */}
                            <input
                                type="text"
                                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161a26] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none transition-all font-semibold"
                                placeholder="Search by plan name or feature..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                            />

                            {/* Plan Type */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'All Plan Frequencies' },
                                    { value: 'daily', label: 'Daily Pass' },
                                    { value: 'monthly', label: 'Monthly Plan' },
                                    { value: 'quarterly', label: 'Quarterly Plan' },
                                    { value: 'yearly', label: 'Yearly Package' }
                                ]}
                                value={filterPlanType}
                                onChange={(val) => setFilterPlanType(val || 'all')}
                                placeholder="Plan Frequency"
                                searchPlaceholder="Search plan type..."
                            />

                            {/* Status */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'active', label: 'Active Plans Only' },
                                    { value: 'inactive', label: 'Inactive / Archived' }
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
                            tableId="client-plans-table"
                            columns={columns}
                            data={paginatedPlans}
                            loading={loading}
                            emptyMessage="No membership plans found matching your criteria."
                            showSno={true}
                            sorting={{
                                sortKey,
                                sortDirection,
                                onSort: handleSort
                            }}
                            pagination={{
                                currentPage: pagination.currentPage,
                                totalPages: Math.ceil(filteredPlans.length / pagination.rowsPerPage) || 1,
                                totalRecords: filteredPlans.length,
                                rowsPerPage: pagination.rowsPerPage,
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange,
                                rowsPerPageOptions: [15, 25, 50, 100]
                            }}
                        />
                    </div>
                </div>
            )}

            {/* TAB 2: ADD / EDIT PLAN FORM with Profile-style Fieldsets & Legends */}
            {activeTab === 'form' && (
                <>
                    <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 rounded-xl p-2 sm:p-2.5 shadow-xs overflow-hidden">
                        <form onSubmit={handleSubmitPlanForm} className="flex flex-col flex-1 h-full overflow-hidden" autoComplete="off">
                        {/* Scrollable Form Body: 3-Column Profile Layout */}
                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1 pb-1">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                                
                                {/* LEFT / MAIN COLUMN (2 Cols): Core Identity, Pricing, Benefits, Status */}
                                <div className="lg:col-span-2 space-y-2">
                                    
                                    {/* FIELDSET 1: Basic Information */}
                                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2.5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs space-y-1.5">
                                        <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                            <Building2 className="w-3 h-3 text-amber-500" />
                                            <span>Plan Identity & Classification</span>
                                        </legend>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-0.5">
                                            {/* Plan Name */}
                                            <div className="sm:col-span-2">
                                                <PlanInput
                                                    label="Plan Name"
                                                    name="name"
                                                    icon={Tag}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                                    placeholder="e.g. Silver Monthly Pass, Gold Annual Membership"
                                                    required
                                                    error={formErrors.name}
                                                />
                                            </div>

                                            {/* Plan Frequency Select */}
                                            <div>
                                                <PlanInput
                                                    as="select"
                                                    label="Frequency Category"
                                                    name="planType"
                                                    value={formData.planType}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        let defaultVal = formData.validity;
                                                        if (val === 'daily') defaultVal = '1';
                                                        else if (val === 'monthly') defaultVal = '30';
                                                        else if (val === 'quarterly') defaultVal = '90';
                                                        else if (val === 'yearly') defaultVal = '365';

                                                        setFormData(p => ({ 
                                                            ...p, 
                                                            planType: val, 
                                                            validity: !editingPlan ? defaultVal : p.validity 
                                                        }));
                                                    }}
                                                    options={FREQUENCY_SELECT_OPTIONS}
                                                    required
                                                />
                                            </div>

                                            {/* Marketing Tagline */}
                                            <div>
                                                <PlanInput
                                                    label="Tagline / Short Summary"
                                                    name="description"
                                                    icon={FileText}
                                                    value={formData.description}
                                                    onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                                    placeholder="e.g. All-inclusive facility access with sauna & locker"
                                                />
                                            </div>

                                            {/* Interactive Frequency Quick-Toggle Pills */}
                                            <div className="sm:col-span-2 pt-0.5">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                                    {FREQUENCY_OPTIONS.map((opt) => {
                                                        const isSelected = formData.planType === opt.id;
                                                        const OptIcon = opt.icon;
                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData(p => ({
                                                                        ...p,
                                                                        planType: opt.id,
                                                                        validity: !editingPlan ? opt.days : p.validity
                                                                    }));
                                                                }}
                                                                className={`py-1.5 px-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
 isSelected
 ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-300 shadow-2xs font-extrabold'
 : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
 }`}
                                                            >
                                                                <OptIcon className="w-3.5 h-3.5 text-amber-500" />
                                                                <span>{opt.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </fieldset>

                                    {/* FIELDSET 2: Pricing, Duration & Validity */}
                                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2.5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs space-y-1.5">
                                        <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                            <Coins className="w-3 h-3 text-emerald-500" />
                                            <span>Pricing & Validity Terms</span>
                                        </legend>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-0.5">
                                            {/* Base Price */}
                                            <div>
                                                <PlanInput
                                                    label="Base Price"
                                                    name="price"
                                                    type="number"
                                                    prefix="₹"
                                                    value={formData.price}
                                                    onChange={(e) => setFormData(p => ({ ...p, price: e.target.value }))}
                                                    placeholder="1999"
                                                    required
                                                    error={formErrors.price}
                                                />
                                            </div>

                                            {/* Discount Percent */}
                                            <div>
                                                <PlanInput
                                                    label="Discount"
                                                    name="discountPercent"
                                                    type="number"
                                                    suffix="%"
                                                    value={formData.discountPercent}
                                                    onChange={(e) => setFormData(p => ({ ...p, discountPercent: e.target.value }))}
                                                    placeholder="0"
                                                    error={formErrors.discountPercent}
                                                />
                                            </div>

                                            {/* Validity in Days */}
                                            <div>
                                                <PlanInput
                                                    label="Validity"
                                                    name="validity"
                                                    type="number"
                                                    icon={Calendar}
                                                    suffix="Days"
                                                    value={formData.validity}
                                                    disabled={Boolean(editingPlan)}
                                                    onChange={(e) => setFormData(p => ({ ...p, validity: e.target.value }))}
                                                    placeholder="30"
                                                    required
                                                    error={formErrors.validity}
                                                    helperText={editingPlan ? 'Locked' : undefined}
                                                />
                                            </div>

                                            {/* Daily Limit in Hours */}
                                            <div>
                                                <PlanInput
                                                    label="Daily Duration"
                                                    name="duration"
                                                    type="number"
                                                    step="0.5"
                                                    icon={Clock}
                                                    suffix="Hrs"
                                                    value={formData.duration}
                                                    onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
                                                    placeholder="1.5"
                                                    required
                                                    error={formErrors.duration}
                                                />
                                            </div>
                                        </div>

                                        {/* Real-Time Net Price Pill Strip */}
                                        <div className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span className="text-[11px] font-bold text-slate-800 dark:text-amber-200">
                                                    Net Member Price:
                                                </span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                                    ₹{computedNetPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                </span>
                                                {Number(formData.discountPercent) > 0 && (
                                                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                        (Saves ₹{(Number(formData.price || 0) - computedNetPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </fieldset>

                                    {/* FIELDSET 3: Amenities & Facility Perks (Profile Style) */}
                                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2.5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs space-y-2">
                                        <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                            <span>Amenities & Plan Privileges ({formData.featuresList?.length || 0} Selected)</span>
                                        </legend>

                                        {/* Preset Facilities Interactive Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 pt-0.5">
                                            {POPULAR_FEATURES.map((facility) => {
                                                const isSelected = formData.featuresList?.includes(facility);
                                                return (
                                                    <button
                                                        key={facility}
                                                        type="button"
                                                        onClick={() => handleToggleFeature(facility)}
                                                        className={`px-2 py-1.5 rounded-lg border text-left transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
 isSelected
 ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300 font-bold shadow-2xs'
 : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
 }`}
                                                    >
                                                        <span className="text-[11px] leading-snug truncate">{facility}</span>
                                                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
 isSelected ? 'bg-amber-500 text-white' : 'border border-slate-300 dark:border-slate-600'
 }`}>
                                                            {isSelected && <Check className="w-2 h-2" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Custom Feature Addition */}
                                        <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={customBenefitInput}
                                                onChange={(e) => setCustomBenefitInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCustomBenefit();
                                                    }
                                                }}
                                                placeholder="Add custom amenity or perk (e.g. Free Consultation)..."
                                                className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddCustomBenefit}
                                                className="px-3 py-1 bg-slate-900 dark:bg-white/10 text-white rounded-lg text-xs font-bold hover:bg-black dark:hover:bg-white/20 transition-all cursor-pointer shrink-0"
                                            >
                                                + Add
                                            </button>
                                        </div>

                                        {/* Active Selected Tags */}
                                        {formData.featuresList.length > 0 && (
                                            <div className="flex flex-wrap gap-1 pt-0.5">
                                                {formData.featuresList.map((f, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                                    >
                                                        <span>{f}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFeature(f)}
                                                            className="text-orange-400 hover:text-rose-500 cursor-pointer"
                                                        >
                                                            <X className="w-2.5 h-2.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </fieldset>

                                    {/* FIELDSET 4: Availability & Status */}
                                    <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs">
                                        <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                            <Power className="w-3 h-3 text-rose-500" />
                                            <span>Plan Availability & Status</span>
                                        </legend>

                                        <div className="flex items-center justify-between px-1 py-0.5">
                                            <div>
                                                <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                                                    Publicly Active & Bookable
                                                </span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                    When enabled, members and staff can select and purchase this package.
                                                </span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isActive}
                                                    onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-white/10 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                                            </label>
                                        </div>
                                    </fieldset>
                                </div>

                                {/* RIGHT COLUMN (1 Col): Live Membership Pass Preview & Breakdown */}
                                <div className="space-y-2">
                                    <div className="sticky top-0 space-y-2">
                                        
                                        {/* Fieldset: Live Customer Pass Preview */}
                                        <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2.5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs space-y-2">
                                            <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span>Live Member Pass Preview</span>
                                            </legend>

                                            {/* Physical VIP Membership Card Mockup */}
                                            <div className="relative rounded-xl p-3.5 overflow-hidden shadow-xl border border-amber-500/30 text-white transition-all bg-gradient-to-br from-slate-900 via-[#161b2a] to-slate-950">
                                                {/* Top Gym Badge */}
                                                <div className="flex items-center justify-between mb-2 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-[10px] shadow-sm">
                                                            FC
                                                        </div>
                                                        <div>
                                                            <p className="text-[8.5px] font-black tracking-widest text-amber-400 leading-tight">
                                                                FITNESS CORP
                                                            </p>
                                                            <p className="text-[7.5px] text-slate-400 font-bold leading-tight">
                                                                OFFICIAL PASS
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40">
                                                        {formData.planType}
                                                    </span>
                                                </div>

                                                {/* Plan Title & Tagline */}
                                                <div className="mb-2 relative z-10">
                                                    <h3 className="text-sm font-black tracking-tight text-white line-clamp-1">
                                                        {formData.name || 'Membership Plan Name'}
                                                    </h3>
                                                    <p className="text-[10px] text-slate-300 line-clamp-1 mt-0.5 font-medium">
                                                        {formData.description || 'Full facility access and workout privileges included.'}
                                                    </p>
                                                </div>

                                                {/* Pricing Box */}
                                                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md mb-2 relative z-10">
                                                    <div className="flex items-baseline justify-between">
                                                        <div>
                                                            <span className="text-[8px] font-bold tracking-wider text-slate-400 block">
                                                                Payable Fee
                                                            </span>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-lg font-black text-white tracking-tight">
                                                                    ₹{computedNetPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                                                </span>
                                                                {Number(formData.discountPercent) > 0 && (
                                                                    <span className="text-[10px] font-bold text-slate-400 line-through">
                                                                        ₹{Number(formData.price || 0).toLocaleString('en-IN')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {Number(formData.discountPercent) > 0 && (
                                                            <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                {formData.discountPercent}% OFF
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-1.5 pt-1.5 border-t border-white/10 text-[10px]">
                                                        <div className="flex items-center gap-1 text-slate-300">
                                                            <Calendar className="w-3 h-3 text-amber-400" />
                                                            <span className="font-bold">{formData.validity || 30} Days</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-300 justify-end">
                                                            <Clock className="w-3 h-3 text-orange-400" />
                                                            <span className="font-bold">{formData.duration || 1.5} Hrs / Day</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Live Included Benefits Checklist */}
                                                <div className="space-y-1 relative z-10">
                                                    <p className="text-[8px] font-black tracking-widest text-slate-400">
                                                        Included Privileges
                                                    </p>
                                                    <div className="space-y-0.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                        {formData.featuresList.length === 0 ? (
                                                            <p className="text-[10px] text-slate-400 italic">No features selected yet</p>
                                                        ) : (
                                                            formData.featuresList.map((f, i) => (
                                                                <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-200">
                                                                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                                                    <span className="truncate">{f}</span>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Ambient glow */}
                                                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none"></div>
                                                <div className="absolute -left-6 -top-6 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>
                                            </div>
                                        </fieldset>

                                        {/* Fieldset: Financial Summary */}
                                        <fieldset className="border border-slate-200 dark:border-white/10 rounded-xl p-2.5 bg-white dark:bg-[#121622]/85 backdrop-blur-md shadow-2xs space-y-1.5">
                                            <legend className="px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 bg-white dark:bg-[#151926] rounded-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                                <span>Cost Summary</span>
                                            </legend>

                                            <div className="space-y-1.5 text-xs pt-0.5">
                                                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                                    <span>Base Package Rate:</span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                                        ₹{Number(formData.price || 0).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                                {Number(formData.discountPercent) > 0 && (
                                                    <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                                                        <span>Promo Discount ({formData.discountPercent}%):</span>
                                                        <span className="font-bold">
                                                            - ₹{(Number(formData.price || 0) - computedNetPrice).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 dark:border-white/10 font-black text-slate-900 dark:text-white">
                                                    <span>Payable Total:</span>
                                                    <span className="text-sm text-orange-500">
                                                        ₹{computedNetPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Separate Bottom Action Footer (Matches Reference Image) */}
                <div className="shrink-0">
                    <FormFooter
                        onSubmit={handleSubmitPlanForm}
                        onCancel={handleCancelForm}
                        isSubmitting={submitting}
                        isEdit={Boolean(editingPlan)}
                        submitText={editingPlan ? 'Update Membership Plan' : 'Create Membership Plan'}
                        cancelText="Cancel (Esc)"
                        updatedInfo={editingPlan ? { at: 'Existing Record' } : undefined}
                    />
                </div>
            </>
        )}

            {/* Deactivate / Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteModal.isOpen}
                title="Deactivate Membership Plan"
                message={`Are you sure you want to deactivate "${deleteModal.planName}"? Users will no longer be able to purchase or renew this plan.`}
                confirmText={isDeleting ? 'Deactivating...' : 'Yes, Deactivate'}
                confirmVariant="danger"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, planId: null, planName: '' })}
            />
        </div>
    );
};

export default ClientPlanMasterPage;
