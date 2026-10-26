import api from '../../common/utils/api';

/**
 * Default Client Menus (9 Client Pages)
 * DASHBOARD, PROFILE, USERS, PLANS, REVENUE, CASH_PAYMENTS, ACTIVE_MEMBERS, ANNOUNCEMENTS, PAYMENT_HISTORY
 */
export const DEFAULT_CLIENT_MENUS = [
    { id: 1, pageId: 1, menuCode: 'DASHBOARD', menuName: 'Dashboard Overview', menuLabel: 'Dashboard', route: '/dashboard', icon: 'layout-dashboard', sortOrder: 1, children: [] },
    { id: 2, pageId: 2, menuCode: 'PROFILE', menuName: 'Facility Profile', menuLabel: 'Profile', route: '/profile', icon: 'building', sortOrder: 2, children: [] },
    { id: 3, pageId: 3, menuCode: 'USERS', menuName: 'Staff & Roles', menuLabel: 'Staff', route: '/users', icon: 'users', sortOrder: 3, children: [] },
    { id: 4, pageId: 4, menuCode: 'PLANS', menuName: 'Membership Plans', menuLabel: 'Plans', route: '/plans', icon: 'coins', sortOrder: 4, children: [] },
    { id: 5, pageId: 5, menuCode: 'REVENUE', menuName: 'Revenue Analytics', menuLabel: 'Revenue', route: '/revenue', icon: 'trending-up', sortOrder: 5, children: [] },
    { id: 6, pageId: 6, menuCode: 'CASH_PAYMENTS', menuName: 'Enrollment Requests', menuLabel: 'Enrollments', route: '/cash-payments', icon: 'wallet', sortOrder: 6, children: [] },
    { id: 7, pageId: 7, menuCode: 'ACTIVE_MEMBERS', menuName: 'Active Members', menuLabel: 'Members', route: '/active-members', icon: 'user-check', sortOrder: 7, children: [] },
    { id: 8, pageId: 8, menuCode: 'ANNOUNCEMENTS', menuName: 'Announcements', menuLabel: 'Announcements', route: '/announcements', icon: 'bell', sortOrder: 8, children: [] },
    { id: 9, pageId: 9, menuCode: 'PAYMENT_HISTORY', menuName: 'Transaction History', menuLabel: 'Payments', route: '/payment-history', icon: 'file-text', sortOrder: 9, children: [] }
];

export const getStoredCompanyId = () => {
    try {
        const storedCompany = localStorage.getItem('client_company') || localStorage.getItem('company');
        if (storedCompany) {
            const parsed = JSON.parse(storedCompany);
            if (parsed && (parsed.id || parsed.companyId)) return parsed.id || parsed.companyId;
        }
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed && (parsed.companyId || parsed.company_id)) return parsed.companyId || parsed.company_id;
        }
    } catch (_) {}
    return null;
};

