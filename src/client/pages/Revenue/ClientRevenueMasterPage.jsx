import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    TrendingUp, DollarSign, Crown, Users, ArrowUpRight, 
    Calendar, RefreshCw, Download, Search, Filter, 
    CheckCircle2, AlertCircle, Clock, CreditCard, 
    Banknote, QrCode, Landmark, ChevronDown, ChevronRight, 
    Sparkles, ShieldCheck, FileSpreadsheet, Eye, Receipt,
    Layers, PieChart, BarChart3, LineChart, ArrowDownRight, Zap,
    ArrowRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { DataTable, SearchableSelect } from '@/common';
import SectionTransition from '@/client/pages/Profile/components/SectionTransition';
import { useClientRevenueLogic } from './revenue.logic';

export const ClientRevenueMasterPage = ({ gym }) => {
    const { currentThemeConfig } = useTheme();
    const {
        activeTab,
        setActiveTab,
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
        transactions,
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
    } = useClientRevenueLogic({ gym });

    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    // Format Currency Helper
    const formatCurrency = (val) => {
        return `₹${Number(val || 0).toLocaleString('en-IN')}`;
    };

    // Navigation Tabs Configuration
    const tabs = useMemo(() => [
        { id: 'overview', label: 'Revenue Overview', icon: TrendingUp },
        { id: 'plans', label: 'Plan Performance', icon: Crown },
        { id: 'transactions', label: 'Transactions & Ledger', icon: Receipt },
        { id: 'methods', label: 'Payment Channels', icon: CreditCard }
    ], []);

    // SVG Chart Geometry Math for Smooth Spline Curve
    const chartHeight = 180;
    const chartWidth = 720;
    const paddingX = 36;
    const paddingY = 20;

    const maxTrendVal = useMemo(() => {
        const max = Math.max(...trendData.map(d => d.total), 1);
        return Math.ceil(max * 1.15); // Add 15% headroom
    }, [trendData]);

    const chartPoints = useMemo(() => {
        const count = trendData.length;
        if (count === 0) return [];

        const usableW = chartWidth - paddingX * 2;
        const usableH = chartHeight - paddingY * 2;
        const stepX = count > 1 ? usableW / (count - 1) : usableW;

        return trendData.map((d, i) => {
            const x = paddingX + i * stepX;
            const ratio = d.total / maxTrendVal;
            const y = chartHeight - paddingY - ratio * usableH;
            return { x, y, data: d, index: i };
        });
    }, [trendData, maxTrendVal]);

    // Build Smooth Bezier Path
    const svgPaths = useMemo(() => {
        if (chartPoints.length === 0) return { linePath: '', areaPath: '' };

        let linePath = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
        for (let i = 0; i < chartPoints.length - 1; i++) {
            const p0 = chartPoints[i];
            const p1 = chartPoints[i + 1];
            const cpX1 = p0.x + (p1.x - p0.x) * 0.45;
            const cpY1 = p0.y;
            const cpX2 = p1.x - (p1.x - p0.x) * 0.45;
            const cpY2 = p1.y;
            linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }

        const lastP = chartPoints[chartPoints.length - 1];
        const firstP = chartPoints[0];
        const groundY = chartHeight - paddingY;
        const areaPath = `${linePath} L ${lastP.x} ${groundY} L ${firstP.x} ${groundY} Z`;

        return { linePath, areaPath };
    }, [chartPoints]);

    // Columns for Transactions DataTable
    const transactionColumns = useMemo(() => [
        {
            key: 'id',
            title: 'TXN ID & Reference',
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
            width: '230px',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-black text-xs shrink-0">
                        {row.member.avatar ? (
                            <img src={row.member.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            row.member.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {row.member.name}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {row.member.email}
                        </span>
                    </div>
                </div>
            )
        },
        {
            key: 'planName',
            title: 'Membership Plan',
            width: '180px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {row.planName}
                    </span>
                    <span className="text-[10px] text-amber-500/90 font-medium">
                        Recurring Access
                    </span>
                </div>
            )
        },
        {
            key: 'amount',
            title: 'Net Amount',
            width: '130px',
            align: 'right',
            render: (row) => (
                <div className="text-right">
                    <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">
                        {formatCurrency(row.amount)}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-medium">
                        Net Settled
                    </span>
                </div>
            )
        },
        {
            key: 'paymentMethod',
            title: 'Channel',
            width: '110px',
            render: (row) => {
                const styles = {
                    'UPI': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                    'Card': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
                    'Cash': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    'NetBanking': 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                }[row.paymentMethod] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

                return (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider border ${styles}`}>
                        {row.paymentMethod}
                    </span>
                );
            }
        },
        {
            key: 'purchaseDate',
            title: 'Enrollment Date',
            width: '130px',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {new Date(row.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(row.purchaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            width: '100px',
            render: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider ${
 row.status === 'Active' 
 ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' 
 : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'
 }`}>
                    {row.status}
                </span>
            )
        },
        {
            key: 'actions',
            title: 'Action',
            width: '80px',
            align: 'center',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => setSelectedTransaction(row)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    title="View Receipt"
                >
                    <Eye className="w-3.5 h-3.5" />
                </button>
            )
        }
    ], []);

    return (
        <div className="space-y-3.5 animate-fade-in select-none pb-4">
         

            {/* Top 4 Executive KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Total Collections */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Total Facility Collections
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(kpiStats.totalRevenue)}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            +{kpiStats.momGrowth}% MoM
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">All active cycles</span>
                    </div>
                </div>

                {/* 2. Monthly Run Rate */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-pink-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            This Month Revenue
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-500 border border-pink-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(kpiStats.currentMonthTotal)}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ArrowUpRight className="w-3 h-3" />
                            +8.4% pace
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">October 2026</span>
                    </div>
                </div>

                {/* 3. Top Performing Plan */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-yellow-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Top Performing Plan
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Crown className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {kpiStats.topPlan.name}
                        </h3>
                        <p className="text-xs font-black text-amber-500">
                            {formatCurrency(kpiStats.topPlan.totalRevenue)} gross
                        </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[9px] font-black tracking-wider text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/20">
                            👑 Rank 1
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{kpiStats.topPlan.count || 38} enrolled</span>
                    </div>
                </div>

                {/* 4. ARPU */}
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Average Value (ARPU)
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Users className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {formatCurrency(kpiStats.arpu)}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">/ user</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-1.5 py-0.5 rounded-md border border-cyan-500/20">
                            <Users className="w-3 h-3" />
                            {kpiStats.totalMembers} active paying
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Verified active</span>
                    </div>
                </div>
            </div>

            {/* Standardized Navigation Tabs matching SaaS Blueprint */}
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 w-max overflow-x-auto custom-scrollbar select-none">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-colors duration-200 cursor-pointer whitespace-nowrap ${
                                isActive
                                    ? 'text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
                            }`}
                        >
                            {/* Smooth hardware-accelerated animated sliding indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="revenue-tab-pill-indicator"
                                    className="absolute inset-0 rounded-lg z-0"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                                        boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 450,
                                        damping: 35
                                    }}
                                />
                            )}
                            <Icon className={`w-3.5 h-3.5 shrink-0 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="relative z-10 font-bold">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT WITH PROFILE-PAGE SMOOTH EASING TRANSITION */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <SectionTransition key="overview" direction={tabDirection} className="w-full">
                        <div className="space-y-3.5">
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
                        {/* Main Revenue Chart (Modern SVG Spline / Bar) */}
                        <div className="lg:col-span-8 bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                            {/* Chart Controls Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5 pb-2.5 border-b border-slate-100 dark:border-white/5">
                                <div>
                                    <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                        Revenue Collection Inflow
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        Verified gross collections across billing cycles
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* View Toggle: Spline vs Column */}
                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        <button
                                            type="button"
                                            onClick={() => setChartView('area')}
                                            className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
 chartView === 'area'
 ? 'bg-white dark:bg-white/10 text-amber-500 shadow-2xs'
 : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
 }`}
                                            title="Spline Area View"
                                        >
                                            <LineChart className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChartView('bar')}
                                            className={`p-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
 chartView === 'bar'
 ? 'bg-white dark:bg-white/10 text-amber-500 shadow-2xs'
 : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
 }`}
                                            title="Column Bars View"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Frequency Selector */}
                                    <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                        {['monthly', 'weekly', 'daily', 'yearly'].map((tf) => (
                                             <button
                                                key={tf}
                                                type="button"
                                                onClick={() => setTimeframe(tf)}
                                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider transition-all cursor-pointer ${
 timeframe === tf
 ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-2xs'
 : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
 }`}
                                            >
                                                {tf}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Responsive High-End SVG Visualizer */}
                            <div className="relative w-full overflow-hidden">
                                <svg
                                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                                    className="w-full h-44 sm:h-48 overflow-visible"
                                >
                                    <defs>
                                        {/* Soft Gold Area Fill */}
                                        <linearGradient id="revenueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                                            <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.08" />
                                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                                        </linearGradient>

                                        {/* Slim Column Bar Gradient */}
                                        <linearGradient id="slimBarGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
                                            <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
                                        </linearGradient>
                                    </defs>

                                    {/* Subtle Horizontal Gridlines & Y-Axis Labels */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                        const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
                                        const val = Math.round(ratio * maxTrendVal);
                                        return (
                                            <g key={i}>
                                                <line
                                                    x1={paddingX}
                                                    y1={y}
                                                    x2={chartWidth - paddingX}
                                                    y2={y}
                                                    stroke="currentColor"
                                                    strokeDasharray="4 6"
                                                    className="text-slate-200 dark:text-white/5"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={paddingX - 8}
                                                    y={y + 3}
                                                    textAnchor="end"
                                                    className="fill-slate-400 dark:fill-slate-500 text-[10px] font-mono font-medium"
                                                >
                                                    {val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* AREA SPLINE VIEW */}
                                    {chartView === 'area' && (
                                        <>
                                            {/* Filled Gradient Area Under Curve */}
                                            <path d={svgPaths.areaPath} fill="url(#revenueAreaGrad)" />

                                            {/* Glowing Stroke Curve */}
                                            <path
                                                d={svgPaths.linePath}
                                                fill="none"
                                                stroke="#f59e0b"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                            />

                                            {/* Interactive Points on Curve */}
                                            {chartPoints.map((pt) => {
                                                const isHov = hoveredIdx === pt.index;
                                                return (
                                                    <g key={pt.index} className="cursor-pointer">
                                                        {/* Target Circle for Hover Hitbox */}
                                                        <circle
                                                            cx={pt.x}
                                                            cy={pt.y}
                                                            r="14"
                                                            fill="transparent"
                                                            onMouseEnter={() => setHoveredIdx(pt.index)}
                                                            onMouseLeave={() => setHoveredIdx(null)}
                                                        />
                                                        {/* Outer Glow Circle */}
                                                        <circle
                                                            cx={pt.x}
                                                            cy={pt.y}
                                                            r={isHov ? 6.5 : 4}
                                                            fill={isHov ? '#fbbf24' : '#f59e0b'}
                                                            stroke="#0f172a"
                                                            strokeWidth="2"
                                                            className="transition-all duration-200"
                                                        />
                                                    </g>
                                                );
                                            })}
                                        </>
                                    )}

                                    {/* SLIM COLUMN BARS VIEW */}
                                    {chartView === 'bar' && (
                                        chartPoints.map((pt) => {
                                            const barW = 16;
                                            const groundY = chartHeight - paddingY;
                                            const barH = groundY - pt.y;
                                            const isHov = hoveredIdx === pt.index;

                                            return (
                                                <g
                                                    key={pt.index}
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredIdx(pt.index)}
                                                    onMouseLeave={() => setHoveredIdx(null)}
                                                >
                                                    <rect
                                                        x={pt.x - barW / 2}
                                                        y={pt.y}
                                                        width={barW}
                                                        height={Math.max(4, barH)}
                                                        rx="5"
                                                        fill="url(#slimBarGrad)"
                                                        className={`transition-all duration-200 ${isHov ? 'brightness-125' : 'opacity-90'}`}
                                                    />
                                                </g>
                                            );
                                        })
                                    )}

                                    {/* X-Axis Labels */}
                                    {chartPoints.map((pt) => (
                                        <text
                                            key={pt.index}
                                            x={pt.x}
                                            y={chartHeight - 6}
                                            textAnchor="middle"
                                            className={`text-[10px] font-bold tracking-tight transition-colors ${
 hoveredIdx === pt.index
 ? 'fill-amber-500 font-extrabold'
 : 'fill-slate-400 dark:fill-slate-500'
 }`}
                                        >
                                            {pt.data.label}
                                        </text>
                                    ))}
                                </svg>

                                {/* Floating Tooltip Card */}
                                {hoveredIdx !== null && chartPoints[hoveredIdx] && (
                                    <div
                                        className="absolute z-20 pointer-events-none p-2 rounded-lg bg-slate-900/95 dark:bg-slate-950/95 text-white border border-amber-500/30 shadow-xl backdrop-blur-md text-xs transition-all animate-fade-in"
                                        style={{
                                            left: `${Math.min(chartWidth - 140, Math.max(20, chartPoints[hoveredIdx].x - 65))}px`,
                                            top: `${Math.max(10, chartPoints[hoveredIdx].y - 65)}px`
                                        }}
                                    >
                                        <div className="font-bold text-[10px] text-slate-400 tracking-wider">
                                            {chartPoints[hoveredIdx].data.label}
                                        </div>
                                        <div className="font-black text-amber-400 text-xs">
                                            {chartPoints[hoveredIdx].data.formattedTotal}
                                        </div>
                                        <div className="text-[10px] text-slate-300 font-medium">
                                            {chartPoints[hoveredIdx].data.newEnrollments} enrolls • {chartPoints[hoveredIdx].data.renewals} renewals
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chart Footnote Highlights */}
                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-2.5 text-xs font-semibold">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                                        <span>Gross Volume</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span>Verified Bank Receipts</span>
                                    </div>
                                </div>
                                <span className="text-[11px] text-amber-500 font-bold">
                                    Peak Cycle: {formatCurrency(maxTrendVal)}
                                </span>
                            </div>
                        </div>

                        {/* Right Column: User Distribution & Tier Share */}
                        <div className="lg:col-span-4 bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                            <div>
                                <h2 className="text-sm font-black tracking-tight text-slate-900 dark:text-white mb-0.5">
                                    Tier Distribution
                                </h2>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2">
                                    Active paying subscribers across membership levels
                                </p>

                                {/* Slim Elegant Radial Ring */}
                                <div className="relative w-24 h-24 mx-auto my-1 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-slate-100 dark:text-white/5" />
                                        {/* Segments: 51.4%, 29.2%, 14.6%, 4.8% (Circumference ~ 238.76) */}
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#f59e0b" strokeWidth="8" strokeDasharray="122.7 238.76" strokeDashoffset="0" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#ec4899" strokeWidth="8" strokeDasharray="69.7 238.76" strokeDashoffset="-125" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3b82f6" strokeWidth="8" strokeDasharray="34.8 238.76" strokeDashoffset="-196" strokeLinecap="round" />
                                        <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10b981" strokeWidth="8" strokeDasharray="11.4 238.76" strokeDashoffset="-232" strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                        <span className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                                            {kpiStats.totalMembers}
                                        </span>
                                        <span className="text-[8px] font-black tracking-widest text-slate-400">
                                            Subscribers
                                        </span>
                                    </div>
                                </div>

                                {/* Plan List with Horizontal Progress Bar */}
                                <div className="space-y-1 mt-2">
                                    {planBreakdown.map((plan) => (
                                        <div key={plan.id} className="py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            <div className="flex items-center justify-between text-xs mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                                                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: plan.color }} />
                                                    <span className="font-bold text-[11px] text-slate-800 dark:text-slate-200 truncate max-w-[130px]">
                                                        {plan.name}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-black text-xs text-slate-900 dark:text-white font-mono">
                                                        {plan.percentage}%
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 ml-1 font-medium">
                                                        ({plan.count})
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-slate-200/70 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                                                <div 
                                                    className="h-full rounded-full transition-all duration-500" 
                                                    style={{ 
                                                        width: `${plan.percentage}%`,
                                                        backgroundColor: plan.color 
                                                    }} 
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs font-bold text-slate-500">
                                <span>Facility Utilization</span>
                                <span className="text-emerald-500 font-extrabold">92.4% Optimal</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Executive Revenue Insight Banner */}
            
                    {/* Recent Transactions Snapshot */}
                    <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs overflow-hidden">
                        <div className="px-3.5 py-2 border-b border-slate-200/90 dark:border-white/10 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                    Recent Ledger & Member Enrollments
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                    Confirmed facility receipts and renewals
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActiveTab('transactions')}
                                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500 hover:text-amber-400 transition-colors tracking-wider cursor-pointer"
                            >
                                <span>Full Ledger</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="p-1">
                            <DataTable
                                columns={transactionColumns}
                                data={transactions.slice(0, 5)}
                                loading={loading}
                                emptyMessage="No recent transactions to display."
                                onRowClick={(row) => setSelectedTransaction(row)}
                            />
                        </div>
                    </div>
                </div>
            </SectionTransition>
        )}

        {/* TAB 2: DETAILED PLAN PERFORMANCE */}
        {activeTab === 'plans' && (
            <SectionTransition key="plans" direction={tabDirection} className="w-full">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {planBreakdown.map((plan, idx) => (
                            <div 
                                key={plan.id}
                                className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-col justify-between group hover:border-amber-500/40 transition-all"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider ${
 idx === 0 
 ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25' 
 : idx === 1 
 ? 'bg-pink-500/15 text-pink-500 border border-pink-500/25'
 : 'bg-blue-500/15 text-blue-500 border border-blue-500/25'
 }`}>
                                            {plan.tag || 'Active Plan'}
                                        </span>
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: plan.color }} />
                                    </div>

                                    <h3 className="text-xs font-black text-slate-900 dark:text-white tracking-tight mb-0.5 truncate">
                                        {plan.name}
                                    </h3>
                                    <div className="text-lg font-black text-amber-500 mb-2 font-mono">
                                        {formatCurrency(plan.totalRevenue)}
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                            <span>Subscribers</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{plan.count} members</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                            <span>Ticket (ARPU)</span>
                                            <span className="font-bold text-slate-900 dark:text-white font-mono">{formatCurrency(plan.arpu)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                            <span>Revenue Share</span>
                                            <span className="font-bold text-emerald-500 font-mono">{plan.percentage}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5">
                                    <div className="w-full bg-slate-100 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="h-full rounded-full transition-all duration-500" 
                                            style={{ 
                                                width: `${plan.percentage}%`,
                                                backgroundColor: plan.color 
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Plan Performance Matrix Table */}
                    <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/10 p-3.5 shadow-2xs">
                        <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white mb-2">
                            Plan Revenue Contribution Comparison
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 text-[10px] font-black tracking-widest">
                                        <th className="py-2 px-2.5">Plan Name</th>
                                        <th className="py-2 px-2.5">Tier Status</th>
                                        <th className="py-2 px-2.5 text-right">Subscribers</th>
                                        <th className="py-2 px-2.5 text-right">ARPU</th>
                                        <th className="py-2 px-2.5 text-right">Net Revenue</th>
                                        <th className="py-2 px-2.5 text-right">Share (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-semibold">
                                    {planBreakdown.map((p) => (
                                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="py-2 px-2.5 font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                                <span>{p.name}</span>
                                            </td>
                                            <td className="py-2 px-2.5">
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                    {p.tag || 'Active'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2.5 text-right text-slate-700 dark:text-slate-300">
                                                {p.count} members
                                            </td>
                                            <td className="py-2 px-2.5 text-right text-slate-700 dark:text-slate-300 font-mono">
                                                {formatCurrency(p.arpu)}
                                            </td>
                                            <td className="py-2 px-2.5 text-right font-black text-amber-500 font-mono">
                                                {formatCurrency(p.totalRevenue)}
                                            </td>
                                            <td className="py-2 px-2.5 text-right text-emerald-500 font-black">
                                                {p.percentage}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </SectionTransition>
        )}

        {/* TAB 3: FULL TRANSACTIONS LEDGER */}
        {activeTab === 'transactions' && (
            <SectionTransition key="transactions" direction={tabDirection} className="w-full">
                <div className="space-y-2.5">
                    {/* Filter & Search Bar */}
                    <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                            {/* Search Box */}
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search member, plan, TXN ID..."
                                    className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all"
                                />
                            </div>

                            {/* Status Filter */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'active', label: 'Active Only' },
                                    { value: 'expired', label: 'Expired Only' }
                                ]}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val || 'all')}
                                placeholder="Status"
                                searchPlaceholder="Search status..."
                                className="w-36"
                            />

                            {/* Payment Method Filter */}
                            <SearchableSelect
                                options={[
                                    { value: 'all', label: 'All Channels' },
                                    { value: 'upi', label: 'UPI & QR' },
                                    { value: 'card', label: 'Card' },
                                    { value: 'cash', label: 'Cash POS' },
                                    { value: 'netbanking', label: 'Net Banking' }
                                ]}
                                value={methodFilter}
                                onChange={(val) => setMethodFilter(val || 'all')}
                                placeholder="Payment Method"
                                searchPlaceholder="Search channel..."
                                className="w-40"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-bold">
                                {transactions.length} record(s)
                            </span>
                        </div>
                    </div>

                    {/* Data Table with Pagination */}
                    <div className="rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 p-1.5 shadow-2xs">
                        <DataTable
                            columns={transactionColumns}
                            data={paginatedTransactions}
                            loading={loading}
                            emptyMessage="No transactions match your search or filter criteria."
                            onRowClick={(row) => setSelectedTransaction(row)}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            onSort={handleSort}
                            pagination={{
                                currentPage: pagination.currentPage,
                                rowsPerPage: pagination.rowsPerPage,
                                totalRecords: transactions.length,
                                totalPages: Math.max(1, Math.ceil(transactions.length / (pagination.rowsPerPage || 10))),
                                onPageChange: pagination.handlePageChange,
                                onRowsPerPageChange: pagination.handleRowsPerPageChange
                            }}
                        />
                    </div>
                </div>
            </SectionTransition>
        )}

        {/* TAB 4: PAYMENT CHANNELS & SETTLEMENT */}
        {activeTab === 'methods' && (
            <SectionTransition key="methods" direction={tabDirection} className="w-full">
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {paymentMethods.map((method) => (
                            <div
                                key={method.key}
                                className="rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md p-3.5 border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-2xs" style={{ backgroundColor: method.color }}>
                                            {method.key === 'upi' && <QrCode className="w-3.5 h-3.5" />}
                                            {method.key === 'card' && <CreditCard className="w-3.5 h-3.5" />}
                                            {method.key === 'cash' && <Banknote className="w-3.5 h-3.5" />}
                                            {method.key === 'netbanking' && <Landmark className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                                            {method.percentage}%
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                                        {method.name}
                                    </h3>
                                    <div className="text-lg font-black text-amber-500 font-mono mb-2">
                                        {formatCurrency(method.amount)}
                                    </div>
                                </div>

                                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-white/5 text-xs text-slate-400">
                                    <div className="flex justify-between">
                                        <span>Settlement Time</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{method.settlement}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Success Rate</span>
                                        <span className="font-bold text-emerald-500">99.8%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-2xs">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                                    Payment Gateway & Direct Bank Settlements
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    Facility merchant accounts, payout routing, and automated reconciliation
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[11px] font-black tracking-wider">
                                <ShieldCheck className="w-3 h-3" />
                                Gateway Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-black tracking-wider text-slate-400">Total Payouts Settled</span>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">₹1,74,200</div>
                                <span className="text-[10px] text-emerald-500 font-bold">100% reconciled</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-black tracking-wider text-slate-400">Next Scheduled Payout</span>
                                <div className="text-base font-black text-amber-500 mt-0.5">₹10,800</div>
                                <span className="text-[10px] text-slate-400 font-medium">Tomorrow at 10:00 AM</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <span className="text-[10px] font-black tracking-wider text-slate-400">Chargeback Rate</span>
                                <div className="text-base font-black text-emerald-500 mt-0.5">0.00%</div>
                                <span className="text-[10px] text-emerald-500 font-bold">Zero disputes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SectionTransition>
        )}
    </AnimatePresence>

            {/* Receipt Modal */}
            {selectedTransaction && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setSelectedTransaction(null)}
                >
                    <div 
                        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
                                <Receipt className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Payment Receipt
                            </h3>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                {selectedTransaction.id}
                            </p>
                        </div>

                        <div className="py-3 space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Member:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedTransaction.member.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Email:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedTransaction.member.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Plan:</span>
                                <span className="font-bold text-amber-500">{selectedTransaction.planName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Channel:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedTransaction.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Date:</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {new Date(selectedTransaction.purchaseDate).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Reference:</span>
                                <span className="font-mono text-slate-500 text-[10px]">{selectedTransaction.referenceId}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex justify-between items-center text-sm">
                                <span className="font-black text-slate-900 dark:text-white">Total Paid:</span>
                                <span className="font-black text-emerald-500 text-base">{formatCurrency(selectedTransaction.amount)}</span>
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setSelectedTransaction(null)}
                                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:brightness-110 shadow-2xs transition-all cursor-pointer"
                            >
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientRevenueMasterPage;
