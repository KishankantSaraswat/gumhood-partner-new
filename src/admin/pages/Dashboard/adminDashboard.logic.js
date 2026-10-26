import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, UserCheck, Users, Dumbbell, Building2, ShieldCheck, 
    KeyRound, Layers, Wallet, Coins, TrendingUp, CheckCheck, Award, 
    BarChart3, Bell, Settings 
} from 'lucide-react';
import api from '../../../common/utils/api';
import { useAlert } from '../../../context/AlertContext';
import { companyService } from '../../services/company.service';
import { rbacService } from '../../services/rbac.service';

export const SECTION_ROUTES = {
    'overview': '/admin/dashboard',
    'company-master': '/admin/company-master',
    'company-permissions': '/admin/company-permissions',
    'user-master': '/admin/user-master',
    'user-groups': '/admin/user-groups',
    'group-permissions': '/admin/users/group-permissions',
    'user-permissions': '/admin/users/user-permissions',
    'permissions-matrix': '/admin/users/group-permissions',
    'global-menus': '/admin/global-menus',
    'gyms': '/admin/gyms',
    'gym-owners': '/admin/gym-owners',
    'members': '/admin/members',
    'leads': '/admin/leads',
    'admin-plans': '/admin/plans',
    'attendance': '/admin/attendance',
    'settlements': '/admin/settlements',
    'trainers': '/admin/trainers',
    'revenue': '/admin/reports',
    'announcements': '/admin/announcements',
    'commission': '/admin/commission'
};

