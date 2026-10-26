import React, { useMemo } from 'react';
import { 
    Users, UserCheck, AlertTriangle, UserX, Clock, 
    RefreshCw, Download, Search, Filter, Eye, Phone, 
    Mail, Calendar, ArrowUpRight, ShieldCheck, CheckCircle2,
    XCircle, LayoutGrid, Table as TableIcon, X, Dumbbell,
    Sparkles, ChevronRight, Activity, Zap
} from 'lucide-react';
import { DataTable } from '@/common';
import { useClientMemberLogic } from './member.logic';

export const ClientMemberMasterPage = ({ gym, initialType = 'active' }) => {
    const {
        filterType,
        setFilterType,
        viewMode,
        setViewMode,
        searchTerm,
        setSearchTerm,
        sortKey,
        sortDirection,
        handleSort,
        loading,
        refreshing,
        error,
        filteredMembers,
        paginatedMembers,
        kpiStats,
        selectedMember,
        setSelectedMember,
        memberDetails,
        detailsLoading,
        handleSelectMember,
        fetchMembers,
        handleExportCSV,
        pagination
    } = useClientMemberLogic({ gym, initialType });

    // Format Currency Helper
    const formatCurrency = (val) => {
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    // Safe initial getter
    const getInitial = (name, fallback = 'M') => {
        if (!name || typeof name !== 'string') return fallback;
        const char = name.trim().charAt(0);
        return char ? char.toUpperCase() : fallback;
    };

    // Columns for DataTable view
    const tableColumns = useMemo(() => [
        {
            key: 'member',
            title: 'Member Details',
            width: '240px',
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                        {row.photo ? (
                            <img src={row.photo} alt={row.name} className="w-full h-full object-cover" />
                        ) : (
                            getInitial(row.name)
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {row.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {row.phone}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'planName',
            title: 'Membership Tier',
            width: '200px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {row.planName}
                    </span>
                    <span className="text-[10px] text-amber-500 font-semibold font-mono">
                        {row.amountDeducted > 0 ? formatCurrency(row.amountDeducted) : 'Active Pass'}
                    </span>
                </div>
            )
        },
        {
            key: 'expiryDate',
            title: 'Expiry Date',
            width: '160px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(row.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        Valid Till EOD
                    </span>
                </div>
            )
        },
        {
            key: 'remainingDays',
            title: 'Validity Status',
            width: '160px',
            render: (row) => {
                if (row.isExpired) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            Expired
                        </span>
                    );
                }
                if (row.isExpiringSoon) {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/25 animate-pulse">
                            <Clock className="w-3 h-3" />
                            {row.remainingDays} Days Left
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {row.remainingDays} Days Left
                    </span>
                );
            }
        },
        {
            key: 'actions',
            title: 'Profile',
            width: '100px',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => handleSelectMember(row)}
                    className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-all cursor-pointer"
                    title="View Member Profile"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
            )
        }
    ], [handleSelectMember]);

    return (
        <div className="space-y-3.5 animate-fade-in select-none pb-6">
            {/* Header Toolbar */}
        

            {/* Top 4 Executive KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Active Members */}
                <div 
                    onClick={() => setFilterType('active')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 filterType === 'active' 
 ? 'border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-emerald-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Active Memberships
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <UserCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.activeCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Verified Active
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Valid pass access</span>
                    </div>
                </div>

                {/* 2. Expiring Soon */}
                <div 
                    onClick={() => setFilterType('expiring')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 filterType === 'expiring' 
 ? 'border-amber-500/60 shadow-xs ring-1 ring-amber-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Expiring in 7 Days
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.expiringCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Renewal Due
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Within 7 days</span>
                    </div>
                </div>

                {/* 3. Expired Members */}
                <div 
                    onClick={() => setFilterType('expired')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 filterType === 'expired' 
 ? 'border-rose-500/60 shadow-xs ring-1 ring-rose-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-rose-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Expired Memberships
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <UserX className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.expiredCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                            Past Cycles
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Inactive passes</span>
                    </div>
                </div>

                {/* 4. Active Health Ratio */}
                <div 
                    onClick={() => setFilterType('all')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 filterType === 'all' 
 ? 'border-cyan-500/60 shadow-xs ring-1 ring-cyan-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-cyan-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Active Health Ratio
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Activity className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.healthyRatio}%
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">retained</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                            {kpiStats.total} total members
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">All recorded</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs and View Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 w-max overflow-x-auto custom-scrollbar">
                    {[
                        { id: 'active', label: 'Active Members', count: kpiStats.activeCount, icon: UserCheck },
                        { id: 'expiring', label: 'Expiring Soon', count: kpiStats.expiringCount, icon: AlertTriangle },
                        { id: 'expired', label: 'Expired', count: kpiStats.expiredCount, icon: UserX },
                        { id: 'all', label: 'All Records', count: kpiStats.total, icon: Users }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = filterType === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setFilterType(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
 isActive
 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-2xs'
 : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
 }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span>{tab.label}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
 isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
 }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* View Mode Toggle: Grid Cards vs Data Table */}
                <div className="flex items-center gap-1 self-end sm:self-auto">
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
 viewMode === 'grid'
 ? 'bg-white dark:bg-white/10 text-amber-500 shadow-2xs'
 : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
 }`}
                            title="Grid Cards View"
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('table')}
                            className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
 viewMode === 'table'
 ? 'bg-white dark:bg-white/10 text-amber-500 shadow-2xs'
 : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
 }`}
                            title="Data Table View"
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search member by name, phone or email..."
                            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">
                        {filteredMembers.length} member(s) listed
                    </span>
                </div>
            </div>

            {/* CONTENT AREA: REAL DATA OR CLEAN EMPTY STATE (STRICTLY NO MOCK DATA) */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs text-center">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Synchronizing membership ledger from server...
                    </p>
                </div>
            ) : filteredMembers.length === 0 ? (
                /* ACCURATE EMPTY STATE - NO FABRICATED MOCK DATA */
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-8 border border-slate-200/90 dark:border-white/10 text-center shadow-2xs">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-amber-500/20">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                        No {filterType !== 'all' ? filterType : ''} Members Found
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                        {searchTerm.trim()
                            ? `No members match the query "${searchTerm}". Try adjusting your search.`
                            : `There are currently no ${filterType !== 'all' ? filterType : ''} memberships enrolled in this facility database.`}
                    </p>
                    <button
                        type="button"
                        onClick={() => fetchMembers(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Re-sync Ledger</span>
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                /* GRID CARDS VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {paginatedMembers.map((member) => (
                        <div
                            key={member.id}
                            onClick={() => handleSelectMember(member)}
                            className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between group cursor-pointer"
                        >
                            <div>
                                {/* Header: Avatar & Status */}
                                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                                            {member.photo ? (
                                                <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitial(member.name)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                                                {member.name}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                                                <Phone className="w-2.5 h-2.5 text-slate-400" />
                                                <span>{member.phone}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Validity Pill */}
                                    {member.isExpired ? (
                                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 shrink-0">
                                            Expired
                                        </span>
                                    ) : member.isExpiringSoon ? (
                                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/25 shrink-0 animate-pulse">
                                            {member.remainingDays}d left
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                                            {member.remainingDays}d left
                                        </span>
                                    )}
                                </div>

                                {/* Plan Information */}
                                <div className="mb-2">
                                    <span className="text-[10px] text-slate-400 font-black tracking-wider block mb-0.5">
                                        Current Plan
                                    </span>
                                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                        {member.planName}
                                    </h5>
                                </div>

                                {/* Expiry Info */}
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] space-y-1 mb-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">Expires on:</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">
                                            {new Date(member.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {member.amountDeducted > 0 && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-slate-400 font-medium">Fee Paid:</span>
                                            <span className="font-bold text-amber-500 font-mono">
                                                {formatCurrency(member.amountDeducted)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* View Profile Action */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform">
                                <span className="text-[11px]">View Full Profile</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* DATA TABLE VIEW */
                <div className="rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-1.5 shadow-2xs">
                    <DataTable
                        columns={tableColumns}
                        data={paginatedMembers}
                        loading={loading}
                        emptyMessage="No members match the current filter."
                        onRowClick={(row) => handleSelectMember(row)}
                        pagination={{
                            currentPage: pagination.currentPage,
                            rowsPerPage: pagination.rowsPerPage,
                            totalRecords: pagination.totalRecords,
                            totalPages: pagination.totalPages,
                            onPageChange: pagination.handlePageChange,
                            onRowsPerPageChange: pagination.handleRowsPerPageChange
                        }}
                    />
                </div>
            )}

            {/* Pagination Controls for Grid View */}
            {viewMode === 'grid' && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-[#121622]/60 rounded-xl border border-slate-200/80 dark:border-white/10 text-xs">
                    <span className="text-slate-400">
                        Page {pagination.currentPage} of {pagination.totalPages} ({filteredMembers.length} total)
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => pagination.handlePageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage <= 1}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => pagination.handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* MEMBER INSPECTION DETAILS MODAL */}
            {selectedMember && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedMember(null)}
                >
                    <div
                        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Member Profile & Membership Audit
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    Plan ID: {selectedMember.planId}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMember(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {detailsLoading ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center">
                                <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mb-2" />
                                <span className="text-xs text-slate-400">Loading audit profile...</span>
                            </div>
                        ) : (
                            <div className="py-3 space-y-3 text-xs">
                                {/* Profile Card */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-lg overflow-hidden shrink-0">
                                        {(memberDetails?.photo || selectedMember.photo) ? (
                                            <img 
                                                src={memberDetails?.photo || selectedMember.photo} 
                                                alt={memberDetails?.name || selectedMember.name} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            getInitial(memberDetails?.name || selectedMember.name)
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                                            {memberDetails?.name || selectedMember.name}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                            {selectedMember.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-2.5 h-2.5" />
                                                    <span>{selectedMember.phone}</span>
                                                </span>
                                            )}
                                            {selectedMember.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-2.5 h-2.5" />
                                                    <span>{selectedMember.email}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Membership Plan Specs */}
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-2">
                                    <h4 className="text-[10px] font-black tracking-wider text-slate-400">
                                        Membership Subscription Details
                                    </h4>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {memberDetails?.planName || selectedMember.planName}
                                        </span>
                                        <span className="font-black text-amber-500 font-mono">
                                            {formatCurrency(memberDetails?.amountDeducted || selectedMember.amountDeducted)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
                                        <div>
                                            Status: <strong className=" text-emerald-500">{selectedMember.status}</strong>
                                        </div>
                                        <div>
                                            Remaining: <strong>{selectedMember.remainingDays} Days</strong>
                                        </div>
                                        <div>
                                            Expiry: <strong>{new Date(selectedMember.expiryDate).toLocaleDateString()}</strong>
                                        </div>
                                        <div>
                                            Active Access: <strong>Full Gym Access</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedMember(null)}
                                className="px-4 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientMemberMasterPage;

