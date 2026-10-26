import React from 'react';
import { 
    Wallet, ArrowDownLeft, ArrowUpRight, Receipt, RefreshCw, Download, 
    Search, ExternalLink, Mail, MessageCircle, Copy, Check, Eye, 
    X, AlertCircle, ShieldCheck, Landmark, Clock, ArrowUpDown, ChevronLeft, 
    ChevronRight, CreditCard, Sparkles, HelpCircle
} from 'lucide-react';
import { useClientTransactionLogic, TRANSACTION_TABS } from './transaction.logic';

export const ClientTransactionMasterPage = ({ gym }) => {
    const {
        loading,
        refreshing,
        error,
        kpiStats,
        filteredTransactions,
        paginatedTransactions,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        sortKey,
        setSortKey,
        sortDirection,
        setSortDirection,
        currentPage,
        setCurrentPage,
        totalPages,
        selectedTxn,
        setSelectedTxn,
        showSupportModal,
        setShowSupportModal,
        copiedId,
        handleCopyId,
        fetchTransactions,
        handleExportCSV
    } = useClientTransactionLogic({ gym });

    // Format Date & Time
    const formatDateTime = (dateStr) => {
        if (!dateStr) return { date: '-', time: '-' };
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return { date: '-', time: '-' };
        return {
            date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    };

    return (
        <div className="space-y-3.5 animate-fade-in select-none pb-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs">
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Transaction History</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold tracking-widest border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Ledger
                        </span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Real-time ledger of member payments, subscriptions, settlements, and payout transactions
                    </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowSupportModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer"
                        title="Contact Support or Update Bank Details"
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Support Desk</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchTransactions(true)}
                        disabled={refreshing || loading}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
                        title="Refresh Transactions"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCSV}
                        disabled={filteredTransactions.length === 0}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:border-amber-500/40 hover:text-amber-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Export ledger as CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>{error}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => fetchTransactions(true)}
                        className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* 4 Compact Financial KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Net Wallet Balance */}
                <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                                Wallet Balance
                            </span>
                            <h3 className={`text-xl sm:text-2xl font-black mt-1 tracking-tight ${
 kpiStats.netBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'
 }`}>
                                ₹{kpiStats.netBalance.toLocaleString('en-IN')}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                                    <Sparkles className="w-2.5 h-2.5" /> Net Balance
                                </span>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* 2. Total Inflow (Credits) */}
                <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                                Gross Credits
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                                +₹{kpiStats.totalCredit.toLocaleString('en-IN')}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-0.5">
                                    <ArrowDownLeft className="w-2.5 h-2.5" /> Inflow
                                </span>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                            <ArrowDownLeft className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* 3. Total Debits / Settlements */}
                <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                                Total Payouts
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-rose-500 mt-1 tracking-tight">
                                -₹{kpiStats.totalDebit.toLocaleString('en-IN')}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-2.5 h-2.5" /> Debits
                                </span>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                        </div>
                    </div>
                </div>

                {/* 4. Total Count */}
                <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md p-3.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs relative overflow-hidden group">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">
                                Logged Entries
                            </span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
                                {kpiStats.totalCount}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                                    {kpiStats.completedCount} completed
                                </span>
                            </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                            <Receipt className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Support Desk Strip - Compact Modern SaaS Design */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>Settlement Desk & Banking Support</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 ">
                                Verified
                            </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Need payout assistance, remittance details, or update your registered bank account?
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
                    <button
                        type="button"
                        onClick={() => window.location.href = 'mailto:admin@gymshood.com?subject=Settlement%20and%20Ledger%20Inquiry'}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-slate-50 text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-white/10 shadow-2xs transition-all cursor-pointer"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Admin</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => window.open('https://api.whatsapp.com/send?phone=917023340058&text=Hi%20GymsHood%20Team%2C%20I%20have%20an%20inquiry%20regarding%20my%20transactions', '_blank')}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                    </button>
                </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md p-3 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {TRANSACTION_TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            let count = 0;
                            if (tab.id === 'all') count = kpiStats.totalCount;
                            else if (tab.id === 'credit') count = kpiStats.totalCredit > 0 ? filteredTransactions.filter(t => t.type === 'Credit').length : 0;
                            else if (tab.id === 'debit') count = kpiStats.totalDebit > 0 ? filteredTransactions.filter(t => t.type === 'Debit').length : 0;
                            else if (tab.id === 'completed') count = kpiStats.completedCount;
                            else if (tab.id === 'pending') count = kpiStats.pendingCount;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
 isActive
 ? 'bg-amber-500 text-slate-950 shadow-2xs font-black'
 : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
 }`}
                                >
                                    <span>{tab.label}</span>
                                    {isActive && count > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950/20 text-slate-950 font-black">
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search & Sort Controls */}
                    <div className="flex items-center gap-2">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-64">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by reason, order ID..."
                                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Sort Toggle */}
                        <button
                            type="button"
                            onClick={() => {
                                if (sortKey === 'date') {
                                    setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
                                } else {
                                    setSortKey('date');
                                    setSortDirection('desc');
                                }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold hover:border-amber-500/40 transition-all cursor-pointer shrink-0"
                            title="Toggle date sort direction"
                        >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{sortDirection === 'desc' ? 'Newest' : 'Oldest'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Ledger DataTable */}
            <div className="bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400">
                                <th className="px-3.5 py-2.5">Transaction & Reason</th>
                                <th className="px-3.5 py-2.5">Date & Time</th>
                                <th className="px-3.5 py-2.5">Reference / Order ID</th>
                                <th className="px-3.5 py-2.5">Status</th>
                                <th className="px-3.5 py-2.5 text-right">Amount</th>
                                <th className="px-3.5 py-2.5 text-center">Receipt</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
                                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                                Loading real-time ledger...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map((txn) => {
                                    const isCredit = txn.type === 'Credit';
                                    const { date, time } = formatDateTime(txn.createdAt);
                                    const statusLower = (txn.status || '').toLowerCase();
                                    const isCompleted = statusLower === 'completed' || statusLower === 'success';

                                    return (
                                        <tr 
                                            key={txn.id} 
                                            className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                            onClick={() => setSelectedTxn(txn)}
                                        >
                                            {/* Details & Reason */}
                                            <td className="px-3.5 py-2.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
 isCredit 
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
 : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
 }`}>
                                                        {isCredit ? (
                                                            <ArrowDownLeft className="w-4 h-4" />
                                                        ) : (
                                                            <ArrowUpRight className="w-4 h-4" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-extrabold text-slate-900 dark:text-white leading-tight">
                                                            {txn.reason}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 font-bold tracking-wider">
                                                            {txn.paymentMode}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Date & Time */}
                                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                <p className="font-bold text-slate-700 dark:text-slate-200">
                                                    {date}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-semibold">
                                                    {time}
                                                </p>
                                            </td>

                                            {/* Reference / Order ID */}
                                            <td className="px-3.5 py-2.5">
                                                {txn.razorpayOrderId ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">
                                                            {txn.razorpayOrderId}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCopyId(txn.razorpayOrderId);
                                                            }}
                                                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                                                            title="Copy Order ID"
                                                        >
                                                            {copiedId === txn.razorpayOrderId ? (
                                                                <Check className="w-3 h-3 text-emerald-500" />
                                                            ) : (
                                                                <Copy className="w-3 h-3" />
                                                            )}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="font-mono text-[10px] text-slate-400">
                                                        {txn.id?.substring(0, 14)}...
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border ${
 isCompleted
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
 : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
 }`}>
                                                    <span className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                    {txn.status}
                                                </span>
                                            </td>

                                            {/* Amount */}
                                            <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                                                <span className={`text-sm font-black tracking-tight ${
 isCredit 
 ? 'text-emerald-600 dark:text-emerald-400' 
 : 'text-rose-500'
 }`}>
                                                    {isCredit ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3.5 py-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTxn(txn);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-500 text-slate-500 dark:text-slate-400 transition-all cursor-pointer"
                                                    title="View Transaction Slip"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                /* Clean Empty State (Strictly 0 records, NO mock data) */
                                <tr>
                                    <td colSpan="6" className="py-14 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400">
                                                <Receipt className="w-6 h-6 stroke-[1.5]" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                                                    No Transactions Found
                                                </h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                                    {searchTerm || activeTab !== 'all'
                                                        ? 'No records match your selected filter or search term.'
                                                        : 'No transaction entries have been recorded for this facility yet.'}
                                                </p>
                                            </div>
                                            {(searchTerm || activeTab !== 'all') && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveTab('all');
                                                        setSearchTerm('');
                                                    }}
                                                    className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                                                >
                                                    Reset Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Toolbar */}
                {totalPages > 1 && (
                    <div className="px-3.5 py-2.5 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                        <span>
                            Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, filteredTransactions.length)} of {filteredTransactions.length} entries
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:text-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 font-mono text-[11px] text-slate-800 dark:text-slate-200">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:text-amber-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Transaction Receipt / Details Modal */}
            {selectedTxn && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
                    onClick={() => setSelectedTxn(null)}
                >
                    <div 
                        className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-md w-full overflow-hidden animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Receipt Top Header */}
                        <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Receipt className="w-4 h-4 text-amber-500" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Transaction Voucher
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedTxn(null)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Receipt Body */}
                        <div className="p-5 space-y-4">
                            {/* Big Amount Badge */}
                            <div className="text-center py-2">
                                <span className="text-[10px] font-black tracking-widest text-slate-400">
                                    Total Amount
                                </span>
                                <h2 className={`text-3xl font-black mt-0.5 tracking-tight ${
 selectedTxn.type === 'Credit' ? 'text-emerald-500' : 'text-rose-500'
 }`}>
                                    {selectedTxn.type === 'Credit' ? '+' : '-'}₹{selectedTxn.amount.toLocaleString('en-IN')}
                                </h2>
                                <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider border ${
 (selectedTxn.status || '').toLowerCase() === 'completed'
 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
 : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
 }`}>
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                    {selectedTxn.status}
                                </span>
                            </div>

                            <div className="border-t border-b border-dashed border-slate-200 dark:border-white/10 py-3 space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Transaction Type</span>
                                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                        {selectedTxn.type === 'Credit' ? 'Credit (Inflow)' : 'Debit (Payout)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Reason / Purpose</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-right max-w-[200px] truncate">
                                        {selectedTxn.reason}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Date & Time</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {new Date(selectedTxn.createdAt).toLocaleString('en-IN')}
                                    </span>
                                </div>
                                {selectedTxn.razorpayOrderId && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 font-bold">Order ID</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                                {selectedTxn.razorpayOrderId}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyId(selectedTxn.razorpayOrderId)}
                                                className="p-0.5 text-slate-400 hover:text-amber-500"
                                            >
                                                {copiedId === selectedTxn.razorpayOrderId ? (
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                ) : (
                                                    <Copy className="w-3 h-3" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Payment Mode</span>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">
                                        {selectedTxn.paymentMode}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-400 font-bold">Internal Reference</span>
                                    <span className="font-mono text-[10px] text-slate-500">
                                        {selectedTxn.id}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleCopyId(selectedTxn.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                    {copiedId === selectedTxn.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>Copy Txn ID</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTxn(null)}
                                    className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Support Desk & Settlement Info Modal */}
            {showSupportModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowSupportModal(false)}
                >
                    <div 
                        className="bg-white dark:bg-[#121622] rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl max-w-lg w-full overflow-hidden animate-modal-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Landmark className="w-4 h-4 text-indigo-500" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                    Settlement & Support Helpdesk
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSupportModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 text-xs">
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                For inquiries concerning payout cycles, bank transfers, enrollment revenue settlements, or to update your bank account information, contact our partner operations team directly:
                            </p>

                            <div className="space-y-2.5">
                                {/* Email support */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900 dark:text-white">Email Partner Support</p>
                                            <p className="text-[11px] text-slate-400 font-mono">admin@gymshood.com</p>
                                        </div>
                                    </div>
                                    <a
                                        href="mailto:admin@gymshood.com?subject=Partner%20Settlement%20Request"
                                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
                                    >
                                        Send Email
                                    </a>
                                </div>

                                {/* WhatsApp support */}
                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                                            <MessageCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-slate-900 dark:text-white">WhatsApp Direct Helpdesk</p>
                                            <p className="text-[11px] text-slate-400 font-mono">+91 70233 40058</p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://api.whatsapp.com/send?phone=917023340058"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                                    >
                                        Message
                                    </a>
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium leading-relaxed">
                                <strong>Note:</strong> Payout settlements are initiated according to your facility's contracted payout schedule. Please ensure your IFSC and bank account number are up-to-date to prevent settlement holdbacks.
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowSupportModal(false)}
                                    className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-300 dark:hover:bg-white/20 transition-all cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientTransactionMasterPage;

