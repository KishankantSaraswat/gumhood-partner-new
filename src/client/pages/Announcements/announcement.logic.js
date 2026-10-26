import { useState, useEffect, useMemo, useCallback } from 'react';
import api from '@/common/utils/api';
import { useAlert } from '@/context/AlertContext';

export const ANNOUNCEMENT_CATEGORIES = [
    { id: 'general', label: 'Facility Notice', color: '#f59e0b', icon: 'bell' },
    { id: 'timing', label: 'Timing & Holidays', color: '#3b82f6', icon: 'calendar' },
    { id: 'maintenance', label: 'Equipment & Maintenance', color: '#ec4899', icon: 'wrench' },
    { id: 'promotion', label: 'Special Offer & Events', color: '#10b981', icon: 'sparkles' },
    { id: 'alert', label: 'Urgent Operational Alert', color: '#ef4444', icon: 'alert-triangle' }
];

export const useClientAnnouncementLogic = ({ gym } = {}) => {
    const { showAlert } = useAlert();

    // Primary State
    const TAB_ORDER = useMemo(() => ['all', 'gym', 'admin', 'urgent'], []);
    const [activeTab, setActiveTabState] = useState('all'); // 'all' | 'gym' | 'admin' | 'urgent'
    const [tabDirection, setTabDirection] = useState(1);

    const handleTabChange = useCallback((nextTab) => {
        const currentIdx = TAB_ORDER.indexOf(activeTab);
        const nextIdx = TAB_ORDER.indexOf(nextTab);
        setTabDirection(nextIdx >= currentIdx ? 1 : -1);
        setActiveTabState(nextTab);
    }, [activeTab, TAB_ORDER]);

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    // Data State (Strictly Real Backend Data - No Mock Data)
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal & Form State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteModalTarget, setDeleteModalTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // New Announcement Form State
    const [formTitle, setFormTitle] = useState('');
    const [formMessage, setFormMessage] = useState('');
    const [formCategory, setFormCategory] = useState('general');
    const [formPriority, setFormPriority] = useState('normal'); // 'normal' | 'important' | 'urgent'
    const [formSending, setFormSending] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(8);

    // Fetch Announcements from Real Endpoints
    const fetchAnnouncements = useCallback(async (isManual = false) => {
        if (isManual) setRefreshing(true);
        else setLoading(true);

        try {
            const [gymData, adminData] = await Promise.allSettled([
                api.get('/gymdb/announcements/gym'),
                api.get('/admin/announcements/user')
            ]);

            let combined = [];

            // 1. Gym announcements
            if (gymData.status === 'fulfilled' && gymData.value?.success && Array.isArray(gymData.value?.announcements)) {
                const list = gymData.value.announcements.map(ann => ({
                    id: ann.id || ann._id,
                    title: ann.title || 'Facility Announcement',
                    message: ann.message || '',
                    category: ann.category || 'general',
                    priority: ann.priority || 'normal',
                    createdAt: ann.createdAt || new Date().toISOString(),
                    isAdmin: false,
                    senderName: ann.gymId?.name || gym?.name || 'Front Desk Staff',
                    raw: ann
                }));
                combined.push(...list);
            }

            // 2. Admin system announcements
            if (adminData.status === 'fulfilled' && adminData.value?.success && Array.isArray(adminData.value?.announcements)) {
                const adminList = adminData.value.announcements.map(ann => ({
                    id: ann.id || ann._id,
                    title: ann.title || 'System Broadcast',
                    message: ann.message || '',
                    category: ann.category || 'alert',
                    priority: ann.priority || 'urgent',
                    createdAt: ann.createdAt || new Date().toISOString(),
                    isAdmin: true,
                    senderName: 'Platform Administrator',
                    raw: ann
                }));
                combined.push(...adminList);
            }

            // Sort by createdAt descending (newest first)
            combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setAnnouncements(combined);
        } catch (err) {
            console.error('[AnnouncementLogic] Error fetching announcements:', err);
            // Strictly real: set empty list on error, never inject fake records
            setAnnouncements([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [gym]);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    // Handle Create Announcement
    const handleCreateAnnouncement = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!formMessage.trim()) {
            showAlert({
                title: 'Message Required',
                message: 'Please enter announcement details to broadcast.',
                type: 'error'
            });
            return;
        }

        setFormSending(true);
        try {
            // Include formatted message combining title if provided
            const payload = {
                title: formTitle.trim() || 'Facility Announcement',
                message: formTitle.trim() ? `[${formTitle.trim()}] ${formMessage.trim()}` : formMessage.trim(),
                category: formCategory,
                priority: formPriority
            };

            const response = await api.post('/gymdb/gyms/announcements', payload);
            if (response && response.success !== false) {
                // Reset form
                setFormTitle('');
                setFormMessage('');
                setFormCategory('general');
                setFormPriority('normal');
                setShowCreateModal(false);

                showAlert({
                    title: 'Announcement Published',
                    message: 'Your broadcast notice has been published and sent to gym members.',
                    type: 'success'
                });

                // Refresh live announcements
                fetchAnnouncements(true);
            } else {
                throw new Error(response?.message || 'Publishing was not acknowledged by the server');
            }
        } catch (err) {
            console.error('[AnnouncementLogic] Create error:', err);
            showAlert({
                title: 'Publish Failed',
                message: err.message || 'We could not publish your announcement. Please verify connection.',
                type: 'error'
            });
        } finally {
            setFormSending(false);
        }
    };

    // Handle Delete Announcement
    const handleDeleteAnnouncement = async () => {
        if (!deleteModalTarget) return;
        const targetId = deleteModalTarget.id;
        setDeleting(true);

        try {
            const data = await api.delete(`/gymdb/announcements/gym/${targetId}`);
            if (data && data.success !== false) {
                setAnnouncements(prev => prev.filter(item => item.id !== targetId));
                setDeleteModalTarget(null);
                showAlert({
                    title: 'Announcement Removed',
                    message: 'The announcement has been withdrawn from members.',
                    type: 'success'
                });
            } else {
                throw new Error(data?.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('[AnnouncementLogic] Delete error:', err);
            showAlert({
                title: 'Delete Failed',
                message: err.message || 'Could not delete announcement. It may have expired.',
                type: 'error'
            });
        } finally {
            setDeleting(false);
        }
    };

    // Filter Logic
    const filteredAnnouncements = useMemo(() => {
        return announcements.filter(item => {
            // Tab filter
            if (activeTab === 'gym' && item.isAdmin) return false;
            if (activeTab === 'admin' && !item.isAdmin) return false;
            if (activeTab === 'urgent' && item.priority !== 'urgent') return false;

            // Category filter
            if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

            // Search query
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase().trim();
                const titleMatch = (item.title || '').toLowerCase().includes(q);
                const msgMatch = (item.message || '').toLowerCase().includes(q);
                const senderMatch = (item.senderName || '').toLowerCase().includes(q);

                if (!titleMatch && !msgMatch && !senderMatch) return false;
            }

            return true;
        });
    }, [announcements, activeTab, categoryFilter, searchTerm]);

    // Paginated list
    const paginatedAnnouncements = useMemo(() => {
        const start = (currentPage - 1) * rowsPerPage;
        return filteredAnnouncements.slice(start, start + rowsPerPage);
    }, [filteredAnnouncements, currentPage, rowsPerPage]);

    // KPI Summary
    const kpiStats = useMemo(() => {
        const gymNotices = announcements.filter(a => !a.isAdmin);
        const adminNotices = announcements.filter(a => a.isAdmin);
        const urgentNotices = announcements.filter(a => a.priority === 'urgent');

        return {
            total: announcements.length,
            gymCount: gymNotices.length,
            adminCount: adminNotices.length,
            urgentCount: urgentNotices.length
        };
    }, [announcements]);

    // Export CSV
    const handleExportCSV = () => {
        if (filteredAnnouncements.length === 0) return;
        const headers = ['ID', 'Title', 'Message', 'Category', 'Priority', 'Sender', 'Is Admin', 'Date'];
        const rows = filteredAnnouncements.map(a => [
            a.id,
            a.title,
            a.message.replace(/\n/g, ' '),
            a.category,
            a.priority,
            a.senderName,
            a.isAdmin ? 'Yes' : 'No',
            new Date(a.createdAt).toLocaleString()
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `announcements-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return {
        activeTab,
        setActiveTab: handleTabChange,
        tabDirection,
        searchTerm,
        setSearchTerm,
        categoryFilter,
        setCategoryFilter,
        viewMode,
        setViewMode,
        loading,
        refreshing,
        announcements,
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
        pagination: {
            currentPage,
            rowsPerPage,
            totalRecords: filteredAnnouncements.length,
            totalPages: Math.max(1, Math.ceil(filteredAnnouncements.length / rowsPerPage)),
            handlePageChange: (page) => setCurrentPage(page),
            handleRowsPerPageChange: (size) => {
                setRowsPerPage(Number(size));
                setCurrentPage(1);
            }
        }
    };
};

export default useClientAnnouncementLogic;

