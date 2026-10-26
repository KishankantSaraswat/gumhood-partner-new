import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/common/utils/api';

/**
 * Filter Tab definitions for Transactions
 */
export const TRANSACTION_TABS = [
    { id: 'all', label: 'All Transactions' },
    { id: 'credit', label: 'Credits (Inflow)' },
    { id: 'debit', label: 'Debits (Payouts)' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' }
];

/**
 * Safe Transaction Object Normalizer
 */
export const normalizeTransaction = (t) => {
    if (!t) return null;
    const amountVal = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount) || 0;
    const typeVal = (t.type || '').toLowerCase() === 'debit' ? 'Debit' : 'Credit';

    return {
        id: t._id || t.id || `txn_${Date.now()}`,
        rawId: t._id || t.id || '',
        amount: Math.abs(amountVal),
        type: typeVal,
        reason: t.reason || t.description || (typeVal === 'Credit' ? 'Member Enrollment Record' : 'Payout Settlement'),
        razorpayOrderId: t.razorpayOrderId || t.orderId || t.paymentId || '',
        status: t.status || 'Completed',
        createdAt: t.createdAt || t.date || new Date().toISOString(),
        paymentMode: t.paymentMode || t.mode || (t.razorpayOrderId ? 'Online / Razorpay' : 'Direct Transfer'),
        metadata: t.metadata || {},
        user: t.user || t.userId || null,
        gymId: t.gymId || t.gym_id || null
    };
};

/**
 * Custom Hook: useClientTransactionLogic
 * Strictly manages live transaction records from backend without fabricated mock items.
 */
export const useClientTransactionLogic = ({ gym }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Filter, Search, and Pagination States
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('date'); // 'date' | 'amount'
    const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 12;

    // Modals
    const [selectedTxn, setSelectedTxn] = useState(null);
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Fetch transactions strictly from real backend
    const fetchTransactions = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const res = await api.get('/gymdb/api/transactions');
            if (res && res.success && Array.isArray(res.data)) {
                const normalized = res.data.map(normalizeTransaction).filter(Boolean);
                setTransactions(normalized);
            } else if (Array.isArray(res?.data?.transactions)) {
                const normalized = res.data.transactions.map(normalizeTransaction).filter(Boolean);
                setTransactions(normalized);
            } else if (Array.isArray(res)) {
                const normalized = res.map(normalizeTransaction).filter(Boolean);
                setTransactions(normalized);
            } else {
                // If backend returns empty object or non-array, keep real empty state
                setTransactions([]);
            }
        } catch (err) {
            console.error('Error fetching transactions:', err);
            setError(err?.message || 'Unable to retrieve transaction history. Please try again.');
            setTransactions([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions, gym?.id]);

    // Financial KPI Calculations
    const kpiStats = useMemo(() => {
        let totalCredit = 0;
        let totalDebit = 0;
        let completedCount = 0;
        let pendingCount = 0;

        transactions.forEach(t => {
            if (t.type === 'Credit') {
                totalCredit += t.amount;
            } else {
                totalDebit += t.amount;
            }

            if ((t.status || '').toLowerCase() === 'completed') {
                completedCount += 1;
            } else {
                pendingCount += 1;
            }
        });

        const netBalance = totalCredit - totalDebit;

        return {
            netBalance,
            totalCredit,
            totalDebit,
            totalCount: transactions.length,
            completedCount,
            pendingCount
        };
    }, [transactions]);

    // Filtered and Sorted Transaction list
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Tab filter
            if (activeTab === 'credit' && t.type !== 'Credit') return false;
            if (activeTab === 'debit' && t.type !== 'Debit') return false;
            if (activeTab === 'completed' && (t.status || '').toLowerCase() !== 'completed') return false;
            if (activeTab === 'pending' && (t.status || '').toLowerCase() === 'completed') return false;

            // Search query filter
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const reasonMatch = (t.reason || '').toLowerCase().includes(q);
                const orderMatch = (t.razorpayOrderId || '').toLowerCase().includes(q);
                const idMatch = (t.id || '').toLowerCase().includes(q);
                const amountMatch = t.amount.toString().includes(q);
                const statusMatch = (t.status || '').toLowerCase().includes(q);
                const modeMatch = (t.paymentMode || '').toLowerCase().includes(q);
                if (!reasonMatch && !orderMatch && !idMatch && !amountMatch && !statusMatch && !modeMatch) {
                    return false;
                }
            }

            return true;
        }).sort((a, b) => {
            if (sortKey === 'amount') {
                return sortDirection === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            // Default sort by date
            const dateA = new Date(a.createdAt).getTime() || 0;
            const dateB = new Date(b.createdAt).getTime() || 0;
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [transactions, activeTab, searchTerm, sortKey, sortDirection]);

    // Pagination slice
    const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(startIndex, startIndex + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    // Reset pagination on filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm, sortKey, sortDirection]);

    // Copy ID helper
    const handleCopyId = (id) => {
        if (!id) return;
        navigator.clipboard?.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // CSV Export
    const handleExportCSV = () => {
        if (!filteredTransactions.length) return;

        const headers = ['Date', 'Transaction ID', 'Order Reference', 'Type', 'Reason', 'Payment Mode', 'Status', 'Amount (INR)'];
        const rows = filteredTransactions.map(t => [
            `"${new Date(t.createdAt).toLocaleString('en-IN')}"`,
            `"${t.id}"`,
            `"${t.razorpayOrderId || '-'}"`,
            `"${t.type}"`,
            `"${(t.reason || '').replace(/"/g, '""')}"`,
            `"${t.paymentMode || 'Online'}"`,
            `"${t.status}"`,
            t.amount
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Transaction_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        transactions,
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
        pageSize,
        selectedTxn,
        setSelectedTxn,
        showSupportModal,
        setShowSupportModal,
        copiedId,
        handleCopyId,
        fetchTransactions,
        handleExportCSV
    };
};

