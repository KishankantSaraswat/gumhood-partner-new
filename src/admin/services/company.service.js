import api from '../../common/utils/api';

/**
 * Company API Service
 * Endpoints:
 *   POST   /api/v1/company (or /company)
 *   GET    /api/v1/company (or /company)  [supports ?client_id= and ?status=]
 *   GET    /api/v1/company/:id
 *   PUT    /api/v1/company/:id
 *   DELETE /api/v1/company/:id
 *
 * Client Company Auth, Groups, and Users:
 *   POST   /api/v1/client-company/login (and /client-company/login)
 *   POST   /api/v1/client-company/groups (and /client-company/groups)
 *   POST   /api/v1/client-company/users (and /client-company/users)
 *   GET    /api/v1/client-company/:companyId/users
 *   GET    /api/v1/client-company/:companyId/groups
 */
export const companyService = {
    /**
     * Get all companies
     */
    getAllCompanies: async (params = {}) => {
        const query = new URLSearchParams();
        if (params.client_id) query.append('client_id', params.client_id);
        if (params.status !== undefined && params.status !== 'all') query.append('status', params.status);
        const qs = query.toString() ? `?${query.toString()}` : '';

        try {
            const res = await api.get(`/api/v1/company${qs}`);
            return res.companies || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            const fallback = await api.get(`/company${qs}`);
            return fallback.companies || fallback.data || (Array.isArray(fallback) ? fallback : []);
        }
    },

    /**
     * Get single company by ID
     */
    getCompanyById: async (id) => {
        try {
            const res = await api.get(`/api/v1/company/${id}`);
            return res.company || res.data || res;
        } catch (err) {
            const fallback = await api.get(`/company/${id}`);
            return fallback.company || fallback.data || fallback;
        }
    },

    /**
     * Create new company
     */
    createCompany: async (payload) => {
        try {
            return await api.post('/api/v1/company', payload);
        } catch (err) {
            return await api.post('/company', payload);
        }
    },

    /**
     * Update existing company
     */
    updateCompany: async (id, payload) => {
        try {
            return await api.put(`/api/v1/company/${id}`, payload);
        } catch (err) {
            return await api.put(`/company/${id}`, payload);
        }
    },

    /**
     * Delete company
     */
    deleteCompany: async (id) => {
        try {
            return await api.delete(`/api/v1/company/${id}`);
        } catch (err) {
            return await api.delete(`/company/${id}`);
        }
    },

    /**
     * Authenticate client staff / partner against client_company_user
     * POST /api/v1/client-company/login (or /client-company/login)
     * Returns JWT + user profile + company details with rights
     */
    loginClientCompanyUser: async (email, password, consent = false) => {
        const payload = { email, password, consent };
        try {
            return await api.post('/api/v1/client-company/login', payload);
        } catch (err) {
            return await api.post('/client-company/login', payload);
        }
    },

    /**
     * Create roles/groups and bulk-assign page rights for a company
     * POST /api/v1/client-company/groups
     */
    createCompanyGroup: async (groupData) => {
        try {
            return await api.post('/api/v1/client-company/groups', groupData);
        } catch (err) {
            return await api.post('/client-company/groups', groupData);
        }
    },

    /**
     * Fetch groups for a specific company
     */
    getCompanyGroups: async (companyId) => {
        try {
            const res = await api.get(`/api/v1/client-company/${companyId}/groups`);
            return res.groups || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            const fallback = await api.get(`/client-company/${companyId}/groups`);
            return fallback.groups || fallback.data || (Array.isArray(fallback) ? fallback : []);
        }
    },

    /**
     * Create users within a client company
     * POST /api/v1/client-company/users (or /client-company/users)
     * Payload: { name, email, password, phone, companyId, groupId, managerId, isCompanyOwner, permissions }
     */
    createCompanyUser: async (userData) => {
        try {
            return await api.post('/api/v1/client-company/users', userData);
        } catch (err) {
            return await api.post('/client-company/users', userData);
        }
    },

    /**
     * Fetch users within a client company
     * GET /api/v1/client-company/users?companyId=:companyId&status=true
     */
    getCompanyUsers: async (companyId, status = null) => {
        const query = new URLSearchParams();
        if (companyId) query.append('companyId', companyId);
        if (status !== null) query.append('status', status);
        const qs = query.toString() ? `?${query.toString()}` : '';

        try {
            const res = await api.get(`/api/v1/client-company/users${qs}`);
            return res.users || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            try {
                const fallback = await api.get(`/client-company/users${qs}`);
                return fallback.users || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                // Also check path param fallback /api/v1/client-company/:companyId/users
                const alt = await api.get(`/api/v1/client-company/${companyId}/users`);
                return alt.users || alt.data || (Array.isArray(alt) ? alt : []);
            }
        }
    },

    /**
     * Get single user details with group and permissions
     * GET /api/v1/client-company/users/:id
     */
    getCompanyUserById: async (id) => {
        try {
            const res = await api.get(`/api/v1/client-company/users/${id}`);
            return res.user || res.data || res;
        } catch (err) {
            const fallback = await api.get(`/client-company/users/${id}`);
            return fallback.user || fallback.data || fallback;
        }
    },

    /**
     * Update client user
     * PUT /api/v1/client-company/users/:id
     * Payload: { name, phone, groupId, managerId, status, password, permissions }
     */
    updateCompanyUser: async (id, userData) => {
        try {
            return await api.put(`/api/v1/client-company/users/${id}`, userData);
        } catch (err) {
            return await api.put(`/client-company/users/${id}`, userData);
        }
    },

    /**
     * Get Company Rights Matrix
     * GET /api/v1/admin/companies/:companyId/rights
     */
    getCompanyRights: async (companyId) => {
        try {
            const res = await api.get(`/api/v1/admin/companies/${companyId}/rights`);
            return res.rights || res.data || (Array.isArray(res) ? res : []);
        } catch (err) {
            try {
                const fallback = await api.get(`/admin/companies/${companyId}/rights`);
                return fallback.rights || fallback.data || (Array.isArray(fallback) ? fallback : []);
            } catch (fallbackErr) {
                console.error(`Failed to fetch company rights for company ${companyId}:`, fallbackErr);
                throw fallbackErr;
            }
        }
    },

    /**
     * Save/Upsert batch company permissions
     * POST /api/v1/admin/companies/:companyId/rights
     * Payload: { rights: [{ page_id, view_right, add_right, edit_right, excel_right, delete_right }] }
     */
    saveCompanyRights: async (companyId, rightsArray) => {
        const formattedRights = rightsArray.map((r) => ({
            page_id: Number(r.page_id || r.pageId || r.id),
            view_right: Boolean(r.view_right ?? r.view),
            add_right: Boolean(r.add_right ?? r.add),
            edit_right: Boolean(r.edit_right ?? r.edit),
            excel_right: Boolean(r.excel_right ?? r.excel),
            delete_right: Boolean(r.delete_right ?? r.delete)
        }));

        try {
            return await api.post(`/api/v1/admin/companies/${companyId}/rights`, {
                rights: formattedRights
            });
        } catch (err) {
            return await api.post(`/admin/companies/${companyId}/rights`, {
                rights: formattedRights
            });
        }
    },

    /**
     * Delete permission for a specific page
     * DELETE /api/v1/admin/companies/:companyId/rights/:pageId
     */
    deleteCompanyRight: async (companyId, pageId) => {
        try {
            return await api.delete(`/api/v1/admin/companies/${companyId}/rights/${pageId}`);
        } catch (err) {
            return await api.delete(`/admin/companies/${companyId}/rights/${pageId}`);
        }
    }
};

export default companyService;
