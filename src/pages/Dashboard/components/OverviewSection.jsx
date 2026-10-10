import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../../utils/api';
import ActiveMembersModal from './ActiveMembersModal';
import { useAlert } from '../../../context/AlertContext';

const OverviewSection = ({ gym, onSectionChange }) => {
    const { showAlert } = useAlert();
    const [showQR, setShowQR] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        activeMembers: 0,
        monthlyRevenue: 0,
        expiringSoon: 0,
        totalPlans: 0,
        nearbyUsers: 0,
    });
    const [loading, setLoading] = useState(true);

    const [activeShift, setActiveShift] = useState(null);

    const [checkinLogs, setCheckinLogs] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const gymId = gym?.id || "N/A";

    useEffect(() => {
        if (!gym?.id) return;

        const fetchStats = async () => {
            try {
                // Fetch stats in parallel
                const endpoints = [
                    `/gymdb/dashboard/members/${gym.id}`,
                    `/gymdb/dashboard/revenue/${gym.id}`,
                    `/gymdb/dashboard/stats/${gym.id}`,
                    `/gymdb/plans/gym/${gym.id}`,
                    `/gymdb/gym/${gym.id}/active-capacity`,
                    `/gymdb/gym/${gym.id}/today-register`,
                    `/gymdb/gym/pending-requests`
                ];

                const results = await Promise.allSettled(endpoints.map(ep => api.get(ep)));

                const [membersRes, revenueRes, statsRes, plansRes, shiftRes, logsRes, requestsRes] = results;

                const membersData = membersRes.status === 'fulfilled' ? membersRes.value : { success: false };
                const revenueData = revenueRes.status === 'fulfilled' ? revenueRes.value : { success: false };
                const statsData = statsRes.status === 'fulfilled' ? statsRes.value : { success: false };
                const plansData = plansRes.status === 'fulfilled' ? plansRes.value : { success: false };
                const shiftData = shiftRes.status === 'fulfilled' ? shiftRes.value : { success: false };
                const logsData = logsRes.status === 'fulfilled' ? logsRes.value : { success: false };
                const requestsData = requestsRes.status === 'fulfilled' ? requestsRes.value : { success: false };

                console.log('📊 Dashboard Data Received (Settled):', {
                    members: membersData,
                    revenue: revenueData,
                    stats: statsData,
                    plans: plansData
                });

                // Extract active members: Try statsData first, then fallback to membersData
                let activeMembers = 0;
                if (statsData.success && statsData.stats?.totalActiveMembers !== undefined) {
                    activeMembers = statsData.stats.totalActiveMembers;
                } else if (membersData.success && membersData.data?.planDistribution?.totalActiveUsers !== undefined) {
                    activeMembers = membersData.data.planDistribution.totalActiveUsers;
                }

                // Extract expiring soon count
                const expiringSoon = membersData.success ? (membersData.data?.expiringSoon || 0) : 0;

                // Extract monthly revenue
                let monthlyRevenue = 0;
                if (revenueData.success && revenueData.data?.monthly?.totals?.length > 0) {
                    monthlyRevenue = revenueData.data.monthly.totals[revenueData.data.monthly.totals.length - 1];
                }

                // Extract nearby users
                const nearbyUsers = statsData.success ? (statsData.stats?.totalNearbyUsers || 0) : 0;

                // Extract plans count
                const totalPlans = plansData.success ? (plansData.plans?.length || 0) : 0;

                setDashboardStats({
                    activeMembers,
                    monthlyRevenue,
                    expiringSoon,
                    totalPlans,
                    nearbyUsers
                });

                if (shiftData.success) setActiveShift(shiftData);
                if (logsData.success) setCheckinLogs(logsData.register || []);
                if (requestsData.success) setPendingRequests(requestsData.data || []);

            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

    }, [gym?.id, refreshTrigger]);

    const handleApprove = async (transactionId) => {
        try {
            const data = await api.post('/gymdb/plans/approve-cash', { transactionId });
            if (data.success) {
                // Refresh data
                setRefreshTrigger(prev => prev + 1);
                // Optional: Show success toast
            }
        } catch (error) {
            console.error("Approval failed", error);
            showAlert({
                title: 'Approval Failed',
                message: error.message || 'We could not process this approval. Please try again later.',
                type: 'error'
            });
        }
    };

    const handleReject = async (transactionId) => {
        const reason = prompt("Enter reason for rejection:");
        if (!reason) return; // Cancelled

        try {
            const data = await api.post('/gymdb/plans/reject-cash', { transactionId, reason });
            if (data.success) {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Rejection failed", error);
            showAlert({
                title: 'Rejection Failed',
                message: error.message || 'We could not process this rejection. Please try again later.',
                type: 'error'
            });
        }
    };

    const stats = [
        { title: 'Active Members', value: dashboardStats.activeMembers, icon: 'fas fa-users-viewfinder', color: 'text-[#4f46e5]', bg: 'bg-[#eef2ff]' },
        { title: 'This Month Revenue', value: `₹${dashboardStats.monthlyRevenue.toLocaleString()}`, icon: 'Rs', color: 'text-[#10b981]', bg: 'bg-[#ecfdf5]', isTextIcon: true },
        { title: 'Expiring Soon', value: dashboardStats.expiringSoon, icon: 'fas fa-exclamation-circle', color: 'text-[#f59e0b]', bg: 'bg-[#fffbeb]' },
        { title: 'Total Membership Plans', value: dashboardStats.totalPlans, icon: 'fas fa-tag', color: 'text-[#8b5cf6]', bg: 'bg-[#f5f3ff]' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => {
                            if (stat.title === 'Active Members') onSectionChange('active-members');
                            if (stat.title === 'Expiring Soon') onSectionChange('expiring-soon');
                        }}
                        className={`bg-white rounded-2xl p-6 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group ${(stat.title === 'Active Members' || stat.title === 'Expiring Soon') ? 'cursor-pointer hover:border-indigo-200' : ''
                            }`}
                    >
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-slate-500">{stat.title}</p>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                            {stat.isTextIcon ? (
                                <span className="font-bold text-lg">{stat.icon}</span>
                            ) : (
                                <i className={`${stat.icon} text-xl`}></i>
                            )}
                        </div>
                    </div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                {/* Left Card: Gym Profile with Flip Animation */}
                <div className="lg:col-span-7 min-h-[500px] lg:h-[500px]" style={{ perspective: '1200px' }}>
                    <div
                        className={`relative w-full h-full transition-all duration-700 ease-in-out ${showQR ? '[transform:rotateY(180deg)]' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front Side */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-[2.5rem] p-6 lg:p-8 text-white shadow-2xl overflow-hidden flex flex-col justify-between border border-slate-700/50 ${showQR ? 'pointer-events-none' : ''}`}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                                            <i className="fas fa-dumbbell text-xl sm:text-2xl text-emerald-400"></i>
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mb-1 truncate max-w-[150px] sm:max-w-none">{gym?.name || "My Gym"}</h3>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${gym?.isVerified ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-amber-400"}`}></span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {gym?.isVerified ? "Verified Partner" : "Verification Pending"}
                                                    </span>
                                                </div>
                                                
                                                {gym?.subscriptionExpiry && (
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                                        <i className="fas fa-crown text-[10px] text-amber-400"></i>
                                                        <span className="text-[10px] font-black text-indigo-100 uppercase tracking-wider">
                                                            {gym.assignedPlan?.name || "Active Plan"} • {(() => {
                                                                const days = Math.ceil((new Date(gym.subscriptionExpiry) - new Date()) / (1000 * 60 * 60 * 24));
                                                                return days > 0 ? `${days} Days Left` : "Expired Today";
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    {activeShift?.isOpen ? (
                                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
                                            <div className="flex justify-between items-center mb-6">
                                                <div>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Current Session</p>
                                                    <h4 className="text-xl font-black text-white">{activeShift.shiftInfo.name}</h4>
                                                </div>
                                                <div className="text-right">
                                                    <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-black uppercase tracking-wider mb-1 inline-block">
                                                        Active
                                                    </div>
                                                    <p className="text-white font-mono text-sm">{activeShift.shiftInfo.startTime} - {activeShift.shiftInfo.endTime}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-300">Capacity Status</span>
                                                    <span className="font-bold text-white">{activeShift.activeCount} <span className="text-slate-500">/ {activeShift.capacity}</span></span>
                                                </div>
                                                <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700 ease-out"
                                                        style={{ width: `${Math.min((activeShift.activeCount / activeShift.capacity) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/5 rounded-3xl border border-white/5">
                                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                                <i className="fas fa-moon text-2xl text-indigo-400"></i>
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2">Gym Closed</h4>
                                            <p className="text-slate-400 text-sm max-w-[200px]">No active shifts at the moment. Check back later.</p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setShowQR(true)}
                                    className="mt-6 w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                                >
                                    <i className="fas fa-qrcode text-lg group-hover:rotate-12 transition-transform"></i>
                                    <span>Show QR Access Code</span>
                                </button>
                            </div>

                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                        </div>

                        {/* Back Side - QR Code */}
                        <div
                            className={`absolute inset-0 bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-2xl flex flex-col items-center border border-slate-100 ${!showQR ? 'pointer-events-none' : ''}`}
                            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                            <button
                                onClick={() => setShowQR(false)}
                                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all z-20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="w-full h-full flex flex-col items-center justify-center pt-8">
                                <div className="text-center mb-8">
                                    <div className="inline-block p-1 bg-indigo-50 rounded-xl mb-3">
                                        <div className="px-3 py-1 bg-white rounded-lg shadow-sm">
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Secure Access Pass</span>
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{gym?.name || "Gym Name"}</h2>
                                </div>

                                <div className="relative mb-8 group">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative p-8 bg-white rounded-[2rem] shadow-xl border border-slate-100">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.5)] animate-scan z-10 opacity-50 rounded-t-[2rem]"></div>
                                        <QRCodeCanvas
                                            id="gym-qr-code"
                                            value={gymId}
                                            size={200}
                                            level="H"
                                            includeMargin={true}
                                            className="mx-auto"
                                        />
                                        <div className="absolute bottom-4 left-0 w-full text-center">
                                            <p className="text-[10px] font-mono text-slate-400">SCAN TO CHECK-IN</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full max-w-sm grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => {
                                            const canvas = document.getElementById('gym-qr-code');
                                            if (canvas) {
                                                const url = canvas.toDataURL('image/png');
                                                const link = document.createElement('a');
                                                link.download = `${gym?.name || 'gym'}-qrcode.png`;
                                                link.href = url;
                                                link.click();
                                            }
                                        }}
                                        className="py-4 bg-slate-900 text-white rounded-[1.5rem] font-bold text-xs tracking-wider shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-download"></i> SAVE
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const canvas = document.getElementById('gym-qr-code');
                                            if (canvas && navigator.share) {
                                                try {
                                                    const blob = await new Promise(resolve => canvas.toBlob(resolve));
                                                    const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                                                    await navigator.share({
                                                        title: gym?.name || 'Gym QR Code',
                                                        text: 'Check out my gym QR code!',
                                                        files: [file]
                                                    });
                                                } catch (err) {
                                                    console.error('Error sharing:', err);
                                                }
                                            } else {
                                                // Fallback for browsers that don't support share
                                                const canvas = document.getElementById('gym-qr-code');
                                                if (canvas) {
                                                    const url = canvas.toDataURL('image/png');
                                                    const link = document.createElement('a');
                                                    link.download = `${gym?.name || 'gym'}-qrcode.png`;
                                                    link.href = url;
                                                    link.click();
                                                }
                                            }
                                        }}
                                        className="py-4 bg-[#2d6a4f] text-white rounded-[1.5rem] font-bold text-xs tracking-wider shadow-xl hover:bg-[#1b4332] transition-all flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-share-nodes"></i> SHARE
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Pending Approvals & Live Check-ins */}
                <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Pending Approvals Card */}
                    {pendingRequests.length > 0 && (
                        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 border border-amber-100 shadow-sm flex flex-col max-h-[400px]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg sm:text-xl font-black text-slate-900">Pending Approvals</h3>
                                <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 animate-pulse">
                                    <i className="fas fa-clock"></i>
                                    Action Needed
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {req.userId?.profile_picture ? (
                                                    <img src={req.userId.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {req.userId?.name?.[0] || 'U'}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{req.userId?.name || 'Unknown User'}</p>
                                                    <p className="text-xs text-slate-500">{req.metadata?.planId?.name || 'Plan'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-indigo-600">₹{req.amount}</p>
                                                <p className="text-[10px] text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-1">
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                className="flex-1 py-2 bg-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Live Check-ins Card */}
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 border border-slate-100 shadow-sm flex flex-col h-auto lg:h-[500px] min-h-[400px] flex-1">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h3 className="text-lg sm:text-xl font-black text-slate-900">Live Activity</h3>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Live
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 sm:space-y-4 custom-scrollbar">
                            {checkinLogs.length > 0 ? (
                                checkinLogs.map((log, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                            {log.photo ? (
                                                <img src={log.photo} alt={log.userName} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs font-black text-indigo-600">{log.userName?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-900 text-sm truncate">{log.userName || "Unknown User"}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Checked In</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-black text-slate-900 text-xs">
                                                {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                    <i className="fas fa-clipboard-check text-4xl mb-3"></i>
                                    <p className="text-xs font-bold uppercase tracking-widest text-center">No check-ins today yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                @keyframes scan {
                0% { top: 10%; }
                100% { top: 90%; }
                }
                .animate-scan {
                animation: scan 2.5s ease-in-out infinite;
                }
            `}} />
            </div>
        </div>
    );
};

export default OverviewSection;

