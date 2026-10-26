import api from '@/common/utils/api';
import { getStoredCompanyId } from './clientRbac.service';

/**
 * Service to interact with the Gym Member CRUD endpoints
 * Base routes: /api/v1/members or /members
 */
export const clientMemberService = {
    /**
     * Get paginated members list with optional search, status, and gymId
     */
    getMembers: async ({ gymId, search, status, page = 1, limit = 50 } = {}) => {
        const targetGymId = gymId || getStoredCompanyId();
        const params = new URLSearchParams();
        if (targetGymId) params.append('gymId', targetGymId);
        if (search) params.append('search', search.trim());
        if (status && status !== 'all') params.append('status', status);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);

        const response = await api.get(`/api/v1/members?${params.toString()}`);
        return response.data || response;
    },

    /**
     * Get single member details by ID
     */
    getMemberById: async (id, gymId) => {
        const targetGymId = gymId || getStoredCompanyId();
        const query = targetGymId ? `?gymId=${targetGymId}` : '';
        const response = await api.get(`/api/v1/members/${id}${query}`);
        return response.data || response;
    },

    /**
     * Create a new gym member
     */
    createMember: async (payload) => {
        const targetGymId = payload.gymId || getStoredCompanyId();
        const response = await api.post('/api/v1/members', {
            ...payload,
            gymId: Number(targetGymId)
        });
        return response.data || response;
    },

    /**
     * Update an existing member
     */
    updateMember: async (id, payload) => {
        const targetGymId = payload.gymId || getStoredCompanyId();
        const response = await api.put(`/api/v1/members/${id}`, {
            ...payload,
            gymId: Number(targetGymId)
        });
        return response.data || response;
    },

    /**
     * Deactivate / delete member
     */
    deleteMember: async (id, gymId) => {
        const targetGymId = gymId || getStoredCompanyId();
        const query = targetGymId ? `?gymId=${targetGymId}` : '';
        const response = await api.delete(`/api/v1/members/${id}${query}`);
        return response.data || response;
    }
};

export default clientMemberService;
