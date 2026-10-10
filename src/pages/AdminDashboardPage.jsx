import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, LayoutDashboard, Dumbbell, Coins, Megaphone, Search, Filter, Eye, TrendingUp, Users, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, Zap, Award, Calendar, Bell, Settings, LogOut, Menu, X, ChevronRight, Activity, Loader, FileText, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';
import { useAlert } from '../context/AlertContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [activeSection, setActiveSection] = useState('overview');
    const [animateStats, setAnimateStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalGyms: 0,
        totalUsers: 0,
        totalRevenue: 0,
        pendingGyms: 0,
        revenueData: [],
        gymTypeData: [],
        topGyms: []
    });

    const [gymsList, setGymsList] = useState([]);
    const [gymOwners, setGymOwners] = useState([]);
    const [gymOwnersLoading, setGymOwnersLoading] = useState(false);
    const [gymOwnersError, setGymOwnersError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [settlementRequests, setSettlementRequests] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', target: 'ALL_USERS', targetGyms: [] });
    const [revenuePeriod, setRevenuePeriod] = useState('totalRevenue');
    const [commissionPeriod, setCommissionPeriod] = useState('totalCommission');
    const [selectedGym, setSelectedGym] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [planFormData, setPlanFormData] = useState({ name: '', description: '', price: '', duration: '', features: '' });
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [updatingCommission, setUpdatingCommission] = useState(false);
    const [tempCommission, setTempCommission] = useState(0);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, gymId: null, gymName: '' });
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminPlans, setAdminPlans] = useState([]);
    const [verifyModal, setVerifyModal] = useState({ isOpen: false, gymId: null, gymName: '' });
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
        fetchData();
        fetchGymOwners();
        setTimeout(() => setAnimateStats(true), 100);
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, gymsRes, annRes, settleRes, plansRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/gyms/admin-all'),
                api.get('/admin/announcements/user'),
                api.get('/payment/settlement-requests'),
                api.get('/admin-plans/all')
            ]);

            if (statsRes.success) setStats(statsRes.stats);
            if (gymsRes.success) setGymsList(gymsRes.gyms);
            if (annRes.success) setAnnouncements(annRes.announcements);
            if (settleRes.success) setSettlementRequests(settleRes.data);
            if (plansRes.success) setAdminPlans(plansRes.plans);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchGymOwners = async () => {
        setGymOwnersLoading(true);
        setGymOwnersError('');
        try {
            const response = await api.get('/admin/users?role=GymOwner');
            const users = response?.users || response?.data?.users;
            if (!Array.isArray(users)) {
                throw new Error('The server returned an unexpected Gym Owners response.');
            }
            setGymOwners(users);
        } catch (err) {
            console.error('Error fetching Gym Owners:', err);
            setGymOwnersError(err.message || 'Could not fetch Gym Owners.');
        } finally {
            setGymOwnersLoading(false);
        }
    };

    const getSubscriptionInfo = (gym) => {
        if (!gym.isVerified) return { badge: 'Verified First', color: 'bg-slate-100 text-slate-500', subBadge: null };
        if (!gym.assignedPlan) return { badge: 'No Plan', color: 'bg-amber-100 text-amber-700', subBadge: 'Plan Required' };
        
        const status = gym.subscriptionStatus;
        const expiry = gym.subscriptionExpiry;
        const planName = gym.assignedPlan?.name || 'Assigned Plan';
        
        if (status === 'pending') return { badge: planName, subBadge: 'Payment Pending', color: 'bg-orange-100 text-orange-700' };
        
        if (expiry) {
            const days = Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
            if (days < 0) return { badge: planName, subBadge: 'Expired', color: 'bg-rose-100 text-rose-700' };
            return { badge: planName, subBadge: `${days} Days Left`, color: 'bg-emerald-100 text-emerald-700' };
        }
        
        return { badge: planName, subBadge: 'Not Activated', color: 'bg-slate-100 text-slate-600' };
    };

    const handleVerifyToggle = async (gymId, planId) => {
        setIsVerifying(true);
        try {
            const data = await api.put(`/admin/gym/${gymId}/toggle-verify`, { adminPlanId: planId });
            if (data.success) {
                setGymsList(prev => prev.map(g => g.id === gymId ? { ...g, isVerified: data.isVerified } : g));
                // Also refresh stats to update pending count
                const statsRes = await api.get('/admin/stats');
                if (statsRes.success) setStats(statsRes.stats);
 
                setVerifyModal({ isOpen: false, gymId: null, gymName: '' });
                setSelectedPlanId('');
 
                showAlert({
                    title: data.isVerified ? 'Gym Verified' : 'Verification Revoked',
                    message: `Strategic partnership status for this gym has been ${data.isVerified ? 'activated' : 'deactivated'}.`,
                    type: 'success'
                });
            }
        } catch (err) {
            showAlert({
                title: 'Operation Failed',
                message: err.message || 'We encountered an error while updating the verification status. Please try again.',
                type: 'error'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleSendAnnouncement = async () => {
        if (!newAnnouncement.title || !newAnnouncement.message) {
            showAlert({
                title: 'Incomplete Announcement',
                message: 'Please provide both a title and a message to reach your audience.',
                type: 'warning'
            });
            return;
        }
        try {
            let finalTargetType = newAnnouncement.target;
            let finalTargetGyms = [];

            // If a specific gym is selected from dropdown
            const isSingleGymId = gymsList.some(g => g.id === newAnnouncement.target);
            if (isSingleGymId) {
                finalTargetType = 'SPECIFIC_GYMS';
                finalTargetGyms = [newAnnouncement.target];
            } else if (newAnnouncement.target === 'SPECIFIC_GYMS') {
                finalTargetGyms = newAnnouncement.targetGyms;
            }

            const data = await api.post('/admin/announcements', {
                title: newAnnouncement.title,
                message: newAnnouncement.message,
                targetType: finalTargetType,
                targetGyms: finalTargetGyms
            });
            if (data.success) {
                showAlert({
                    title: 'Broadcast Successful',
                    message: 'Your announcement has been dispatched and is now live.',
                    type: 'success'
                });
                setNewAnnouncement({ title: '', message: '', target: 'ALL_USERS', targetGyms: [] });
                // Refresh announcements
                const annRes = await api.get('/admin/announcements/user');
                if (annRes.success) setAnnouncements(annRes.announcements);
            }
        } catch (err) {
            showAlert({
                title: 'Dispatch Failed',
                message: 'We could not send your announcement at this time. Please check your connection.',
                type: 'error'
            });
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const data = await api.delete(`/admin/announcements/${id}`);
            if (data.success) {
                showAlert({
                    title: 'Announcement Removed',
                    message: 'The selected announcement has been permanently deleted.',
                    type: 'success'
                });
                const annRes = await api.get('/admin/announcements/user');
                if (annRes.success) setAnnouncements(annRes.announcements);
            }
        } catch (err) {
            showAlert({
                title: 'Deletion Failed',
                message: 'Unable to remove the announcement. Please try again later.',
                type: 'error'
            });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const fetchGymDetails = async (gymId) => {
        setIsModalLoading(true);
        try {
            const data = await api.get(`/admin/gym/${gymId}/details`);
            if (data.success) {
                setSelectedGym(data);
                setTempCommission(data.gym.commissionRate || 0);
            }
        } catch (err) {
            showAlert({
                title: 'Data Retrieval Error',
                message: 'We could not fetch the details for this gym partner.',
                type: 'error'
            });
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleUpdateCommission = async (gymId, newRate) => {
        const targetGymId = gymId || selectedGym?.gym?.id;
        const targetRate = newRate !== undefined ? newRate : tempCommission;

        if (targetRate < 0 || targetRate > 100) {
            showAlert({
                title: 'Invalid Rate',
                message: 'Please enter a commission percentage between 0 and 100.',
                type: 'warning'
            });
            return;
        }
        setUpdatingCommission(true);
        try {
            const data = await api.put(`/admin/gym/${targetGymId}/commission`, {
                commissionRate: targetRate
            });
            if (data.success) {
                showAlert({
                    title: 'Structure Updated',
                    message: 'The new commission rate has been successfully applied to this partner.',
                    type: 'success'
                });
                // Update local state if it matches selectedGym
                if (selectedGym && selectedGym.gym.id === targetGymId) {
                    setSelectedGym(prev => ({
                        ...prev,
                        gym: { ...prev.gym, commissionRate: data.commissionRate }
                    }));
                }
                // Update gymsList as well to show in table
                setGymsList(prev => prev.map(g =>
                    g.id === targetGymId ? { ...g, commissionRate: data.commissionRate } : g
                ));
            }
        } catch (err) {
            showAlert({
                title: 'Update Failed',
                message: 'Failed to synchronize the new commission rate with the server.',
                type: 'error'
            });
        } finally {
            setUpdatingCommission(false);
        }
    };

    const handleSettlementStatus = async (requestId, status) => {
        const adminNotes = status === 'Approved' ? 'Settlement processed' : prompt('Enter rejection reason:');
        if (status === 'Rejected' && !adminNotes) return;

        const transactionId = status === 'Approved' ? prompt('Enter Transaction ID (optional):') : '';

        try {
            const data = await api.put(`/payment/settlement/${requestId}/status`, {
                status,
                adminNotes,
                transactionId
            });
            if (data.success) {
                showAlert({
                    title: 'Settlement Processed',
                    message: `The settlement request was marked as ${status.toLowerCase()} correctly.`,
                    type: 'success'
                });
                // Refresh data
                const settleRes = await api.get('/payment/settlement-requests');
                if (settleRes.success) setSettlementRequests(settleRes.data);

                // Refresh gyms list to show updated balance
                const gymsRes = await api.get('/admin/gyms/admin-all');
                if (gymsRes.success) setGymsList(gymsRes.gyms);
            }
        } catch (err) {
            showAlert({
                title: 'Processing Error',
                message: 'We encountered an issue while updating the settlement status: ' + err.message,
                type: 'error'
            });
        }
    };

    const handleDeleteGym = async () => {
        if (!deletePassword) {
            showAlert({
                title: 'Security Required',
                message: 'Authentication is required to perform this destructive action.',
                type: 'warning'
            });
            return;
        }

        setIsDeleting(true);
        try {
            const data = await api.delete(`/admin/gym/${deleteModal.gymId}`, {
                password: deletePassword
            });

            if (data.success) {
                showAlert({
                    title: 'Gym Permanently Deleted',
                    message: 'The gym partner and all associated data have been purged from the system.',
                    type: 'success'
                });
                setDeleteModal({ isOpen: false, gymId: null, gymName: '' });
                setDeletePassword('');
                // Refresh the list and stats
                const [gymsRes, statsRes] = await Promise.all([
                    api.get('/admin/gyms/admin-all'),
                    api.get('/admin/stats')
                ]);
                if (gymsRes.success) setGymsList(gymsRes.gyms);
                if (statsRes.success) setStats(statsRes.stats);
            }
        } catch (err) {
            showAlert({
                title: 'Access Denied',
                message: err.response?.data?.message || err.message || 'Incorrect password or insufficient permissions.',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader className="w-12 h-12 text-violet-600 animate-spin" />
                    <p className="text-slate-500 font-bold">Loading Admin Panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50 overflow-hidden font-sans">
            {/* Mobile Menu */}
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-white p-3 rounded-2xl shadow-xl border border-slate-100"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <aside className={`fixed md:relative border-r border-slate-200 flex flex-col shadow-2xl z-40 transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } ${isCollapsed ? 'w-24' : 'w-72'} bg-white`}>
                <div className={`h-20 flex items-center border-b border-slate-200 bg-white shrink-0 relative transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'px-6'}`}>
                    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'scale-125' : 'scale-100'}`}>
                        <img src={logo} alt="Gymshood Admin" className="w-11 h-11 object-contain mr-4" />
                        {!isCollapsed && (
                            <div className="ml-4 transition-all duration-300 opacity-100 whitespace-nowrap">
                                <span className="font-black text-xl text-slate-900">Gymshood</span>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Admin Panel</p>
                            </div>
                        )}
                    </div>
                    {/* Collapse Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md text-slate-400 hover:text-indigo-600 z-50 transition-all"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 transform rotate-180" />}
                    </button>
                </div>

                <nav className={`flex-1 overflow-y-auto py-8 space-y-2 transition-all duration-300 ${isCollapsed ? 'px-3' : 'px-4'}`}>
                    {[
                        { icon: LayoutDashboard, label: 'Dashboard', section: 'overview' },
                        { icon: Dumbbell, label: 'Gym Partners', section: 'gyms' },
                        { icon: Users, label: 'Gym Owners', section: 'gym-owners' },
                        { icon: FileText, label: 'Admin Plans', section: 'admin-plans' },
                        // { icon: Coins, label: 'Settlements', section: 'settlements' },
                        // { icon: Settings, label: 'Commission', section: 'commission' },
                        { icon: Megaphone, label: 'Announcements', section: 'announcements' }
                    ].map(({ icon: Icon, label, section }) => (
                        <button key={section} onClick={() => {
                            setActiveSection(section);
                            setSidebarOpen(false);
                            if (section === 'gym-owners') fetchGymOwners();
                        }}
                            className={`w-full flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center px-0 py-4' : 'px-5 py-3.5 gap-4'
                                } rounded-2xl font-semibold ${activeSection === section ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'
                                } group relative`}
                            title={isCollapsed ? label : ''}
                        >
                            <Icon className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'group-hover:scale-110' : ''}`} />
                            {!isCollapsed && <span className="whitespace-nowrap transition-all duration-300 opacity-100">{label}</span>}
                            {activeSection === section && !isCollapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
                            
                            {/* Hover Tooltip for Collapsed Mode */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                    {label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className={`p-4 border-t border-slate-200 transition-all duration-300 ${isCollapsed ? 'flex flex-col items-center gap-4' : 'space-y-4'}`}>
                    <button onClick={handleLogout} className={`w-full flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center p-4' : 'px-5 py-3.5 gap-4'} rounded-2xl font-semibold text-red-600 hover:bg-red-50 group relative`}>
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span>Logout</span>}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50">
                                Logout
                            </div>
                        )}
                    </button>
                    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-3 p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 overflow-hidden'}`}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-lg shrink-0">A</div>
                        {!isCollapsed && (
                            <div className="transition-all duration-300 opacity-100 overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 whitespace-nowrap">Super Admin</p>
                                <p className="text-xs text-slate-500 truncate">admin@gymshood.com</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm">
                    <div className="pl-14 md:pl-0">
                        <h1 className="text-xl sm:text-3xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                            {activeSection === 'overview' ? 'Dashboard Overview' : 
                             activeSection === 'gyms' ? 'Gym Partners' : 
                             activeSection === 'gym-owners' ? 'Gym Owners' :
                             activeSection === 'admin-plans' ? 'Subscription Plans' :
                             activeSection === 'commission' ? 'Commission Settings' : 
                             activeSection === 'settlements' ? 'Settlements' : 
                             'Announcements'}
                        </h1>
                        <p className="hidden sm:block text-sm text-slate-500 font-medium mt-1">Welcome back, Super Admin</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-3 hover:bg-slate-100 rounded-2xl transition-all">
                            <Bell className="w-5 h-5 text-slate-600" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </button>
                        {/* <span className="text-xs font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 text-white px-5 py-2.5 rounded-full hidden sm:flex items-center gap-2 shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            System Online
                        </span> */}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {/* Overview */}
                    {activeSection === 'overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { icon: Dumbbell, label: 'Total Gyms', value: stats.totalGyms, change: '+', gradient: 'from-violet-500 to-purple-600' },
                                    { icon: Users, label: 'Total Users', value: stats.totalUsers, change: '+', gradient: 'from-blue-500 to-cyan-600' },
                                    { icon: DollarSign, label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toLocaleString('en-IN')}`, change: '+', gradient: 'from-emerald-500 to-teal-600' },
                                    { icon: AlertCircle, label: 'Pending', value: stats.pendingGyms, change: 'Action', gradient: 'from-orange-500 to-red-600' }
                                ].map(({ icon: Icon, label, value, change, gradient }, idx) => (
                                    <div key={idx} className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-xl transform transition-all duration-700 hover:scale-105 ${animateStats ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ transitionDelay: `${idx * 100}ms` }}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg`}>
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600">
                                                <ArrowUpRight className="w-4 h-4" />{change}
                                            </span>
                                        </div>
                                        <h3 className="text-slate-500 text-sm font-semibold mb-2 uppercase">{label}</h3>
                                        <p className="text-4xl font-black text-slate-900">{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                                    <h3 className="font-black text-2xl text-slate-900 flex items-center gap-3 mb-6">
                                        <Activity className="w-7 h-7 text-violet-600" />Platform Growth
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats.revenueData}>
                                                <defs>
                                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                <XAxis dataKey="month" stroke="#94a3b8" />
                                                <YAxis stroke="#94a3b8" />
                                                <Tooltip />
                                                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorRevenue)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                                    <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
                                        <Award className="w-6 h-6 text-amber-500" />Quick Stats
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-slate-600">Verified Gyms</span>
                                                <Zap className="w-4 h-4 text-violet-600" />
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{stats.totalGyms - stats.pendingGyms}/{stats.totalGyms}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-slate-600">Pending Approvals</span>
                                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                            </div>
                                            <p className="text-2xl font-black text-slate-900">{stats.pendingGyms}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gyms */}
                    {activeSection === 'gyms' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-900">Gym Partners Management</h2>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input type="text" placeholder="Search gyms..." className="pl-12 pr-4 py-3 border border-slate-200 rounded-2xl text-sm outline-none focus:border-violet-500 w-full sm:w-64 bg-white shadow-sm" />
                                    </div>
                                    <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                                        <Filter className="w-4 h-4" /> Period:
                                        <select
                                            value={revenuePeriod}
                                            onChange={(e) => setRevenuePeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none text-white font-bold cursor-pointer"
                                        >
                                            <option value="totalRevenue" className="text-slate-900">All Time</option>
                                            <option value="currentMonth" className="text-slate-900">Current Month</option>
                                            <option value="lastMonth" className="text-slate-900">Last Month</option>
                                            <option value="last3Months" className="text-slate-900">Last 3 Months</option>
                                            <option value="last6Months" className="text-slate-900">Last 6 Months</option>
                                        </select>
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-5 text-left font-bold">Gym Name</th>
                                            <th className="p-5 text-left font-bold">Owner</th>
                                            <th className="p-5 text-left font-bold">Location</th>
                                            <th className="p-5 text-left font-bold">Rating</th>
                                            <th className="p-5 text-left font-bold">Revenue</th>
                                            <th className="p-5 text-left font-bold">Subscription</th>
                                            <th className="p-5 text-left font-bold">Status</th>
                                            <th className="p-5 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {gymsList.map((gym, idx) => (
                                            <tr key={idx}
                                                onClick={() => fetchGymDetails(gym.id)}
                                                className="hover:bg-violet-50 transition-all cursor-pointer group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">{gym.name[0]}</div>
                                                        <span className="font-bold text-slate-900">{gym.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-600 font-medium">{gym.owner?.name || 'N/A'}</td>
                                                <td className="p-5 text-slate-600 font-medium">{gym.location?.address?.split(',')[0] || 'Unknown'}</td>
                                                <td className="p-5">
                                                    <div className="flex items-center gap-1">
                                                        <Award className="w-4 h-4 text-amber-500" />
                                                        <span className="font-bold text-slate-900">{gym.avgRating || '0.0'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="font-bold text-slate-900">
                                                        {`₹${Number(gym.revenueBreakdown?.[revenuePeriod] || 0).toLocaleString('en-IN')}`}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    {(() => {
                                                        const info = getSubscriptionInfo(gym);
                                                        return (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sm font-black text-slate-900 leading-tight">{info.badge}</span>
                                                                {info.subBadge && (
                                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider inline-block w-fit ${info.color}`}>
                                                                        {info.subBadge}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${gym.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>{gym.isVerified ? 'Verified' : 'Pending'}</span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (gym.isVerified) {
                                                                    handleVerifyToggle(gym.id);
                                                                } else {
                                                                    setVerifyModal({ isOpen: true, gymId: gym.id, gymName: gym.name });
                                                                }
                                                            }}
                                                            className={`px-5 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${gym.isVerified ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg'
                                                                }`}
                                                        >
                                                            {gym.isVerified ? 'Revoke' : 'Verify Now'}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteModal({ isOpen: true, gymId: gym.id, gymName: gym.name });
                                                            }}
                                                            className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100 shadow-sm"
                                                            title="Delete Gym Permanently"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Revenue */}
                    {activeSection === 'revenue' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black text-slate-900">Global Revenue Analytics</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                                    <h3 className="font-black text-xl text-slate-900 mb-6">Revenue by Gym Type</h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={stats.gymTypeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                    {stats.gymTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
                                    <h3 className="font-black text-xl text-slate-900 mb-6">Top Performing Gyms</h3>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {stats.topGyms.map((gym, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-violet-50 hover:to-purple-50 transition-all border border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-lg text-white ${idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' : 'bg-gradient-to-br from-violet-500 to-purple-600'}`}>{idx + 1}</div>
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">{gym.name}</span>
                                                            <span className={`text-xs font-bold flex items-center gap-1 ${gym.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                                {gym.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{gym.growth}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-xl text-slate-900">₹{Number(gym.revenue).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gym Owners */}
                    {activeSection === 'gym-owners' && (
                        <section className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900">Gym Owners</h2>
                                    <p className="text-sm text-slate-500 mt-1">Registered accounts with the GymOwner role.</p>
                                </div>
                                <button
                                    onClick={fetchGymOwners}
                                    disabled={gymOwnersLoading}
                                    className="px-5 py-3 rounded-2xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 disabled:opacity-60"
                                >
                                    {gymOwnersLoading ? 'Loading...' : 'Refresh list'}
                                </button>
                            </div>

                            {gymOwnersError && (
                                <div role="alert" className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold">
                                    {gymOwnersError}
                                </div>
                            )}

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
                                <table className="w-full min-w-[640px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-5 text-left font-bold">Name</th>
                                            <th className="p-5 text-left font-bold">Email</th>
                                            <th className="p-5 text-left font-bold">Phone</th>
                                            <th className="p-5 text-left font-bold">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {gymOwnersLoading ? (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-slate-500 font-semibold">Loading Gym Owners...</td>
                                            </tr>
                                        ) : gymOwners.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-10 text-center text-slate-500 font-semibold">
                                                    {gymOwnersError ? 'Gym Owners could not be loaded.' : 'No Gym Owners found.'}
                                                </td>
                                            </tr>
                                        ) : gymOwners.map((owner, index) => (
                                            <tr key={owner.id || owner.id || `${owner.email}-${index}`} className="hover:bg-violet-50 transition-colors">
                                                <td className="p-5 font-bold text-slate-900">{owner.name || owner.ownerName || '—'}</td>
                                                <td className="p-5 text-slate-600">{owner.email || '—'}</td>
                                                <td className="p-5 text-slate-600">{owner.phone || '—'}</td>
                                                <td className="p-5 text-slate-600">
                                                    {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                                {gymOwners.length} Gym Owner{gymOwners.length === 1 ? '' : 's'}
                            </p>
                        </section>
                    )}

                    {/* Announcements */}
                    {activeSection === 'announcements' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl self-start">
                                <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2">
                                    <Megaphone className="w-6 h-6 text-violet-600" />Create Announcement
                                </h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Target Audience</label>
                                        <select
                                            value={newAnnouncement.target}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        >
                                            <option value="ALL">All (Everyone)</option>
                                            <option value="ALL_USERS">All Users</option>
                                            <option value="ALL_GYMS">All Gym Owners</option>
                                            <option value="SPECIFIC_GYMS">Multiple Gyms (Select...)</option>
                                            <optgroup label="Individual Gyms">
                                                {gymsList.map(gym => (
                                                    <option key={gym.id} value={gym.id}>{gym.name}</option>
                                                ))}
                                            </optgroup>
                                            <option value="SPECIFIC_USERS">Specific Users (By ID)</option>
                                        </select>
                                    </div>
                                    {newAnnouncement.target === 'SPECIFIC_GYMS' && (
                                        <div className="animate-fade-in">
                                            <label className="block text-sm font-bold text-slate-700 mb-2">Select Gyms</label>
                                            <div className="max-h-40 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                                {gymsList.map(gym => (
                                                    <label key={gym.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={newAnnouncement.targetGyms.includes(gym.id)}
                                                            onChange={(e) => {
                                                                const updated = e.target.checked
                                                                    ? [...newAnnouncement.targetGyms, gym.id]
                                                                    : newAnnouncement.targetGyms.filter(id => id !== gym.id);
                                                                setNewAnnouncement({ ...newAnnouncement, targetGyms: updated });
                                                            }}
                                                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                                                        />
                                                        <span className="text-sm font-bold text-slate-700">{gym.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold px-1">{newAnnouncement.targetGyms.length} gyms selected</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none"
                                            placeholder="Enter title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                                        <textarea
                                            rows={4}
                                            value={newAnnouncement.message}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none resize-none"
                                            placeholder="Enter message..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendAnnouncement}
                                        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-black hover:shadow-2xl transition-all"
                                    >
                                        Send Announcement
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                <h3 className="font-black text-xl text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-6 h-6 text-violet-600" />Announcement History
                                </h3>
                                <div className="space-y-4">
                                    {announcements.length > 0 ? announcements.map((a, idx) => (
                                        <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl hover:shadow-2xl transition-all relative group">
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="font-black text-slate-900 text-lg">{a.title}</h4>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleDeleteAnnouncement(a.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Delete Announcement"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                    <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
                                                        {new Date(a.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 mb-5">{a.message}</p>
                                            <div className="flex items-center gap-4 text-sm">
                                                <span className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 px-4 py-2 rounded-xl font-bold uppercase text-[10px]">
                                                    {a.targetType || 'General'}
                                                </span>
                                                <span className="flex items-center gap-2 text-slate-500 font-semibold">
                                                    <Eye className="w-4 h-4" />{Math.floor(Math.random() * 1000)} Views
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200">
                                            <p className="text-slate-400 font-medium">No announcements found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Admin Plans Management */}
                    {activeSection === 'admin-plans' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-900">Partner Subscription Plans</h2>
                                <button 
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        setPlanFormData({ name: '', description: '', price: '', duration: '', features: '' });
                                        setIsPlanModalOpen(true);
                                    }}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-black flex items-center gap-2 shadow-lg hover:shadow-violet-200 transition-all"
                                >
                                    <Zap className="w-4 h-4" /> Create New Plan
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {adminPlans.map((plan) => (
                                    <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl relative overflow-hidden group hover:border-violet-500 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center text-xl font-black shadow-inner">
                                                <i className="fas fa-gem"></i>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-black text-slate-900">₹{plan.price}</p>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{plan.duration} Days</p>
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2">{plan.description}</p>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedPlan(plan);
                                                    setPlanFormData({
                                                        name: plan.name,
                                                        description: plan.description,
                                                        price: plan.price,
                                                        duration: plan.duration,
                                                        features: (plan.features || []).join('\n')
                                                    });
                                                    setIsPlanModalOpen(true);
                                                }}
                                                className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-violet-50 hover:text-violet-600 transition-all border border-slate-100"
                                            >
                                                Edit Plan
                                            </button>
                                            <button 
                                                onClick={async () => {
                                                    if(window.confirm('Delete this plan?')) {
                                                        try {
                                                            await api.delete(`/admin-plans/delete/${plan.id}`);
                                                            setAdminPlans(prev => prev.filter(p => p.id !== plan.id));
                                                            showAlert({ title: 'Plan Deleted', message: 'The subscription plan has been removed.', type: 'success' });
                                                        } catch(err) {
                                                            showAlert({ title: 'Error', message: err.message, type: 'error' });
                                                        }
                                                    }
                                                }}
                                                className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border border-rose-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {adminPlans.length === 0 && (
                                    <div className="col-span-full py-20 bg-white rounded-[3rem] border border-dashed border-slate-200 text-center">
                                        <Zap className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                        <p className="text-slate-400 font-bold italic">No subscription plans created yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeSection === 'settlements' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-black text-slate-900">Settlement Requests</h2>
                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
                                <table className="w-full min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-5 text-left font-bold">Gym / Owner</th>
                                            <th className="p-5 text-left font-bold">Bank / UPI Details</th>
                                            <th className="p-5 text-left font-bold">Amount</th>
                                            <th className="p-5 text-left font-bold">Requested At</th>
                                            <th className="p-5 text-left font-bold">Status</th>
                                            <th className="p-5 text-right font-bold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {settlementRequests.length > 0 ? settlementRequests.map((req, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-all">
                                                <td className="p-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900">{req.gymId?.name || 'N/A'}</span>
                                                        <span className="text-xs text-slate-500 font-medium">{req.ownerId?.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className="flex flex-col text-xs text-slate-600 space-y-1">
                                                        {req.bankDetails?.upiId && <span className="flex items-center gap-1 font-bold text-indigo-600"><Zap className="w-3 h-3" /> UPI: {req.bankDetails.upiId}</span>}
                                                        {req.bankDetails?.accountNumber && (
                                                            <>
                                                                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> A/C: {req.bankDetails.accountNumber}</span>
                                                                <span className="flex items-center gap-1 ml-4 text-slate-400">IFSC: {req.bankDetails.ifscCode}</span>
                                                                <span className="flex items-center gap-1 ml-4 text-slate-400">Name: {req.bankDetails.accountHolderName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="font-black text-lg text-slate-900">₹{req.amount.toLocaleString()}</span>
                                                </td>
                                                <td className="p-5 text-slate-500 text-xs font-semibold">
                                                    {new Date(req.createdAt).toLocaleString()}
                                                </td>
                                                <td className="p-5">
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        req.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>{req.status}</span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    {req.status === 'Pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleSettlementStatus(req.id, 'Approved')}
                                                                className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 shadow-md transition-all"
                                                                title="Approve"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSettlementStatus(req.id, 'Rejected')}
                                                                className="bg-rose-500 text-white p-2 rounded-xl hover:bg-rose-600 shadow-md transition-all"
                                                                title="Reject"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="p-20 text-center">
                                                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold italic">No settlement requests found</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Commission Settings */}
                    {activeSection === 'commission' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-2xl font-black text-slate-900">Commission Management</h2>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-5 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                                        <Filter className="w-4 h-4" /> Earnings Period:
                                        <select
                                            value={commissionPeriod}
                                            onChange={(e) => setCommissionPeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none text-white font-bold cursor-pointer"
                                        >
                                            <option value="todayCommission" className="text-slate-900">Today</option>
                                            <option value="monthCommission" className="text-slate-900">This Month</option>
                                            <option value="yearCommission" className="text-slate-900">This Year</option>
                                            <option value="totalCommission" className="text-slate-900">All Time</option>
                                        </select>
                                    </button>
                                </div>
                            </div>

                            {/* Total Earnings Summary Card */}
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 rounded-2xl bg-white/20 shadow-lg">
                                        <Coins className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 text-sm font-bold uppercase tracking-wider">Total Platform Earnings ({commissionPeriod.replace('Commission', '')})</p>
                                        <h3 className="text-5xl font-black mt-1">
                                            ₹{gymsList.reduce((sum, gym) => sum + (gym.revenueBreakdown?.[commissionPeriod] || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/20">
                                    <p className="text-white/60 text-xs font-medium">This total reflects the aggregated admin commission from all gym partners for the selected period.</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-x-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                                            <th className="p-5 text-left font-bold">Gym Name</th>
                                            <th className="p-5 text-left font-bold">Owner</th>
                                            <th className="p-5 text-left font-bold">Earnings ({commissionPeriod.replace('Commission', '')})</th>
                                            <th className="p-5 text-left font-bold">Current Rate</th>
                                            <th className="p-5 text-right font-bold tracking-widest">Update Rate (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {gymsList.map((gym) => (
                                            <tr key={gym.id} className="hover:bg-slate-50 transition-all group">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">{gym.name[0]}</div>
                                                        <span className="font-bold text-slate-900">{gym.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-5 text-slate-600 font-medium">{gym.owner?.name || 'N/A'}</td>
                                                <td className="p-5">
                                                    <span className="font-black text-emerald-600">
                                                        ₹{Number(gym.revenueBreakdown?.[commissionPeriod] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="p-5">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-black text-sm">
                                                        {gym.commissionRate || 0}%
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex justify-end gap-3 items-center">
                                                        <div className="relative w-24">
                                                            <input
                                                                type="number"
                                                                defaultValue={gym.commissionRate || 0}
                                                                onBlur={async (e) => {
                                                                    const val = Number(e.target.value);
                                                                    if (val !== gym.commissionRate) {
                                                                        await handleUpdateCommission(gym.id, val);
                                                                    }
                                                                }}
                                                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-violet-500 outline-none font-bold text-slate-700 text-center"
                                                                min="0"
                                                                max="100"
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                                                        </div>
                                                        <button
                                                            onClick={async (e) => {
                                                                const input = e.target.closest('div').querySelector('input');
                                                                await handleUpdateCommission(gym.id, Number(input.value));
                                                            }}
                                                            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:shadow-md transition-all whitespace-nowrap"
                                                        >
                                                            Update
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {/* Gym Details Modal */}
            {selectedGym && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedGym(null)}></div>
                    <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black shadow-inner">
                                    {selectedGym.gym.name[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">{selectedGym.gym.name}</h2>
                                    <p className="text-white/80 text-sm font-medium flex items-center gap-2">
                                        <Award className="w-4 h-4" /> {selectedGym.gym.gymType} • {selectedGym.gym.avgRating} Rating
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedGym(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 font-sans">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Basic Info */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-violet-600" /> Basic Information
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Owner</p>
                                                <p className="font-bold text-slate-900">{selectedGym.gym.owner?.name}</p>
                                                <p className="text-sm text-slate-500">{selectedGym.gym.owner?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Phone</p>
                                                <p className="font-bold text-slate-900 text-sm">{selectedGym.gym.phone}</p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Address</p>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">{selectedGym.gym.location?.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subscription Info */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 bg-gradient-to-br from-indigo-50/50 to-white">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-indigo-600" /> Subscription Status
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Active Plan</p>
                                                <p className="font-extrabold text-indigo-600 text-lg uppercase tracking-tight">
                                                    {selectedGym.gym.assignedPlan?.name || 'No Plan Assigned'}
                                                </p>
                                                <p className="text-sm font-bold text-slate-400">₹{selectedGym.gym.assignedPlan?.price || 0} / {selectedGym.gym.assignedPlan?.duration || '0'} Days</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Status & Expiry</p>
                                                {(() => {
                                                    const info = getSubscriptionInfo(selectedGym.gym);
                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest w-fit ${info.color}`}>
                                                                {info.subBadge || info.badge}
                                                            </span>
                                                            {selectedGym.gym.subscriptionExpiry && (
                                                                <p className="text-sm font-bold text-slate-500 mt-1">
                                                                    Valid until: {new Date(selectedGym.gym.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-emerald-600" /> Documents
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            {selectedGym.gym.verificationDocuments?.gstUrl && (
                                                <a href={api.getMediaUrl(selectedGym.gym.verificationDocuments.gstUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-violet-500 transition-all group shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all"><FileText className="w-4 h-4" /></div>
                                                    <div><p className="text-xs font-bold text-slate-800">GST Certificate</p></div>
                                                </a>
                                            )}
                                            {selectedGym.gym.verificationDocuments?.idProofUrl && (
                                                <a href={api.getMediaUrl(selectedGym.gym.verificationDocuments.idProofUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-violet-500 transition-all group shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all"><Shield className="w-4 h-4" /></div>
                                                    <div><p className="text-xs font-bold text-slate-800">ID Proof</p></div>
                                                </a>
                                            )}
                                            {selectedGym.gym.verificationDocuments?.panUrl && (
                                                <a href={api.getMediaUrl(selectedGym.gym.verificationDocuments.panUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-violet-500 transition-all group shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><FileText className="w-4 h-4" /></div>
                                                    <div><p className="text-xs font-bold text-slate-800">PAN Card</p></div>
                                                </a>
                                            )}
                                            {selectedGym.gym.verificationDocuments?.certificationUrl && (
                                                <a href={api.getMediaUrl(selectedGym.gym.verificationDocuments.certificationUrl)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 hover:border-violet-500 transition-all group shrink-0">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all"><Award className="w-4 h-4" /></div>
                                                    <div><p className="text-xs font-bold text-slate-800">Certification</p></div>
                                                </a>
                                            )}
                                            {(!selectedGym.gym.verificationDocuments?.gstUrl && !selectedGym.gym.verificationDocuments?.idProofUrl && !selectedGym.gym.verificationDocuments?.panUrl && !selectedGym.gym.verificationDocuments?.certificationUrl) && (
                                                <p className="text-slate-400 italic text-sm">No specific documents found</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Photos */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-indigo-600" /> Gym Photos
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {selectedGym.gym.media?.frontPhotoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.frontPhotoUrl)} alt="Front" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase p-2 text-center">Front Photo</div>
                                                </div>
                                            )}
                                            {selectedGym.gym.media?.receptionPhotoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.receptionPhotoUrl)} alt="Reception" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase p-2 text-center">Reception</div>
                                                </div>
                                            )}
                                            {selectedGym.gym.media?.workoutFloorPhotoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.workoutFloorPhotoUrl)} alt="Workout Floor" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase p-2 text-center">Workout Floor</div>
                                                </div>
                                            )}
                                            {selectedGym.gym.media?.logoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200 p-2">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.logoUrl)} alt="Logo" className="w-full h-full object-contain" />
                                                </div>
                                            )}
                                            {(!selectedGym.gym.media?.frontPhotoUrl && !selectedGym.gym.media?.receptionPhotoUrl && !selectedGym.gym.media?.workoutFloorPhotoUrl) && (
                                                <p className="text-slate-400 italic text-sm col-span-full">No functional photos uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Revenue Card */}
                                    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-3xl shadow-lg text-white">
                                        <p className="text-white/80 text-sm font-bold uppercase mb-2">Lifetime Revenue</p>
                                        <p className="text-4xl font-black mb-4">₹{selectedGym.totalRevenue.toLocaleString('en-IN')}</p>
                                    </div>



                                    {/* Facilities */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-500" /> Facilities
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGym.gym.facilities?.map((f, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 uppercase">{f}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* User Statistics Card */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Users className="w-5 h-5 text-indigo-600" /> User Statistics
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Active</p>
                                                <p className="text-2xl font-black text-emerald-700">{selectedGym.userStats?.active || 0}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                                                <p className="text-[10px] font-bold text-rose-600 uppercase mb-1">Expired</p>
                                                <p className="text-2xl font-black text-rose-700">{selectedGym.userStats?.expired || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Plan Purchase Distribution */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <TrendingUp className="w-7 h-7 text-emerald-600" /> Plan Purchase Distribution
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {selectedGym.userStats?.planBreakdown?.map((item, i) => (
                                        <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-3">
                                                <Award className="w-6 h-6 text-violet-500" />
                                            </div>
                                            <h4 className="font-black text-slate-900 text-sm mb-1">{item.planName}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">{item.planType}</p>
                                            <div className="px-4 py-1.5 rounded-full bg-violet-600 text-white text-sm font-black shadow-lg shadow-violet-200">
                                                {item.count} Purchases
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedGym.userStats?.planBreakdown || selectedGym.userStats.planBreakdown.length === 0) && (
                                        <div className="col-span-full py-10 text-center">
                                            <p className="text-slate-400 font-bold italic">No plan purchases recorded yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Plans section */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <Activity className="w-7 h-7 text-violet-600" /> Active Membership Plans
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {selectedGym.plans?.map((plan, i) => (
                                        <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-violet-500 hover:bg-violet-50 transition-all hover:scale-[1.02]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h4 className="font-black text-slate-900 text-lg mb-1">{plan.name}</h4>
                                                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-slate-100 text-slate-500 uppercase tracking-widest">{plan.planType} Plan</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-violet-600">₹{plan.price}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Workout</p>
                                                    <p className="font-black text-slate-800">{plan.duration} hrs</p>
                                                </div>
                                                <div className="bg-white/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Validity</p>
                                                    <p className="font-black text-slate-800">{plan.validity} days</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedGym.plans || selectedGym.plans.length === 0) && (
                                        <div className="col-span-full py-20 text-center">
                                            <Dumbbell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 font-bold italic text-lg">No membership plans created yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Verification Modal for Deletion */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteModal({ ...deleteModal, isOpen: false })}></div>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-6">
                                <Trash2 className="w-10 h-10 text-rose-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Delete Gym?</h2>
                            <p className="text-slate-500 font-medium mb-6">
                                You are about to permanently delete <span className="font-bold text-slate-900">"{deleteModal.gymName}"</span>. This action cannot be undone.
                            </p>

                            <form onSubmit={(e) => { e.preventDefault(); handleDeleteGym(); }} className="w-full space-y-4">
                                <div className="text-left">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Admin Password</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="password"
                                            value={deletePassword}
                                            onChange={(e) => setDeletePassword(e.target.value)}
                                            placeholder="Enter your password..."
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-rose-500 outline-none font-bold text-slate-700 transition-all"
                                            autoFocus
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        disabled={isDeleting}
                                        onClick={() => {
                                            setDeleteModal({ ...deleteModal, isOpen: false });
                                            setDeletePassword('');
                                        }}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDeleting}
                                        className="flex-1 py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-rose-600 to-red-600 hover:shadow-xl hover:shadow-rose-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isDeleting ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm Deletion'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
 
            {/* Verify Modal */}
            {verifyModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}></div>
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative p-8 animate-in fade-in zoom-in duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Verify Gym Partner</h2>
                            <p className="text-slate-500 font-medium mb-6">
                                To verify <span className="font-bold text-slate-900">"{verifyModal.gymName}"</span>, please select a subscription plan that will be assigned to them.
                            </p>
 
                            <div className="w-full text-left space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2 ml-1">Select Subscription Plan</label>
                                    <select
                                        value={selectedPlanId}
                                        onChange={(e) => setSelectedPlanId(e.target.value)}
                                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700 transition-all"
                                    >
                                        <option value="">Select a plan...</option>
                                        {adminPlans.map(plan => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name} - ₹{plan.price} ({plan.duration} days)
                                            </option>
                                        ))}
                                    </select>
                                    {adminPlans.length === 0 && (
                                        <p className="text-xs text-rose-500 mt-2 font-bold px-1">
                                            No plans created. Please create a plan first.
                                        </p>
                                    )}
                                </div>
 
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => setVerifyModal({ ...verifyModal, isOpen: false })}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all border border-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={!selectedPlanId || isVerifying}
                                        onClick={() => handleVerifyToggle(verifyModal.gymId, selectedPlanId)}
                                        className="flex-1 py-4 px-6 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:shadow-emerald-200 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                <span>Verifying...</span>
                                            </>
                                        ) : (
                                            <span>Verify Partner</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Modal */}
            {isPlanModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-violet-600" />
                                {selectedPlan ? 'Edit Subscription Plan' : 'Create New Plan'}
                            </h2>
                            <button onClick={() => setIsPlanModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Plan Name</label>
                                    <input 
                                        type="text" 
                                        value={planFormData.name}
                                        onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="e.g. Pro Partner Plan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={planFormData.price}
                                        onChange={(e) => setPlanFormData({...planFormData, price: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Duration (Days)</label>
                                    <input 
                                        type="number" 
                                        value={planFormData.duration}
                                        onChange={(e) => setPlanFormData({...planFormData, duration: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="30"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
                                    <textarea 
                                        rows={3}
                                        value={planFormData.description}
                                        onChange={(e) => setPlanFormData({...planFormData, description: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700 resize-none"
                                        placeholder="Quick summary of the plan..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Features (one per line)</label>
                                    <textarea 
                                        rows={4}
                                        value={planFormData.features}
                                        onChange={(e) => setPlanFormData({...planFormData, features: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700 resize-none"
                                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100">
                            <button 
                                onClick={async () => {
                                    try {
                                        const payload = {
                                            ...planFormData,
                                            features: (planFormData.features || '').split('\n').filter(f => f.trim() !== '')
                                        };
                                        let res;
                                        if (selectedPlan) {
                                            res = await api.put(`/admin-plans/update/${selectedPlan.id}`, payload);
                                            setAdminPlans(prev => prev.map(p => p.id === selectedPlan.id ? res.plan : p));
                                        } else {
                                            res = await api.post('/admin-plans/create', payload);
                                            setAdminPlans(prev => [...prev, res.plan]);
                                        }
                                        setIsPlanModalOpen(false);
                                        showAlert({ title: 'Success', message: `Plan ${selectedPlan ? 'updated' : 'created'} successfully!`, type: 'success' });
                                    } catch(err) {
                                        showAlert({ title: 'Error', message: err.message, type: 'error' });
                                    }
                                }}
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-violet-200 transition-all"
                            >
                                {selectedPlan ? 'Save Changes' : 'Create Plan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
