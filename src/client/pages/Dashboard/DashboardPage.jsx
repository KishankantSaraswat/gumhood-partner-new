import React, { useState, useMemo } from 'react';
import { 
    LayoutDashboard, Users, Building2, ShieldCheck, 
    Coins, TrendingUp, Bell, Settings, LogOut, Menu, X, 
    ChevronRight, ChevronDown, ChevronsLeft, ChevronsRight, 
    Search, Sparkles, Calendar, Clock, MapPin, Loader, 
    ArrowUpRight, Zap, Award, FileText, RotateCw, Wallet, 
    UserCheck, DollarSign, Activity, CheckCheck
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeColorPicker, ThemeToggle, SearchableSelect } from '@/common';
import OverviewSection from './components/OverviewSection';
import { ClientUserMasterPage } from '../Users/ClientUserMasterPage';
import { ClientGroupMasterPage } from '../Groups/ClientGroupMasterPage';
import { ClientGroupPermissionsPage } from '../Permissions/ClientGroupPermissionsPage';
import { ClientUserPermissionsPage } from '../Permissions/ClientUserPermissionsPage';
import { ClientRevenueMasterPage } from '../Revenue/ClientRevenueMasterPage';
import { ClientPlanMasterPage } from '../Plans/ClientPlanMasterPage';
import { ClientEnrollmentMasterPage } from '../Enrollments/ClientEnrollmentMasterPage';
import { ClientMemberMasterPage, ClientMemberPage } from '../Members';
import { ClientAnnouncementMasterPage } from '../Announcements/ClientAnnouncementMasterPage';
import { ClientTransactionMasterPage } from '../Transactions/ClientTransactionMasterPage';
import CashPaymentSection from './components/CashPaymentSection';
import AnnouncementsSection from './components/AnnouncementsSection';
import PaymentContactInfoSection from './components/PaymentContactInfoSection';
import ActiveMembersSection from './components/ActiveMembersSection';
import SubscriptionOverlay from './components/SubscriptionOverlay';
import { 
    useClientDashboardLogic, 
    resolveSectionFromMenu 
} from './dashboard.logic';

/**
 * Enterprise Client Partner Dashboard Page
 * Features dynamic company branding, dynamic database menus, theme switching, and responsive navigation.
 */