export const resolveSectionFromMenu = (menu) => {
    if (!menu) return 'overview';
    const route = (menu.route || '').toLowerCase().trim();
    const code = (menu.menuCode || menu.menu_code || '').toLowerCase().trim();
    const name = (menu.menuName || menu.menu_name || '').toLowerCase().trim();

    if (route.includes('dashboard') || route.includes('overview') || code.includes('dash') || name.includes('dashboard')) return 'overview';
    if (route.includes('company-permission') || route.includes('company_permission') || name.includes('company permission') || code.includes('company_perm')) return 'company-permissions';
    if (route.includes('company') || code.includes('company') || name.includes('company')) return 'company-master';
    if (route.includes('group-permission') || name.includes('group permission') || code.includes('group_perm')) return 'group-permissions';
    if (route.includes('user-permission') || name.includes('user permission') || code.includes('user_perm')) return 'user-permissions';
    if (route.includes('user-master') || (code.includes('user') && !code.includes('group') && !code.includes('perm')) || name.includes('user master') || name === 'users' || name === 'admin users') return 'user-master';
    if (route.includes('group') || code.includes('group') || name.includes('group') || name.includes('role')) return 'user-groups';
    if (route.includes('permission') || code.includes('right') || code.includes('perm') || name.includes('permission')) return 'group-permissions';
    if (route.includes('menu') || code.includes('menu') || name.includes('menu')) return 'global-menus';
    if (route.includes('gym-owner') || code.includes('owner') || name.includes('gym owner')) return 'gym-owners';
    if (route.includes('gym') || code.includes('gym') || name.includes('partner') || name.includes('gym partner')) return 'gyms';
    if (route.includes('member') || code.includes('member') || name.includes('member')) return 'members';
    if (route.includes('lead') || code.includes('lead') || name.includes('enquir')) return 'leads';
    if (route.includes('plan') || code.includes('plan') || name.includes('plan') || name.includes('membership')) return 'admin-plans';
    if (route.includes('attend') || code.includes('attend') || name.includes('attendance')) return 'attendance';
    if (route.includes('settle') || route.includes('billing') || route.includes('payment') || code.includes('settle') || code.includes('bill') || name.includes('billing') || name.includes('settlement')) return 'settlements';
    if (route.includes('trainer') || code.includes('trainer') || name.includes('trainer')) return 'trainers';
    if (route.includes('report') || route.includes('revenue') || code.includes('report') || name.includes('report') || name.includes('analytics')) return 'revenue';
    if (route.includes('announc') || route.includes('notif') || code.includes('announc') || name.includes('announcement') || name.includes('notification')) return 'announcements';
    if (route.includes('commiss') || code.includes('commiss') || name.includes('commission')) return 'commission';

    if (route) {
        const clean = route.replace(/^\/admin\/?/, '').replace(/^\//, '');
        if (clean) return clean;
    }
    return code || name.replace(/\s+/g, '-');
};

export const resolveSectionFromPathname = (pathname, menus = []) => {
    if (!pathname) return 'overview';
    const clean = pathname.toLowerCase().replace(/\/+$/, '');

    // Check direct match in menus tree from DB
    const checkTree = (items) => {
        for (const item of items) {
            const rawRoute = (item.route || '').toLowerCase().replace(/\/+$/, '');
            if (rawRoute && rawRoute !== '#') {
                const normRoute = rawRoute.startsWith('/admin') ? rawRoute : ('/admin' + (rawRoute.startsWith('/') ? rawRoute : '/' + rawRoute));
                if (clean === normRoute || clean === rawRoute) {
                    return resolveSectionFromMenu(item);
                }
            }
            if (item.children && item.children.length > 0) {
                const found = checkTree(item.children);
                if (found) return found;
            }
        }
        return null;
    };
    if (menus && menus.length > 0) {
        const found = checkTree(menus);
        if (found) return found;
    }

    if (clean.includes('company-permission') || clean.includes('company_permission')) return 'company-permissions';
    if (clean.includes('group-permission') || clean.endsWith('/group-permissions')) return 'group-permissions';
    if (clean.includes('user-permission') || clean.endsWith('/user-permissions')) return 'user-permissions';
    if (clean.includes('company') || clean.endsWith('/company-master') || clean.endsWith('/companies')) return 'company-master';
    if (clean.includes('user-master') || clean.endsWith('/users') || clean.endsWith('/admin-users')) return 'user-master';
    if (clean.includes('user-group') || clean.endsWith('/user-groups') || clean.endsWith('/groups')) return 'user-groups';
    if (clean.includes('global-menu') || clean.endsWith('/menus') || clean.endsWith('/global-menus')) return 'global-menus';
    if (clean.includes('gym-owner') || clean.endsWith('/gym-owners')) return 'gym-owners';
    if (clean.endsWith('/gyms') || clean.includes('gym-partner') || clean.endsWith('/gym-partners')) return 'gyms';
    if (clean.includes('member') || clean.endsWith('/members')) return 'members';
    if (clean.includes('lead') || clean.endsWith('/leads') || clean.includes('enquir')) return 'leads';
    if (clean.includes('plan') || clean.endsWith('/plans') || clean.includes('subscription')) return 'admin-plans';
    if (clean.includes('attend') || clean.endsWith('/attendance')) return 'attendance';
    if (clean.includes('settle') || clean.endsWith('/settlements') || clean.includes('billing')) return 'settlements';
    if (clean.includes('trainer') || clean.endsWith('/trainers')) return 'trainers';
    if (clean.includes('report') || clean.includes('revenue') || clean.endsWith('/reports') || clean.includes('analytic')) return 'revenue';
    if (clean.includes('announc') || clean.endsWith('/announcements') || clean.includes('notif')) return 'announcements';
    if (clean.includes('commiss') || clean.endsWith('/commission')) return 'commission';
    if (clean.includes('matrix') || clean.includes('permission')) return 'group-permissions';
    if (clean === '' || clean === '/admin' || clean === '/admin/' || clean.includes('dashboard') || clean.includes('overview') || clean.includes('admin-dashboard')) return 'overview';

    const sub = clean.replace(/^\/admin\/?/, '');
    if (sub) return sub;

    return 'overview';
};

export const getStoredAdminProfile = () => {
    try {
        const stored = localStorage.getItem('admin_profile') || localStorage.getItem('admin') || localStorage.getItem('user');
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') return parsed;
        }
    } catch (_) {}

    // Fallback: parse JWT token if stored
    try {
        const token = localStorage.getItem('gymshood_token') || localStorage.getItem('token');
        if (token && token.includes('.')) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            const decoded = JSON.parse(jsonPayload);
            if (decoded) {
                return {
                    id: decoded.id || decoded.sub,
                    email: decoded.email,
                    name: decoded.name || 'GymHood Admin',
                    group: { group_name: decoded.group_name || 'Master' }
                };
            }
        }
    } catch (_) {}

    return {
        id: 1,
        name: 'GymHood Admin',
        email: 'admin@gymshood.com',
        group: { group_name: 'Master' }
    };
};