export const clientRbacService = {
    // ==========================================
    // 1. Client Company Users (Staff Management)
    // ==========================================
    /**
     * 3a. List Company Users (Hierarchy Aware)
     * GET /api/v1/client-company/users
     */
    getUsers: async (companyId = null, status = null) => {
        const cId = companyId || getStoredCompanyId();
        const query = new URLSearchParams();
        if (cId) query.append('companyId', cId);
        if (status !== null && status !== 'all') query.append('status', status);
        const qs = query.toString() ? `?${query.toString()}` : '';

        try {
            const res = await api.get(`/api/v1/client-company/users${qs}`);
            return res.users || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            const fallback = await api.get(`/client-company/users${qs}`);
            return fallback.users || fallback.data || (Array.isArray(fallback) ? fallback : []);
        }
    },

    /**
     * 3c. Get User Details
     * GET /api/v1/client-company/users/:id
     */
    getUserById: async (id) => {
        try {
            const res = await api.get(`/api/v1/client-company/users/${id}`);
            return res.user || res.data || res;
        } catch (err) {
            const fallback = await api.get(`/client-company/users/${id}`);
            return fallback.user || fallback.data || fallback;
        }
    },

    /**
     * 3b. Create Company User
     * POST /api/v1/client-company/users
     */
    createUser: async (userData) => {
        const cId = userData.companyId || userData.company_id || getStoredCompanyId();
        const payload = {
            companyId: Number(cId) || undefined,
            name: String(userData.name || '').trim(),
            email: String(userData.email || '').trim().toLowerCase(),
            username: String(userData.username || userData.login_id || userData.email?.split('@')[0] || '').trim(),
            password: userData.password ? String(userData.password).trim() : 'Password@123',
            phone: String(userData.phone || '').trim(),
            groupId: userData.groupId && userData.groupId !== 'none' ? Number(userData.groupId) : (userData.group_id ? Number(userData.group_id) : null),
            managerId: userData.managerId && userData.managerId !== 'none' && userData.managerId !== 'all' ? Number(userData.managerId) : null,
            isCompanyOwner: Boolean(userData.isCompanyOwner || userData.is_company_owner),
            status: userData.status !== undefined ? Boolean(userData.status) : true
        };

        try {
            return await api.post('/api/v1/client-company/users', payload);
        } catch (err) {
            return await api.post('/client-company/users', payload);
        }
    },

    /**
     * 3d. Update Company User
     * PUT /api/v1/client-company/users/:id
     */
    updateUser: async (id, userData) => {
        const payload = {
            name: userData.name !== undefined ? String(userData.name).trim() : undefined,
            phone: userData.phone !== undefined ? String(userData.phone).trim() : undefined,
            username: userData.username !== undefined ? String(userData.username).trim() : (userData.login_id ? String(userData.login_id).trim() : undefined),
            email: userData.email !== undefined ? String(userData.email).trim().toLowerCase() : undefined,
            groupId: userData.groupId !== undefined ? (userData.groupId && userData.groupId !== 'none' ? Number(userData.groupId) : null) : undefined,
            managerId: userData.managerId !== undefined ? (userData.managerId && userData.managerId !== 'none' && userData.managerId !== 'all' ? Number(userData.managerId) : null) : undefined,
            status: userData.status !== undefined ? Boolean(userData.status) : undefined,
            isCompanyOwner: userData.isCompanyOwner !== undefined ? Boolean(userData.isCompanyOwner) : undefined
        };
        if (userData.password && String(userData.password).trim()) {
            payload.password = String(userData.password).trim();
        }

        try {
            return await api.put(`/api/v1/client-company/users/${id}`, payload);
        } catch (err) {
            return await api.put(`/client-company/users/${id}`, payload);
        }
    },

    /**
     * 3e. Delete Company User
     * DELETE /api/v1/client-company/users/:id
     */
    deleteUser: async (id) => {
        try {
            return await api.delete(`/api/v1/client-company/users/${id}`);
        } catch (err) {
            return await api.delete(`/client-company/users/${id}`);
        }
    },

    // ==========================================
    // 2. Client User Groups / Roles
    // ==========================================
    /**
     * 1a. List All Groups for a Company
     * GET /api/v1/client-company/groups
     */
    getGroups: async (companyId = null) => {
        const cId = companyId || getStoredCompanyId();
        const qs = cId ? `?companyId=${cId}` : '';
        try {
            const res = await api.get(`/api/v1/client-company/groups${qs}`);
            return res.groups || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            try {
                const fallback = await api.get(`/api/v1/client-company/groups`);
                return fallback.groups || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                const alt = await api.get(`/client-company/groups${qs}`);
                return alt.groups || alt.data || (Array.isArray(alt) ? alt : []);
            }
        }
    },

    /**
     * 1c. Get User Group by ID
     * GET /api/v1/client-company/groups/:id
     */
    getGroupById: async (id) => {
        try {
            const res = await api.get(`/api/v1/client-company/groups/${id}`);
            return res.group || res.data || res;
        } catch (err) {
            const fallback = await api.get(`/client-company/groups/${id}`);
            return fallback.group || fallback.data || fallback;
        }
    },

    /**
     * 1b. Create User Group
     * POST /api/v1/client-company/groups
     */
    createGroup: async (groupData) => {
        const payload = {
            group_name: String(groupData.group_name || '').trim(),
            allow_ip: groupData.allow_ip ? String(groupData.allow_ip).trim() : '',
            status: groupData.status !== undefined ? Boolean(groupData.status) : true
        };

        try {
            return await api.post('/api/v1/client-company/groups', payload);
        } catch (err) {
            return await api.post('/client-company/groups', payload);
        }
    },

    /**
     * 1d. Update User Group
     * PUT /api/v1/client-company/groups/:id
     */
    updateGroup: async (id, groupData) => {
        const payload = {
            group_name: String(groupData.group_name || '').trim(),
            allow_ip: groupData.allow_ip ? String(groupData.allow_ip).trim() : '',
            status: groupData.status !== undefined ? Boolean(groupData.status) : true
        };

        try {
            return await api.put(`/api/v1/client-company/groups/${id}`, payload);
        } catch (err) {
            return await api.put(`/client-company/groups/${id}`, payload);
        }
    },

    /**
     * 1e. Delete User Group
     * DELETE /api/v1/client-company/groups/:id
     */
    deleteGroup: async (id) => {
        try {
            return await api.delete(`/api/v1/client-company/groups/${id}`);
        } catch (err) {
            return await api.delete(`/client-company/groups/${id}`);
        }
    },

    // ==========================================
    // 3. Client Menus Tree
    // ==========================================
    getClientMenus: async () => {
        try {
            const res = await api.get('/api/v1/client-company/me');
            if (res?.menus && Array.isArray(res.menus) && res.menus.length > 0) {
                return res.menus;
            }
        } catch (_) {}

        try {
            const stored = localStorage.getItem('client_menus') || localStorage.getItem('menus');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (_) {}

        return DEFAULT_CLIENT_MENUS;
    },

    // ==========================================
    // 4. Group-Wise Permissions (Matrix)
    // ==========================================
    /**
     * 2a. Get Group Rights Matrix
     * GET /api/v1/client-company/groups/:groupId/rights
     */
    getGroupRights: async (groupId) => {
        try {
            const res = await api.get(`/api/v1/client-company/groups/${groupId}/rights`);
            return res.rights || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            try {
                const fallback = await api.get(`/client-company/groups/${groupId}/rights`);
                return fallback.rights || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.warn(`Could not load group rights for ${groupId}:`, fallbackErr.message);
                return [];
            }
        }
    },

    /**
     * 2b. Save / Update Group Rights
     * POST /api/v1/client-company/groups/:groupId/rights
     */
    saveGroupRights: async (groupId, rightsArray) => {
        const formattedRights = rightsArray.map(r => ({
            pageId: Number(r.pageId || r.page_id || r.id),
            viewRight: Boolean(r.viewRight ?? r.view_right ?? r.view),
            addRight: Boolean(r.addRight ?? r.add_right ?? r.add),
            editRight: Boolean(r.editRight ?? r.edit_right ?? r.edit),
            excelRight: Boolean(r.excelRight ?? r.excel_right ?? r.excel),
            deleteRight: Boolean(r.deleteRight ?? r.delete_right ?? r.delete)
        }));

        try {
            return await api.post(`/api/v1/client-company/groups/${groupId}/rights`, {
                rights: formattedRights
            });
        } catch (err) {
            return await api.post(`/client-company/groups/${groupId}/rights`, {
                rights: formattedRights
            });
        }
    },

    // ==========================================
    // 5. User-Wise Permissions (Matrix Overrides)
    // ==========================================
    /**
     * 4a. Get User Rights Overrides
     * GET /api/v1/client-company/users/:userId/rights
     */
    getUserRights: async (userId) => {
        try {
            const res = await api.get(`/api/v1/client-company/users/${userId}/rights`);
            return res.rights || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            try {
                const fallback = await api.get(`/client-company/users/${userId}/rights`);
                return fallback.rights || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.warn(`Could not load user rights for ${userId}:`, fallbackErr.message);
                return [];
            }
        }
    },

    /**
     * 4b. Save / Update User Rights Overrides
     * POST /api/v1/client-company/users/:userId/rights
     */
    saveUserRights: async (userId, rightsArray) => {
        const formattedRights = rightsArray.map(r => ({
            pageId: Number(r.pageId || r.page_id || r.id),
            viewRight: Boolean(r.viewRight ?? r.view_right ?? r.view),
            addRight: Boolean(r.addRight ?? r.add_right ?? r.add),
            editRight: Boolean(r.editRight ?? r.edit_right ?? r.edit),
            excelRight: Boolean(r.excelRight ?? r.excel_right ?? r.excel),
            deleteRight: Boolean(r.deleteRight ?? r.delete_right ?? r.delete)
        }));

        try {
            return await api.post(`/api/v1/client-company/users/${userId}/rights`, {
                rights: formattedRights
            });
        } catch (err) {
            return await api.post(`/client-company/users/${userId}/rights`, {
                rights: formattedRights
            });
        }
    },

    /**
     * 4c. Delete User Right Override
     * DELETE /api/v1/client-company/users/:userId/rights/:pageId
     */
    deleteUserRight: async (userId, pageId) => {
        try {
            return await api.delete(`/api/v1/client-company/users/${userId}/rights/${pageId}`);
        } catch (err) {
            return await api.delete(`/client-company/users/${userId}/rights/${pageId}`);
        }
    }
};

export default clientRbacService;
