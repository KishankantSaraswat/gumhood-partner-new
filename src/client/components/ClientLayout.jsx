import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Dumbbell, Building2, ShieldCheck, 
    KeyRound, Layers, Wallet, Coins, TrendingUp, CheckCheck, 
    BarChart3, Bell, Settings, FileText, Menu, X, ChevronsLeft, ChevronsRight, 
    ChevronRight, ChevronDown, Search, Sparkles, LogOut, MapPin, Loader
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeColorPicker, ThemeToggle } from '@/common';
import { 
    getImageUrl, 
    getStoredCompany,
    getStoredUser,
    getStoredMenus,
    ensureUsersSubmenus,
    DEFAULT_CLIENT_MENUS,
    SECTION_TITLES,
    resolveSectionFromMenu,
    resolveSectionFromPathname
} from '../pages/Dashboard/dashboard.logic';

export const ClientLayout = ({ children, activeRoute = '/profile', activeTitle }) => {
    const { currentThemeConfig, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Context & User State
    const [companyData, setCompanyData] = useState(() => getStoredCompany());
    const [userData, setUserData] = useState(() => getStoredUser());
    const [groupData, setGroupData] = useState(() => {
        try {
            const stored = localStorage.getItem('group');
            return stored ? JSON.parse(stored) : null;
        } catch (_) { return null; }
    });

    const companyName = companyData?.name || 'Partner Facility';
    const companyInitials = (companyName.split(' ').map(w => w[0]).join('').substring(0, 2) || 'AI').toUpperCase();
    const rawLogo = companyData?.companylogo 
        || companyData?.companyLogo 
        || companyData?.company_logo 
        || companyData?.logo 
        || companyData?.logoUrl 
        || companyData?.logo_url 
        || companyData?.media?.logoUrl 
        || companyData?.media?.logo 
        || null;
    const isMockLogo = rawLogo && (rawLogo.includes('example.com') || rawLogo.includes('example.org'));
    const companyLogo = rawLogo && !isMockLogo ? getImageUrl(rawLogo) : null;
    const [logoError, setLogoError] = useState(false);
    const hasLogo = Boolean(companyLogo && !logoError);

    const userName = userData?.name || userData?.username || 'Club Manager';
    const userEmail = userData?.email || '';
    const userRole = groupData?.group_name || (userData?.isCompanyOwner ? 'Company Owner' : 'Club Manager');
    const userInitial = (userName.trim().charAt(0) || 'M').toUpperCase();
    const userAvatar = userData?.profile_picture || null;

    // Sidebar & Menus State
    const [clientMenus, setClientMenus] = useState(() => getStoredMenus());
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('client_sidebar_collapsed') === 'true';
    });
    const [expandedMenuIds, setExpandedMenuIds] = useState(() => {
        try {
            const stored = localStorage.getItem('client_expanded_menu_ids');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return new Set(parsed);
            }
        } catch (_) {}
        return new Set([1, 2, 3, '1', '2', '3']);
    });

    // Profile Dropdown Menu State
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Toggle Sidebar Collapse
    const toggleSidebarCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('client_sidebar_collapsed', String(next));
            return next;
        });
    };

    // Toggle Submenu Expand
    const toggleMenuExpand = (id) => {
        setExpandedMenuIds(prev => {
            const next = new Set(prev);
            const sId = String(id);
            const nId = Number(id);
            const hasIt = next.has(id) || next.has(sId) || (!isNaN(nId) && next.has(nId));
            if (hasIt) {
                next.delete(id);
                next.delete(sId);
                if (!isNaN(nId)) next.delete(nId);
            } else {
                next.add(id);
                next.add(sId);
                if (!isNaN(nId)) next.add(nId);
            }
            try {
                localStorage.setItem('client_expanded_menu_ids', JSON.stringify([...next]));
            } catch (_) {}
            return next;
        });
    };

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Icon Resolver for Lucide icons
    const getMenuIconComponent = (menu) => {
        const iconStr = (menu.icon || '').toLowerCase().trim();
        const code = (menu.menuCode || menu.menu_code || '').toLowerCase().trim();
        const name = (menu.menuName || menu.menu_name || '').toLowerCase().trim();

        if (iconStr.includes('dash') || code.includes('dash') || name.includes('dashboard')) return LayoutDashboard;
        if (iconStr.includes('user-check') || iconStr.includes('member') || code.includes('member')) return UserCheck;
        if (iconStr.includes('user') || iconStr.includes('staff') || code.includes('user') || name.includes('staff')) return Users;
        if (iconStr.includes('dumbbell') || iconStr.includes('fitness')) return Dumbbell;
        if (iconStr.includes('building') || iconStr.includes('facility') || iconStr.includes('company') || code.includes('profile')) return Building2;
        if (iconStr.includes('shield') || iconStr.includes('role')) return ShieldCheck;
        if (iconStr.includes('wallet') || iconStr.includes('request') || code.includes('cash')) return Wallet;
        if (iconStr.includes('coin') || iconStr.includes('plan') || code.includes('plan')) return Coins;
        if (iconStr.includes('trend') || iconStr.includes('revenue') || code.includes('revenue')) return TrendingUp;
        if (iconStr.includes('check') || iconStr.includes('attend')) return CheckCheck;
        if (iconStr.includes('bell') || iconStr.includes('announc') || code.includes('announc')) return Bell;
        if (iconStr.includes('file') || iconStr.includes('invoice') || iconStr.includes('history')) return FileText;
        if (iconStr.includes('bar') || iconStr.includes('chart')) return BarChart3;
        if (iconStr.includes('setting')) return Settings;
        return Layers;
    };

    // Recursive search filter
    const filterMenusRecursively = (items, query) => {
        if (!query || !query.trim()) return items;
        const q = query.toLowerCase().trim();
        return items
            .map(item => {
                const nameMatches = (item.menuName || item.menu_name || '').toLowerCase().includes(q);
                const codeMatches = (item.menuCode || item.menu_code || '').toLowerCase().includes(q);
                const routeMatches = (item.route || '').toLowerCase().includes(q);
                const matchingChildren = item.children ? filterMenusRecursively(item.children, query) : [];

                if (nameMatches || codeMatches || routeMatches || matchingChildren.length > 0) {
                    return {
                        ...item,
                        children: matchingChildren
                    };
                }
                return null;
            })
            .filter(Boolean);
    };

    const filteredMenus = useMemo(() => {
        return filterMenusRecursively(clientMenus, sidebarSearchQuery);
    }, [clientMenus, sidebarSearchQuery]);

    const handleSignOut = () => {
        localStorage.removeItem('gymshood_token');
        localStorage.removeItem('role');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('client_company');
        localStorage.removeItem('group');
        localStorage.removeItem('user_rights');
        localStorage.removeItem('client_menus');
        window.location.href = '/login';
    };

    const currentPath = location.pathname.toLowerCase().replace(/\/+$/, '') || activeRoute;

    return (
        <div 
            className="dashboard-layout-dark flex h-screen overflow-hidden font-sans select-none"
            style={!isDark ? {
                background: 'radial-gradient(1200px circle at 90% 10%, color-mix(in srgb, var(--grad-primary-from, #f97316) 10%, transparent) 0%, transparent 60%), radial-gradient(900px circle at 10% 30%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, transparent) 0%, transparent 55%), linear-gradient(135deg, color-mix(in srgb, var(--grad-primary-from, #f97316) 6%, #f8fafc) 0%, #f8fafc 40%, color-mix(in srgb, var(--grad-primary-to, #ea580c) 8%, #f1f5f9) 100%)'
            } : undefined}
        >
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Mobile Menu Trigger */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-900/90 text-amber-400 p-2.5 rounded-xl shadow-xl border border-amber-500/30 cursor-pointer"
            >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar - Matching Admin Themed Sidebar */}
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
                        onClick={() => navigate('/dashboard')}
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

                    {/* Collapse Button */}
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

                {/* Navigation Menus */}
                <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5 text-xs font-semibold custom-scrollbar">
                    {filteredMenus.map((item) => {
                        const ItemIcon = getMenuIconComponent(item);
                        const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                        const itemRoute = (item.route || '').toLowerCase().replace(/\/+$/, '');
                        const isCurrentActive = itemRoute && itemRoute !== '#' && (currentPath === itemRoute || currentPath.endsWith(itemRoute));
                        const isChildActive = hasChildren && item.children.some(c => {
                            const cRoute = (c.route || '').toLowerCase().replace(/\/+$/, '');
                            return cRoute && cRoute !== '#' && (currentPath === cRoute || currentPath.endsWith(cRoute));
                        });
                        const isParentActive = isCurrentActive || isChildActive;
                        const isExpanded = expandedMenuIds.has(item.id) || 
                                           expandedMenuIds.has(String(item.id)) || 
                                           (typeof item.id === 'number' && expandedMenuIds.has(Number(item.id))) ||
                                           (hasChildren && isParentActive);

                        return (
                            <div key={item.id || item.menuCode} className="space-y-1">
                                <button
                                    onClick={(e) => {
                                        if (hasChildren) {
                                            e.preventDefault();
                                            toggleMenuExpand(item.id);
                                        } else {
                                            const target = item.route && item.route !== '#' ? item.route : '/dashboard';
                                            navigate(target);
                                            setIsSidebarOpen(false);
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
                                            const childRoute = (child.route || '').toLowerCase().replace(/\/+$/, '');
                                            const isThisChildActive = childRoute && (currentPath === childRoute || currentPath.endsWith(childRoute));

                                            return (
                                                <button
                                                    key={child.id || child.menuCode}
                                                    onClick={() => {
                                                        navigate(child.route || '/dashboard');
                                                        setIsSidebarOpen(false);
                                                    }}
                                                    className={`w-full flex items-center px-2.5 py-2 gap-2.5 rounded-lg text-xs transition-all cursor-pointer ${
                                                        isThisChildActive
                                                            ? 'themed-nav-active font-black scale-[1.01]'
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                                                    }`}
                                                >
                                                    <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${isThisChildActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300'}`} />
                                                    <span className="truncate font-medium">{child.menuName || child.menu_name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer Support Card & Sign Out */}
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

            {/* Main Page Area */}
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
                                {activeTitle || 'Facility Profile & Settings'}
                            </h1>
                            <p className="hidden sm:block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                Welcome back, {userName}! Here's what's happening at {companyName} today.
                            </p>
                        </div>
                    </div>

                    {/* Search / Breadcrumbs */}
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
                        {/* Financial Year Context Switcher */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 glass-pill-dark rounded-xl text-xs font-bold text-slate-800 dark:text-amber-400 cursor-pointer shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition-all">
                            <span>2026 - 2027</span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                        </div>

                        {/* Dark / Light Toggle */}
                        <ThemeToggle />

                        {/* Announcements Bell */}
                        <button
                            onClick={() => navigate('/announcements')}
                            className="relative w-9 h-9 rounded-xl glass-pill-dark text-slate-600 dark:text-slate-300 hover:text-orange-500 flex items-center justify-center transition-all cursor-pointer"
                            title="Notifications"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center shadow-xs">
                                5
                            </span>
                        </button>

                        {/* Profile Chip & Menu */}
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
                                                navigate('/profile');
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
                                        <p className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 mb-2">Color Theme</p>
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

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ClientLayout;
