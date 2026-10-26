import React, { useMemo } from 'react';
import { 
    Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, 
    Download, Search, Filter, Eye, Check, X, ShieldCheck, 
    CreditCard, Banknote, QrCode, ArrowUpRight, Calendar,
    User, Phone, Mail, FileText, ChevronRight, Sparkles,
    LayoutGrid, Table as TableIcon, Tag, Award, Zap
} from 'lucide-react';
import { DataTable, SearchableSelect } from '@/common';
import { useClientEnrollmentLogic, COMMON_REJECTION_REASONS } from './enrollment.logic';

export const ClientEnrollmentMasterPage = () => {
    const {
        activeTab,
        setActiveTab,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,
        planFilter,
        setPlanFilter,
        methodFilter,
        setMethodFilter,
        loading,
        refreshing,
        actionLoading,
        isDemoMode,
        fetchRequests,
        filteredRequests,
        paginatedRequests,
        kpiStats,
        selectedRequest,
        setSelectedRequest,
        showApproveModal,
        setShowApproveModal,
        showRejectModal,
        setShowRejectModal,
        rejectionReason,
        setRejectionReason,
        customReason,
        setCustomReason,
        handleApprove,
        handleReject,
        handleExportCSV,
        pagination
    } = useClientEnrollmentLogic();

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

    // Format Relative / Short Date
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / (60 * 1000));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    // Columns for DataTable view
    const tableColumns = useMemo(() => [
        {
            key: 'id',
            title: 'Request ID & Reference',
            width: '160px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white font-mono tracking-tight">
                        {row.id}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[130px]">
                        {row.referenceId}
                    </span>
                </div>
            )
        },
        {
            key: 'member',
            title: 'Member Details',
            width: '220px',
            render: (row) => (
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">
                        {getInitial(row.userId?.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {row.userId?.name || 'Walk-in Member'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {row.userId?.email || row.userId?.phone}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'plan',
            title: 'Membership Tier',
            width: '200px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {row.metadata?.planId?.name || 'Standard Plan'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span>{row.metadata?.planId?.validity || 30} days</span>
                        <span>•</span>
                        <span className="text-amber-500 font-semibold">{row.metadata?.planId?.planType || 'General'}</span>
                    </div>
                </div>
            )
        },
        {
            key: 'channel',
            title: 'Channel & Fee',
            width: '150px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-xs text-slate-900 dark:text-white font-mono">
                        {formatCurrency(row.amount)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        {row.paymentMethod === 'upi' ? (
                            <>
                                <QrCode className="w-2.5 h-2.5 text-blue-400" />
                                <span>UPI Scan</span>
                            </>
                        ) : (
                            <>
                                <Banknote className="w-2.5 h-2.5 text-emerald-500" />
                                <span>Cash POS</span>
                            </>
                        )}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Verification Status',
            width: '140px',
            render: (row) => {
                if (row.status === 'approved') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                        </span>
                    );
                }
                if (row.status === 'rejected') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            <XCircle className="w-3 h-3" />
                            Rejected
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider bg-amber-500/15 text-amber-500 border border-amber-500/25 animate-pulse">
                        <Clock className="w-3 h-3" />
                        Pending
                    </span>
                );
            }
        },
        {
            key: 'time',
            title: 'Timestamp',
            width: '120px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {formatTimeAgo(row.createdAt)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            title: 'Quick Actions',
            width: '160px',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    {row.status === 'pending' ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowApproveModal(row)}
                                disabled={actionLoading === row.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/30 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Approve Enrollment"
                            >
                                <Check className="w-3 h-3" />
                                <span>Approve</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(row)}
                                disabled={actionLoading === row.id}
                                className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Reject Request"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => setSelectedRequest(row)}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-all cursor-pointer"
                        title="View Full Details"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        }
    ], [actionLoading]);

    return (
        <div className="space-y-3.5 animate-fade-in select-none pb-6">
            {/* Header Toolbar */}
         

            {/* Top 4 Executive KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Pending Approvals */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Pending Requests
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Clock className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.pendingCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {formatCurrency(kpiStats.pendingAmount)} unverified
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Front desk queue</span>
                    </div>
                </div>

                {/* 2. Total Approved */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Approved Activations
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.approvedCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            {formatCurrency(kpiStats.approvedAmount)} collected
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">100% deposited</span>
                    </div>
                </div>

                {/* 3. Verification Approval Rate */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Approval Rate
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.approvalRate}%
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                            {kpiStats.rejectedCount} rejected / cancelled
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{kpiStats.totalProcessed} processed</span>
                    </div>
                </div>

                {/* 4. Avg Desk Response */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Avg Desk Response
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Zap className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            ~{kpiStats.avgResponseMinutes}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">minutes</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20">
                            Real-time sync
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Optimal speed</span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs and Layout Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Tabs */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 w-max overflow-x-auto custom-scrollbar">
                    {[
                        { id: 'pending', label: 'Pending Verification', count: kpiStats.pendingCount, icon: Clock },
                        { id: 'approved', label: 'Approved & Active', count: kpiStats.approvedCount, icon: CheckCircle2 },
                        { id: 'rejected', label: 'Rejected / Cancelled', count: kpiStats.rejectedCount, icon: XCircle },
                        { id: 'all', label: 'All History', count: kpiStats.pendingCount + kpiStats.approvedCount + kpiStats.rejectedCount, icon: FileText }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
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
                            title="Interactive Cards View"
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
                            title="Compact Data Table View"
                        >
                            <TableIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search member, phone, plan, or TXN ID..."
                            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all"
                        />
                    </div>

                    {/* Plan Filter */}
                    <SearchableSelect
                        options={[
                            { value: 'all', label: 'All Plans' },
                            { value: 'annual', label: 'Annual Tier' },
                            { value: 'half-yearly', label: '6-Months Tier' },
                            { value: 'quarterly', label: 'Quarterly Tier' },
                            { value: 'monthly', label: 'Monthly Tier' }
                        ]}
                        value={planFilter}
                        onChange={(val) => setPlanFilter(val || 'all')}
                        placeholder="Plan Tier"
                        searchPlaceholder="Search tier..."
                        className="w-36"
                    />

                    {/* Payment Mode Filter */}
                    <SearchableSelect
                        options={[
                            { value: 'all', label: 'All Channels' },
                            { value: 'cash', label: 'Cash POS' },
                            { value: 'upi', label: 'UPI & QR' }
                        ]}
                        value={methodFilter}
                        onChange={(val) => setMethodFilter(val || 'all')}
                        placeholder="Channel"
                        searchPlaceholder="Search channel..."
                        className="w-36"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">
                        {filteredRequests.length} request(s) found
                    </span>
                </div>
            </div>

            {/* CONTENT AREA: GRID CARDS OR DATA TABLE */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-8 border border-slate-200/90 dark:border-white/10 text-center shadow-2xs">
                    <div className="w-12 h-12 bg-emerald-500/15 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-emerald-500/20">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                        Queue is All Caught Up!
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        There are currently no {activeTab !== 'all' ? activeTab : ''} requests pending front desk action.
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* INTERACTIVE CARDS GRID */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {paginatedRequests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between group"
                        >
                            <div>
                                {/* Header: Member & Time */}
                                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">
                                            {getInitial(req.userId?.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                                {req.userId?.name || 'Walk-in Member'}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">
                                                {req.userId?.phone || req.userId?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                                        {formatTimeAgo(req.createdAt)}
                                    </span>
                                </div>

                                {/* Plan & Fee Information */}
                                <div className="mb-2.5">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 truncate">
                                            {req.metadata?.planId?.planType || 'Membership'}
                                        </span>
                                        <span className="font-black text-sm text-slate-900 dark:text-white font-mono">
                                            {formatCurrency(req.amount)}
                                        </span>
                                    </div>
                                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                        {req.metadata?.planId?.name}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        Validity: <strong>{req.metadata?.planId?.validity || 30} days</strong> ({req.metadata?.planId?.duration || 1} months)
                                    </p>
                                </div>

                                {/* Channel and Notes Badge */}
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-[10px] space-y-1 mb-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">Channel:</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                            {req.paymentMethod === 'upi' ? (
                                                <>
                                                    <QrCode className="w-2.5 h-2.5 text-blue-400" />
                                                    <span>UPI Soundbox</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Banknote className="w-2.5 h-2.5 text-emerald-500" />
                                                    <span>Cash Counter</span>
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-medium">Ref No:</span>
                                        <span className="font-mono text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                                            {req.referenceId}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                                {req.status === 'pending' ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowApproveModal(req)}
                                            disabled={actionLoading === req.id}
                                            className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-2xs hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                        >
                                            <Check className="w-3.5 h-3.5" />
                                            <span>Approve</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectModal(req)}
                                            disabled={actionLoading === req.id}
                                            className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1"
                                            title="Reject request"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRequest(req)}
                                            className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                                            title="View inspection info"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ) : req.status === 'approved' ? (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Pass Active
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRequest(req)}
                                            className="text-[10px] font-bold text-amber-500 hover:underline cursor-pointer"
                                        >
                                            View Audit
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Cancelled
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRequest(req)}
                                            className="text-[10px] font-bold text-slate-400 hover:text-slate-200 cursor-pointer"
                                        >
                                            View Reason
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* DATA TABLE VIEW */
                <div className="rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-1.5 shadow-2xs">
                    <DataTable
                        columns={tableColumns}
                        data={paginatedRequests}
                        loading={loading}
                        emptyMessage="No enrollment requests found."
                        onRowClick={(row) => setSelectedRequest(row)}
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
                        Page {pagination.currentPage} of {pagination.totalPages} ({filteredRequests.length} total)
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

            {/* MODAL 1: APPROVAL CONFIRMATION */}
            {showApproveModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setShowApproveModal(null)}
                >
                    <div
                        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                                <Check className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Confirm Pass Activation
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Verifying payment receipt for {showApproveModal.userId?.name}
                            </p>
                        </div>

                        <div className="py-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Member:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{showApproveModal.userId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Plan Tier:</span>
                                <span className="font-bold text-amber-500">{showApproveModal.metadata?.planId?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Validity Period:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{showApproveModal.metadata?.planId?.validity} Days</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Payment Channel:</span>
                                <span className="font-bold text-slate-900 dark:text-white ">{showApproveModal.paymentMethod}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-sm">
                                <span className="font-black text-slate-900 dark:text-white">Amount Confirmed:</span>
                                <span className="font-black text-emerald-500 text-base">{formatCurrency(showApproveModal.amount)}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowApproveModal(null)}
                                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApprove(showApproveModal)}
                                disabled={actionLoading === showApproveModal.id}
                                className="flex-1 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-2xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                {actionLoading === showApproveModal.id ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Activating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Confirm & Activate</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: REJECTION WITH REASON */}
            {showRejectModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setShowRejectModal(null)}
                >
                    <div
                        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                                <X className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Reject Enrollment Request
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Please specify the reason for rejecting request #{showRejectModal.id}
                            </p>
                        </div>

                        <div className="py-3 space-y-2.5 text-xs">
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Primary Reason
                                </label>
                                <SearchableSelect
                                    options={COMMON_REJECTION_REASONS.map(r => ({ value: r, label: r }))}
                                    value={rejectionReason}
                                    onChange={(val) => setRejectionReason(val)}
                                    placeholder="Select reason..."
                                    searchPlaceholder="Search reason..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Additional Remarks (Optional)
                                </label>
                                <textarea
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    placeholder="Enter additional clarification for the member..."
                                    rows="2"
                                    className="w-full p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-rose-500 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRejectModal(null);
                                    setCustomReason('');
                                }}
                                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading === showRejectModal.id}
                                className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-2xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                {actionLoading === showRejectModal.id ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Rejecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <X className="w-3.5 h-3.5" />
                                        <span>Confirm Rejection</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: FULL DETAILS INSPECTION */}
            {selectedRequest && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedRequest(null)}
                >
                    <div
                        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Enrollment Request Inspection
                                </h3>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {selectedRequest.id} • {selectedRequest.referenceId}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="py-3 space-y-3 text-xs">
                            {/* Member Card */}
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <h4 className="text-[10px] font-black tracking-wider text-slate-400 mb-1.5">
                                    Member Profile
                                </h4>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-xs">
                                        {getInitial(selectedRequest.userId?.name)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {selectedRequest.userId?.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                            {selectedRequest.userId?.email} • {selectedRequest.userId?.phone}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Card */}
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 space-y-1.5">
                                <h4 className="text-[10px] font-black tracking-wider text-slate-400">
                                    Selected Membership Plan
                                </h4>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-900 dark:text-white">
                                        {selectedRequest.metadata?.planId?.name}
                                    </span>
                                    <span className="font-black text-amber-500 font-mono">
                                        {formatCurrency(selectedRequest.amount)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/5">
                                    <div>Tier: <strong>{selectedRequest.metadata?.planId?.planType}</strong></div>
                                    <div>Validity: <strong>{selectedRequest.metadata?.planId?.validity} Days</strong></div>
                                    <div>Channel: <strong className="">{selectedRequest.paymentMethod}</strong></div>
                                    <div>Status: <strong className="">{selectedRequest.status}</strong></div>
                                </div>
                            </div>

                            {/* Verification Notes */}
                            {selectedRequest.rejectionReason && (
                                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                                    <strong className="block text-[10px] font-black text-rose-500 mb-0.5">Rejection Reason:</strong>
                                    {selectedRequest.rejectionReason}
                                </div>
                            )}

                            {selectedRequest.metadata?.notes && (
                                <div className="text-[10px] text-slate-400 italic">
                                    Desk Note: {selectedRequest.metadata.notes}
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedRequest(null)}
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

export default ClientEnrollmentMasterPage;