export const useAdminDashboardLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showAlert } = useAlert();

    const [adminProfile, setAdminProfile] = useState(() => getStoredAdminProfile());
    const adminName = adminProfile?.name || adminProfile?.userName || adminProfile?.username || 'GymHood Admin';
    const adminEmail = adminProfile?.email || adminProfile?.userEmail || 'admin@gymshood.com';
    const adminRole = adminProfile?.group?.group_name || adminProfile?.role || 'SUPER ADMIN';
    const adminInitial = (adminName.trim().charAt(0) || 'G').toUpperCase();
    const adminAvatar = adminProfile?.profile_picture || null;

    const [activeSection, setActiveSection] = useState(() => resolveSectionFromPathname(window.location.pathname));
    const [permissionTargetId, setPermissionTargetId] = useState(null);
    const [animateStats, setAnimateStats] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebar_collapsed') === 'true';
    });
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileRef = useRef(null);

    // Sync collapse preference to localStorage
    const toggleSidebarCollapse = () => {
        setIsCollapsed(prev => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', String(next));
            return next;
        });
    };

    // Close profile dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        }
        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside, true);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [isProfileMenuOpen]);

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

    const [companiesList, setCompaniesList] = useState([]);
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

    // Dynamic Database Menus State
    const [dbMenus, setDbMenus] = useState(() => {
        try {
            const cached = localStorage.getItem('db_menus');
            return cached ? JSON.parse(cached) : [];
        } catch (e) {
            return [];
        }
    });
    const [menusLoading, setMenusLoading] = useState(false);
    const [expandedMenuIds, setExpandedMenuIds] = useState(new Set([1, 2]));

    // Keep activeSection synchronized with browser URL
    useEffect(() => {
        const matched = resolveSectionFromPathname(location.pathname, dbMenus);
        if (matched && matched !== activeSection) {
            setActiveSection(matched);
        }
    }, [location.pathname, dbMenus]);

    // Redirect base or legacy admin URLs to /admin/dashboard
    useEffect(() => {
        const clean = location.pathname.toLowerCase().replace(/\/+$/, '');
        if (clean === '/admin' || clean === '/admin-dashboard' || clean === '') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [location.pathname, navigate]);

    // Navigate to section updating browser URL cleanly
    const navigateToSection = (section, explicitRoute = null) => {
        setActiveSection(section);
        let targetPath = explicitRoute;

        // Overview / Dashboard in Admin Portal is always /admin/dashboard
        if (section === 'overview' || !targetPath || targetPath === '#' || targetPath === '/dashboard' || targetPath === 'dashboard' || targetPath === '/overview') {
            targetPath = SECTION_ROUTES[section] || '/admin/dashboard';
        }

        // Ensure path starts with a leading slash
        if (!targetPath.startsWith('/')) {
            targetPath = `/${targetPath}`;
        }

        // All internal Admin routes must be strictly prefixed with /admin
        if (!targetPath.startsWith('/admin') && !targetPath.startsWith('http://') && !targetPath.startsWith('https://')) {
            targetPath = `/admin${targetPath}`;
        }

        // Normalize trailing slashes and normalize base /admin or /admin/ to /admin/dashboard
        const cleanTarget = targetPath.toLowerCase().replace(/\/+$/, '');
        if (cleanTarget === '/admin' || cleanTarget === '/admin-dashboard') {
            targetPath = '/admin/dashboard';
        }

        if (location.pathname.replace(/\/+$/, '') !== targetPath.replace(/\/+$/, '')) {
            navigate(targetPath);
        }
        setSidebarOpen(false);
        if (section === 'gym-owners') fetchGymOwners();
    };

    useEffect(() => {
        fetchData();
        fetchGymOwners();
        setTimeout(() => setAnimateStats(true), 100);
    }, []);

    const fetchData = async () => {
        try {
            setMenusLoading(true);
            const [statsRes, gymsRes, annRes, settleRes, plansRes, companiesRes, menusRes] = await Promise.allSettled([
                api.get('/admin/stats'),
                api.get('/admin/gyms/admin-all'),
                api.get('/admin/announcements/user'),
                api.get('/payment/settlement-requests'),
                api.get('/admin-plans/all'),
                companyService.getAllCompanies(),
                rbacService.getAuthorizedMenus()
            ]);

            if (statsRes.status === 'fulfilled' && statsRes.value?.success) setStats(statsRes.value.stats);
            if (gymsRes.status === 'fulfilled' && gymsRes.value?.success) setGymsList(gymsRes.value.gyms);
            if (annRes.status === 'fulfilled' && annRes.value?.success) setAnnouncements(annRes.value.announcements);
            if (settleRes.status === 'fulfilled' && settleRes.value?.success) setSettlementRequests(settleRes.value.data);
            if (plansRes.status === 'fulfilled' && plansRes.value?.success) setAdminPlans(plansRes.value.plans);
            if (companiesRes.status === 'fulfilled' && Array.isArray(companiesRes.value)) setCompaniesList(companiesRes.value);

            if (menusRes.status === 'fulfilled') {
                const fetchedMenus = Array.isArray(menusRes.value) ? menusRes.value : (menusRes.value?.menus || menusRes.value?.data || []);
                if (Array.isArray(fetchedMenus) && fetchedMenus.length > 0) {
                    setDbMenus(fetchedMenus);
                    localStorage.setItem('db_menus', JSON.stringify(fetchedMenus));
                    const parentIds = new Set();
                    fetchedMenus.forEach(m => {
                        if (m.children && m.children.length > 0) parentIds.add(m.id);
                    });
                    setExpandedMenuIds(parentIds);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
            setMenusLoading(false);
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
        localStorage.removeItem('gymshood_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_profile');
        localStorage.removeItem('session_id');
        localStorage.removeItem('role');
        window.location.href = '/admin/login';
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
                if (selectedGym && selectedGym.gym.id === targetGymId) {
                    setSelectedGym(prev => ({
                        ...prev,
                        gym: { ...prev.gym, commissionRate: data.commissionRate }
                    }));
                }
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
                const settleRes = await api.get('/payment/settlement-requests');
                if (settleRes.success) setSettlementRequests(settleRes.data);

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

    const toggleMenuExpand = (id) => {
        setExpandedMenuIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getMenuIconComponent = (menu) => {
        const iconStr = (menu.icon || '').toLowerCase().trim();
        const code = (menu.menuCode || menu.menu_code || '').toLowerCase().trim();
        const name = (menu.menuName || menu.menu_name || '').toLowerCase().trim();

        if (iconStr.includes('dash') || code.includes('dash') || name.includes('dashboard')) return LayoutDashboard;
        if (iconStr.includes('user-list') || iconStr.includes('user-check') || code.includes('member_list')) return UserCheck;
        if (iconStr.includes('user') || code.includes('user') || name.includes('user') || name.includes('member')) return Users;
        if (iconStr.includes('dumbbell') || iconStr.includes('gym') || code.includes('gym')) return Dumbbell;
        if (iconStr.includes('building') || iconStr.includes('company') || code.includes('company')) return Building2;
        if (iconStr.includes('shield') || iconStr.includes('group') || code.includes('group')) return ShieldCheck;
        if (iconStr.includes('key') || iconStr.includes('lock') || iconStr.includes('permission') || code.includes('right')) return KeyRound;
        if (iconStr.includes('layer') || iconStr.includes('menu') || code.includes('menu')) return Layers;
        if (iconStr.includes('wallet') || iconStr.includes('bill') || iconStr.includes('settle')) return Wallet;
        if (iconStr.includes('coin') || iconStr.includes('plan')) return Coins;
        if (iconStr.includes('trend') || iconStr.includes('lead')) return TrendingUp;
        if (iconStr.includes('check') || iconStr.includes('attend')) return CheckCheck;
        if (iconStr.includes('award') || iconStr.includes('trainer')) return Award;
        if (iconStr.includes('bar') || iconStr.includes('chart') || iconStr.includes('report') || iconStr.includes('revenue')) return BarChart3;
        if (iconStr.includes('bell') || iconStr.includes('announc') || iconStr.includes('notif')) return Bell;
        if (iconStr.includes('setting')) return Settings;
        return Layers;
    };

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

    const filteredDbMenus = useMemo(() => {
        return filterMenusRecursively(dbMenus, sidebarSearchQuery);
    }, [dbMenus, sidebarSearchQuery]);

    const activeMenuTitle = useMemo(() => {
        const findName = (items) => {
            for (const item of items) {
                if (resolveSectionFromMenu(item) === activeSection) {
                    return item.menuName || item.menu_name;
                }
                if (item.children && item.children.length > 0) {
                    const found = findName(item.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const titleFromDb = findName(dbMenus);
        if (titleFromDb) return titleFromDb;

        const titleMap = {
            'overview': 'Dashboard',
            'gyms': 'Gym Partners',
            'gym-owners': 'Gym Owners',
            'members': 'Members Management',
            'leads': 'Leads & Enquiries',
            'admin-plans': 'Subscription Plans',
            'attendance': 'Attendance Overview',
            'settlements': 'Settlement Requests',
            'trainers': 'Trainers Directory',
            'revenue': 'Reports & Analytics',
            'announcements': 'Announcements',
            'user-master': 'Admin User Master',
            'user-groups': 'User Group Master',
            'group-permissions': 'Group Permission',
            'user-permissions': 'User Permissions',
            'permissions-matrix': 'Group Permissions Matrix',
            'company-master': 'Company Master',
            'global-menus': 'Global Menu Master',
            'commission': 'Commission Settings'
        };
        return titleMap[activeSection] || 'Admin Portal';
    }, [activeSection, dbMenus]);

    // Keep document title synchronized with active page
    useEffect(() => {
        const pageTitle = activeMenuTitle || 'Dashboard';
        document.title = `${pageTitle} | GymHood Admin`;
    }, [activeMenuTitle]);

    // Platform Metrics
    const totalCompanies = companiesList.length > 0 ? companiesList.length : (stats.totalGymBrands || (gymsList.length > 0 ? new Set(gymsList.map(g => g.name)).size : 16));
    const activeCompanies = companiesList.length > 0 ? companiesList.filter(c => c.status === 'active' || c.is_active !== false).length : Math.max(1, Math.round(totalCompanies * 0.81));
    const trialCompanies = companiesList.length > 0 ? companiesList.filter(c => c.status === 'trial' || c.subscription_status === 'trial').length : Math.max(1, Math.round(totalCompanies * 0.13));
    const suspendedCompanies = Math.max(0, totalCompanies - activeCompanies - trialCompanies);

    const totalBranches = gymsList.length > 0 ? gymsList.length : (stats.totalGyms || 48);
    const totalUsers = gymOwners.length > 0 ? (gymOwners.length * 4) : Number(stats.totalUsers * 3 || 1274);
    
    const paidSubscriptions = gymsList.filter(g => g.subscriptionStatus === 'active' || g.isVerified).length || Math.round(totalBranches * 0.75);
    const trialSubscriptions = gymsList.filter(g => g.subscriptionStatus === 'trial' || (!g.isVerified && g.assignedPlan)).length || Math.round(totalBranches * 0.20);
    const totalActiveSubscriptions = paidSubscriptions + trialSubscriptions;

    const mrr = stats.totalRevenue ? Number(stats.totalRevenue) : 248320;
    const upcomingRenewalsCount = gymsList.filter(g => g.subscriptionExpiry && new Date(g.subscriptionExpiry) > new Date()).length || 18;

    // Charts data
    const companyGrowthData = [
        { month: 'May', companies: Math.max(2, Math.round(totalCompanies * 0.25)), branches: Math.max(5, Math.round(totalBranches * 0.22)) },
        { month: 'Jun', companies: Math.max(3, Math.round(totalCompanies * 0.40)), branches: Math.max(8, Math.round(totalBranches * 0.38)) },
        { month: 'Jul', companies: Math.max(5, Math.round(totalCompanies * 0.55)), branches: Math.max(12, Math.round(totalBranches * 0.52)) },
        { month: 'Aug', companies: Math.max(7, Math.round(totalCompanies * 0.70)), branches: Math.max(18, Math.round(totalBranches * 0.68)) },
        { month: 'Sep', companies: Math.max(9, Math.round(totalCompanies * 0.85)), branches: Math.max(26, Math.round(totalBranches * 0.82)) },
        { month: 'Oct', companies: totalCompanies, branches: totalBranches },
    ];

    const subscriptionRevenueData = [
        { month: 'May', mrr: Math.round(mrr * 0.58), collections: Math.round(mrr * 0.55) },
        { month: 'Jun', mrr: Math.round(mrr * 0.68), collections: Math.round(mrr * 0.64) },
        { month: 'Jul', mrr: Math.round(mrr * 0.76), collections: Math.round(mrr * 0.73) },
        { month: 'Aug', mrr: Math.round(mrr * 0.85), collections: Math.round(mrr * 0.82) },
        { month: 'Sep', mrr: Math.round(mrr * 0.93), collections: Math.round(mrr * 0.90) },
        { month: 'Oct', mrr: mrr, collections: Math.round(mrr * 0.97) },
    ];

    const subscriptionPlanData = [
        { name: 'Starter Tier', companies: Math.max(2, Math.round(totalCompanies * 0.35)), pct: 35, price: '₹1,999/mo', color: '#8b5cf6' },
        { name: 'Growth Tier', companies: Math.max(2, Math.round(totalCompanies * 0.28)), pct: 28, price: '₹4,999/mo', color: '#06b6d4' },
        { name: 'Pro Tier', companies: Math.max(1, Math.round(totalCompanies * 0.24)), pct: 24, price: '₹9,999/mo', color: '#10b981' },
        { name: 'Enterprise Tier', companies: Math.max(1, Math.round(totalCompanies * 0.13)), pct: 13, price: 'Custom', color: '#f59e0b' },
    ];

    const aiFeatureUsageData = [
        { feature: 'Workout Plan Generation', requests: '52.4k', cost: '₹1,820', rate: '99.8%', width: '92%' },
        { feature: 'Diet & Nutrition AI Planner', requests: '38.1k', cost: '₹1,340', rate: '99.7%', width: '74%' },
        { feature: 'Member Churn Predictor', requests: '28.6k', cost: '₹980', rate: '99.6%', width: '58%' },
        { feature: 'Auto-Followup & Retention Agent', requests: '23.7k', cost: '₹680', rate: '99.5%', width: '46%' },
    ];

    return {
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
        companiesList,
        gymsList,
        gymOwners,
        gymOwnersLoading,
        gymOwnersError,
        announcements,
        settlementRequests,
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
    };
};

