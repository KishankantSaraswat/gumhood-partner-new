import api from '../../common/utils/api';

/**
 * RBAC (Role-Based Access Control) API Service
 * 
 * Endpoints implemented in routes/adminRoutes.js:
 * 
 * Dynamic Menus:
 *   GET /admin/menus/me
 * 
 * User Group Master (users_group_master):
 *   GET    /admin/groups
 *   POST   /admin/groups
 *   PUT    /admin/groups/:id
 *   DELETE /admin/groups/:id
 * 
 * Group-Level Permissions (users_group_rights):
 *   GET  /admin/groups/:groupId/rights
 *   POST /admin/groups/:groupId/rights
 * 
 * User-Wise Permission Overrides (users_master_rights):
 *   GET    /admin/users/:userId/rights
 *   POST   /admin/users/:userId/rights
 *   DELETE /admin/users/:userId/rights/:pageId
 * 
 * Admin User Management:
 *   GET    /admin/users
 *   POST   /admin/create-admin
 *   PUT    /admin/users/:id
 *   DELETE /admin/users/:id
 *   POST   /admin/login
 */

export const rbacService = {
    // ==========================================
    // Dynamic Authorized Menus
    // ==========================================
    getAuthorizedMenus: async () => {
        try {
            const res = await api.get('/admin/menus/me');
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Authorized menus fallback:', err.message);
            return [];
        }
    },

    getAllAdminMenu: async (params = {}) => {
        try {
            const res = await api.get('/admin/menus/admin-menus', {
                params: { asTree: true, ...params }
            });
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Fallback to /admin/menus with isClientMenu=false:', err.message);
            const fallback = await api.get('/admin/menus', {
                params: { asTree: true, isClientMenu: false, ...params }
            });
            return fallback.menus || fallback.data || (Array.isArray(fallback) ? fallback : []);
        }
    },

    // ==========================================
    // User Groups (users_group_master)
    // ==========================================
    getGroups: async () => {
        try {
            const res = await api.get('/admin/groups');
            return res.groups || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Failed to fetch user groups:', err);
            throw err;
        }
    },

    createGroup: async (data) => {
        const payload = {
            group_name: String(data.group_name || '').trim(),
            allow_ip: data.allow_ip ? String(data.allow_ip).trim() : null,
            status: data.status !== undefined ? (data.status === true || data.status === 1) : true
        };
        return await api.post('/admin/groups', payload);
    },

    updateGroup: async (id, data) => {
        const payload = {
            group_name: String(data.group_name || '').trim(),
            allow_ip: data.allow_ip ? String(data.allow_ip).trim() : null,
            status: data.status !== undefined ? (data.status === true || data.status === 1) : true
        };
        return await api.put(`/admin/groups/${id}`, payload);
    },

    deleteGroup: async (id) => {
        return await api.delete(`/admin/groups/${id}`);
    },

    // ==========================================
    // Group-Level Permissions (users_group_rights)
    // ==========================================
    getGroupRights: async (groupId) => {
        try {
            const res = await api.get(`/admin/groups/${groupId}/rights`);
            return res.rights || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.error(`Failed to fetch rights for group ${groupId}:`, err);
            throw err;
        }
    },

    saveGroupRights: async (groupId, rightsArray) => {
        // Enforce strict format: [{ page_id, view_right, add_right, edit_right, excel_right, delete_right }]
        const formattedRights = rightsArray.map((r) => ({
            page_id: Number(r.page_id || r.pageId || r.id),
            view_right: Boolean(r.view_right ?? r.view),
            add_right: Boolean(r.add_right ?? r.add),
            edit_right: Boolean(r.edit_right ?? r.edit),
            excel_right: Boolean(r.excel_right ?? r.excel),
            delete_right: Boolean(r.delete_right ?? r.delete)
        }));

        return await api.post(`/admin/groups/${groupId}/rights`, {
            rights: formattedRights
        });
    },

    // ==========================================
    // Admin User Management (admin_users)
    // ==========================================
    getUsers: async () => {
        try {
            const res = await api.get('/admin/users');
            return res.users || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Fallback to fetch admin users list:', err.message);
            try {
                const fallback = await api.get('/admin/create-admin');
                return fallback.users || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.error('Failed to load admin users:', fallbackErr);
                return [];
            }
        }
    },

    createAdminUser: async (data) => {
        const payload = {
            name: String(data.name || '').trim(),
            email: String(data.email || '').trim().toLowerCase(),
            phone: String(data.phone || '').trim(),
            password: data.password || undefined,
            group_id: data.group_id ? Number(data.group_id) : null,
            manager_id: data.manager_id ? Number(data.manager_id) : null,
            is_master: Boolean(data.is_master),
            status: data.status !== undefined ? (data.status === true || data.status === 1) : true
        };
        return await api.post('/admin/create-admin', payload);
    },

    updateUser: async (id, data) => {
        const payload = {
            name: String(data.name || '').trim(),
            email: String(data.email || '').trim().toLowerCase(),
            phone: String(data.phone || '').trim(),
            group_id: data.group_id ? Number(data.group_id) : null,
            manager_id: data.manager_id ? Number(data.manager_id) : null,
            is_master: Boolean(data.is_master),
            status: data.status !== undefined ? (data.status === true || data.status === 1) : true
        };
        if (data.password) {
            payload.password = data.password;
        }
        return await api.put(`/admin/users/${id}`, payload);
    },

    deleteUser: async (id) => {
        return await api.delete(`/admin/users/${id}`);
    },

    // ==========================================
    // User-Wise Permission Overrides (users_master_rights)
    // ==========================================
    getUserRights: async (userId) => {
        try {
            const res = await api.get(`/admin/users/${userId}/rights`);
            return res.rights || res.data || res;
        } catch (err) {
            console.error(`Failed to fetch rights for user ${userId}:`, err);
            throw err;
        }
    },

    saveUserRights: async (userId, rightsArray) => {
        const formattedRights = rightsArray.map((r) => ({
            page_id: Number(r.page_id || r.pageId || r.id),
            view_right: Boolean(r.view_right ?? r.view),
            add_right: Boolean(r.add_right ?? r.add),
            edit_right: Boolean(r.edit_right ?? r.edit),
            excel_right: Boolean(r.excel_right ?? r.excel),
            delete_right: Boolean(r.delete_right ?? r.delete)
        }));

        return await api.post(`/admin/users/${userId}/rights`, {
            rights: formattedRights
        });
    },

    deleteUserOverride: async (userId, pageId) => {
        return await api.delete(`/admin/users/${userId}/rights/${pageId}`);
    }
};

export default rbacService;

