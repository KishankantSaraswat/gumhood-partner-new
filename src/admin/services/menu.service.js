import api from '../../common/utils/api';

/**
 * Global Menu Master API Service
 * 
 * Endpoints:
 *   GET    /admin/menus/me (Authorized dynamic menu tree)
 *   GET    /admin/menus (Supports ?asTree=true)
 *   POST   /admin/menus (Add new page)
 *   GET    /admin/menus/:id (Get single menu)
 *   PUT    /admin/menus/:id (Update menu)
 *   DELETE /admin/menus/:id (Delete menu)
 */
export const globalMenuService = {
    /**
     * Get authorized menu tree for the current logged-in admin user
     */
    getAuthorizedMenus: async () => {
        try {
            const res = await api.get('/admin/menus/me');
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Authorized menus endpoint fallback:', err.message);
            return [];
        }
    },

    /**
     * Admin Menus (isClientMenu = false)
     * Dedicated for Admin User & Group permission matrices
     */
    getAllAdminMenu: async (params = {}) => {
        try {
            const res = await api.get('/admin/menus/admin-menus', {
                params: { asTree: true, ...params }
            });
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Fallback to /admin/menus with isClientMenu=false:', err.message);
            try {
                const fallback = await api.get('/admin/menus', {
                    params: { asTree: true, isClientMenu: false, ...params }
                });
                return fallback.menus || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.error('Failed to fetch admin menus:', fallbackErr);
                throw fallbackErr;
            }
        }
    },

    /**
     * Client Menus (isClientMenu = true)
     * Dedicated for Company Permissions matrix
     */
    getAllClientMenu: async (params = {}) => {
        try {
            const res = await api.get('/admin/menus/client-menus', {
                params: { asTree: true, ...params }
            });
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Fallback to /admin/menus with isClientMenu=true:', err.message);
            try {
                const fallback = await api.get('/admin/menus', {
                    params: { asTree: true, isClientMenu: true, ...params }
                });
                return fallback.menus || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.error('Failed to fetch client menus:', fallbackErr);
                throw fallbackErr;
            }
        }
    },

    /**
     * Get all global menus
     * @param {Object} params - Query parameters (asTree, platform, isActive)
     */
    getAllMenus: async (params = {}) => {
        const query = new URLSearchParams();
        if (params.asTree !== undefined) query.append('asTree', params.asTree);
        if (params.platform && params.platform !== 'all') query.append('platform', params.platform);
        if (params.isActive !== undefined && params.isActive !== 'all') query.append('isActive', params.isActive);
        
        const qs = query.toString() ? `?${query.toString()}` : '';

        try {
            const res = await api.get(`/admin/menus${qs}`);
            return res.menus || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            console.warn('Fallback to /api/v1/global-menus endpoint', err.message);
            try {
                const fallback = await api.get(`/api/v1/global-menus${qs}`);
                return fallback.menus || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                try {
                    const fallback2 = await api.get(`/global-menus${qs}`);
                    return fallback2.menus || fallback2.data || (Array.isArray(fallback2) ? fallback2 : []);
                } catch (fallback2Err) {
                    console.error('Failed to fetch global menus:', fallback2Err);
                    throw fallback2Err;
                }
            }
        }
    },

    /**
     * Get single global menu item by ID
     * @param {number|string} id 
     */
    getMenuById: async (id) => {
        try {
            const res = await api.get(`/admin/menus/${id}`);
            return res.menu || res.data || res;
        } catch (err) {
            try {
                const res = await api.get(`/api/v1/global-menus/${id}`);
                return res.menu || res.data || res;
            } catch (fallbackErr) {
                const fallback = await api.get(`/global-menus/${id}`);
                return fallback.menu || fallback.data || fallback;
            }
        }
    },

    /**
     * Create a new global menu item
     * @param {Object} payload 
     */
    createMenu: async (payload) => {
        // Normalize payload: parentId can be null or integer, trim strings
        const formatted = {
            parentId: payload.parentId ? parseInt(payload.parentId, 10) : null,
            menuCode: String(payload.menuCode || '').trim().toUpperCase(),
            menuName: String(payload.menuName || '').trim(),
            menuLabel: payload.menuLabel ? String(payload.menuLabel).trim() : null,
            route: String(payload.route || '').trim(),
            icon: payload.icon ? String(payload.icon).trim() : null,
            menuType: payload.menuType || 'sidebar',
            sortOrder: parseInt(payload.sortOrder, 10) || 0,
            platform: payload.platform || 'web',
            isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
            isClientMenu: Boolean(payload.isClientMenu ?? payload.is_client_menu ?? false),
            is_client_menu: Boolean(payload.isClientMenu ?? payload.is_client_menu ?? false),
            description: payload.description ? String(payload.description).trim() : null
        };

        try {
            return await api.post('/admin/menus', formatted);
        } catch (err) {
            try {
                return await api.post('/api/v1/global-menus', formatted);
            } catch (fallbackErr) {
                return await api.post('/global-menus', formatted);
            }
        }
    },

    /**
     * Update an existing global menu item
     * @param {number|string} id 
     * @param {Object} payload 
     */
    updateMenu: async (id, payload) => {
        const formatted = {
            parentId: payload.parentId ? parseInt(payload.parentId, 10) : null,
            menuCode: String(payload.menuCode || '').trim().toUpperCase(),
            menuName: String(payload.menuName || '').trim(),
            menuLabel: payload.menuLabel ? String(payload.menuLabel).trim() : null,
            route: String(payload.route || '').trim(),
            icon: payload.icon ? String(payload.icon).trim() : null,
            menuType: payload.menuType || 'sidebar',
            sortOrder: parseInt(payload.sortOrder, 10) || 0,
            platform: payload.platform || 'web',
            isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
            isClientMenu: Boolean(payload.isClientMenu ?? payload.is_client_menu ?? false),
            is_client_menu: Boolean(payload.isClientMenu ?? payload.is_client_menu ?? false),
            description: payload.description ? String(payload.description).trim() : null
        };

        try {
            return await api.put(`/admin/menus/${id}`, formatted);
        } catch (err) {
            try {
                return await api.put(`/api/v1/global-menus/${id}`, formatted);
            } catch (fallbackErr) {
                return await api.put(`/global-menus/${id}`, formatted);
            }
        }
    },

    /**
     * Delete a global menu item
     * @param {number|string} id 
     */
    deleteMenu: async (id) => {
        try {
            return await api.delete(`/admin/menus/${id}`);
        } catch (err) {
            try {
                return await api.delete(`/api/v1/global-menus/${id}`);
            } catch (fallbackErr) {
                return await api.delete(`/global-menus/${id}`);
            }
        }
    },

    /**
     * Client-side tree builder helper
     * In case flat list is passed, transform it into nested tree: parent -> children[]
     */
    buildTree: (items = []) => {
        if (!Array.isArray(items)) return [];
        
        // Deep copy items to avoid mutating originals
        const cloned = items.map(item => ({ ...item, children: [] }));
        const idMap = {};
        cloned.forEach(item => {
            idMap[item.id] = item;
        });

        const rootItems = [];
        cloned.forEach(item => {
            const parentId = item.parent_id !== undefined ? item.parent_id : item.parentId;
            if (parentId && idMap[parentId]) {
                idMap[parentId].children.push(item);
            } else {
                rootItems.push(item);
            }
        });

        // Sort by sort_order / sortOrder
        const sortRecursive = (list) => {
            list.sort((a, b) => (Number(a.sort_order ?? a.sortOrder ?? 0) - Number(b.sort_order ?? b.sortOrder ?? 0)));
            list.forEach(node => {
                if (node.children && node.children.length > 0) {
                    sortRecursive(node.children);
                }
            });
        };

        sortRecursive(rootItems);
        return rootItems;
    },

    /**
     * Client-side helper to flatten a tree for selector dropdown with indent level
     */
    flattenForDropdown: (treeNodes = [], level = 0, excludeId = null) => {
        let result = [];
        for (const node of treeNodes) {
            if (excludeId && String(node.id) === String(excludeId)) {
                continue; // Skip self and its descendants to avoid circular parent loops
            }
            const prefix = '— '.repeat(level);
            result.push({
                id: node.id,
                name: `${prefix}${node.menu_name || node.menuName}`,
                code: node.menu_code || node.menuCode,
                level
            });
            if (node.children && node.children.length > 0) {
                result = result.concat(globalMenuService.flattenForDropdown(node.children, level + 1, excludeId));
            }
        }
        return result;
    }
};

export default globalMenuService;