export const DashboardPage = () => {
    const { currentThemeConfig, isDark } = useTheme();
    const {
        companyData,
        companyName,
        companyLogo,
        companyBackground,
        companyInitials,
        companyEmail,
        companyPhone,
        companyAddress,
        userData,
        userName,
        userEmail,
        userRole,
        userInitial,
        userAvatar,
        clientMenus,
        filteredMenus,
        menusLoading,
        expandedMenuIds,
        activeSection,
        setActiveSection,
        activeMenuTitle,
        sidebarSearchQuery,
        setSidebarSearchQuery,
        isSidebarOpen,
        setIsSidebarOpen,
        isCollapsed,
        setIsCollapsed,
        toggleSidebarCollapse,
        toggleMenuExpand,
        getMenuIconComponent,
        navigateToSection,
        fetchDashboardData,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        profileMenuRef,
        editingPlanId,
        setEditingPlanId,
        showPlanModal,
        setShowPlanModal,
        planModalData,
        setPlanModalData,
        requiresPayment,
        setRequiresPayment,
        authContext,
        gymData,
        stats,
        loading,
        error,
        handleOpenPlanModal,
        handleClosePlanModal,
        handleSignOut,
        ownerName,
        initials,
        titles,
        permissionTargetId,
        setPermissionTargetId,
        getImageUrl
    } = useClientDashboardLogic();

    const [logoError, setLogoError] = useState(false);
    const hasLogo = Boolean(companyLogo && !logoError);

    if (loading && !gymData) {
        return (
            <div className="dashboard-layout-dark flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-5 p-8 rounded-3xl glass-panel-dark text-center border border-amber-500/30 shadow-2xl">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl glow-gold animate-pulse">
                            {companyInitials || 'AI'}
                        </div>
                        <Loader className="w-20 h-20 text-amber-400 animate-spin absolute -top-2 -left-2" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-white tracking-tight">{companyName}</h3>
                        <p className="text-xs font-semibold text-amber-300/80 mt-1 tracking-widest">
                            Loading Partner Operations Portal...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const renderActiveSectionContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-3 w-full">
                        {/* Compact Filter / Context Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 glass-pill-dark px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
                                    <Calendar className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                    <span className="font-bold">This Month (Oct 2026)</span>
                                </div>

                                <div className="flex items-center gap-1.5 glass-pill-dark px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
                                    <Building2 className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                    <span className="font-bold">{companyName}</span>
                                </div>

                                {gymData?.address && (
                                    <div className="hidden sm:flex items-center gap-1.5 glass-pill-dark px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
                                        <MapPin className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                        <span className="font-bold truncate max-w-xs">{gymData.address}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={fetchDashboardData}
                                className="w-8 h-8 rounded-xl header-action-gradient flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs shadow-orange-500/20"
                                title="Refresh Dashboard"
                            >
                                <RotateCw className={`w-3.5 h-3.5 text-white font-black ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Executive Dashboard */}
                        <OverviewSection gym={gymData} onSectionChange={setActiveSection} />
                    </div>
                );

            case 'profile':
                navigateToSection('profile', '/profile');
                return null;
            case 'users-and-roles':
            case 'users':
            case 'user-master':
                return (
                    <ClientUserMasterPage
                        onNavigate={(sec, params) => {
                            if (params?.userId) setPermissionTargetId(params.userId);
                            if (params?.groupId) setPermissionTargetId(params.groupId);
                            navigateToSection(sec);
                        }}
                    />
                );
            case 'user-groups':
            case 'groups':
                return (
                    <ClientGroupMasterPage
                        onNavigate={(sec, params) => {
                            if (params?.userId) setPermissionTargetId(params.userId);
                            if (params?.groupId) setPermissionTargetId(params.groupId);
                            navigateToSection(sec);
                        }}
                    />
                );
            case 'group-permissions':
                return <ClientGroupPermissionsPage initialGroupId={permissionTargetId} />;
            case 'user-permissions':
                return <ClientUserPermissionsPage initialUserId={permissionTargetId} />;
            case 'revenue':
                return <ClientRevenueMasterPage gym={gymData} />;
            case 'plans':
            case 'membership-plans':
            case 'create-plan':
            case 'edit-plan':
                return (
                    <ClientPlanMasterPage
                        gym={gymData}
                        onNavigate={navigateToSection}
                    />
                );
            case 'cash-payments':
            case 'enrollments':
            case 'enrollment-requests':
                return <ClientEnrollmentMasterPage gym={gymData} onNavigate={navigateToSection} />;
            case 'announcements':
                return <ClientAnnouncementMasterPage gym={gymData} />;
            case 'payment-history':
            case 'transactions':
                return <ClientTransactionMasterPage gym={gymData} />;
            case 'payment-contact':
                return <PaymentContactInfoSection gym={gymData} />;
            case 'client-members':
            case 'member-master':
            case 'client-member':
                return <ClientMemberPage gym={gymData} onNavigate={navigateToSection} />;
            case 'active-members':
            case 'members':
                return <ClientMemberMasterPage gym={gymData} initialType="active" />;
            case 'expiring-soon':
                return <ClientMemberMasterPage gym={gymData} initialType="expiring" />;
            default:
                return <OverviewSection gym={gymData} onSectionChange={setActiveSection} />;
        }
    };

    return (
        <div 
            className="dashboard-layout-dark flex h-screen overflow-hidden font-sans select-none"
            style={!isDark ? {
                background: 'radial-gradient(1200px circle at 90% 10%, color-mix(in srgb, var(--grad-primary-from, #f97316) 10%, transparent) 0%, transparent 60%), radial-gradient(900px circle at 10% 30%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, transparent) 0%, transparent 55%), linear-gradient(135deg, color-mix(in srgb, var(--grad-primary-from, #f97316) 6%, #f8fafc) 0%, #f8fafc 40%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, #f1f5f9) 100%)'
            } : undefined}
        >
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/90 text-amber-400 p-2.5 rounded-xl shadow-xl border border-amber-500/30 cursor-pointer"
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar - Theme-Based Shell */}
            <aside 
                className={`fixed md:relative flex flex-col z-40 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                } ${isCollapsed ? 'w-20' : 'w-64'} themed-sidebar-bg select-none`}
                style={!isDark ? {
                    background: 'linear-gradient(180deg, color-mix(in srgb, var(--grad-primary-from, #f97316) 10%, #ffffff) 0%, #ffffff 48%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, #fafbfc) 100%)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderRight: '1px solid rgba(203,213,225,0.55)',
                    boxShadow: '6px 0 24px rgba(15,23,42,0.04)',
                } : undefined}
            >
                
                {/* Brand Header */}
                <div className={`h-16 flex items-center border-b border-slate-200/60 dark:border-white/5 bg-transparent shrink-0 relative transition-all duration-300 ${
 isCollapsed ? 'justify-center px-1' : 'px-3 sm:px-4 justify-between'
 }`}>
                    <div 
                        onClick={() => navigateToSection('overview')}
                        className={`flex items-center cursor-pointer group ${isCollapsed ? 'justify-center w-full' : 'flex-1 min-w-0 pr-2 h-full'}`}
                    >
                        {hasLogo ? (
                            <div className={`flex items-center h-full w-full transition-all duration-300 ${
 isCollapsed ? 'w-10 h-10 justify-center' : 'justify-start'
 }`}>
                                <img 
                                    src={companyLogo} 
                                    alt="" 
                                    onError={() => setLogoError(true)}
                                    className={`transition-all duration-300 filter group-hover:brightness-110 drop-shadow-xs ${
 isCollapsed 
 ? 'w-10 h-10 object-contain p-0.5' 
 : 'h-12 sm:h-13 w-auto max-w-full object-contain object-left'
 }`} 
                                />
                            </div>
                        ) : (
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                                <div
                                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 transition-all duration-300 group-hover:scale-105"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                                        boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                                    }}
                                >
                                    {companyInitials || 'AI'}
                                </div>
                                {!isCollapsed && (
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors truncate">
                                            {companyName}
                                        </span>
                                        <span
                                            className="text-[9px] font-black tracking-widest leading-none transition-colors duration-300"
                                            style={{ color: currentThemeConfig.primary }}
                                        >
                                            Partner Portal
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Toggle Collapse */}
                    <button
                        onClick={toggleSidebarCollapse}
                        className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 ml-auto"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Sidebar Search Input */}
                {!isCollapsed && (
                    <div className="px-3 pt-3 pb-1 shrink-0">
                        <div className="relative flex items-center">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search menus..."
                                value={sidebarSearchQuery}
                                onChange={(e) => setSidebarSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-7 py-2 text-xs bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-orange-400 focus:bg-white dark:focus:bg-white/10 transition-all shadow-2xs"
                            />
                            {sidebarSearchQuery && (
                                <button
                                    onClick={() => setSidebarSearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                    title="Clear search"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Navigation Menu (Dynamically Loaded from Database / Login payload) */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 text-xs font-semibold custom-scrollbar">
                    {filteredMenus.length === 0 ? (
                        menusLoading ? (
                            <div className="space-y-2 py-2 px-1">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="h-10 rounded-xl bg-white/5 animate-pulse flex items-center px-3 gap-3">
                                        <div className="w-4 h-4 rounded-md bg-white/10 shrink-0" />
                                        {!isCollapsed && <div className="h-3 w-28 rounded bg-white/10" />}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-3 py-8 text-center text-xs text-slate-400">
                                <Search className="w-5 h-5 mx-auto mb-1.5 opacity-40 text-slate-400" />
                                {sidebarSearchQuery ? (
                                    <>
                                        <p>No menus matching</p>
                                        <p className="font-bold text-slate-600 dark:text-slate-300 truncate">"{sidebarSearchQuery}"</p>
                                    </>
                                ) : (
                                    <p>No authorized menus assigned</p>
                                )}
                            </div>
                        )
                    ) : (
                        filteredMenus.map((item) => {
                            const ItemIcon = getMenuIconComponent(item);
                            const itemSection = resolveSectionFromMenu(item);
                            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                            const isParentActive = activeSection === itemSection || (hasChildren && item.children.some(c => resolveSectionFromMenu(c) === activeSection));
                            const isExpanded = expandedMenuIds.has(item.id) || 
                                               expandedMenuIds.has(String(item.id)) || 
                                               (typeof item.id === 'number' && expandedMenuIds.has(Number(item.id))) ||
                                               (hasChildren && isParentActive);

                            return (
                                <div key={item.id || item.menuCode} className="space-y-1">
                                    {/* Top-Level Menu Button */}
                                    <button
                                        onClick={(e) => {
                                            if (hasChildren) {
                                                e.preventDefault();
                                                toggleMenuExpand(item.id);
                                            } else {
                                                if (item.route && item.route !== '#') {
                                                    navigateToSection(itemSection, item.route);
                                                } else {
                                                    navigateToSection(itemSection);
                                                }
                                            }
                                        }}
                                        className={`w-full flex items-center transition-all duration-200 ${
                                            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                                        } rounded-xl cursor-pointer ${
                                            isParentActive && (!hasChildren || isCollapsed)
                                                ? 'themed-nav-active font-black scale-[1.02]'
                                                : isParentActive
                                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold shadow-xs'
                                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-transparent hover:border-slate-200 dark:hover:border-white/10'
                                        } group relative`}
                                        title={isCollapsed ? (item.menuName || item.menu_name) : ''}
                                    >
                                        <ItemIcon className={`w-4 h-4 shrink-0 ${isParentActive ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white'} transition-colors`} />
                                        
                                        {!isCollapsed && (
                                            <div className="flex items-center justify-between flex-1">
                                                <span className="truncate">{item.menuName || item.menu_name}</span>
                                                {hasChildren && (
                                                    <span 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenuExpand(item.id);
                                                        }}
                                                        className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-md hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                                        title={isExpanded ? 'Collapse' : 'Expand'}
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>

                                    {/* Nested Child Submenus */}
                                    {hasChildren && isExpanded && !isCollapsed && (
                                        <div className="ml-5 pl-2.5 border-l-2 border-amber-500/30 dark:border-amber-500/20 space-y-1 pt-0.5">
                                            {item.children.map((child) => {
                                                const ChildIcon = getMenuIconComponent(child);
                                                const childSection = resolveSectionFromMenu(child);
                                                const isChildActive = activeSection === childSection;

                                                return (
                                                    <button
                                                        key={child.id || child.menuCode}
                                                        onClick={() => {
                                                            navigateToSection(childSection, child.route);
                                                        }}
                                                        className={`w-full flex items-center px-2.5 py-2 gap-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                                                            isChildActive
                                                                ? 'themed-nav-active font-black scale-[1.01]'
                                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                                                        }`}
                                                    >
                                                        <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${isChildActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                                                        <span className="truncate font-medium">{child.menuName || child.menu_name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </nav>

                {/* Footer Support Card & Logout */}
                <div className="p-3 border-t border-slate-200/60 dark:border-white/5 space-y-2 bg-transparent">
                    {!isCollapsed && (
                        <div
                            className="p-3.5 rounded-2xl text-xs shadow-2xs transition-all duration-300"
                            style={{
                                background: `linear-gradient(135deg, ${currentThemeConfig.primary}12 0%, transparent 100%)`,
                                border: `1px solid ${currentThemeConfig.primary}25`
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center"
                                    style={{ background: `${currentThemeConfig.primary}20` }}
                                >
                                    <Sparkles className="w-3 h-3" style={{ color: currentThemeConfig.primary }} />
                                </div>
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs">AI Copilot Active</span>
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Need assistance? Connect with 24/7 priority support.</p>
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className={`w-full flex items-center transition-all ${
 isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 gap-2.5'
 } text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-300 rounded-xl cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20`}
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
                <header 
                    className="themed-header-bg h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shrink-0 transition-all"
                    style={!isDark ? {
                        background: 'linear-gradient(90deg, color-mix(in srgb, var(--grad-primary-from, #f97316) 10%, #ffffff) 0%, #ffffff 48%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, #ffffff) 100%)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(203,213,225,0.55)',
                        boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
                    } : undefined}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="md:hidden p-2 rounded-xl glass-pill-dark text-slate-700 dark:text-amber-400 cursor-pointer"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {activeMenuTitle}
                            </h1>
                            <p className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Welcome back, {userName}! Here's what's happening at {companyName} today.
                            </p>
                        </div>
                    </div>

                    {/* Global Quick Search Input with ⌘K badge */}
                    <div className="hidden xl:flex items-center relative w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search members, plans, requests..." 
                            className="w-full pl-9 pr-12 py-1.5 text-xs rounded-full border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-orange-400 focus:bg-white dark:focus:bg-white/10 transition-all shadow-2xs" 
                        />
                        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-md select-none">⌘K</kbd>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Financial Year / Branch Switcher */}
                        {authContext?.available_branches && authContext.available_branches.length > 1 ? (
                            <div className="flex items-center gap-1.5 min-w-[170px]">
                                <SearchableSelect
                                    options={authContext.available_branches.map(b => ({
                                        value: b.id,
                                        label: b.name
                                    }))}
                                    value={authContext.branch?.id || localStorage.getItem('active_branch_id') || ''}
                                    onChange={(val) => {
                                        if (val) {
                                            localStorage.setItem('active_branch_id', val);
                                            window.location.reload();
                                        }
                                    }}
                                    placeholder="Select Branch"
                                    searchPlaceholder="Search branch..."
                                    className="!w-auto min-w-[150px]"
                                />
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass-pill-dark rounded-xl text-xs font-bold text-slate-800 dark:text-amber-400 cursor-pointer shadow-2xs">
                                <span>2026 - 2027</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                            </div>
                        )}

                        {/* Dark & Light Theme Switcher */}
                        <ThemeToggle />

                        {/* Notification Bell */}
                        <button
                            onClick={() => navigateToSection('announcements')}
                            className="relative w-9 h-9 rounded-xl glass-pill-dark text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center justify-center transition-all cursor-pointer"
                            title="Announcements & Notices"
                        >
                            <Bell className="w-4 h-4" />
                            {stats.announcementCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                                    {stats.announcementCount}
                                </span>
                            )}
                        </button>

                        {/* Profile Chip with Themed Avatar Ring */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2.5 py-1 glass-pill-dark rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="themed-avatar-ring w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shrink-0 transition-all duration-300 overflow-hidden">
                                    {userAvatar ? (
                                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        userInitial
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col text-left leading-tight">
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">{userName}</span>
                                    <span
                                        className="text-[9px] font-bold tracking-wider transition-colors duration-300 truncate max-w-[130px]"
                                        style={{ color: currentThemeConfig.primary }}
                                    >
                                        {userRole}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-[#0f1118]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 py-3 z-50 animate-modal-in overflow-hidden shadow-2xl ring-1 ring-black/5">
                                    <div className="px-4 pb-2.5">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{userName}</h4>
                                        {userEmail && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{userEmail}</p>
                                        )}
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                {userRole}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigateToSection('profile', '/profile');
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span>Facility Profile Settings</span>
                                        </button>
                                    </div>

                                    <div className="h-px bg-slate-200 dark:bg-white/10 mx-3 mb-2.5"></div>

                                    {/* Color Theme Selector */}
                                    <div className="px-3 pb-2.5">
                                        <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2">Color</p>
                                        <ThemeColorPicker />
                                    </div>

                                    <div className="h-px bg-slate-200 dark:bg-white/10 mx-3 mb-2"></div>

                                    <div className="px-2">
                                        <button
                                            onClick={handleSignOut}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all font-bold text-xs cursor-pointer"
                                        >
                                            <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <div className={`flex-1 ${['plans', 'users', 'groups', 'roles', 'group-permissions', 'user-permissions'].includes(activeSection) ? 'overflow-hidden flex flex-col p-2 sm:p-2.5' : 'overflow-y-auto p-2.5 sm:p-3.5'} custom-scrollbar`}>
                    {renderActiveSectionContent()}
                </div>
            </main>


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
