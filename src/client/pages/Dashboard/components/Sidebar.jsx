import React, { useState, useEffect } from 'react';
import api from '@/common/utils/api';
import logo from '@/assets/logo.png';

const Sidebar = ({ activeSection, onSectionChange, gym, isOpen, onClose, authContext = null }) => {
    const [announcementCount, setAnnouncementCount] = useState(0);
    const [pendingCashCount, setPendingCashCount] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const data = await api.get('/gymdb/announcements/gym');
                if (data.success) {
                    setAnnouncementCount(data.announcements.length);
                }
            } catch (err) {
                console.error('Error fetching announcement count:', err);
            }
        };

        const fetchPendingCashRequests = async () => {
            try {
                const data = await api.get('/gymdb/gym/pending-requests');
                if (data.success) {
                    setPendingCashCount(data.count);
                }
            } catch (err) {
                console.error('Error fetching pending cash requests:', err);
            }
        };

        fetchAnnouncements();
        fetchPendingCashRequests();
    }, []);

    const hasPermission = (perm, pageId = null) => {
        // If user logged in via client company with user_rights / group rights
        try {
            const storedRights = localStorage.getItem('user_rights');
            if (storedRights) {
                const rights = JSON.parse(storedRights);
                if (Array.isArray(rights)) {
                    if (pageId) {
                        const pageRight = rights.find(r => r.page_id === pageId || r.page_name === perm);
                        if (pageRight) return Boolean(pageRight.view_right ?? true);
                    }
                    return true;
                }
            }
        } catch (e) {
            console.warn('Error reading user_rights:', e);
        }

        // If no authContext loaded or no legacy permissions array, show all menus by default
        if (!authContext || !authContext.permissions || !Array.isArray(authContext.permissions)) return true;
        
        // If user is owner, super admin, company staff, or has null role (permission-based)
        if (!authContext.role || authContext.role === 'SUPER_ADMIN' || authContext.role === 'GYM_OWNER' || authContext.role === 'PARTNER') return true;
        
        return authContext.permissions.includes(perm);
    };

    const baseMenuItems = [
        { id: 'overview', icon: 'fas fa-home', label: 'Overview', show: true },
        { id: 'profile', icon: 'fas fa-building', label: 'My Gym Profile', show: hasPermission('GYM_SETTINGS_VIEW') },
        { id: 'users', icon: 'fas fa-users', label: 'User Master', show: true },
        { id: 'revenue', icon: 'fas fa-chart-line', label: 'Revenue Analytics', show: hasPermission('REPORT_VIEW') },
        { id: 'plans', icon: 'fas fa-tags', label: 'Membership Plans', show: hasPermission('PLAN_VIEW') },
        { id: 'cash-payments', icon: 'fas fa-money-bill-wave', label: 'Enrollment Requests', badge: pendingCashCount, show: hasPermission('PAYMENT_VIEW') },
        { id: 'announcements', icon: 'fas fa-bullhorn', label: 'Announcements', badge: announcementCount, show: true },
        { id: 'payment-history', icon: 'fas fa-history', label: 'Transaction History', show: hasPermission('PAYMENT_VIEW') },
    ];

    const menuItems = baseMenuItems.filter(item => item.show);

    const handleMenuClick = (id) => {
        onSectionChange(id);
        onClose(); // Close sidebar on mobile when item clicked
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] animate-fade-in"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
 fixed md:relative
 bg-white border-r border-slate-200/80 flex-col z-[70] h-screen
 transition-all duration-300 ease-in-out
 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
 ${isCollapsed ? 'w-16' : 'w-56'}
 md:flex select-none
 `}>
                <div className={`h-14 flex items-center border-b border-slate-100 relative shrink-0 bg-white transition-all duration-300 ${isCollapsed ? 'justify-center px-1' : 'px-4 justify-between'}`}>
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Gymshood" className="w-7 h-7 object-contain" />
                        {!isCollapsed && (
                            <div className="flex items-center gap-1">
                                <span className="font-extrabold text-base tracking-tight text-slate-900">
                                    Gymshood
                                </span>
                                <span className="text-[10px] font-black text-theme-primary bg-theme-light px-1.5 py-0.5 rounded-md">
                                    Partner
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Collapse Toggle Button - Desktop Only */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden md:flex p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                        title={isCollapsed ? 'Expand' : 'Collapse'}
                    >
                        <i className={`fas fa-chevron-right text-[10px] transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`}></i>
                    </button>
                    {/* Close button for mobile */}
                    <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times text-base"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 sm:py-6">
                    <nav className={`space-y-1 sm:space-y-2 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                        {menuItems.map((item) => (
                            <a
                                key={item.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleMenuClick(item.id); }}
                                className={`flex items-center transition-all duration-300 relative group ${isCollapsed ? 'justify-center p-4' : 'px-4 sm:px-6 py-3 sm:py-3.5 gap-0'} font-bold ${activeSection === item.id
 ? 'bg-gradient-to-r from-[#ff5e3a] via-[#ff2a6d] to-[#e01e5a] text-white shadow-md shadow-rose-500/30 scale-[1.02]'
 : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700 active:scale-95'
 } rounded-xl`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <i className={`${item.icon} text-base sm:text-lg transition-transform duration-300 ${activeSection === item.id ? 'text-white' : 'group-hover:text-[#ff2a6d]'} ${isCollapsed ? 'group-hover:scale-110 w-auto' : 'w-8'}`}></i>
                                {!isCollapsed && <span className="text-sm tracking-tight whitespace-nowrap transition-all duration-300 opacity-100 ml-0">{item.label}</span>}
                                {item.badge > 0 && (
                                    <span className={`${isCollapsed ? 'absolute top-2 right-2' : 'ml-auto'} bg-gradient-to-r from-[#ff2a6d] to-[#e01e5a] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs`}>
                                        {item.badge}
                                    </span>
                                )}
                                
                                {/* Hover Tooltip for Collapsed Mode */}
                                {isCollapsed && (
                                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                        {item.label}
                                    </div>
                                )}
                            </a>
                        ))}
                    </nav>
                </div>

                <div className={`p-4 border-t border-slate-200 bg-slate-50/50 transition-all duration-300 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                    <div className={`transition-all duration-300 ${isCollapsed ? 'w-full flex flex-col items-center gap-4' : 'space-y-3'}`}>
                        <button
                            onClick={() => onSectionChange('profile')}
                            className={`w-full flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'} bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100 group relative`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <i className="fas fa-store text-xs"></i>
                                </div>
                                {!isCollapsed && <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900 transition-all duration-300 opacity-100">Edit Profile</span>}
                            </div>
                            {!isCollapsed && <i className="fas fa-chevron-right text-xs text-slate-300 group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all"></i>}
                            
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                    Edit Profile
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem('gymshood_token');
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }}
                            className={`w-full flex items-center justify-center transition-all duration-300 ${isCollapsed ? 'p-3' : 'gap-2 px-4 py-3'} bg-red-50 text-red-600 rounded-xl font-bold text-xs tracking-wider hover:bg-red-100 hover:text-red-700 active:scale-[0.98] group relative`}
                        >
                            <i className="fas fa-right-from-bracket"></i>
                            {!isCollapsed && <span>Sign Out</span>}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-red-600 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[100]">
                                    Sign Out
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
