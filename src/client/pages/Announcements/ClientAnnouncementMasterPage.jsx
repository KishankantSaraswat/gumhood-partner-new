import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bell, Megaphone, AlertTriangle, ShieldCheck, Sparkles, 
    Calendar, Wrench, RefreshCw, Download, Search, Plus, 
    Trash2, Clock, CheckCircle2, X, Send, Tag, AlertCircle,
    Building2, MessageSquare, Flame, Check
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import SectionTransition from '@/client/pages/Profile/components/SectionTransition';
import { useClientAnnouncementLogic, ANNOUNCEMENT_CATEGORIES } from './announcement.logic';
import { SearchableSelect } from '../../../common';

export const ClientAnnouncementMasterPage = ({ gym }) => {
    const { currentThemeConfig } = useTheme();
    const {
        activeTab,
        setActiveTab,
        tabDirection,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        loading,
        refreshing,
        filteredAnnouncements,
        paginatedAnnouncements,
        kpiStats,
        showCreateModal,
        setShowCreateModal,
        deleteModalTarget,
        setDeleteModalTarget,
        deleting,
        formTitle,
        setFormTitle,
        formMessage,
        setFormMessage,
        formCategory,
        setFormCategory,
        formPriority,
        setFormPriority,
        formSending,
        handleCreateAnnouncement,
        handleDeleteAnnouncement,
        fetchAnnouncements,
        handleExportCSV,
        pagination
    } = useClientAnnouncementLogic({ gym });

    // Format Relative / Short Date
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / (60 * 1000));
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    // Category Badge Helper
    const getCategoryConfig = (catId) => {
        return ANNOUNCEMENT_CATEGORIES.find(c => c.id === catId) || ANNOUNCEMENT_CATEGORIES[0];
    };

    return (
        <div className="space-y-3.5 animate-fade-in select-none pb-6">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 dark:bg-[#121622]/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs">
                <div>
                    <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Member Announcements</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 text-[9px] font-extrabold tracking-widest border border-amber-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Live Broadcast
                        </span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Broadcast facility updates, schedule changes, holiday hours, and urgent member alerts
                    </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white font-black text-xs shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        style={{
                            background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                            boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                        }}
                    >
                        <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                        <span>Post Announcement</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => fetchAnnouncements(true)}
                        disabled={refreshing}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
                        title="Refresh Announcements"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-500' : ''}`} />
                    </button>

                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:border-amber-500/30 transition-all cursor-pointer"
                        title="Export CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Top 4 Executive KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Total Active Broadcasts */}
                <div 
                    onClick={() => setActiveTab('all')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 activeTab === 'all' 
 ? 'border-amber-500/60 shadow-xs ring-1 ring-amber-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-amber-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Total Broadcasts
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Megaphone className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.total}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Active Feed
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Visible to members</span>
                    </div>
                </div>

                {/* 2. Facility Notices */}
                <div 
                    onClick={() => setActiveTab('gym')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 activeTab === 'gym' 
 ? 'border-emerald-500/60 shadow-xs ring-1 ring-emerald-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-emerald-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Facility Notices
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <Building2 className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.gymCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Gym Staff
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Direct announcements</span>
                    </div>
                </div>

                {/* 3. System & Admin Alerts */}
                <div 
                    onClick={() => setActiveTab('admin')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 activeTab === 'admin' 
 ? 'border-blue-500/60 shadow-xs ring-1 ring-blue-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-blue-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            System Alerts
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.adminCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20">
                            Admin Network
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Platform-wide alerts</span>
                    </div>
                </div>

                {/* 4. Urgent Priority Notices */}
                <div 
                    onClick={() => setActiveTab('urgent')}
                    className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border transition-all flex flex-col justify-between group cursor-pointer ${
 activeTab === 'urgent' 
 ? 'border-rose-500/60 shadow-xs ring-1 ring-rose-500/20' 
 : 'border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-rose-500/40'
 }`}
                >
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                            Urgent Notices
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {kpiStats.urgentCount}
                        </h3>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md border border-rose-500/20">
                            High Priority
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Pin to top</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs & Quick Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Tabs with Smooth Hardware-Accelerated Sliding Pill Indicator */}
                <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 w-max overflow-x-auto custom-scrollbar select-none">
                    {[
                        { id: 'all', label: 'All Broadcasts', count: kpiStats.total, icon: Megaphone },
                        { id: 'gym', label: 'Facility Notices', count: kpiStats.gymCount, icon: Building2 },
                        { id: 'admin', label: 'System Alerts', count: kpiStats.adminCount, icon: ShieldCheck },
                        { id: 'urgent', label: 'Urgent', count: kpiStats.urgentCount, icon: AlertTriangle }
                    ].map((tab) => {
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
                                        layoutId="announcement-tab-pill-indicator"
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
                                <span className={`relative z-10 px-1.5 py-0.2 rounded-full text-[9px] font-black transition-colors ${
                                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex sm:hidden items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-black text-xs shadow-md"
                    style={{
                        background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                        boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                    }}
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Announcement</span>
                </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="px-3 py-2 rounded-xl bg-white dark:bg-[#121622]/85 backdrop-blur-md border border-slate-200/90 dark:border-white/10 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search notices by headline, keywords or sender..."
                            className="w-full pl-8 pr-2.5 py-1 rounded-lg bg-slate-100/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-amber-500 transition-all"
                        />
                    </div>

                    {/* Category Filter */}
                    <SearchableSelect
                        options={[
                            { value: 'all', label: 'All Categories' },
                            ...ANNOUNCEMENT_CATEGORIES.map(cat => ({ value: cat.id, label: cat.label }))
                        ]}
                        value={categoryFilter}
                        onChange={(val) => setCategoryFilter(val || 'all')}
                        placeholder="Category"
                        searchPlaceholder="Search category..."
                        className="w-48"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">
                        {filteredAnnouncements.length} announcement(s)
                    </span>
                </div>
            </div>

            {/* CONTENT AREA: REAL ANNOUNCEMENTS (STRICTLY NO MOCK DATA) */}
            <AnimatePresence mode="wait">
                <SectionTransition key={activeTab} direction={tabDirection} className="w-full">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs text-center">
                            <RefreshCw className="w-8 h-8 animate-spin mb-3" style={{ color: currentThemeConfig.primary }} />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Synchronizing announcements from server...
                    </p>
                </div>
            ) : filteredAnnouncements.length === 0 ? (
                /* ACCURATE EMPTY STATE */
                <div className="bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-8 border border-slate-200/90 dark:border-white/10 text-center shadow-2xs">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-2.5 border border-amber-500/20">
                        <Megaphone className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">
                        No {activeTab !== 'all' ? activeTab : ''} Announcements Yet
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                        {searchTerm.trim()
                            ? `No announcements match the query "${searchTerm}".`
                            : 'Keep members informed with facility updates, timing modifications, or promotions.'}
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-black shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                        style={{
                            background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                            boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                        }}
                    >
                        <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                        <span>Post First Announcement</span>
                    </button>
                </div>
            ) : (
                /* ANNOUNCEMENTS STREAM */
                <div className="space-y-2.5">
                    {paginatedAnnouncements.map((ann) => {
                        const catConfig = getCategoryConfig(ann.category);
                        const isRecent = new Date(ann.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                        return (
                            <div
                                key={ann.id}
                                className={`bg-white dark:bg-[#121622]/85 backdrop-blur-md rounded-xl p-3.5 border shadow-2xs hover:border-amber-500/40 transition-all flex flex-col justify-between group ${
 ann.isAdmin
 ? 'border-blue-500/20 dark:border-blue-500/20'
 : 'border-slate-200/90 dark:border-white/10'
 }`}
                            >
                                <div>
                                    {/* Header Row: Category, Priority, Sender, Time, Delete */}
                                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-white/5">
                                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                            {/* Category Tag */}
                                            <span 
                                                className="px-2 py-0.5 rounded text-[9px] font-black tracking-wider text-slate-900 border"
                                                style={{ backgroundColor: `${catConfig.color}25`, borderColor: `${catConfig.color}40`, color: catConfig.color }}
                                            >
                                                {catConfig.label}
                                            </span>

                                            {/* Priority Tag */}
                                            {ann.priority === 'urgent' && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-rose-500/15 text-rose-500 border border-rose-500/25 flex items-center gap-0.5 animate-pulse">
                                                    <Flame className="w-2.5 h-2.5" />
                                                    Urgent
                                                </span>
                                            )}

                                            {/* Admin Badge */}
                                            {ann.isAdmin && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-0.5">
                                                    <ShieldCheck className="w-2.5 h-2.5" />
                                                    System
                                                </span>
                                            )}

                                            {/* New Pill */}
                                            {isRecent && (
                                                <span className="px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                                                    New
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {formatTimeAgo(ann.createdAt)}
                                            </span>

                                            {/* Delete Button (Only for Gym Staff notices) */}
                                            {!ann.isAdmin && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteModalTarget(ann)}
                                                    className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-all cursor-pointer"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message Body */}
                                    <div className="py-1">
                                        {ann.title && ann.title !== 'Facility Announcement' && (
                                            <h4 className="font-black text-xs text-slate-900 dark:text-white mb-1 tracking-tight">
                                                {ann.title}
                                            </h4>
                                        )}
                                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                            {ann.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer: Sender Signature & Date */}
                                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                                        <MessageSquare className="w-3 h-3 text-amber-500" />
                                        <span>Posted by: <strong>{ann.senderName}</strong></span>
                                    </span>
                                    <span>
                                        {new Date(ann.createdAt).toLocaleDateString('en-IN', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </SectionTransition>
        </AnimatePresence>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-3 py-2 bg-white/60 dark:bg-[#121622]/60 rounded-xl border border-slate-200/80 dark:border-white/10 text-xs">
                    <span className="text-slate-400">
                        Page {pagination.currentPage} of {pagination.totalPages} ({filteredAnnouncements.length} total)
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => pagination.handlePageChange(Math.max(1, pagination.currentPage - 1))}
                            disabled={pagination.currentPage <= 1}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        >
                            Previous
                        </button>
                        <button
                            type="button"
                            onClick={() => pagination.handlePageChange(Math.min(pagination.totalPages, pagination.currentPage + 1))}
                            disabled={pagination.currentPage >= pagination.totalPages}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 disabled:opacity-40 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL 1: POST NEW ANNOUNCEMENT */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setShowCreateModal(false)}
                >
                    <div
                        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                                    <Megaphone className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                        Post New Announcement
                                    </h3>
                                    <p className="text-[10px] text-slate-400">
                                        Broadcast message to all active registered members
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAnnouncement} className="py-3 space-y-3 text-xs">
                            {/* Headline */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Announcement Headline (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="e.g. Diwali Holiday Timings, Steam Room Maintenance..."
                                    className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all placeholder:text-slate-400"
                                />
                            </div>

                            {/* Category & Priority Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Category
                                    </label>
                                    <SearchableSelect
                                        options={ANNOUNCEMENT_CATEGORIES.map(c => ({ value: c.id, label: c.label }))}
                                        value={formCategory}
                                        onChange={(val) => setFormCategory(val)}
                                        placeholder="Select category"
                                        searchPlaceholder="Search category..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Priority Level
                                    </label>
                                    <SearchableSelect
                                        options={[
                                            { value: 'normal', label: 'Standard Priority' },
                                            { value: 'important', label: 'Important (Highlighted)' },
                                            { value: 'urgent', label: 'Urgent Alert (Pinned)' }
                                        ]}
                                        value={formPriority}
                                        onChange={(val) => setFormPriority(val)}
                                        placeholder="Select priority"
                                        searchPlaceholder="Search priority..."
                                    />
                                </div>
                            </div>

                            {/* Message Body */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                                        Broadcast Message *
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {formMessage.length} characters
                                    </span>
                                </div>
                                <textarea
                                    required
                                    rows="4"
                                    value={formMessage}
                                    onChange={(e) => setFormMessage(e.target.value)}
                                    placeholder="Type your announcement details here for gym members..."
                                    className="w-full p-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white outline-none focus:border-amber-500 transition-all resize-none placeholder:text-slate-400"
                                />
                            </div>

                            {/* Actions */}
                            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={formSending || !formMessage.trim()}
                                    className="flex-1 py-1.5 rounded-lg text-white font-black text-xs hover:brightness-110 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                                    style={{
                                        background: `linear-gradient(135deg, ${currentThemeConfig.gradientFrom} 0%, ${currentThemeConfig.gradientTo} 100%)`,
                                        boxShadow: `0 4px 14px ${currentThemeConfig.primary}40`
                                    }}
                                >
                                    {formSending ? (
                                        <>
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            <span>Publishing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Broadcast Notice</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: DELETE CONFIRMATION */}
            {deleteModalTarget && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
                    onClick={() => setDeleteModalTarget(null)}
                >
                    <div
                        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-white/15 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center pb-3 border-b border-slate-100 dark:border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                Withdraw Announcement
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Are you sure you want to remove this announcement from the members feed?
                            </p>
                        </div>

                        <div className="py-2.5 text-xs text-slate-600 dark:text-slate-300 italic truncate">
                            "{deleteModalTarget.title || deleteModalTarget.message}"
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalTarget(null)}
                                className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/15 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAnnouncement}
                                disabled={deleting}
                                className="flex-1 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-2xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        <span>Removing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Confirm Delete</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientAnnouncementMasterPage;

