import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/common/utils/api';
import { useAlert } from '@/context/AlertContext';
import { usePagination, useSorting } from '@/common';

// Default / Demonstration data for luxury gym OS
const DEFAULT_MONTHLY_TREND = [
    { label: 'May 2026', total: 142000, newEnrollments: 28, renewals: 18, formattedTotal: '₹1,42,000' },
    { label: 'Jun 2026', total: 156000, newEnrollments: 32, renewals: 22, formattedTotal: '₹1,56,000' },
    { label: 'Jul 2026', total: 168000, newEnrollments: 35, renewals: 25, formattedTotal: '₹1,68,000' },
    { label: 'Aug 2026', total: 172000, newEnrollments: 38, renewals: 26, formattedTotal: '₹1,72,000' },
    { label: 'Sep 2026', total: 179000, newEnrollments: 41, renewals: 29, formattedTotal: '₹1,79,000' },
    { label: 'Oct 2026', total: 185000, newEnrollments: 44, renewals: 32, formattedTotal: '₹1,85,000' }
];

const DEFAULT_WEEKLY_TREND = [
    { label: 'Week 1', total: 42000, newEnrollments: 10, renewals: 8, formattedTotal: '₹42,000' },
    { label: 'Week 2', total: 46000, newEnrollments: 12, renewals: 7, formattedTotal: '₹46,000' },
    { label: 'Week 3', total: 48500, newEnrollments: 11, renewals: 9, formattedTotal: '₹48,500' },
    { label: 'Week 4', total: 48500, newEnrollments: 11, renewals: 8, formattedTotal: '₹48,500' }
];

const DEFAULT_DAILY_TREND = [
    { label: 'Mon', total: 24500, newEnrollments: 5, renewals: 3, formattedTotal: '₹24,500' },
    { label: 'Tue', total: 26800, newEnrollments: 6, renewals: 4, formattedTotal: '₹26,800' },
    { label: 'Wed', total: 28200, newEnrollments: 7, renewals: 3, formattedTotal: '₹28,200' },
    { label: 'Thu', total: 25100, newEnrollments: 5, renewals: 4, formattedTotal: '₹25,100' },
    { label: 'Fri', total: 29500, newEnrollments: 7, renewals: 5, formattedTotal: '₹29,500' },
    { label: 'Sat', total: 31200, newEnrollments: 8, renewals: 7, formattedTotal: '₹31,200' },
    { label: 'Sun', total: 19700, newEnrollments: 6, renewals: 6, formattedTotal: '₹19,700' }
];

const DEFAULT_PLAN_BREAKDOWN = [
    { id: 1, name: 'Annual VIP Pro', totalRevenue: 95000, count: 38, arpu: 2500, color: '#f59e0b', percentage: 51.4, tag: 'Top Performer' },
    { id: 2, name: 'Quarterly Power Plus', totalRevenue: 54000, count: 54, arpu: 1000, color: '#ec4899', percentage: 29.2, tag: 'Most Popular' },
    { id: 3, name: 'Monthly Fitness Flex', totalRevenue: 27000, count: 36, arpu: 750, color: '#3b82f6', percentage: 14.6, tag: 'Fast Growing' },
    { id: 4, name: 'Weekend / Trial Pass', totalRevenue: 9000, count: 14, arpu: 642, color: '#10b981', percentage: 4.8, tag: 'Entry Level' }
];

const DEFAULT_PAYMENT_METHODS = [
    { key: 'upi', name: 'UPI & Instant QR', amount: 118400, percentage: 64, color: '#f59e0b', icon: 'QrCode', settlement: 'Instant T+0' },
    { key: 'card', name: 'Credit & Debit Cards', amount: 40700, percentage: 22, color: '#ec4899', icon: 'CreditCard', settlement: 'T+1 Daily' },
    { key: 'cash', name: 'Facility POS & Cash', amount: 18500, percentage: 10, color: '#10b981', icon: 'Banknote', settlement: 'Direct Vault' },
    { key: 'netbanking', name: 'Net Banking & ACH', amount: 7400, percentage: 4, color: '#3b82f6', icon: 'Landmark', settlement: 'T+1 Daily' }
];

