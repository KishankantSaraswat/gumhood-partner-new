import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, LayoutDashboard, Dumbbell, Coins, Megaphone, Search, Filter, Eye, TrendingUp, Users, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight, Zap, Award, Calendar, Bell, Settings, LogOut, Menu, X, ChevronRight, Activity, Loader, FileText, Trash2, RotateCw, ShoppingCart, AlertOctagon, HelpCircle, ChevronDown, CheckCircle2, ChevronLeft, ChevronsLeft, ChevronsRight, Building2, Sparkles, Clock, Wallet, CheckCheck, MapPin, CreditCard, UserCheck, BarChart3, Flame, UserPlus, Layers, Package, ShieldCheck, KeyRound } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../common/utils/api';
import { useAlert } from '../../../context/AlertContext';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColorPicker, ThemeToggle } from '../../../common';
import CompanyMasterPage from '../Company/CompanyMasterPage';
import GlobalMenuMasterPage from '../Menus/GlobalMenuMasterPage';
import UserGroupMasterPage from '../Groups/UserGroupMasterPage';
import UserMasterPage from '../Users/UserMasterPage';
import GroupPermissionsPage from '../Permissions/GroupPermissionsPage';
import UserPermissionsPage from '../Permissions/UserPermissionsPage';
import CompanyPermissionsPage from '../CompanyPermissions/CompanyPermissionsPage';
import { 
    SECTION_ROUTES, 
    resolveSectionFromMenu, 
    resolveSectionFromPathname, 
    useAdminDashboardLogic 
} from './adminDashboard.logic';

export { SECTION_ROUTES, resolveSectionFromMenu, resolveSectionFromPathname };

