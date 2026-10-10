import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Dashboard/components/Sidebar';
import OverviewSection from './Dashboard/components/OverviewSection';
import ProfileSection from './Dashboard/components/ProfileSection';
import RevenueSection from './Dashboard/components/RevenueSection';
import PlansSection from './Dashboard/components/PlansSection';
import AnnouncementsSection from './Dashboard/components/AnnouncementsSection';
import PaymentHistorySection from './Dashboard/components/PaymentHistorySection';
import PaymentContactInfoSection from './Dashboard/components/PaymentContactInfoSection';
import CashPaymentSection from './Dashboard/components/CashPaymentSection';
import ActiveMembersSection from './Dashboard/components/ActiveMembersSection';
import PlanFormSection from './Dashboard/components/PlanFormSection';
import GymLoader from '../components/GymLoader';
import SettlementRequestModal from './Dashboard/components/SettlementRequestModal';
import PlanFormModal from './Dashboard/components/PlanFormSection';
import SubscriptionOverlay from './Dashboard/components/SubscriptionOverlay';
import api from '../utils/api';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('overview');
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [gymData, setGymData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showSettleModal, setShowSettleModal] = useState(false);
    const [settlementModalData, setSettlementModalData] = useState(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [planModalData, setPlanModalData] = useState(null);
    const [requiresPayment, setRequiresPayment] = useState(false);
    const [authContext, setAuthContext] = useState(null);
    const profileMenuRef = useRef(null);

    // Close profile menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('gymshood_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch Master Authorization Context (/auth/me)
                try {
                    const authRes = await api.get('/auth/me');
                    if (authRes.success) {
                        setAuthContext(authRes);
                        if (authRes.gym?.id) localStorage.setItem('active_gym_id', authRes.gym.id);
                        if (authRes.branch?.id && !localStorage.getItem('active_branch_id')) {
                            localStorage.setItem('active_branch_id', authRes.branch.id);
                        }
                    }
                } catch (authErr) {
                    console.warn('Could not fetch /auth/me context:', authErr.message);
                }

                // 2. Get owner's gym/branch details
                const data = await api.get('/gymdb/gym/owner/me');
                if (data.success && data.gyms && data.gyms.length > 0) {
                    const activeBranchId = localStorage.getItem('active_branch_id');
                    const matchedGym = activeBranchId ? data.gyms.find(g => String(g.id) === String(activeBranchId)) : data.gyms[0];
                    setGymData(matchedGym || data.gyms[0]);
                } else {
                    setError('No gym found for this account.');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                if (err.response && err.response.requiresPayment) {
                    setRequiresPayment(true);
                    setGymData(err.response.gymId ? { _id: err.response.gymId, ...err.response } : err.response);
                    return;
                }
                
                setError(err.message);
                if (err.message.includes('authenticated') || err.message.includes('token')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);


    const handleOpenPlanModal = (planId = null) => {
        setPlanModalData({ planId });
        setShowPlanModal(true);
    };

    const handleClosePlanModal = () => {
        setShowPlanModal(false);
        setPlanModalData(null);
    };

    const titles = {
        'overview': 'Dashboard Overview',
        'profile': 'My Gym Profile',
        'revenue': 'Revenue Analytics',
        'plans': 'Membership Plans',
        'cash-payments': 'Enrollment Requests',
        'announcements': 'Announcements',
        'payment-history': 'Transaction History',
        'payment-contact': 'Payment Contact Info',
        'active-members': 'Active Members',
        'expiring-soon': 'Expiring Soon'
    };

    const renderSection = () => {
        if (loading) return (
            <div className="flex items-center justify-center h-full">
                <GymLoader text="Loading your gym data..." />
            </div>
        );

        if (error) return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <i className="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Something went wrong</h3>
                <p className="text-slate-500 mb-6 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );

        switch (activeSection) {
            case 'overview': return <OverviewSection gym={gymData} onSectionChange={setActiveSection} />;
            case 'profile': return <ProfileSection gym={gymData} />;
            case 'revenue': return <RevenueSection gym={gymData} />;
            case 'plans':
                return <PlansSection
                    gym={gymData}
                    onCreatePlan={() => handleOpenPlanModal()}
                    onEditPlan={(id) => handleOpenPlanModal(id)}
                />;
            case 'create-plan':
                return <PlanFormSection gym={gymData} onBack={() => setActiveSection('plans')} />;
            case 'edit-plan':
                return <PlanFormSection
                    gym={gymData}
                    planId={editingPlanId}
                    onBack={() => {
                        setActiveSection('plans');
                        setEditingPlanId(null);
                    }}
                />;
            case 'cash-payments': return <CashPaymentSection />;
            case 'announcements': return <AnnouncementsSection gym={gymData} />;
            case 'payment-history': return <PaymentHistorySection gym={gymData} />;
            case 'payment-contact': return <PaymentContactInfoSection gym={gymData} />;
            case 'active-members': return <ActiveMembersSection gym={gymData} initialType="active" />;
            case 'expiring-soon': return <ActiveMembersSection gym={gymData} initialType="expiring" />;
            default: return <OverviewSection gym={gymData} />;
        }
    };

    const ownerName = JSON.parse(localStorage.getItem('user'))?.name || 'Owner';
    const initials = ownerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="bg-slate-50 h-screen flex overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Sidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                gym={gymData}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                authContext={authContext}
            />

            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="h-16 sm:h-20 bg-white border-b border-slate-100 flex items-center px-4 sm:px-6 md:px-10 z-10 justify-between">
                    {/* Left: Logo and Title (visible on mobile) */}
                    <div className="flex items-center gap-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden w-10 h-10 -ml-2 flex items-center justify-center text-slate-700 bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-90"
                        >
                            <i className="fas fa-bars text-lg"></i>
                        </button>

                        {/* Title - responsive sizing */}
                        <h1 className="text-lg sm:text-2xl font-black text-[#1e293b] truncate max-w-[150px] sm:max-w-none">
                            {titles[activeSection]}
                        </h1>

                        {/* Branch Switcher for Multi-Branch Gyms */}
                        {authContext?.available_branches && authContext.available_branches.length > 1 && (
                            <div className="hidden lg:flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 ml-4">
                                <i className="fas fa-code-branch text-indigo-600"></i>
                                <span className="text-slate-500 font-bold">Branch:</span>
                                <select
                                    value={authContext.branch?.id || localStorage.getItem('active_branch_id') || ''}
                                    onChange={(e) => {
                                        localStorage.setItem('active_branch_id', e.target.value);
                                        window.location.reload();
                                    }}
                                    className="bg-transparent font-bold text-indigo-700 focus:outline-none cursor-pointer"
                                >
                                    {authContext.available_branches.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Right: Icons and Profile Menu */}
                    <div className="flex items-center gap-3 sm:gap-5">
                        {/* Notification Button */}
                        {/* <button className="hidden md:flex w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-50 items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100 active:scale-95">
                            <i className="fas fa-bell text-sm sm:text-base"></i>
                        </button> */}

                        {/* Profile Button and Dropdown */}
                        <div className="relative" ref={profileMenuRef}>
                            <div
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-indigo-600 items-center justify-center text-white font-bold border-2 border-white shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all text-sm sm:text-base flex select-none"
                            >
                                {initials || 'JD'}
                            </div>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 py-3 z-50 animate-modal-in overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-50 mb-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                                        <p className="text-sm font-black text-slate-900 truncate">{ownerName}</p>
                                    </div>

                                    <div className="px-2 space-y-1">
                                        <button
                                            onClick={() => { setActiveSection('profile'); setIsProfileMenuOpen(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all group font-bold text-sm"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <i className="fas fa-edit text-[10px]"></i>
                                            </div>
                                            <span>Update Gym Info</span>
                                        </button>

                                        {[
                                            { label: 'Transaction History', icon: 'fas fa-history', section: 'payment-history' }
                                        ].map((item, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    if (item.section) {
                                                        setActiveSection(item.section);
                                                        setIsProfileMenuOpen(false);
                                                    }
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-2xl transition-all group font-bold text-sm"
                                            >
                                                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <i className={`${item.icon} text-[10px]`}></i>
                                                </div>
                                                <span>{item.label}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-50 px-2">
                                        <button
                                            onClick={() => {
                                                localStorage.removeItem('gymshood_token');
                                                localStorage.removeItem('token');
                                                window.location.href = '/login';
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all group font-black text-xs uppercase tracking-widest"
                                        >
                                            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-500 group-hover:text-white transition-all">
                                                <i className="fas fa-power-off text-[10px]"></i>
                                            </div>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {renderSection()}
                </div>
            </main>


            {/* Plan Form Modal - Centered on entire dashboard */}
            {showPlanModal && planModalData && (
                <PlanFormModal
                    gym={gymData}
                    planId={planModalData.planId}
                    onClose={handleClosePlanModal}
                    onSuccess={() => {
                        // Refresh plans data if needed
                        handleClosePlanModal();
                    }}
                />
            )}
            {/* Subscription Overlay */}
            {requiresPayment && gymData && (
                <SubscriptionOverlay 
                    gym={gymData} 
                    onPaymentSuccess={() => {
                        setRequiresPayment(false);
                        window.location.reload();
                    }}
                />
            )}
        </div>
    );
};

export default DashboardPage;