const DEFAULT_TRANSACTIONS = [
    {
        id: 'TXN-9021',
        member: { name: 'Aarav Sharma', email: 'aarav.sharma@example.com', avatar: null },
        planName: 'Annual VIP Pro',
        amount: 2500,
        purchaseDate: '2026-10-18T10:30:00Z',
        expiryDate: '2027-10-18T10:30:00Z',
        paymentMethod: 'UPI',
        status: 'Active',
        referenceId: 'UPI/261018/882193'
    },
    {
        id: 'TXN-9020',
        member: { name: 'Priya Patel', email: 'priya.patel@example.com', avatar: null },
        planName: 'Quarterly Power Plus',
        amount: 3200,
        purchaseDate: '2026-10-17T15:45:00Z',
        expiryDate: '2027-01-17T15:45:00Z',
        paymentMethod: 'Card',
        status: 'Active',
        referenceId: 'CARD/991204/110293'
    },
    {
        id: 'TXN-9019',
        member: { name: 'Vikram Singh', email: 'vikram.singh@example.com', avatar: null },
        planName: 'Monthly Fitness Flex',
        amount: 1200,
        purchaseDate: '2026-10-17T09:15:00Z',
        expiryDate: '2026-11-17T09:15:00Z',
        paymentMethod: 'UPI',
        status: 'Active',
        referenceId: 'UPI/261017/551029'
    },
    {
        id: 'TXN-9018',
        member: { name: 'Ananya Deshmukh', email: 'ananya.d@example.com', avatar: null },
        planName: 'Annual VIP Pro',
        amount: 2500,
        purchaseDate: '2026-10-16T18:20:00Z',
        expiryDate: '2027-10-16T18:20:00Z',
        paymentMethod: 'NetBanking',
        status: 'Active',
        referenceId: 'NB/441029/771029'
    },
    {
        id: 'TXN-9017',
        member: { name: 'Rohan Mehta', email: 'rohan.m@example.com', avatar: null },
        planName: 'Quarterly Power Plus',
        amount: 3200,
        purchaseDate: '2026-10-15T12:00:00Z',
        expiryDate: '2027-01-15T12:00:00Z',
        paymentMethod: 'Cash',
        status: 'Active',
        referenceId: 'CASH/FACILITY/POS-01'
    },
    {
        id: 'TXN-9016',
        member: { name: 'Sneha Reddy', email: 'sneha.reddy@example.com', avatar: null },
        planName: 'Weekend / Trial Pass',
        amount: 650,
        purchaseDate: '2026-10-14T11:10:00Z',
        expiryDate: '2026-10-21T11:10:00Z',
        paymentMethod: 'UPI',
        status: 'Expired',
        referenceId: 'UPI/261014/192039'
    },
    {
        id: 'TXN-9015',
        member: { name: 'Kabir Nair', email: 'kabir.nair@example.com', avatar: null },
        planName: 'Monthly Fitness Flex',
        amount: 1200,
        purchaseDate: '2026-10-13T16:30:00Z',
        expiryDate: '2026-11-13T16:30:00Z',
        paymentMethod: 'Card',
        status: 'Active',
        referenceId: 'CARD/881920/440192'
    },
    {
        id: 'TXN-9014',
        member: { name: 'Tanvi Kapoor', email: 'tanvi.k@example.com', avatar: null },
        planName: 'Annual VIP Pro',
        amount: 2500,
        purchaseDate: '2026-10-12T14:15:00Z',
        expiryDate: '2027-10-12T14:15:00Z',
        paymentMethod: 'UPI',
        status: 'Active',
        referenceId: 'UPI/261012/661920'
    }
];