const AdminDashboard = () => {
    const { currentThemeConfig, themeMode, isDark, setThemeMode } = useTheme();
    const {
        adminProfile,
        adminName,
        adminEmail,
        adminRole,
        adminInitial,
        adminAvatar,
        activeSection,
        setActiveSection,
        permissionTargetId,
        setPermissionTargetId,
        animateStats,
        sidebarOpen,
        setSidebarOpen,
        isCollapsed,
        setIsCollapsed,
        toggleSidebarCollapse,
        sidebarSearchQuery,
        setSidebarSearchQuery,
        isProfileMenuOpen,
        setIsProfileMenuOpen,
        profileRef,
        loading,
        stats,
        setStats,
        companiesList,
        gymsList,
        setGymsList,
        gymOwners,
        gymOwnersLoading,
        gymOwnersError,
        announcements,
        setAnnouncements,
        settlementRequests,
        setSettlementRequests,
        newAnnouncement,
        setNewAnnouncement,
        revenuePeriod,
        setRevenuePeriod,
        commissionPeriod,
        setCommissionPeriod,
        selectedGym,
        setSelectedGym,
        selectedPlan,
        setSelectedPlan,
        isPlanModalOpen,
        setIsPlanModalOpen,
        planFormData,
        setPlanFormData,
        isModalLoading,
        updatingCommission,
        tempCommission,
        setTempCommission,
        deleteModal,
        setDeleteModal,
        deletePassword,
        setDeletePassword,
        isDeleting,
        adminPlans,
        verifyModal,
        setVerifyModal,
        selectedPlanId,
        setSelectedPlanId,
        isVerifying,
        dbMenus,
        menusLoading,
        expandedMenuIds,
        navigateToSection,
        fetchData,
        fetchGymOwners,
        getSubscriptionInfo,
        handleVerifyToggle,
        handleSendAnnouncement,
        handleDeleteAnnouncement,
        handleLogout,
        fetchGymDetails,
        handleUpdateCommission,
        handleSettlementStatus,
        handleDeleteGym,
        toggleMenuExpand,
        getMenuIconComponent,
        filteredDbMenus,
        activeMenuTitle,
        totalCompanies,
        activeCompanies,
        trialCompanies,
        suspendedCompanies,
        totalBranches,
        totalUsers,
        paidSubscriptions,
        trialSubscriptions,
        totalActiveSubscriptions,
        mrr,
        upcomingRenewalsCount,
        companyGrowthData,
        subscriptionRevenueData,
        subscriptionPlanData,
        aiFeatureUsageData
    } = useAdminDashboardLogic();

    if (loading) {
        return (
            <div className="dashboard-layout-dark flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-5 p-8 rounded-3xl glass-panel-dark text-center border border-amber-500/30 shadow-2xl">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl glow-gold animate-pulse">
                            AI
                        </div>
                        <Loader className="w-20 h-20 text-amber-400 animate-spin absolute -top-2 -left-2" />
                    </div>
                    <div>
                        <h3 className="text-xl font-extrabold text-white tracking-tight">AI GymOS</h3>
                        <p className="text-xs font-semibold text-amber-300/80 mt-1 tracking-widest">Loading Admin Control Hub...</p>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div 
            className="dashboard-layout-dark flex h-screen overflow-hidden font-sans select-none"
            style={!isDark ? {
                background: 'radial-gradient(1200px circle at 90% 10%, color-mix(in srgb, var(--grad-primary-from, #f97316) 10%, transparent) 0%, transparent 60%), radial-gradient(900px circle at 10% 30%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, transparent) 0%, transparent 55%), linear-gradient(135deg, color-mix(in srgb, var(--grad-primary-from, #f97316) 6%, #f8fafc) 0%, #f8fafc 40%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, #f1f5f9) 100%)'
            } : undefined}
        >
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/90 text-amber-400 p-2.5 rounded-xl shadow-xl border border-amber-500/30 cursor-pointer"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar - Theme-Based Shell (from theme-sidebar-header.md) */}
            <aside 
                className={`fixed md:relative flex flex-col z-40 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
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
 isCollapsed ? 'justify-center px-1' : 'px-4 justify-between'
 }`}>
                    <div 
                        onClick={() => navigateToSection('overview')}
                        className="flex items-center gap-3 cursor-pointer group"
                        title="Go to Admin Dashboard"
                    >
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 transition-all duration-300 group-hover:scale-105"
                            style={{
                                background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                                boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                            }}
                        >
                            AI
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-amber-400 transition-colors">AI GymOS</span>
                                </div>
                                <span
                                    className="text-[9px] font-black tracking-widest leading-none transition-colors duration-300"
                                    style={{ color: currentThemeConfig.primary }}
                                >
                                    ADMIN PANEL
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Toggle Collapse */}
                    <button
                        onClick={toggleSidebarCollapse}
                        className="hidden md:flex p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Sidebar Search Input (In-Sidebar Search from theme-sidebar-header.md) */}
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

                {/* Navigation Menu (Dynamically Loaded from Database /admin/menus/me) */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 text-xs font-semibold custom-scrollbar">
                    {/* Empty state when searching or no menus */}
                    {filteredDbMenus.length === 0 ? (
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
                        filteredDbMenus.map((item) => {
                            const ItemIcon = getMenuIconComponent(item);
                            const itemSection = resolveSectionFromMenu(item);
                            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                            const isExpanded = expandedMenuIds.has(item.id);
                            const isParentActive = activeSection === itemSection || (hasChildren && item.children.some(c => resolveSectionFromMenu(c) === activeSection));

                            return (
                                <div key={item.id || item.menuCode} className="space-y-1">
                                    {/* Top-Level Menu Button */}
                                    <button
                                        onClick={() => {
                                            if (hasChildren) {
                                                toggleMenuExpand(item.id);
                                            }
                                            if (item.route && item.route !== '#') {
                                                navigateToSection(itemSection, item.route);
                                            } else if (!hasChildren) {
                                                navigateToSection(itemSection);
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
                                                {hasChildren ? (
                                                    <span className="p-0.5 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-transform">
                                                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                                    </span>
                                                ) : item.menuLabel && item.menuLabel !== item.menuName ? (
                                                    <span
                                                        className="text-[10px] font-black px-1.5 py-0.5 rounded-full text-white shadow-xs"
                                                        style={{ background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)` }}
                                                    >
                                                        {item.menuLabel}
                                                    </span>
                                                ) : null}
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
                        onClick={handleLogout}
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
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-xl glass-pill-dark text-slate-700 dark:text-amber-400 cursor-pointer"
                        >
                            <Menu className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {activeMenuTitle}
                            </h1>
                            <p className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Welcome back, Admin! Here's what's happening in your gym network today.
                            </p>
                        </div>
                    </div>

                    {/* Global Quick Search Input with ⌘K badge */}
                    <div className="hidden xl:flex items-center relative w-80">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search members, plans, invoices..." 
                            className="w-full pl-9 pr-12 py-1.5 text-xs rounded-full border border-slate-200/90 dark:border-white/10 bg-white/70 dark:bg-white/5 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-orange-400 focus:bg-white dark:focus:bg-white/10 transition-all shadow-2xs" 
                        />
                        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-md select-none">⌘K</kbd>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {/* Financial Year Context Switcher (from theme-sidebar-header.md) */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass-pill-dark rounded-xl text-xs font-bold text-slate-800 dark:text-amber-400 cursor-pointer shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                            <span>2026 - 2027</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                        </div>

                        {/* Dark & Light Theme Switcher */}
                        <ThemeToggle />

                        {/* Notification Bell */}
                        <button
                            onClick={() => navigateToSection('announcements')}
                            className="relative w-9 h-9 rounded-xl glass-pill-dark text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center justify-center transition-all cursor-pointer"
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                                5
                            </span>
                        </button>

                        {/* Profile Chip with Themed Avatar Ring */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2.5 py-1 glass-pill-dark rounded-2xl hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer"
                            >
                                <div className="themed-avatar-ring w-8 h-8 rounded-full text-white font-black flex items-center justify-center text-xs shrink-0 transition-all duration-300 overflow-hidden">
                                    {adminAvatar ? (
                                        <img src={adminAvatar} alt={adminName} className="w-full h-full object-cover rounded-full" />
                                    ) : (
                                        adminInitial
                                    )}
                                </div>
                                <div className="hidden md:flex flex-col text-left leading-tight">
                                    <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate max-w-[130px]">{adminName}</span>
                                    <span
                                        className="text-[9px] font-bold tracking-wider transition-colors duration-300 truncate max-w-[130px]"
                                        style={{ color: currentThemeConfig.primary }}
                                    >
                                        {adminRole}
                                    </span>
                                </div>
                                <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block" />
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white/95 dark:bg-[#0f1118]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 py-3 z-50 animate-modal-in overflow-hidden shadow-2xl ring-1 ring-black/5">
                                    <div className="px-4 pb-2.5">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{adminName}</h4>
                                        {adminEmail && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">{adminEmail}</p>
                                        )}
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                {adminRole}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="px-2 pb-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigateToSection('overview');
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span>Profile Details</span>
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
                                            onClick={handleLogout}
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

                <div className={`flex-1 ${['global-menus', 'user-master', 'user-groups', 'group-permissions', 'user-permissions', 'permissions-matrix', 'company-master'].includes(activeSection) ? 'overflow-hidden flex flex-col p-3 sm:p-4' : 'overflow-y-auto p-4 sm:p-5'} custom-scrollbar`}>
                    {/* Overview Section */}
                    {activeSection === 'overview' && (
                        <div className="space-y-4 max-w-[1600px] mx-auto">
                            {/* Dashboard Welcome Hero Banner with Cybernetic Golden Runner */}
                            <div className="hero-runner-banner relative rounded-2xl border border-amber-500/30 p-5 sm:p-6 overflow-hidden shadow-xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
                                <div className="max-w-xl z-10 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-amber-400/20 border border-amber-400/35 text-amber-300 flex items-center gap-1.5 backdrop-blur-md">
                                            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> AI GYM OS • AUTONOMOUS OPERATIONS
                                        </span>
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                                        Good Morning, {adminName || 'Admin'} <span className="inline-block animate-bounce">👋</span>
                                    </h2>
                                    <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                                        Your gym network is running with <span className="text-amber-300 font-bold">{stats.totalGyms || 12} partner gyms</span> and <span className="text-emerald-400 font-bold">{Number(stats.totalUsers * 3 || 1274).toLocaleString('en-IN')} active members</span> across all branches today.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <button
                                            onClick={() => navigateToSection('revenue')}
                                            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer"
                                        >
                                            <span>View AI Insights</span>
                                            <ArrowUpRight className="w-4 h-4 text-slate-950 font-black" />
                                        </button>
                                        <button
                                            onClick={() => navigateToSection('gyms')}
                                            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900/60 hover:bg-slate-900/80 border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
                                        >
                                            <span>Manage Gym Network</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Right Quick Action Feature Pills matching reference */}
                                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-1 gap-2 z-10 shrink-0 w-full lg:w-56">
                                    {[
                                        { icon: Zap, label: 'Predict Member Churn' },
                                        { icon: FileText, label: 'Automate Follow-ups' },
                                        { icon: Award, label: 'AI Workout & Diet Plans' },
                                        { icon: TrendingUp, label: 'Grow Your Revenue' },
                                    ].map((item, idx) => {
                                        const ItemIcon = item.icon;
                                        return (
                                            <div key={idx} className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-950/60 border border-amber-400/20 backdrop-blur-md text-[11px] font-bold text-slate-200 hover:border-amber-400/50 hover:text-white transition-all cursor-pointer">
                                                <ItemIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Filter Bar with Clean White Glass Pills */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="flex items-center gap-2 glass-pill-dark px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                                        <Calendar className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                        <select
                                            value={revenuePeriod}
                                            onChange={(e) => setRevenuePeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none font-bold cursor-pointer text-xs"
                                        >
                                            <option value="totalRevenue">This Month</option>
                                            <option value="currentMonth">All Time</option>
                                            <option value="lastMonth">Last Month</option>
                                            <option value="last3Months">Last 3 Months</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2 glass-pill-dark px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                                        <Building2 className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                        <span className="font-bold">All Companies ({totalCompanies})</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                                    </div>

                                    <div className="flex items-center gap-2 glass-pill-dark px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-2xs">
                                        <MapPin className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                        <span className="font-bold">All Branches ({totalBranches})</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
                                    </div>

                                    <div className="hidden sm:flex items-center gap-2 glass-pill-dark px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs">
                                        <Clock className="w-3.5 h-3.5" style={{ color: currentThemeConfig.primary }} />
                                        <span className="font-bold">01 Oct 2026 - 17 Oct 2026</span>
                                    </div>
                                </div>

                                <button
                                    onClick={fetchData}
                                    className="w-9 h-9 rounded-xl header-action-gradient flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md shadow-orange-500/20"
                                    title="Refresh Analytics"
                                >
                                    <RotateCw className={`w-4 h-4 text-white font-black ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Row 1 Metrics - 4 Large SaaS Platform Stat Cards with Filled Sparklines */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* 1. Total Companies */}
                                <div className="glass-panel-dark kpi-card-purple p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                    <div className="flex items-start justify-between z-10">
                                        <div>
                                            <span className="text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">Total Companies</span>
                                            <h3 className="text-3xl font-black kpi-stat-purple text-purple-600 dark:text-purple-400 mt-1 tracking-tight">
                                                {totalCompanies}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/25 flex items-center gap-0.5">
                                                    <ArrowUpRight className="w-3 h-3" /> +3 this month
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{activeCompanies} Active • {trialCompanies} Trial</span>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0">
                                            <Building2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    {/* Purple Sparkline Wave */}
                                    <div className="w-full h-14 mt-2 -mb-1">
                                        <svg className="w-full h-full text-purple-500" viewBox="0 0 120 28" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="purpleSparkSaaS" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.45} />
                                                    <stop offset="60%" stopColor="#a855f7" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,24 C14,24 22,18 34,18 C46,18 54,25 66,25 C76,25 82,9 92,9 C102,9 110,22 120,16 L120,28 L0,28 Z" fill="url(#purpleSparkSaaS)" />
                                            <path d="M0,24 C14,24 22,18 34,18 C46,18 54,25 66,25 C76,25 82,9 92,9 C102,9 110,22 120,16" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* 2. Total Branches */}
                                <div className="glass-panel-dark kpi-card-emerald p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                    <div className="flex items-start justify-between z-10">
                                        <div>
                                            <span className="text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">Total Branches</span>
                                            <h3 className="text-3xl font-black kpi-stat-emerald text-emerald-600 dark:text-emerald-400 mt-1 tracking-tight">
                                                {totalBranches}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-0.5">
                                                    <ArrowUpRight className="w-3 h-3" /> +8.4%
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Across all companies</span>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                                            <MapPin className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    {/* Emerald Sparkline Wave */}
                                    <div className="w-full h-14 mt-2 -mb-1">
                                        <svg className="w-full h-full text-emerald-500" viewBox="0 0 120 28" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="emeraldSparkSaaS" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                                                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,25 C14,25 22,20 36,20 C48,20 58,26 70,26 C80,26 88,8 100,8 C110,8 116,18 120,14 L120,28 L0,28 Z" fill="url(#emeraldSparkSaaS)" />
                                            <path d="M0,25 C14,25 22,20 36,20 C48,20 58,26 70,26 C80,26 88,8 100,8 C110,8 116,18 120,14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* 3. Total Users */}
                                <div className="glass-panel-dark kpi-card-amber p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                    <div className="flex items-start justify-between z-10">
                                        <div>
                                            <span className="text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">Total Users</span>
                                            <h3 className="text-3xl font-black kpi-stat-amber text-orange-600 dark:text-amber-400 mt-1 tracking-tight">
                                                {Number(totalUsers).toLocaleString('en-IN')}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-orange-500/15 text-orange-700 dark:text-amber-400 border border-orange-500/25 flex items-center gap-0.5">
                                                    <ArrowUpRight className="w-3 h-3" /> +16.2%
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Company & staff accounts</span>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    {/* Orange Sparkline Wave */}
                                    <div className="w-full h-14 mt-2 -mb-1">
                                        <svg className="w-full h-full text-orange-500" viewBox="0 0 120 28" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="amberSparkSaaS" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.45} />
                                                    <stop offset="60%" stopColor="#f97316" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,25 C14,25 22,21 38,21 C52,21 62,26 75,26 C86,26 94,9 104,9 C112,9 116,18 120,15 L120,28 L0,28 Z" fill="url(#amberSparkSaaS)" />
                                            <path d="M0,25 C14,25 22,21 38,21 C52,21 62,26 75,26 C86,26 94,9 104,9 C112,9 116,18 120,15" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>

                                {/* 4. Active Subscriptions */}
                                <div className="glass-panel-dark kpi-card-cyan p-5 flex flex-col justify-between relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                                    <div className="flex items-start justify-between z-10">
                                        <div>
                                            <span className="text-[11px] font-black tracking-wider text-slate-500 dark:text-slate-400 block">Active Subscriptions</span>
                                            <h3 className="text-3xl font-black kpi-stat-cyan text-cyan-600 dark:text-cyan-400 mt-1 tracking-tight">
                                                {totalActiveSubscriptions}
                                            </h3>
                                            <div className="flex items-center gap-1.5 mt-1.5">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25 flex items-center gap-0.5">
                                                    <ArrowUpRight className="w-3 h-3" /> 94% retention
                                                </span>
                                                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{paidSubscriptions} Paid • {trialSubscriptions} Trial</span>
                                            </div>
                                        </div>
                                        <div className="w-11 h-11 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    {/* Cyan Sparkline Wave */}
                                    <div className="w-full h-14 mt-2 -mb-1">
                                        <svg className="w-full h-full text-cyan-500" viewBox="0 0 120 28" preserveAspectRatio="none">
                                            <defs>
                                                <linearGradient id="cyanSparkSaaS" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.45} />
                                                    <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.15} />
                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                                                </linearGradient>
                                            </defs>
                                            <path d="M0,23 C12,23 20,26 32,26 C44,26 52,14 64,14 C76,14 84,24 94,24 C102,24 110,9 116,9 C118,9 119,15 120,15 L120,28 L0,28 Z" fill="url(#cyanSparkSaaS)" />
                                            <path d="M0,23 C12,23 20,26 32,26 C44,26 52,14 64,14 C76,14 84,24 94,24 C102,24 110,9 116,9 C118,9 119,15 120,15" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 Metrics - 4 Operational Platform Status Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* 5. Monthly Recurring Revenue (MRR) */}
                                <div className="kpi-subtle-emerald p-4.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider">Monthly Recurring Revenue</span>
                                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                                            <Wallet className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-2.5">
                                        <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                            ₹{Number(mrr).toLocaleString('en-IN')}
                                        </h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-bold text-emerald-600/90 dark:text-emerald-400/90">+14.2% MoM growth</span>
                                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">ARR: ₹{Number(mrr * 12).toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-950/40 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '88%' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* 6. Upcoming Renewals */}
                                <div className="kpi-subtle-amber p-4.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider">Upcoming Renewals</span>
                                        <div className="w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                                            <Clock className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-2.5">
                                        <h4 className="text-2xl font-black text-orange-600 dark:text-amber-400">
                                            {upcomingRenewalsCount} Subscriptions
                                        </h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-bold text-orange-600/90 dark:text-amber-400/90">Expiring in next 14 days</span>
                                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-amber-400 border border-orange-500/20">Auto-Renew: 82%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-orange-100 dark:bg-orange-950/40 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: '64%' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* 7. AI Usage */}
                                <div className="kpi-subtle-purple p-4.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider">AI Usage & Cost</span>
                                        <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-2.5">
                                        <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">
                                            142.8k Requests
                                        </h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-bold text-purple-600/90 dark:text-purple-400/90">₹4,820 estimated cost</span>
                                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">99.6% Success</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-purple-100 dark:bg-purple-950/40 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full" style={{ width: '92%' }} />
                                        </div>
                                    </div>
                                </div>

                                {/* 8. Platform Health */}
                                <div className="kpi-subtle-cyan p-4.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer hover:shadow-md">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-wider">Platform Health</span>
                                        <div className="w-9 h-9 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/25">
                                            <Activity className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="mt-2.5">
                                        <h4 className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
                                            99.98% Healthy
                                        </h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[10px] font-bold text-cyan-600/90 dark:text-cyan-400/90">API: 38ms • DB Connected</span>
                                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">Webhooks 100%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-cyan-100 dark:bg-cyan-950/40 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3 - Charts 1 & 2: Company Growth and Subscription Revenue */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                {/* Chart 1: Company Growth */}
                                <div className="lg:col-span-6 glass-panel-dark p-5.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                                                Company Growth Trajectory
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400">New companies & branch activations over time</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-3 text-[11px] font-bold">
                                                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs"></span>
                                                    Companies
                                                </div>
                                                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
                                                    Branches
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/25">
                                                +{totalCompanies} Brands
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-[270px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={companyGrowthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="compGrowthPurple" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.42} />
                                                        <stop offset="60%" stopColor="#8b5cf6" stopOpacity={0.12} />
                                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                                                    </linearGradient>
                                                    <linearGradient id="branchGrowthEmerald" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                                                        <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0a" : "#e2e8f0"} vertical={false} />
                                                <XAxis dataKey="month" stroke="#64748b" tickLine={false} fontSize={10} />
                                                <YAxis stroke="#64748b" tickLine={false} fontSize={10} axisLine={false} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: isDark ? 'rgba(15, 17, 23, 0.95)' : '#ffffff',
                                                        borderRadius: '14px',
                                                        fontSize: '11px',
                                                        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                                                        border: isDark ? '1px solid rgba(255, 196, 78, 0.3)' : '1px solid rgba(226, 232, 240, 0.9)',
                                                        color: isDark ? '#f8fafc' : '#0f172a'
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="companies"
                                                    name="New Companies"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={2.5}
                                                    dot={{ r: 3.5, fill: '#8b5cf6', strokeWidth: 1.5, stroke: '#fff' }}
                                                    fill="url(#compGrowthPurple)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="branches"
                                                    name="Branch Activations"
                                                    stroke="#10b981"
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#fff' }}
                                                    fill="url(#branchGrowthEmerald)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Chart 2: Subscription Revenue */}
                                <div className="lg:col-span-6 glass-panel-dark p-5.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                                                Subscription Revenue & Collections
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400">MRR trend and subscription collections over time</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-3 text-[11px] font-bold">
                                                <div className="flex items-center gap-1.5 text-orange-600 dark:text-amber-400">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs"></span>
                                                    MRR (₹)
                                                </div>
                                                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-xs"></span>
                                                    Collections
                                                </div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/25">
                                                ₹{Number(mrr).toLocaleString('en-IN')}/mo
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-[270px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={subscriptionRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="mrrAmberGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.42} />
                                                        <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.12} />
                                                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                                                    </linearGradient>
                                                    <linearGradient id="collCyanGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.35} />
                                                        <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.08} />
                                                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff0a" : "#e2e8f0"} vertical={false} />
                                                <XAxis dataKey="month" stroke="#64748b" tickLine={false} fontSize={10} />
                                                <YAxis stroke="#64748b" tickLine={false} fontSize={10} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                                <Tooltip
                                                    contentStyle={{
                                                        background: isDark ? 'rgba(15, 17, 23, 0.95)' : '#ffffff',
                                                        borderRadius: '14px',
                                                        fontSize: '11px',
                                                        boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                                                        border: isDark ? '1px solid rgba(255, 196, 78, 0.3)' : '1px solid rgba(226, 232, 240, 0.9)',
                                                        color: isDark ? '#f8fafc' : '#0f172a'
                                                    }}
                                                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="mrr"
                                                    name="MRR (₹)"
                                                    stroke="#f59e0b"
                                                    strokeWidth={2.5}
                                                    dot={{ r: 3.5, fill: '#f59e0b', strokeWidth: 1.5, stroke: '#fff' }}
                                                    fill="url(#mrrAmberGrad)"
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="collections"
                                                    name="Collections (₹)"
                                                    stroke="#06b6d4"
                                                    strokeWidth={2}
                                                    dot={{ r: 3, fill: '#06b6d4', strokeWidth: 1, stroke: '#fff' }}
                                                    fill="url(#collCyanGrad)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Row 4 - Charts 3 & 4: Subscription Plan Distribution and AI Usage & Cost */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                                {/* Chart 3: Subscription Plan Distribution */}
                                <div className="lg:col-span-5 glass-panel-dark p-5.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all shadow-sm flex flex-col justify-between">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                                                Subscription Plan Distribution
                                            </h3>
                                            <p className="text-[10px] font-semibold text-slate-400">Starter, Growth, Pro and Enterprise tiers</p>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-bold border border-purple-500/25">
                                            {totalCompanies} Subscribed
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 my-auto">
                                        {/* Donut Chart */}
                                        <div className="h-[185px] w-[50%] relative flex items-center justify-center shrink-0">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={subscriptionPlanData}
                                                        innerRadius={50}
                                                        outerRadius={74}
                                                        paddingAngle={4}
                                                        dataKey="pct"
                                                        stroke="none"
                                                    >
                                                        {subscriptionPlanData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            background: isDark ? 'rgba(15, 17, 23, 0.95)' : '#ffffff',
                                                            borderRadius: '12px',
                                                            fontSize: '11px',
                                                            boxShadow: isDark ? '0 10px 25px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
                                                            border: isDark ? '1px solid rgba(255, 196, 78, 0.3)' : '1px solid rgba(226, 232, 240, 0.9)',
                                                            color: isDark ? '#fff' : '#0f172a'
                                                        }}
                                                        formatter={(value, name) => [`${value}% (${subscriptionPlanData.find(p => p.name === name)?.companies || 0} Gyms)`, name]}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                            {/* Center label */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-xl font-black text-slate-900 dark:text-white leading-tight">100%</span>
                                                <span className="text-[9px] font-bold text-slate-400 tracking-wider">Active</span>
                                            </div>
                                        </div>

                                        {/* Plan Legend Stack */}
                                        <div className="flex-1 space-y-2.5 pl-2">
                                            {subscriptionPlanData.map((plan, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: plan.color }}></span>
                                                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">{plan.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0 ml-1">
                                                            <span className="text-[10px] text-slate-400">{plan.price}</span>
                                                            <span className="font-black text-slate-900 dark:text-white text-xs">{plan.pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${plan.pct}%`, backgroundColor: plan.color }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Chart 4: AI Usage & Cost */}
                                <div className="lg:col-span-7 glass-panel-dark p-5.5 rounded-2xl border border-slate-200/80 dark:border-white/10 hover:border-purple-500/30 transition-all shadow-sm flex flex-col justify-between">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                                        <div>
                                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">
                                                AI Usage & Compute Cost
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400">Requests, failures and cost by AI feature or provider</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-black border border-purple-500/25">
                                                142.8k Total Requests
                                            </span>
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/25">
                                                ₹4,820 Total Cost
                                            </span>
                                        </div>
                                    </div>

                                    {/* Feature Usage List */}
                                    <div className="space-y-3 my-auto">
                                        {aiFeatureUsageData.map((item, idx) => (
                                            <div key={idx} className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-purple-500/30 transition-all">
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs">
                                                            AI
                                                        </div>
                                                        <span className="text-slate-900 dark:text-white truncate font-bold text-xs">{item.feature}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 shrink-0">
                                                        <span className="text-purple-600 dark:text-purple-400 font-black">{item.requests} reqs</span>
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.cost}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold">{item.rate}</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 transition-all duration-500"
                                                        style={{ width: item.width }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gym Partners */}
                    {activeSection === 'gyms' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Gym Partners Management</h2>
                                    <p className="text-xs font-semibold text-slate-400 mt-0.5">Manage partner gyms, memberships, verification, and payout contracts</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:flex-none">
                                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400/80" />
                                        <input
                                            type="text"
                                            placeholder="Search gyms..."
                                            className="pl-10 pr-4 py-2.5 bg-white/5 border border-amber-500/20 rounded-xl text-xs outline-none focus:border-amber-400 text-white placeholder-slate-400 w-full sm:w-64"
                                        />
                                    </div>
                                    <div className="glass-pill-dark px-3 py-2 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Period:</span>
                                        <select
                                            value={revenuePeriod}
                                            onChange={(e) => setRevenuePeriod(e.target.value)}
                                            className="bg-transparent border-none outline-none text-white font-bold cursor-pointer text-xs"
                                        >
                                            <option value="totalRevenue" className="bg-[#12141a] text-slate-200">All Time</option>
                                            <option value="currentMonth" className="bg-[#12141a] text-slate-200">Current Month</option>
                                            <option value="lastMonth" className="bg-[#12141a] text-slate-200">Last Month</option>
                                            <option value="last3Months" className="bg-[#12141a] text-slate-200">Last 3 Months</option>
                                            <option value="last6Months" className="bg-[#12141a] text-slate-200">Last 6 Months</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel-dark overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[850px] text-left text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-amber-300 text-[11px] tracking-wider border-b border-amber-500/20">
                                                <th className="p-4 font-extrabold">Gym Name</th>
                                                <th className="p-4 font-extrabold">Owner</th>
                                                <th className="p-4 font-extrabold">Location</th>
                                                <th className="p-4 font-extrabold">Rating</th>
                                                <th className="p-4 font-extrabold">Revenue</th>
                                                <th className="p-4 font-extrabold">Subscription</th>
                                                <th className="p-4 font-extrabold">Status</th>
                                                <th className="p-4 font-extrabold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {gymsList.map((gym, idx) => (
                                                <tr
                                                    key={idx}
                                                    onClick={() => fetchGymDetails(gym.id)}
                                                    className="hover:bg-amber-500/5 transition-all cursor-pointer group"
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md glow-gold shrink-0">
                                                                {gym.name[0]}
                                                            </div>
                                                            <span className="font-extrabold text-white text-sm group-hover:text-amber-300 transition-colors">
                                                                {gym.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-slate-300 font-medium">{gym.owner?.name || 'N/A'}</td>
                                                    <td className="p-4 text-slate-400 font-medium">{gym.location?.address?.split(',')[0] || 'Unknown'}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                                                            <Award className="w-3.5 h-3.5 text-amber-400" />
                                                            <span>{gym.avgRating || '0.0'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-black text-emerald-400">
                                                            {`₹${Number(gym.revenueBreakdown?.[revenuePeriod] || 0).toLocaleString('en-IN')}`}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        {(() => {
                                                            const info = getSubscriptionInfo(gym);
                                                            return (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-xs font-black text-white">{info.badge}</span>
                                                                    {info.subBadge && (
                                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-amber-300 bg-amber-500/15 border border-amber-500/30 w-fit">
                                                                            {info.subBadge}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider ${
 gym.isVerified
 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
 : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
 }`}>
                                                            {gym.isVerified ? 'Verified' : 'Pending'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
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
                                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
 gym.isVerified
 ? 'bg-white/10 text-slate-300 hover:bg-white/20'
 : 'gold-gradient-btn shadow-md'
 }`}
                                                            >
                                                                {gym.isVerified ? 'Revoke' : 'Verify Now'}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteModal({ isOpen: true, gymId: gym.id, gymName: gym.name });
                                                                }}
                                                                className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20 cursor-pointer"
                                                                title="Delete Gym"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revenue Analytics */}
                    {activeSection === 'revenue' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <h2 className="text-2xl font-black text-white tracking-tight">Global Revenue Analytics</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="glass-panel-dark p-6">
                                    <h3 className="font-extrabold text-base text-white mb-4">Revenue by Gym Type</h3>
                                    <div className="h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={stats.gymTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                                                    {stats.gymTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#12141a', borderColor: '#f59e0b', borderRadius: '12px', color: '#fff' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="glass-panel-dark p-6">
                                    <h3 className="font-extrabold text-base text-white mb-4">Top Performing Gyms</h3>
                                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                        {stats.topGyms.map((gym, idx) => (
                                            <div key={idx} className="p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 ${idx === 0 ? 'bg-amber-400 glow-gold' : idx === 1 ? 'bg-slate-300' : 'bg-amber-600 text-white'}`}>{idx + 1}</div>
                                                    <div>
                                                        <span className="font-bold text-white block">{gym.name}</span>
                                                        <span className={`text-[11px] font-bold flex items-center gap-1 ${gym.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            {gym.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{gym.growth}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="font-black text-emerald-400">₹{Number(gym.revenue).toLocaleString('en-IN')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gym Owners */}
                    {activeSection === 'gym-owners' && (
                        <section className="space-y-6 max-w-[1600px] mx-auto">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Gym Owners</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Registered owner accounts controlling client company gyms</p>
                                </div>
                                <button
                                    onClick={fetchGymOwners}
                                    disabled={gymOwnersLoading}
                                    className="px-4 py-2 rounded-xl gold-gradient-btn text-xs font-black disabled:opacity-60 cursor-pointer shadow-md"
                                >
                                    {gymOwnersLoading ? 'Loading...' : 'Refresh list'}
                                </button>
                            </div>

                            {gymOwnersError && (
                                <div role="alert" className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 font-semibold text-xs">
                                    {gymOwnersError}
                                </div>
                            )}

                            <div className="glass-panel-dark overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-left text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-amber-300 text-[11px] tracking-wider border-b border-amber-500/20">
                                                <th className="p-4 font-bold">Name</th>
                                                <th className="p-4 font-bold">Email</th>
                                                <th className="p-4 font-bold">Phone</th>
                                                <th className="p-4 font-bold">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {gymOwnersLoading ? (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-semibold">Loading Gym Owners...</td>
                                                </tr>
                                            ) : gymOwners.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="p-8 text-center text-slate-400 font-semibold">
                                                        {gymOwnersError ? 'Gym Owners could not be loaded.' : 'No Gym Owners found.'}
                                                    </td>
                                                </tr>
                                            ) : gymOwners.map((owner, index) => (
                                                <tr key={owner.id || `${owner.email}-${index}`} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-bold text-white">{owner.name || owner.ownerName || '—'}</td>
                                                    <td className="p-4 text-slate-300">{owner.email || '—'}</td>
                                                    <td className="p-4 text-slate-300">{owner.phone || '—'}</td>
                                                    <td className="p-4 text-slate-400">
                                                        {owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Announcements */}
                    {activeSection === 'announcements' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
                            <div className="glass-panel-dark p-6 self-start">
                                <h3 className="font-black text-lg text-white mb-5 flex items-center gap-2">
                                    <Megaphone className="w-5 h-5 text-amber-400" /> Create Announcement
                                </h3>
                                <div className="space-y-4 text-xs font-bold">
                                    <div>
                                        <label className="block text-slate-300 mb-1.5">Target Audience</label>
                                        <select
                                            value={newAnnouncement.target}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white/5 border border-amber-500/20 rounded-xl text-white outline-none focus:border-amber-400"
                                        >
                                            <option value="ALL" className="bg-[#12141a]">All (Everyone)</option>
                                            <option value="ALL_USERS" className="bg-[#12141a]">All Users</option>
                                            <option value="ALL_GYMS" className="bg-[#12141a]">All Gym Owners</option>
                                            <option value="SPECIFIC_GYMS" className="bg-[#12141a]">Multiple Gyms (Select...)</option>
                                            <optgroup label="Individual Gyms">
                                                {gymsList.map(gym => (
                                                    <option key={gym.id} value={gym.id} className="bg-[#12141a]">{gym.name}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 mb-1.5">Title</label>
                                        <input
                                            type="text"
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white/5 border border-amber-500/20 rounded-xl text-white outline-none focus:border-amber-400 placeholder-slate-500"
                                            placeholder="Announcement title..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-300 mb-1.5">Message</label>
                                        <textarea
                                            rows={4}
                                            value={newAnnouncement.message}
                                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white/5 border border-amber-500/20 rounded-xl text-white outline-none focus:border-amber-400 placeholder-slate-500 resize-none"
                                            placeholder="Write broadcast message..."
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendAnnouncement}
                                        className="w-full py-3 rounded-xl gold-gradient-btn text-xs font-black transition-all cursor-pointer shadow-lg"
                                    >
                                        Dispatch Announcement
                                    </button>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                <h3 className="font-black text-lg text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-amber-400" /> Announcement History
                                </h3>
                                <div className="space-y-3">
                                    {announcements.length > 0 ? announcements.map((a, idx) => (
                                        <div key={idx} className="glass-panel-dark p-5 relative group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-extrabold text-white text-base">{a.title}</h4>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteAnnouncement(a.id)}
                                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                                        {new Date(a.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-slate-300 text-xs mb-3">{a.message}</p>
                                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                                <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 ">
                                                    {a.targetType || 'General'}
                                                </span>
                                                <span className="text-slate-400 flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5 text-amber-400" /> {Math.floor(Math.random() * 800) + 120} views
                                                </span>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="glass-panel-dark p-10 text-center text-slate-400 text-xs font-semibold">
                                            No announcements dispatched yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin Plans Management */}
                    {activeSection === 'admin-plans' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Partner Subscription Plans</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">SaaS tier plans assigned to partner gyms</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedPlan(null);
                                        setPlanFormData({ name: '', description: '', price: '', duration: '', features: '' });
                                        setIsPlanModalOpen(true);
                                    }}
                                    className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg cursor-pointer"
                                >
                                    <Zap className="w-4 h-4 text-slate-950 font-black" /> Create New Plan
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {adminPlans.map((plan) => (
                                    <div key={plan.id} className="glass-panel-dark p-6 relative overflow-hidden group hover:border-amber-400/60 transition-all flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-lg font-black shadow-lg glow-amber">
                                                    <Coins className="w-6 h-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black text-emerald-400">₹{plan.price}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 tracking-widest">{plan.duration} Days</p>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-black text-white mb-1.5">{plan.name}</h3>
                                            <p className="text-slate-400 text-xs mb-4 line-clamp-2">{plan.description}</p>
                                        </div>
                                        
                                        <div className="flex gap-2 pt-3 border-t border-white/5">
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
                                                className="flex-1 py-2 glass-pill-dark text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
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
                                                className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all border border-rose-500/20 cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {adminPlans.length === 0 && (
                                    <div className="col-span-full py-16 glass-panel-dark text-center">
                                        <Coins className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                        <p className="text-slate-400 font-bold text-xs italic">No subscription plans created yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Settlements */}
                    {activeSection === 'settlements' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <h2 className="text-2xl font-black text-white tracking-tight">Settlement Requests</h2>
                            <div className="glass-panel-dark overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[950px] text-left text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-amber-300 text-[11px] tracking-wider border-b border-amber-500/20">
                                                <th className="p-4 font-bold">Gym / Owner</th>
                                                <th className="p-4 font-bold">Bank / UPI Details</th>
                                                <th className="p-4 font-bold">Amount</th>
                                                <th className="p-4 font-bold">Requested At</th>
                                                <th className="p-4 font-bold">Status</th>
                                                <th className="p-4 font-bold text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {settlementRequests.length > 0 ? settlementRequests.map((req, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-all">
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-extrabold text-white">{req.gymId?.name || 'N/A'}</span>
                                                            <span className="text-[11px] text-slate-400 font-medium">{req.ownerId?.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col text-xs text-slate-300 space-y-0.5">
                                                            {req.bankDetails?.upiId && <span className="font-bold text-amber-300">UPI: {req.bankDetails.upiId}</span>}
                                                            {req.bankDetails?.accountNumber && (
                                                                <>
                                                                    <span>A/C: {req.bankDetails.accountNumber}</span>
                                                                    <span className="text-slate-400">IFSC: {req.bankDetails.ifscCode}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="font-black text-emerald-400 text-sm">₹{req.amount.toLocaleString()}</span>
                                                    </td>
                                                    <td className="p-4 text-slate-400 text-xs font-semibold">
                                                        {new Date(req.createdAt).toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider ${
 req.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
 req.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
 }`}>{req.status}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {req.status === 'Pending' && (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleSettlementStatus(req.id, 'Approved')}
                                                                    className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-2 rounded-xl hover:bg-emerald-500/30 transition-all cursor-pointer"
                                                                    title="Approve"
                                                                >
                                                                    <Shield className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSettlementStatus(req.id, 'Rejected')}
                                                                    className="bg-rose-500/20 border border-rose-500/40 text-rose-400 p-2 rounded-xl hover:bg-rose-500/30 transition-all cursor-pointer"
                                                                    title="Reject"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" className="p-12 text-center text-slate-400 text-xs italic">
                                                        No settlement requests found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Commission Settings */}
                    {activeSection === 'commission' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Commission Management</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Admin revenue split rates per gym partner</p>
                                </div>
                                <div className="glass-pill-dark px-3 py-2 rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Earnings Period:</span>
                                    <select
                                        value={commissionPeriod}
                                        onChange={(e) => setCommissionPeriod(e.target.value)}
                                        className="bg-transparent border-none outline-none text-white font-bold cursor-pointer text-xs"
                                    >
                                        <option value="todayCommission" className="bg-[#12141a]">Today</option>
                                        <option value="monthCommission" className="bg-[#12141a]">This Month</option>
                                        <option value="yearCommission" className="bg-[#12141a]">This Year</option>
                                        <option value="totalCommission" className="bg-[#12141a]">All Time</option>
                                    </select>
                                </div>
                            </div>

                            {/* Total Earnings Summary Card */}
                            <div className="glass-panel-dark p-6 border border-amber-500/30 glow-gold">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                        <Coins className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-amber-300 text-xs font-extrabold tracking-widest">Total Platform Earnings ({commissionPeriod.replace('Commission', '')})</p>
                                        <h3 className="text-3xl font-black text-emerald-400 mt-1">
                                            ₹{gymsList.reduce((sum, gym) => sum + (gym.revenueBreakdown?.[commissionPeriod] || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel-dark overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px] text-left text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-amber-300 text-[11px] tracking-wider border-b border-amber-500/20">
                                                <th className="p-4 font-bold">Gym Name</th>
                                                <th className="p-4 font-bold">Owner</th>
                                                <th className="p-4 font-bold">Earnings</th>
                                                <th className="p-4 font-bold">Current Rate</th>
                                                <th className="p-4 font-bold text-right">Update Rate (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {gymsList.map((gym) => (
                                                <tr key={gym.id} className="hover:bg-white/5 transition-all">
                                                    <td className="p-4 font-bold text-white">{gym.name}</td>
                                                    <td className="p-4 text-slate-300">{gym.owner?.name || 'N/A'}</td>
                                                    <td className="p-4 font-black text-emerald-400">
                                                        ₹{Number(gym.revenueBreakdown?.[commissionPeriod] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="p-4 font-bold text-amber-300">{gym.commissionRate || 0}%</td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2 items-center">
                                                            <input
                                                                type="number"
                                                                defaultValue={gym.commissionRate || 0}
                                                                onBlur={async (e) => {
                                                                    const val = Number(e.target.value);
                                                                    if (val !== gym.commissionRate) {
                                                                        await handleUpdateCommission(gym.id, val);
                                                                    }
                                                                }}
                                                                className="w-16 px-2 py-1 bg-white/5 border border-amber-500/20 rounded-lg text-white font-bold text-center text-xs"
                                                                min="0"
                                                                max="100"
                                                            />
                                                            <button
                                                                onClick={async (e) => {
                                                                    const input = e.target.closest('div').querySelector('input');
                                                                    await handleUpdateCommission(gym.id, Number(input.value));
                                                                }}
                                                                className="px-3 py-1 gold-gradient-btn rounded-lg text-xs font-black cursor-pointer"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Admin User Master Page */}
                    {activeSection === 'user-master' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <UserMasterPage 
                                onNavigate={(sec, params) => {
                                    if (params?.userId) setPermissionTargetId(params.userId);
                                    navigateToSection(sec);
                                }}
                            />
                        </div>
                    )}

                    {/* User Group Master Page */}
                    {activeSection === 'user-groups' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <UserGroupMasterPage 
                                onNavigate={(sec, params) => {
                                    if (params?.groupId) setPermissionTargetId(params.groupId);
                                    navigateToSection(sec);
                                }} 
                            />
                        </div>
                    )}

                    {/* Dedicated Group Permissions Page (Runwaybites Style) */}
                    {activeSection === 'group-permissions' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <GroupPermissionsPage initialGroupId={permissionTargetId} />
                        </div>
                    )}

                    {/* Dedicated User Permissions Page (Runwaybites Style) */}
                    {activeSection === 'user-permissions' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <UserPermissionsPage initialUserId={permissionTargetId} />
                        </div>
                    )}

                    {/* Dedicated Company Permissions Page (Client Menus) */}
                    {activeSection === 'company-permissions' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <CompanyPermissionsPage initialCompanyId={permissionTargetId} />
                        </div>
                    )}

                    {/* Group Permissions Matrix Page (Legacy/Matrix view) */}
                    {activeSection === 'permissions-matrix' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <GroupPermissionsPage initialGroupId={permissionTargetId} />
                        </div>
                    )}

                    {/* Company Master Page */}
                    {activeSection === 'company-master' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <CompanyMasterPage />
                        </div>
                    )}

                    {/* Global Menu Master Page */}
                    {activeSection === 'global-menus' && (
                        <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden">
                            <GlobalMenuMasterPage />
                        </div>
                    )}

                    {/* Members Placeholder/Section */}
                    {activeSection === 'members' && (
                        <div className="space-y-6 max-w-[1600px] mx-auto">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Gym Members Network</h2>
                                    <p className="text-xs text-slate-400 mt-0.5">Aggregated registered members across all client companies and branches</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="glass-pill-dark px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300">
                                        Total: {Number(stats.totalUsers * 3 || 1274).toLocaleString('en-IN')} Members
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel-dark overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px] text-left text-xs">
                                        <thead>
                                            <tr className="bg-white/5 text-amber-300 text-[11px] tracking-wider border-b border-amber-500/20">
                                                <th className="p-4 font-bold">Member Name</th>
                                                <th className="p-4 font-bold">Gym Brand</th>
                                                <th className="p-4 font-bold">Membership Plan</th>
                                                <th className="p-4 font-bold">Status</th>
                                                <th className="p-4 font-bold text-right">Validity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {[
                                                { name: 'Priya Sharma', gym: 'Gold Gym Hub', plan: 'Premium Annual', status: 'Active', days: '280 Days Left' },
                                                { name: 'Rahul Verma', gym: 'Iron Paradise', plan: 'Standard Monthly', status: 'Active', days: '14 Days Left' },
                                                { name: 'Sneha Patel', gym: 'FitPulse Fitness', plan: 'Basic Monthly', status: 'Expiring Soon', days: '2 Days Left' },
                                                { name: 'Amit Desai', gym: 'Titan Club', plan: 'Student Plan', status: 'Active', days: '190 Days Left' },
                                                { name: 'Karan Mehra', gym: 'Gold Gym Hub', plan: 'Premium Annual', status: 'Active', days: '310 Days Left' },
                                            ].map((m, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-all">
                                                    <td className="p-4 font-bold text-white">{m.name}</td>
                                                    <td className="p-4 text-slate-300">{m.gym}</td>
                                                    <td className="p-4 font-bold text-purple-400">{m.plan}</td>
                                                    <td className="p-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
 m.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
 }`}>{m.status}</span>
                                                    </td>
                                                    <td className="p-4 text-right text-slate-300 font-semibold">{m.days}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                                                <p className="text-xs text-slate-500 font-bold mb-1">Owner</p>
                                                <p className="font-bold text-slate-900">{selectedGym.gym.owner?.name}</p>
                                                <p className="text-sm text-slate-500">{selectedGym.gym.owner?.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold mb-1">Phone</p>
                                                <p className="font-bold text-slate-900 text-sm">{selectedGym.gym.phone}</p>
                                            </div>
                                            <div className="col-span-1 sm:col-span-2">
                                                <p className="text-xs text-slate-500 font-bold mb-1">Address</p>
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
                                                <p className="text-xs text-slate-500 font-bold mb-1">Active Plan</p>
                                                <p className="font-extrabold text-indigo-600 text-lg tracking-tight">
                                                    {selectedGym.gym.assignedPlan?.name || 'No Plan Assigned'}
                                                </p>
                                                <p className="text-sm font-bold text-slate-400">₹{selectedGym.gym.assignedPlan?.price || 0} / {selectedGym.gym.assignedPlan?.duration || '0'} Days</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold mb-1">Status & Expiry</p>
                                                {(() => {
                                                    const info = getSubscriptionInfo(selectedGym.gym);
                                                    return (
                                                        <div className="flex flex-col gap-1">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-black tracking-widest w-fit ${info.color}`}>
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
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold p-2 text-center">Front Photo</div>
                                                </div>
                                            )}
                                            {selectedGym.gym.media?.receptionPhotoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.receptionPhotoUrl)} alt="Reception" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold p-2 text-center">Reception</div>
                                                </div>
                                            )}
                                            {selectedGym.gym.media?.workoutFloorPhotoUrl && (
                                                <div className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200">
                                                    <img src={api.getMediaUrl(selectedGym.gym.media.workoutFloorPhotoUrl)} alt="Workout Floor" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold p-2 text-center">Workout Floor</div>
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
                                        <p className="text-white/80 text-sm font-bold mb-2">Lifetime Revenue</p>
                                        <p className="text-4xl font-black mb-4">₹{selectedGym.totalRevenue.toLocaleString('en-IN')}</p>
                                    </div>



                                    {/* Facilities */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-amber-500" /> Facilities
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGym.gym.facilities?.map((f, i) => (
                                                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 ">{f}</span>
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
                                                <p className="text-[10px] font-bold text-emerald-600 mb-1">Active</p>
                                                <p className="text-2xl font-black text-emerald-700">{selectedGym.userStats?.active || 0}</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-center">
                                                <p className="text-[10px] font-bold text-rose-600 mb-1">Expired</p>
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
                                            <p className="text-[10px] text-slate-500 font-bold mb-3">{item.planType}</p>
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
                                                    <span className="text-[10px] font-black bg-white px-2 py-1 rounded-lg border border-slate-100 text-slate-500 tracking-widest">{plan.planType} Plan</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-violet-600">₹{plan.price}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1">Workout</p>
                                                    <p className="font-black text-slate-800">{plan.duration} hrs</p>
                                                </div>
                                                <div className="bg-white/50 p-3 rounded-2xl border border-slate-100/50">
                                                    <p className="text-[10px] font-bold text-slate-400 mb-1">Validity</p>
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
                                    <label className="block text-xs font-black text-slate-500 tracking-wider mb-2 ml-1">Admin Password</label>
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
                                    <label className="block text-xs font-black text-slate-500 tracking-wider mb-2 ml-1">Select Subscription Plan</label>
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
                                    <label className="block text-xs font-black text-slate-500 tracking-widest mb-2 ml-1">Plan Name</label>
                                    <input 
                                        type="text" 
                                        value={planFormData.name}
                                        onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="e.g. Pro Partner Plan"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 tracking-widest mb-2 ml-1">Price (₹)</label>
                                    <input 
                                        type="number" 
                                        value={planFormData.price}
                                        onChange={(e) => setPlanFormData({...planFormData, price: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-500 tracking-widest mb-2 ml-1">Duration (Days)</label>
                                    <input 
                                        type="number" 
                                        value={planFormData.duration}
                                        onChange={(e) => setPlanFormData({...planFormData, duration: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700"
                                        placeholder="30"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 tracking-widest mb-2 ml-1">Description</label>
                                    <textarea 
                                        rows={3}
                                        value={planFormData.description}
                                        onChange={(e) => setPlanFormData({...planFormData, description: e.target.value})}
                                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-violet-500 outline-none font-bold text-slate-700 resize-none"
                                        placeholder="Quick summary of the plan..."
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-500 tracking-widest mb-2 ml-1">Features (one per line)</label>
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
                                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-sm tracking-widest shadow-xl hover:shadow-violet-200 transition-all"
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
