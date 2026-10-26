import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '@/common/utils/api';
import ActiveMembersModal from './ActiveMembersModal';
import { useAlert } from '@/context/AlertContext';
import { useTheme } from '@/context/ThemeContext';
import {
    Users,
    Crown,
    Clock,
    UserPlus,
    RotateCw,
    Maximize2,
    Minimize2,
    Printer,
    ChevronRight,
    TrendingUp,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    BarChart3,
    LineChart as LineChartIcon,
    Flame,
    Info,
    ChevronDown,
    ArrowUp
} from 'lucide-react';

/**
 * OverviewSection
 * Premium, High-Density Executive Gym Dashboard:
 * 1. Strictly adheres to currentThemeConfig (active colors, gradients, and CSS variables).
 * 2. 5 Compact KPI Metric Cards with dynamic theme sparkline bars.
 * 3. Member Attendance Graph dynamically styled to theme color (both Pillar Bars & Curved Area modes).
 * 4. High-contrast, scannable Attendance QR Card with theme buttons.
 * 5. 3 Bottom Cards: Today's Activity, Membership Overview (Donut chart themed), Upcoming Renewals.
 */
const OverviewSection = ({ gym, onSectionChange }) => {
    const { showAlert } = useAlert();
    const { currentThemeConfig, isDark } = useTheme();

    // Theme tokens
    const primaryColor = currentThemeConfig?.primary || '#f97316';
    const gradientFrom = currentThemeConfig?.gradientFrom || '#f97316';
    const gradientTo = currentThemeConfig?.gradientTo || '#ea580c';

    const [loading, setLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Chart & QR States
    const [attendanceTimeframe, setAttendanceTimeframe] = useState('This Week');
    const [chartMode, setChartMode] = useState('bar'); // 'bar' | 'area'
    const [isQrFullscreen, setIsQrFullscreen] = useState(false);
    const [activeHoverBar, setActiveHoverBar] = useState(null);

    // Dynamic Data State
    const [dashboardData, setDashboardData] = useState({
        activeMembers: 648,
        totalCapacity: 800,
        activeMemberGrowth: 12,
        monthlyRevenue: 185000,
        revenueGrowth: 18,
        activeMemberships: 612,
        membershipPercentage: 94,
        todayCheckins: 86,
        lastCheckinTime: '12:32 PM',
        newMembersThisMonth: 12,
        expiringSoon: 24,
        expiredCount: 12,
    });

    const [checkinLogs, setCheckinLogs] = useState([]);
    const [upcomingRenewals, setUpcomingRenewals] = useState([]);

    const targetGymId = gym?.id || gym?._id || localStorage.getItem('active_gym_id') || 2;
    const gymName = gym?.name || 'Fitness Corp International';

    // Fetch API Data
    useEffect(() => {
        if (!targetGymId) return;

        const fetchStats = async () => {
            try {
                const endpoints = [
                    `/gymdb/dashboard/members/${targetGymId}`,
                    `/gymdb/dashboard/revenue/${targetGymId}`,
                    `/gymdb/dashboard/stats/${targetGymId}`,
                    `/gymdb/plans/gym/${targetGymId}`,
                    `/gymdb/gym/${targetGymId}/today-register`,
                    `/gymdb/members/gym/${targetGymId}`
                ];

                const results = await Promise.allSettled(endpoints.map(ep => api.get(ep)));

                const [
                    membersRes, 
                    revenueRes, 
                    statsRes, 
                    plansRes, 
                    logsRes, 
                    memberListRes
                ] = results;

                const membersData = membersRes.status === 'fulfilled' ? membersRes.value : {};
                const revenueData = revenueRes.status === 'fulfilled' ? revenueRes.value : {};
                const statsData = statsRes.status === 'fulfilled' ? statsRes.value : {};
                const logsData = logsRes.status === 'fulfilled' ? logsRes.value : {};
                const memberListData = memberListRes.status === 'fulfilled' ? memberListRes.value : {};

                let activeCount = 648;
                if (statsData.success && statsData.stats?.totalActiveMembers) {
                    activeCount = statsData.stats.totalActiveMembers;
                } else if (membersData.success && membersData.data?.planDistribution?.totalActiveUsers) {
                    activeCount = membersData.data.planDistribution.totalActiveUsers;
                }

                let revenue = 185000;
                if (revenueData.success && revenueData.data?.monthly?.totals?.length > 0) {
                    const totals = revenueData.data.monthly.totals;
                    revenue = totals[totals.length - 1] || revenue;
                }

                let expiring = 24;
                if (membersData.success && typeof membersData.data?.expiringSoon === 'number') {
                    expiring = membersData.data.expiringSoon;
                }

                const todayLogs = (logsData.success && Array.isArray(logsData.register)) ? logsData.register : [];
                setCheckinLogs(todayLogs);

                const checkinCount = todayLogs.length > 0 ? todayLogs.length : 86;
                const lastCheckin = todayLogs.length > 0 && todayLogs[0]?.checkInTime
                    ? new Date(todayLogs[0].checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '12:32 PM';

                // Upcoming renewals mapping
                if (memberListData.success && Array.isArray(memberListData.members) && memberListData.members.length > 0) {
                    const mappedRenewals = memberListData.members
                        .filter(m => m.expiry_date || m.subscriptionExpiry || m.membershipEnd)
                        .slice(0, 5)
                        .map((m, idx) => {
                            const expiry = new Date(m.expiry_date || m.subscriptionExpiry || m.membershipEnd);
                            const daysDiff = Math.max(1, Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24)));
                            return {
                                id: m.id || m._id || idx,
                                name: m.name || m.user?.name || 'Member',
                                plan: m.planName || m.plan?.name || (idx % 2 === 0 ? '3 Months Plan' : 'Annual Plan'),
                                date: expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
                                daysLeft: daysDiff,
                                avatarText: (m.name || 'MB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                            };
                        });

                    if (mappedRenewals.length > 0) {
                        setUpcomingRenewals(mappedRenewals);
                    } else {
                        setDefaultRenewals();
                    }
                } else {
                    setDefaultRenewals();
                }

                setDashboardData(prev => ({
                    ...prev,
                    activeMembers: activeCount,
                    monthlyRevenue: revenue,
                    activeMemberships: Math.round(activeCount * 0.94),
                    expiringSoon: expiring,
                    todayCheckins: checkinCount,
                    lastCheckinTime: lastCheckin
                }));

            } catch (err) {
                console.error('Error fetching dashboard stats:', err);
                setDefaultRenewals();
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [targetGymId, refreshTrigger]);

    const setDefaultRenewals = () => {
        setUpcomingRenewals([
            { id: 1, name: 'Rohan Singh', plan: '3 Months Plan', date: '25 Oct 2025', daysLeft: 2, avatarText: 'RS' },
            { id: 2, name: 'Ananya Patel', plan: '6 Months Plan', date: '28 Oct 2025', daysLeft: 5, avatarText: 'AP' },
            { id: 3, name: 'Vikram Kumar', plan: 'Annual Plan', date: '30 Oct 2025', daysLeft: 7, avatarText: 'VK' },
            { id: 4, name: 'Neha Mehta', plan: '3 Months Plan', date: '2 Nov 2025', daysLeft: 10, avatarText: 'NM' },
            { id: 5, name: 'Arjun Sharma', plan: '6 Months Plan', date: '5 Nov 2025', daysLeft: 13, avatarText: 'AS' }
        ]);
    };

    // Print QR Code
    const handlePrintQR = () => {
        const qrCanvas = document.getElementById('gym-attendance-qr-canvas');
        if (!qrCanvas) return;
        const qrDataUrl = qrCanvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Attendance QR - ${gymName}</title>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
                            display: flex; 
                            flex-direction: column; 
                            align-items: center; 
                            justify-content: center; 
                            min-height: 90vh; 
                            margin: 0; 
                            background: #fff; 
                        }
                        .card { 
                            border: 2px solid #e2e8f0; 
                            border-radius: 24px; 
                            padding: 32px; 
                            text-align: center; 
                            box-shadow: 0 10px 25px rgba(0,0,0,0.06); 
                            max-width: 340px; 
                        }
                        h2 { margin: 0 0 6px 0; color: #0f172a; font-size: 20px; font-weight: 800; }
                        p { margin: 0 0 20px 0; color: #64748b; font-size: 13px; font-weight: 500; }
                        img { width: 240px; height: 240px; border-radius: 12px; }
                        .badge { 
                            display: inline-block; 
                            background: ${primaryColor}15; 
                            color: ${primaryColor}; 
                            padding: 6px 14px; 
                            border-radius: 9999px; 
                            font-weight: 700; 
                            font-size: 11px; 
                            margin-top: 16px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h2>${gymName}</h2>
                        <p>Scan with Gymshood app to mark attendance</p>
                        <img src="${qrDataUrl}" alt="QR Code" />
                        <div><span class="badge">Official Attendance Access</span></div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); window.close(); }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Attendance Data based on Timeframe with Dual Metrics (Check-ins line & Unique Members bars)
    const attendanceWeekly = [
        { day: 'Mon', date: '17 Oct', checkins: 150, unique: 120, isToday: false },
        { day: 'Tue', date: '18 Oct', checkins: 172, unique: 135, isToday: false },
        { day: 'Wed', date: '19 Oct', checkins: 184, unique: 142, isToday: false },
        { day: 'Thu', date: '20 Oct', checkins: 176, unique: 138, isToday: false },
        { day: 'Fri', date: '21 Oct', checkins: 188, unique: 156, isToday: false },
        { day: 'Sat', date: '22 Oct', checkins: 206, unique: 168, isToday: false, isPeak: true },
        { day: 'Sun', date: '23 Oct', checkins: 152, unique: 86, isToday: true, label: "86 check-ins today" },
    ];

    const attendanceMonthly = [
        { day: 'Week 1', date: '1-7 Oct', checkins: 1120, unique: 890, isToday: false },
        { day: 'Week 2', date: '8-14 Oct', checkins: 1240, unique: 960, isToday: false },
        { day: 'Week 3', date: '15-21 Oct', checkins: 1380, unique: 1040, isToday: false, isPeak: true },
        { day: 'Week 4', date: '22-28 Oct', checkins: 720, unique: 520, isToday: true, label: "Current Week" },
    ];

    const attendance3Months = [
        { day: 'Aug', date: 'Aug 2026', checkins: 4950, unique: 3820, isToday: false },
        { day: 'Sep', date: 'Sep 2026', count: 4150, checkins: 5420, unique: 4150, isToday: false, isPeak: true },
        { day: 'Oct', date: 'Current', checkins: 4380, unique: 3410, isToday: true, label: "This Month" },
    ];

    const currentAttendanceData = attendanceTimeframe === 'This Month' 
        ? attendanceMonthly 
        : attendanceTimeframe === 'Last 3 Months' 
            ? attendance3Months 
            : attendanceWeekly;

    const totalCheckinsSum = currentAttendanceData.reduce((acc, curr) => acc + (curr.checkins || curr.count || 0), 0);
    const totalUniqueSum = currentAttendanceData.reduce((acc, curr) => acc + (curr.unique || curr.count || 0), 0);
    const averageAttendance = Math.round(totalCheckinsSum / currentAttendanceData.length);
    const maxAttendanceValue = attendanceTimeframe === 'This Week' ? 250 : Math.max(...currentAttendanceData.map(d => Math.max(d.checkins || 0, d.unique || 0)), 200);

    // Calculate Smooth SVG Spline for Check-ins Curve + Under Area Fill
    const generateComboChartData = () => {
        const width = 1000;
        const height = 240;
        const topPadding = 25;
        const bottomPadding = 35;
        const usableHeight = height - topPadding - bottomPadding;
        const paddingLeft = 40;
        const paddingRight = 40;
        const availableWidth = width - paddingLeft - paddingRight;
        const step = availableWidth / (currentAttendanceData.length - 1);

        const points = currentAttendanceData.map((d, i) => {
            const x = paddingLeft + i * step;
            const checkinsVal = d.checkins || d.count || 0;
            const uniqueVal = d.unique || d.count || 0;
            const yLine = height - bottomPadding - (checkinsVal / maxAttendanceValue) * usableHeight;
            const yBar = height - bottomPadding - (uniqueVal / maxAttendanceValue) * usableHeight;
            return {
                x,
                y: yLine,
                yBar,
                checkins: checkinsVal,
                unique: uniqueVal,
                day: d.day,
                date: d.date,
                isToday: d.isToday,
                isPeak: d.isPeak
            };
        });

        const linePath = points.reduce((acc, p, i) => {
            if (i === 0) return `M ${p.x} ${p.y}`;
            const prev = points[i - 1];
            const cpX1 = prev.x + (p.x - prev.x) / 2;
            const cpY1 = prev.y;
            const cpX2 = prev.x + (p.x - prev.x) / 2;
            const cpY2 = p.y;
            return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
        }, '');

        const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - bottomPadding} L ${points[0].x} ${height - bottomPadding} Z`;

        return { points, linePath, areaPath, height, bottomPadding, usableHeight };
    };

    const comboChart = generateComboChartData();
    const areaData = comboChart;

    // Recent Today Activities
    const defaultActivities = [
        {
            time: '01:05 PM',
            icon: Users,
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            title: 'Member checked in',
            subtitle: 'Rahul Sharma',
        },
        {
            time: '12:48 PM',
            icon: ShieldCheck,
            iconBg: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
            title: 'Payment received',
            subtitle: '₹3,000 - Annual Plan Renewal',
        },
        {
            time: '12:15 PM',
            icon: UserPlus,
            iconBg: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400',
            title: 'New member enrolled',
            subtitle: 'Priya Mehta - 3 Months Plan',
        },
        {
            time: '11:40 AM',
            icon: Crown,
            iconBg: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
            title: 'Trainer assigned',
            subtitle: 'Amit Kumar - Personal Training',
        },
        {
            time: '10:30 AM',
            icon: Users,
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            title: 'Member checked in',
            subtitle: 'Sneha Patel',
        }
    ];

    const activityItems = checkinLogs.length > 0
        ? checkinLogs.slice(0, 5).map((log) => ({
            time: new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            icon: Users,
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            title: 'Member checked in',
            subtitle: log.userName || 'Member',
        }))
        : defaultActivities;

    // Static High-Security Permanent QR Payload
    const qrPayload = `GYM_ATTENDANCE:${targetGymId}:${encodeURIComponent(gymName)}`;

    // Helper for Renewal Pill color
    const getDaysBadgeStyle = (days) => {
        if (days <= 2) {
            return 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
        }
        if (days <= 5) {
            return 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
        }
        if (days <= 7) {
            return 'bg-orange-50 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30';
        }
        return 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
    };

    // Helper for Avatar color
    const getAvatarBg = (idx) => {
        const colors = [
            'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300',
            'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
            'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
            'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
            'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-300',
        ];
        return colors[idx % colors.length];
    };

    return (
        <div className="space-y-3.5 w-full">
            {/* Dynamic CSS Definition for Theme Gradient in SVGs */}
            <svg width="0" height="0" className="absolute pointer-events-none">
                <defs>
                    <linearGradient id="themeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.32" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="themeBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.35" />
                        <stop offset="100%" stopColor={primaryColor} stopOpacity="0.12" />
                    </linearGradient>
                    <filter id="themeLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={primaryColor} floodOpacity="0.35" />
                    </filter>
                </defs>
            </svg>

            {/* ============================================================== */}
            {/* ROW 1: 5 EXECUTIVE METRIC CARDS                                */}
            {/* ============================================================== */}
            {/* ============================================================== */}
            {/* ROW 1: 5 EXECUTIVE METRIC CARDS WITH LUXURY GRADIENT FILLS     */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 w-full">
                
                {/* 1. Active Members (Theme Dynamic Gradient) */}
                <div 
                    onClick={() => onSectionChange?.('active-members')}
                    className="relative overflow-hidden rounded-2xl p-3.5 border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                    style={{
                        background: isDark 
                            ? `linear-gradient(135deg, ${primaryColor}18 0%, rgba(18, 22, 34, 0.95) 60%, rgba(18, 22, 34, 0.98) 100%)`
                            : `linear-gradient(135deg, ${primaryColor}14 0%, ${primaryColor}06 45%, #ffffff 100%)`,
                        borderColor: isDark ? `${primaryColor}35` : `${primaryColor}30`,
                        boxShadow: `0 4px 20px -2px ${primaryColor}15`
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                style={{ 
                                    background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${primaryColor} 100%)`,
                                    boxShadow: `0 4px 12px ${primaryColor}40`
                                }}
                            >
                                <Users className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Active Members</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span 
                                    className="text-2xl font-black tracking-tight"
                                    style={{ color: primaryColor }}
                                >
                                    {dashboardData.activeMembers}
                                </span>
                                <span 
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black border"
                                    style={{ 
                                        backgroundColor: `${primaryColor}15`,
                                        color: primaryColor,
                                        borderColor: `${primaryColor}30` 
                                    }}
                                >
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    +{dashboardData.activeMemberGrowth}%
                                </span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                of {dashboardData.totalCapacity} total members
                            </p>
                        </div>

                        {/* Mini Sparkline Bar Chart (Theme Color) */}
                        <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
                            {[35, 55, 45, 70, 95].map((h, i) => (
                                <span 
                                    key={i} 
                                    style={{ 
                                        height: `${h}%`,
                                        backgroundColor: primaryColor,
                                        opacity: 0.65 + (i * 0.08)
                                    }}
                                    className="w-1.5 rounded-t-sm group-hover:opacity-100 transition-opacity"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Monthly Revenue (Blue Gradient Fill) */}
                <div 
                    onClick={() => onSectionChange?.('revenue')}
                    className="relative overflow-hidden rounded-2xl p-3.5 border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                    style={{
                        background: isDark 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(18, 22, 34, 0.95) 60%, rgba(18, 22, 34, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(59, 130, 246, 0.05) 45%, #ffffff 100%)',
                        borderColor: isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(59, 130, 246, 0.28)',
                        boxShadow: '0 4px 20px -2px rgba(59, 130, 246, 0.15)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                style={{ 
                                    background: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                                }}
                            >
                                <span className="text-sm font-black text-white">₹</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Monthly Revenue</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                                ₹{Number(dashboardData.monthlyRevenue).toLocaleString('en-IN')}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                                    <TrendingUp className="w-2.5 h-2.5" />
                                    +{dashboardData.revenueGrowth}%
                                </span>
                                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                    vs last mo
                                </span>
                            </div>
                        </div>

                        {/* Mini Sparkline Bar Chart (Blue) */}
                        <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
                            {[30, 48, 42, 75, 100].map((h, i) => (
                                <span 
                                    key={i} 
                                    style={{ height: `${h}%` }}
                                    className="w-1.5 rounded-t-sm bg-blue-400 group-hover:bg-blue-500 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Active Memberships (Amber / Orange Gradient Fill) */}
                <div 
                    onClick={() => onSectionChange?.('plans')}
                    className="relative overflow-hidden rounded-2xl p-3.5 border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                    style={{
                        background: isDark 
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(18, 22, 34, 0.95) 60%, rgba(18, 22, 34, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.05) 45%, #ffffff 100%)',
                        borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(245, 158, 11, 0.28)',
                        boxShadow: '0 4px 20px -2px rgba(245, 158, 11, 0.15)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                style={{ 
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
                                }}
                            >
                                <Crown className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Active Memberships</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                                {dashboardData.activeMemberships}
                            </span>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {dashboardData.membershipPercentage}% of members
                            </p>
                        </div>

                        {/* Mini Sparkline Bar Chart (Amber) */}
                        <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
                            {[40, 52, 65, 80, 92].map((h, i) => (
                                <span 
                                    key={i} 
                                    style={{ height: `${h}%` }}
                                    className="w-1.5 rounded-t-sm bg-amber-400 group-hover:bg-amber-500 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Today's Check-ins (Purple / Violet Gradient Fill) */}
                <div 
                    className="relative overflow-hidden rounded-2xl p-3.5 border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                    style={{
                        background: isDark 
                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(18, 22, 34, 0.95) 60%, rgba(18, 22, 34, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(168, 85, 247, 0.14) 0%, rgba(168, 85, 247, 0.05) 45%, #ffffff 100%)',
                        borderColor: isDark ? 'rgba(168, 85, 247, 0.35)' : 'rgba(168, 85, 247, 0.28)',
                        boxShadow: '0 4px 20px -2px rgba(168, 85, 247, 0.15)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                style={{ 
                                    background: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)',
                                    boxShadow: '0 4px 12px rgba(147, 51, 234, 0.35)'
                                }}
                            >
                                <Clock className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Today's Check-ins</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
                                {dashboardData.todayCheckins}
                            </span>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                Last: {dashboardData.lastCheckinTime}
                            </p>
                        </div>

                        {/* Mini Sparkline Bar Chart (Purple) */}
                        <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
                            {[28, 42, 55, 38, 70].map((h, i) => (
                                <span 
                                    key={i} 
                                    style={{ height: `${h}%` }}
                                    className="w-1.5 rounded-t-sm bg-purple-400 group-hover:bg-purple-500 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 5. New Members (Rose / Red Gradient Fill) */}
                <div 
                    onClick={() => onSectionChange?.('client-members')}
                    className="relative overflow-hidden rounded-2xl p-3.5 border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
                    style={{
                        background: isDark 
                            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.18) 0%, rgba(18, 22, 34, 0.95) 60%, rgba(18, 22, 34, 0.98) 100%)'
                            : 'linear-gradient(135deg, rgba(244, 63, 94, 0.14) 0%, rgba(244, 63, 94, 0.05) 45%, #ffffff 100%)',
                        borderColor: isDark ? 'rgba(244, 63, 94, 0.35)' : 'rgba(244, 63, 94, 0.28)',
                        boxShadow: '0 4px 20px -2px rgba(244, 63, 94, 0.15)'
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                                style={{ 
                                    background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
                                    boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)'
                                }}
                            >
                                <UserPlus className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">New Members</span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        <div>
                            <span className="text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                                {dashboardData.newMembersThisMonth}
                            </span>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                This month
                            </p>
                        </div>

                        {/* Mini Sparkline Bar Chart (Rose) */}
                        <div className="flex items-end gap-1 h-7 pb-0.5 shrink-0">
                            {[20, 32, 48, 62, 85].map((h, i) => (
                                <span 
                                    key={i} 
                                    style={{ height: `${h}%` }}
                                    className="w-1.5 rounded-t-sm bg-rose-400 group-hover:bg-rose-500 transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* ============================================================== */}
            {/* ROW 2: ADVANCED ATTENDANCE GRAPH (COL 8) + ATTENDANCE QR (COL 4) */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">
                           {/* ADVANCED MEMBER ATTENDANCE CHART (COL 8) - MATCHING COMBO GRAPH SPECIFICATION */}
                <div className="lg:col-span-8 bg-white dark:bg-[#121622]/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Header matching screenshot: Title + (i), Themed Pill Tabs, Filter Dropdown */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                        {/* Title with Info Circle */}
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                                Member Attendance
                                <span title="Daily check-ins & unique member visits" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer">
                                    <Info className="w-4 h-4" />
                                </span>
                            </h3>
                        </div>

                        {/* Controls: Timeframe Pills & Member Filter */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            {/* Timeframe Pill Tabs (Themed) */}
                            <div className="flex items-center p-1 bg-slate-100/90 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
                                {['This Week', 'This Month', 'Last 3 Months'].map(tab => {
                                    const isActive = attendanceTimeframe === tab;
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setAttendanceTimeframe(tab)}
                                            style={isActive ? {
                                                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                                                color: '#ffffff',
                                                boxShadow: `0 2px 8px ${primaryColor}40`
                                            } : undefined}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                !isActive ? 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white' : ''
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Filter Dropdown Pill */}
                            <div className="relative">
                                <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    All Members
                                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Legend Row: Check-ins (Dot) & Unique Members (Bar) */}
                    <div className="flex items-center justify-center sm:justify-start gap-5 pt-0.5 pb-2 text-xs font-bold">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span 
                                className="w-2.5 h-2.5 rounded-full" 
                                style={{ backgroundColor: primaryColor }}
                            />
                            <span>Check-ins</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <span 
                                className="w-3 h-3 rounded-md" 
                                style={{ backgroundColor: `${primaryColor}40`, border: `1px solid ${primaryColor}60` }}
                            />
                            <span>Unique Members</span>
                        </div>
                    </div>

                    {/* Chart & Stats Body: 2 Columns (Main Chart Left + Side Stats Right) */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch mt-1">
                        
                        {/* LEFT: SVG COMBO GRAPH (Bar Pillars + Spline Line + Labels) */}
                        <div className="md:col-span-9 flex flex-col justify-end relative min-h-[220px]">
                            
                            {/* Y-Axis Labels & Dashed Horizontal Gridlines */}
                            <div className="absolute inset-x-0 top-3 bottom-12 flex flex-col justify-between pointer-events-none opacity-40">
                                {[250, 200, 150, 100, 50, 0].map((val) => (
                                    <div key={val} className="flex items-center gap-2">
                                        <span className="w-7 text-[10px] font-bold text-slate-400 text-right">{val}</span>
                                        <div className="flex-1 border-b border-dashed border-slate-300 dark:border-white/15"></div>
                                    </div>
                                ))}
                            </div>

                            {/* SVG Chart Layer */}
                            <div className="relative pl-9 pr-2 w-full h-48">
                                <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 240" preserveAspectRatio="none">
                                    {/* Spline Soft Gradient Glow/Area Fill underneath curve */}
                                    <path d={comboChart.areaPath} fill="url(#themeAreaGradient)" />

                                    {/* Unique Members: Rounded Pillar Bars */}
                                    {comboChart.points.map((p, idx) => {
                                        const barWidth = 56;
                                        const barHeight = Math.max((comboChart.height - comboChart.bottomPadding) - p.yBar, 4);
                                        const isHovered = activeHoverBar === idx;

                                        return (
                                            <g 
                                                key={`bar-${idx}`} 
                                                onMouseEnter={() => setActiveHoverBar(idx)}
                                                onMouseLeave={() => setActiveHoverBar(null)}
                                                className="cursor-pointer transition-all duration-200"
                                            >
                                                {/* Pillar Bar Rect */}
                                                <rect
                                                    x={p.x - barWidth / 2}
                                                    y={p.yBar}
                                                    width={barWidth}
                                                    height={barHeight}
                                                    rx="10"
                                                    ry="10"
                                                    fill="url(#themeBarGradient)"
                                                    style={{
                                                        stroke: isHovered ? primaryColor : 'transparent',
                                                        strokeWidth: isHovered ? 1.5 : 0,
                                                        opacity: isHovered ? 1 : 0.85
                                                    }}
                                                />

                                                {/* Value floating directly on top of pillar bar */}
                                                <text
                                                    x={p.x}
                                                    y={p.yBar - 8}
                                                    textAnchor="middle"
                                                    className="text-[14px] font-bold fill-slate-500 dark:fill-slate-400"
                                                    style={{ fontSize: '13px', fontWeight: '700' }}
                                                >
                                                    {p.unique}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Check-ins: Glowing Spline Curve Stroke */}
                                    <path 
                                        d={comboChart.linePath} 
                                        fill="none" 
                                        stroke={primaryColor} 
                                        strokeWidth="3.5" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                        filter="url(#themeLineGlow)"
                                    />

                                    {/* Check-ins: Hollow Circular Node Markers */}
                                    {comboChart.points.map((p, idx) => {
                                        const isHovered = activeHoverBar === idx;
                                        return (
                                            <g 
                                                key={`point-${idx}`}
                                                onMouseEnter={() => setActiveHoverBar(idx)}
                                                onMouseLeave={() => setActiveHoverBar(null)}
                                                className="cursor-pointer"
                                            >
                                                {/* Outer Glow Halo on hover */}
                                                {isHovered && (
                                                    <circle
                                                        cx={p.x}
                                                        cy={p.y}
                                                        r="10"
                                                        fill={`${primaryColor}30`}
                                                    />
                                                )}
                                                {/* White filled node with primary border */}
                                                <circle
                                                    cx={p.x}
                                                    cy={p.y}
                                                    r="5.5"
                                                    fill="#ffffff"
                                                    stroke={primaryColor}
                                                    strokeWidth="3"
                                                    className="transition-transform duration-200"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                            </div>

                            {/* X-Axis Dual-Line Labels: Day (Bold) + Date */}
                            <div className="flex items-center justify-between pl-9 pr-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                {comboChart.points.map((p, idx) => (
                                    <div key={idx} className="text-center flex-1">
                                        <span 
                                            style={{ color: p.isToday ? primaryColor : undefined }}
                                            className={`text-xs font-black block ${!p.isToday ? 'text-slate-800 dark:text-slate-200' : ''}`}
                                        >
                                            {p.day}
                                        </span>
                                        <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5 whitespace-nowrap">
                                            {p.date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT: SUMMARY STATS COLUMN (Total Check-ins, Avg/Day, Unique Members) */}
                        <div className="md:col-span-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-white/10 md:pl-5 pt-3 md:pt-1 flex flex-col justify-around space-y-4">
                            
                            {/* Stat 1: Total Check-ins */}
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Total Check-ins
                                </span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {totalCheckinsSum || 945}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                                        <ArrowUp className="w-2.5 h-2.5" /> 12%
                                    </span>
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                                    vs last week
                                </span>
                            </div>

                            {/* Stat 2: Avg / Day */}
                            <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Avg / Day
                                </span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {averageAttendance || 135}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                                        <ArrowUp className="w-2.5 h-2.5" /> 8%
                                    </span>
                                </div>
                            </div>

                            {/* Stat 3: Unique Members */}
                            <div className="border-t border-slate-100 dark:border-white/5 pt-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Unique Members
                                </span>
                                <div className="flex items-baseline gap-2 mt-0.5">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {totalUniqueSum || 612}
                                    </span>
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
                                        <ArrowUp className="w-2.5 h-2.5" /> 10%
                                    </span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* ATTENDANCE QR CODE CARD (COL 4) - CRISP, HIGH-CONTRAST & CLEAR */}
                <div className="lg:col-span-4 bg-white dark:bg-[#121622]/90 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                                Attendance QR
                            </h3>
                        </div>
                        <div 
                            style={{ 
                                backgroundColor: `${primaryColor}15`,
                                color: primaryColor,
                                borderColor: `${primaryColor}30`
                            }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black border"
                        >
                            <span 
                                style={{ backgroundColor: primaryColor }}
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                            ></span>
                            Live QR
                        </div>
                    </div>

                    {/* QR Code Container + Clear Instructions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 my-auto py-1.5">
                        
                        {/* High-Contrast Crisp QR Canvas Box */}
                        <div className="relative p-2.5 bg-white rounded-xl border border-slate-300/80 shadow-sm flex items-center justify-center shrink-0">
                            <QRCodeCanvas
                                id="gym-attendance-qr-canvas"
                                value={qrPayload}
                                size={120}
                                level="M"
                                fgColor="#0f172a"
                                bgColor="#ffffff"
                                marginSize={0}
                            />
                            {/* Centered Dumbbell Emblem */}
                            <div className="absolute inset-0 m-auto w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-200">
                                <span style={{ color: primaryColor }} className="font-black text-xs">🏋️</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="space-y-2 flex-1 text-center sm:text-left">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                                    Scan to Mark Attendance
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    Ask facility members to scan this QR code directly from their Gymshood mobile app.
                                </p>
                            </div>

                            <div 
                                style={{
                                    backgroundColor: `${primaryColor}12`,
                                    color: primaryColor,
                                    borderColor: `${primaryColor}25`
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Official Entry Token</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons: Fullscreen (Themed) & Print QR */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/10">
                        <button
                            onClick={() => setIsQrFullscreen(true)}
                            style={{ 
                                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                                boxShadow: `0 2px 10px ${primaryColor}35`
                            }}
                            className="py-2 px-3 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Fullscreen</span>
                        </button>
                        <button
                            onClick={handlePrintQR}
                            className="py-2 px-3 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print QR</span>
                        </button>
                    </div>

                </div>

            </div>

            {/* ============================================================== */}
            {/* ROW 3: TODAY'S ACTIVITY + MEMBERSHIP OVERVIEW + UPCOMING RENEWALS */}
            {/* ============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full">

                {/* 1. TODAY'S ACTIVITY (COL 4) */}
                <div className="lg:col-span-4 bg-white dark:bg-[#121622]/90 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            Today's Activity
                        </h3>
                        <button
                            onClick={() => onSectionChange?.('active-members')}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-white/5">
                        {activityItems.map((item, idx) => {
                            const ItemIcon = item.icon;
                            return (
                                <div key={idx} className={`flex items-center justify-between gap-2.5 ${idx > 0 ? 'pt-2' : ''}`}>
                                    {/* Left: Time + Icon + Details */}
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-[10px] font-semibold text-slate-400 shrink-0 w-14">
                                            {item.time}
                                        </span>
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${item.iconBg}`}>
                                            <ItemIcon className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                                {item.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Chevron */}
                                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. MEMBERSHIP OVERVIEW (DONUT) (COL 4) - THEMED */}
                <div className="lg:col-span-4 bg-white dark:bg-[#121622]/90 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            Membership Overview
                        </h3>
                        <button
                            onClick={() => onSectionChange?.('plans')}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            View All
                        </button>
                    </div>

                    {/* Donut Chart with Clean Legend */}
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-auto py-1">
                        {/* Donut SVG */}
                        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Track */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="11"
                                    className="text-slate-100 dark:text-white/5"
                                />
                                {/* Active (Dynamically Bound to Theme Primary Color) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke={primaryColor}
                                    strokeWidth="11"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 * (1 - 0.94)}
                                    strokeLinecap="round"
                                />
                                {/* Expiring Soon (Amber 4%) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#f59e0b"
                                    strokeWidth="11"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 * (1 - 0.04)}
                                    transform="rotate(338.4 50 50)"
                                />
                                {/* Expired (Rose 2%) */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="transparent"
                                    stroke="#ef4444"
                                    strokeWidth="11"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={251.2 * (1 - 0.02)}
                                    transform="rotate(352.8 50 50)"
                                />
                            </svg>
                            {/* Center Counter */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                    {dashboardData.activeMembers}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                                    Members
                                </span>
                                <span style={{ color: primaryColor }} className="text-[9px] font-black mt-0.5">
                                    +12%
                                </span>
                            </div>
                        </div>

                        {/* Breakdown Legend */}
                        <div className="space-y-2.5 w-full sm:w-auto">
                            <div className="flex items-center justify-between sm:justify-start gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span style={{ backgroundColor: primaryColor }} className="w-2 h-2 rounded-full"></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Active</span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">612</span>
                                    <span className="text-[11px] font-bold text-slate-400">94%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiring Soon</span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">24</span>
                                    <span className="text-[11px] font-bold text-slate-400">4%</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-start gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Expired</span>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">12</span>
                                    <span className="text-[11px] font-bold text-slate-400">2%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Warning Pill Banner */}
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs">👑</span>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-300 truncate">
                                    <span className="font-black text-amber-700 dark:text-amber-400">{dashboardData.expiringSoon} memberships</span> expiring soon
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => onSectionChange?.('expiring-soon')}
                            className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-400/20 dark:hover:bg-amber-400/30 text-amber-900 dark:text-amber-300 font-bold text-[10px] shrink-0 transition-colors cursor-pointer"
                        >
                            View Members
                        </button>
                    </div>

                </div>

                {/* 3. UPCOMING RENEWALS (COL 4) */}
                <div className="lg:col-span-4 bg-white dark:bg-[#121622]/90 rounded-xl p-4 sm:p-5 border border-slate-200/80 dark:border-white/10 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                            Upcoming Renewals
                        </h3>
                        <button
                            onClick={() => onSectionChange?.('expiring-soon')}
                            className="px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-2 flex-1 divide-y divide-slate-100 dark:divide-white/5">
                        {upcomingRenewals.map((item, idx) => (
                            <div key={item.id || idx} className={`flex items-center justify-between gap-2.5 ${idx > 0 ? 'pt-2' : ''}`}>
                                
                                {/* Left: Avatar Initial Circle + Name + Plan */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${getAvatarBg(idx)}`}>
                                        {item.avatarText}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                            {item.name}
                                        </p>
                                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate">
                                            {item.plan}
                                        </p>
                                    </div>
                                </div>

                                {/* Right: Expiry Date + Days Pill Badge */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
                                        {item.date}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getDaysBadgeStyle(item.daysLeft)}`}>
                                        {item.daysLeft} days
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* ============================================================== */}
            {/* FULLSCREEN QR MODAL OVERLAY (THEMED)                           */}
            {/* ============================================================== */}
            {isQrFullscreen && (
                <div 
                    onClick={() => setIsQrFullscreen(false)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                >
                    <div 
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#121622] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col items-center"
                    >
                        <div className="flex items-center justify-between w-full mb-4">
                            <div className="text-left">
                                <h3 className="text-base font-black text-slate-900 dark:text-white">{gymName}</h3>
                                <p className="text-[11px] text-slate-400">Scan to Mark Attendance</p>
                            </div>
                            <button
                                onClick={() => setIsQrFullscreen(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer"
                            >
                                <Minimize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Large Clear QR Display */}
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-md">
                            <QRCodeCanvas
                                value={qrPayload}
                                size={220}
                                level="M"
                                fgColor="#0f172a"
                                bgColor="#ffffff"
                            />
                        </div>

                        <div className="mt-4 flex items-center justify-between w-full px-1">
                            <span className="text-xs font-bold text-slate-500">Official Facility QR</span>
                            <button
                                onClick={handlePrintQR}
                                style={{ 
                                    background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                                    boxShadow: `0 2px 10px ${primaryColor}35`
                                }}
                                className="px-3.5 py-1.5 rounded-lg text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewSection;