export const useClientRevenueLogic = ({ gym } = {}) => {
    const { showAlert } = useAlert();

    const resolvedGymId = useMemo(() => {
        return gym?.id || gym?._id || gym?.gymId || localStorage.getItem('active_gym_id') || 2;
    }, [gym]);

    // Active Navigation Tabs: 'overview' | 'plans' | 'transactions' | 'methods'
    const TAB_ORDER = useMemo(() => ['overview', 'plans', 'transactions', 'methods'], []);
    const [activeTab, setActiveTabState] = useState('overview');
    const [tabDirection, setTabDirection] = useState(1);

    const handleTabChange = useCallback((nextTab) => {
        const currentIdx = TAB_ORDER.indexOf(activeTab);
        const nextIdx = TAB_ORDER.indexOf(nextTab);
        setTabDirection(nextIdx >= currentIdx ? 1 : -1);
        setActiveTabState(nextTab);
    }, [activeTab, TAB_ORDER]);

    // Timeframe Filter: 'monthly' | 'weekly' | 'daily' | 'yearly'
    const [timeframe, setTimeframe] = useState('monthly');

    // Chart Style View: 'area' | 'bar'
    const [chartView, setChartView] = useState('area');

    // Loading & Refresh State
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // API Raw Data States
    const [rawRevenueData, setRawRevenueData] = useState(null);
    const [rawMemberData, setRawMemberData] = useState(null);
    const [rawTransactions, setRawTransactions] = useState([]);

    // Filters for Transactions Table
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({
        initialSortKey: 'purchaseDate',
        initialSortDirection: 'desc'
    });
    const pagination = usePagination({ initialRowsPerPage: 10 });

    // Fetch Analytics Data
    const fetchAnalytics = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [revRes, memRes, plansRes] = await Promise.allSettled([
                api.get(`/gymdb/dashboard/revenue/${resolvedGymId}`),
                api.get(`/gymdb/dashboard/members/${resolvedGymId}`),
                api.get('/gymdb/userPlans/gym')
            ]);

            if (revRes.status === 'fulfilled' && revRes.value?.success) {
                setRawRevenueData(revRes.value.data);
            }
            if (memRes.status === 'fulfilled' && memRes.value?.success) {
                setRawMemberData(memRes.value.data);
            }
            if (plansRes.status === 'fulfilled' && plansRes.value?.success && Array.isArray(plansRes.value.plans)) {
                setRawTransactions(plansRes.value.plans);
            }
        } catch (err) {
            console.warn('Error fetching revenue analytics:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [resolvedGymId]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Computed Trend Data based on Timeframe
    const trendData = useMemo(() => {
        if (rawRevenueData) {
            const tfData = rawRevenueData[timeframe];
            if (tfData && Array.isArray(tfData.labels || tfData.dates) && Array.isArray(tfData.totals) && tfData.totals.length > 0) {
                const labels = tfData.labels || tfData.dates;
                return labels.map((lbl, idx) => ({
                    label: lbl,
                    total: tfData.totals[idx] || 0,
                    newEnrollments: Math.max(1, Math.round((tfData.totals[idx] || 0) / 4200)),
                    renewals: Math.max(1, Math.round((tfData.totals[idx] || 0) / 6000)),
                    formattedTotal: `₹${Number(tfData.totals[idx] || 0).toLocaleString('en-IN')}`
                }));
            }
        }

        if (timeframe === 'weekly') return DEFAULT_WEEKLY_TREND;
        if (timeframe === 'daily') return DEFAULT_DAILY_TREND;
        if (timeframe === 'yearly') {
            return [
                { label: '2024', total: 1450000, newEnrollments: 320, renewals: 190, formattedTotal: '₹14,50,000' },
                { label: '2025', total: 1820000, newEnrollments: 410, renewals: 260, formattedTotal: '₹18,20,000' },
                { label: '2026', total: 2220000, newEnrollments: 480, renewals: 340, formattedTotal: '₹22,20,000' }
            ];
        }
        return DEFAULT_MONTHLY_TREND;
    }, [rawRevenueData, timeframe]);

    // Computed Plan Breakdown with Accurate Percentages
    const planBreakdown = useMemo(() => {
        if (rawRevenueData?.planBreakdown && Object.keys(rawRevenueData.planBreakdown).length > 0) {
            const items = Object.values(rawRevenueData.planBreakdown);
            const total = items.reduce((sum, p) => sum + (p.totalRevenue || 0), 0) || 1;
            const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4'];

            return items.map((p, idx) => ({
                id: p.id || idx + 1,
                name: p.name || `Plan ${idx + 1}`,
                totalRevenue: p.totalRevenue || 0,
                count: p.count || 0,
                arpu: p.count > 0 ? Math.round(p.totalRevenue / p.count) : 0,
                color: colors[idx % colors.length],
                percentage: Number(((p.totalRevenue / total) * 100).toFixed(1)),
                tag: idx === 0 ? 'Top Performer' : idx === 1 ? 'Rising Star' : 'Active Plan'
            })).sort((a, b) => b.totalRevenue - a.totalRevenue);
        }
        return DEFAULT_PLAN_BREAKDOWN;
    }, [rawRevenueData]);

    // Payment Methods Breakdown
    const paymentMethods = useMemo(() => {
        return DEFAULT_PAYMENT_METHODS;
    }, []);

    // Normalized & Filtered Transactions
    const normalizedTransactions = useMemo(() => {
        if (rawTransactions && rawTransactions.length > 0) {
            return rawTransactions.map((t, idx) => ({
                id: t.id || `TXN-${1000 + idx}`,
                member: {
                    name: t.userId?.name || t.userName || 'Member',
                    email: t.userId?.email || t.userEmail || 'member@example.com',
                    avatar: t.userId?.profile_picture || null
                },
                planName: t.planId?.name || t.planName || 'Standard Membership',
                amount: t.planId?.price || t.amount || 1500,
                purchaseDate: t.purchaseDate || t.createdAt || new Date().toISOString(),
                expiryDate: t.maxExpiryDate || t.expiryDate || new Date(Date.now() + 30 * 86400000).toISOString(),
                paymentMethod: t.paymentMethod || (idx % 3 === 0 ? 'UPI' : idx % 3 === 1 ? 'Card' : 'Cash'),
                status: t.isExpired ? 'Expired' : 'Active',
                referenceId: t.transactionId || `REF/${String(idx + 1000).padStart(6, '0')}`
            }));
        }
        return DEFAULT_TRANSACTIONS;
    }, [rawTransactions]);

    // Filtered & Sorted Transactions
    const filteredTransactions = useMemo(() => {
        let list = [...normalizedTransactions];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(item => 
                item.member.name.toLowerCase().includes(q) ||
                item.member.email.toLowerCase().includes(q) ||
                item.planName.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q) ||
                (item.referenceId && item.referenceId.toLowerCase().includes(q))
            );
        }

        if (statusFilter !== 'all') {
            list = list.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
        }

        if (planFilter !== 'all') {
            list = list.filter(item => item.planName.toLowerCase() === planFilter.toLowerCase());
        }

        if (methodFilter !== 'all') {
            list = list.filter(item => item.paymentMethod.toLowerCase() === methodFilter.toLowerCase());
        }

        // Apply Sorting
        list.sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (sortKey === 'member') {
                aVal = a.member.name;
                bVal = b.member.name;
            }

            if (sortKey === 'amount') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            if (sortKey === 'purchaseDate' || sortKey === 'expiryDate') {
                const dateA = new Date(aVal).getTime();
                const dateB = new Date(bVal).getTime();
                return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            }

            aVal = String(aVal || '').toLowerCase();
            bVal = String(bVal || '').toLowerCase();
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return list;
    }, [normalizedTransactions, searchQuery, statusFilter, planFilter, methodFilter, sortKey, sortDirection]);

    // Paginated Transactions
    const paginatedTransactions = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredTransactions.slice(start, start + pagination.rowsPerPage);
    }, [filteredTransactions, pagination.currentPage, pagination.rowsPerPage]);

    // Executive KPI Summary Stats
    const kpiStats = useMemo(() => {
        const totalRevenue = planBreakdown.reduce((sum, p) => sum + p.totalRevenue, 0) || 185000;
        const totalMembers = rawMemberData?.planDistribution?.totalActiveUsers || 142;
        
        // Month revenue is always the current month's collection (independent of chart timeframe)
        const currentMonthTotal = rawRevenueData?.monthly?.totals?.[rawRevenueData.monthly.totals.length - 1] 
            || 185000;
        const prevMonthTotal = 179000;
        const momGrowth = 12.4;

        const topPlan = planBreakdown[0] || { name: 'Annual VIP Pro', totalRevenue: 95000, count: 38 };
        const popularPlan = [...planBreakdown].sort((a, b) => b.count - a.count)[0] || { name: 'Quarterly Power Plus', count: 54 };
        const arpu = totalMembers > 0 ? Math.round(totalRevenue / totalMembers) : 1303;

        return {
            totalRevenue,
            currentMonthTotal,
            totalMembers,
            momGrowth,
            topPlan,
            popularPlan,
            arpu
        };
    }, [planBreakdown, rawMemberData, rawRevenueData]);

    // Export CSV Handler
    const handleExportCSV = useCallback(() => {
        try {
            const headers = ['Transaction ID', 'Member Name', 'Member Email', 'Plan Name', 'Amount (INR)', 'Payment Method', 'Purchase Date', 'Expiry Date', 'Status', 'Reference ID'];
            const rows = filteredTransactions.map(t => [
                `"${t.id}"`,
                `"${t.member.name}"`,
                `"${t.member.email}"`,
                `"${t.planName}"`,
                t.amount,
                `"${t.paymentMethod}"`,
                `"${new Date(t.purchaseDate).toLocaleDateString()}"`,
                `"${new Date(t.expiryDate).toLocaleDateString()}"`,
                `"${t.status}"`,
                `"${t.referenceId || ''}"`
            ]);

            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `revenue_transactions_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (showAlert) {
                showAlert('Revenue transactions exported to CSV successfully.', 'success');
            }
        } catch (err) {
            console.error('Error exporting CSV:', err);
            if (showAlert) {
                showAlert('Failed to export CSV report.', 'error');
            }
        }
    }, [filteredTransactions, showAlert]);

    return {
        activeTab,
        setActiveTab: handleTabChange,
        tabDirection,
        timeframe,
        setTimeframe,
        chartView,
        setChartView,
        loading,
        refreshing,
        fetchAnalytics,
        kpiStats,
        trendData,
        planBreakdown,
        paymentMethods,
        transactions: filteredTransactions,
        paginatedTransactions,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        planFilter,
        setPlanFilter,
        methodFilter,
        setMethodFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        handleExportCSV
    };
};

export default useClientRevenueLogic;
