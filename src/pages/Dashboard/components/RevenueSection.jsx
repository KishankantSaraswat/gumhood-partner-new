import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../../../utils/api';

Chart.register(...registerables);

const RevenueSection = ({ gym }) => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState(null);
    const [memberData, setMemberData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [paymentFilter, setPaymentFilter] = useState('total');
    const [revenueFilter, setRevenueFilter] = useState('monthly');
    const [availableMonths, setAvailableMonths] = useState([]);
    const [expandedMonth, setExpandedMonth] = useState(null);

    const revenueChartRef = useRef(null);
    const planChartRef = useRef(null);
    const paymentChartRef = useRef(null);
    const revenueChartInstance = useRef(null);
    const planChartInstance = useRef(null);
    const paymentChartInstance = useRef(null);

    const fetchAnalytics = async () => {
        if (!gym?.id) return;
        try {
            const [revResponse, memResponse, plansResponse] = await Promise.all([
                api.get(`/gymdb/dashboard/revenue/${gym.id}`),
                api.get(`/gymdb/dashboard/members/${gym.id}`),
                api.get('/gymdb/userPlans/gym')
            ]);

            if (revResponse.success) {
                setRevenueData(revResponse.data);
                if (revResponse.data.paymentMethodBreakdown?.byMonth) {
                    setAvailableMonths(Object.keys(revResponse.data.paymentMethodBreakdown.byMonth).sort().reverse());
                }
            }
            if (memResponse.success) setMemberData(memResponse.data);
            if (plansResponse.success) setTransactions(plansResponse.plans);
        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [gym?.id]);

    useEffect(() => {
        const createCharts = () => {
            if (loading) return;

            // Revenue Chart
            if (revenueChartRef.current && revenueData) {
                const ctx = revenueChartRef.current.getContext('2d');
                if (revenueChartInstance.current) revenueChartInstance.current.destroy();

                const currentRevenueData = revenueData[revenueFilter] || { dates: [], totals: [] };
                const labels = currentRevenueData.dates || currentRevenueData.labels || [];
                const totals = currentRevenueData.totals || [];

                revenueChartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{
                            label: 'Revenue (₹)',
                            data: totals,
                            backgroundColor: '#3b82f6',
                            borderRadius: 12,
                            barThickness: 12,
                            maxBarThickness: 15,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 12,
                                callbacks: {
                                    label: (context) => `₹${context.parsed.y?.toLocaleString() || '0'}`
                                }
                            }
                        },
                        scales: {
                            y: { beginAtZero: true, grid: { borderDash: [4, 4], color: '#e2e8f0', drawBorder: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' }, callback: (v) => `₹${v}` } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } }
                        }
                    }
                });
            }

            // Distribution Chart
            if (planChartRef.current && memberData?.planDistribution?.byPlan) {
                const ctx = planChartRef.current.getContext('2d');
                if (planChartInstance.current) planChartInstance.current.destroy();

                const distribution = memberData.planDistribution.byPlan;
                const planItems = Object.values(distribution);
                const labels = planItems.map(p => p.planName || 'Unnamed');
                const data = planItems.map(p => p.count || 0);

                planChartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            tooltip: {
                                callbacks: {
                                    label: (context) => {
                                        const value = context.parsed;
                                        const total = data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return ` ${value} members (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Plan Revenue Chart
            if (paymentChartRef.current && revenueData?.planBreakdown) {
                const ctx = paymentChartRef.current.getContext('2d');
                if (paymentChartInstance.current) paymentChartInstance.current.destroy();

                const breakdown = revenueData.planBreakdown;
                const planItems = Object.values(breakdown);
                const labels = planItems.map(p => p.name);
                const data = planItems.map(p => p.totalRevenue);

                paymentChartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels,
                        datasets: [{
                            data,
                            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
                            borderWidth: 0,
                            cutout: '70%'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { weight: 'bold' } } },
                            tooltip: {
                                backgroundColor: '#1e293b',
                                padding: 12,
                                callbacks: {
                                    label: (context) => {
                                        const value = context.parsed;
                                        const total = data.reduce((a, b) => a + b, 0);
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                        return ` ₹${value.toLocaleString()} (${percentage}%)`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        };

        createCharts();

        return () => {
            if (revenueChartInstance.current) revenueChartInstance.current.destroy();
            if (planChartInstance.current) planChartInstance.current.destroy();
            if (paymentChartInstance.current) paymentChartInstance.current.destroy();
        };
    }, [loading, revenueData, memberData, paymentFilter, revenueFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-8">
            {/* Growth Insights Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <i className="fas fa-crown"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Performing Plan</p>
                        <p className="text-lg font-black text-slate-900 truncate max-w-[150px]">
                            {Object.values(revenueData?.planBreakdown || {}).sort((a,b) => b.totalRevenue - a.totalRevenue)[0]?.name || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        <i className="fas fa-users"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Most Popular Plan</p>
                        <p className="text-lg font-black text-slate-900 truncate max-w-[150px]">
                            {Object.values(revenueData?.planBreakdown || {}).sort((a,b) => b.count - a.count)[0]?.name || 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5 transition-all hover:shadow-md group">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <p className="text-2xl font-black text-slate-900">
                            ₹{Object.values(revenueData?.planBreakdown || {}).reduce((acc, p) => acc + p.totalRevenue, 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Revenue Overview</h3>
                            <p className="text-sm text-slate-500 font-medium">{revenueFilter.charAt(0).toUpperCase() + revenueFilter.slice(1)} collection trends</p>
                        </div>
                        <div className="relative">
                            <select
                                value={revenueFilter}
                                onChange={(e) => setRevenueFilter(e.target.value)}
                                className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none appearance-none cursor-pointer pr-10"
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <i className="fas fa-chevron-down text-xs"></i>
                            </div>
                        </div>
                    </div>
                    <div style={{ height: '350px' }}>
                        <canvas ref={revenueChartRef}></canvas>
                    </div>

                    {/* Plan Revenue Breakdown */}
                    {revenueData?.planBreakdown && (
                        <div className="mt-8 pt-8 border-t border-slate-50">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Revenue by Plan</h4>
                                    <p className="text-sm text-slate-500 font-medium">Which plans are driving your growth</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                <div style={{ height: '300px' }} className="relative">
                                    <canvas ref={paymentChartRef}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</p>
                                        <p className="text-2xl font-black text-slate-900">₹{Object.values(revenueData.planBreakdown).reduce((acc, p) => acc + p.totalRevenue, 0).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    {Object.values(revenueData.planBreakdown)
                                        .sort((a, b) => b.totalRevenue - a.totalRevenue)
                                        .slice(0, 3)
                                        .map((plan, idx) => (
                                            <div key={idx} className={`p-4 rounded-2xl border transition-all hover:scale-[1.02] ${
                                                idx === 0 ? 'bg-indigo-50 border-indigo-100' : 
                                                idx === 1 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                                            }`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                                                        idx === 0 ? 'text-indigo-600' : 
                                                        idx === 1 ? 'text-emerald-600' : 'text-slate-500'
                                                    }`}>
                                                        {idx === 0 ? '👑 Top Performer' : idx === 1 ? '🔥 Rising Star' : 'Plan ' + (idx + 1)}
                                                    </span>
                                                    <span className="font-black text-slate-900">₹{plan.totalRevenue.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-slate-700 text-sm truncate pr-4">{plan.name}</p>
                                                    <p className="text-xs font-bold text-slate-400">{plan.count} Enrollments</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 space-y-4">
                        {(revenueData?.monthly?.dates || revenueData?.monthly?.labels || []).map((label, index) => {
                            const isExpanded = expandedMonth === label;
                            const monthlyTransactions = transactions.filter(t => {
                                const tDate = new Date(t.purchaseDate);
                                const m = tDate.getMonth() + 1;
                                const y = tDate.getFullYear();
                                const formatted = `${y}-${m < 10 ? '0' + m : m}`;
                                return formatted === label;
                            });

                            return (
                                <div key={label} className="overflow-hidden bg-slate-50 border border-slate-100 rounded-[1.5rem] transition-all hover:shadow-lg hover:shadow-slate-100 group">
                                    <div
                                        className="flex items-center justify-between p-6 cursor-pointer"
                                        onClick={() => setExpandedMonth(isExpanded ? null : label)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-colors ${isExpanded ? 'text-blue-500 border-blue-100' : 'text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100'}`}>
                                                <i className="fas fa-calendar-alt"></i>
                                            </div>
                                            <span className="text-lg font-black text-slate-700">{label}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xl font-black text-emerald-600">₹{revenueData?.monthly?.totals?.[index]?.toLocaleString() || '0'}</span>
                                            <div className={`w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-blue-500' : ''}`}>
                                                <i className="fas fa-chevron-down text-xs"></i>
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 animate-slide-down">
                                            <div className="pt-4 border-t border-slate-100">
                                                {monthlyTransactions.length === 0 ? (
                                                    <p className="text-center py-4 text-slate-400 font-bold italic text-sm">No transactions found for this month</p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {monthlyTransactions.map((t) => (
                                                            <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group/row hover:border-blue-100 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 group-hover/row:border-blue-100">
                                                                        {t.userId?.profile_picture ? (
                                                                            <img src={t.userId.profile_picture} alt="" className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <span className="text-[10px] font-black text-slate-400">{t.userId?.name?.[0] || 'U'}</span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-sm font-bold text-slate-900">{t.userId?.name || 'Unknown'}</p>
                                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${t.isExpired ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                                                {t.isExpired ? 'Expired' : 'Active'}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.planId?.name || 'Plan'}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-black text-slate-900">₹{t.planId?.price?.toLocaleString() || '0'}</p>
                                                                    <p className="text-[10px] text-slate-400 font-medium tabular-nums">{new Date(t.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">User Distribution</h3>
                    <p className="text-sm text-slate-500 font-medium mb-8">By membership level</p>
                    <div style={{ height: '300px' }}>
                        <canvas ref={planChartRef}></canvas>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                        <p className="text-2xl font-black text-slate-900">{memberData?.planDistribution?.totalActiveUsers || 0}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Active Members</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Enrollments</h3>
                    <button className="text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline text-sm">View Enrollment History</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                <th className="px-8 py-5">Enrollment Type</th>
                                <th className="px-8 py-5">Member</th>
                                <th className="px-8 py-5">Plan Detail</th>
                                <th className="px-8 py-5">Enrollment Date</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-slate-700 divide-y divide-slate-50">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fas fa-receipt text-slate-300"></i>
                                            </div>
                                            <p className="text-slate-400 font-bold italic">No recent transactions to display</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                                    <i className="fas fa-id-badge text-xs"></i>
                                                </div>
                                                <span className="font-bold text-slate-900">New Enrollment</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 overflow-hidden">
                                                    {plan.userId?.profile_picture ? (
                                                        <img src={plan.userId.profile_picture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        plan.userId?.name?.[0] || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{plan.userId?.name || 'Unknown'}</p>
                                                    <p className="text-[10px] text-slate-400 font-medium">{plan.userId?.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-600">{plan.planId?.name || 'Deleted Plan'}</td>
                                        <td className="px-8 py-5 text-slate-500 tabular-nums">
                                            {new Date(plan.purchaseDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${plan.isExpired ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                {plan.isExpired ? 'Expired' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-slate-500 tabular-nums">
                                            {plan.maxExpiryDate ? new Date(plan.maxExpiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueSection;
