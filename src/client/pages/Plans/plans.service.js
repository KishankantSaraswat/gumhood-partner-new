import api from '@/common/utils/api';

/**
 * Plans Management Service for Partner Portal
 */
export const clientPlansService = {
    /**
     * Get all plans belonging to a gym
     */
    async getPlans(gymId) {
        if (!gymId) return { success: false, plans: [] };
        try {
            const data = await api.get(`/gymdb/plans/gym/${gymId}`);
            if (data && data.success) {
                return {
                    success: true,
                    plans: Array.isArray(data.plans) ? data.plans : []
                };
            }
            return {
                success: false,
                plans: Array.isArray(data?.plans) ? data.plans : [],
                message: data?.message || 'Failed to fetch plans'
            };
        } catch (error) {
            console.error('Error fetching plans in clientPlansService:', error);
            throw error;
        }
    },

    /**
     * Get a specific plan by ID
     */
    async getPlanById(gymId, planId) {
        const res = await this.getPlans(gymId);
        if (res.success && res.plans) {
            const plan = res.plans.find(p => String(p.id) === String(planId) || String(p._id) === String(planId));
            return { success: !!plan, plan };
        }
        return { success: false, plan: null };
    },

    /**
     * Create a new membership plan
     */
    async createPlan(gymId, payload) {
        if (!gymId) throw new Error('Gym ID is required to create a plan');
        const formattedPayload = {
            ...payload,
            validity: Number(payload.validity),
            price: Number(payload.price),
            discountPercent: Number(payload.discountPercent || 0),
            duration: Number(payload.duration || 1.5),
            features: Array.isArray(payload.features) ? payload.features.join(', ') : (payload.features || ''),
            isActive: payload.isActive !== false
        };
        const data = await api.post(`/gymdb/${gymId}/plans`, formattedPayload);
        return data;
    },

    /**
     * Update an existing membership plan
     */
    async updatePlan(planId, payload) {
        if (!planId) throw new Error('Plan ID is required to update');
        const formattedPayload = {
            ...payload,
            validity: Number(payload.validity),
            price: Number(payload.price),
            discountPercent: Number(payload.discountPercent || 0),
            duration: Number(payload.duration || 1.5),
            features: Array.isArray(payload.features) ? payload.features.join(', ') : (payload.features || ''),
            isActive: payload.isActive !== false
        };
        const data = await api.put(`/gymdb/plans/${planId}`, formattedPayload);
        return data;
    },

    /**
     * Deactivate a plan (soft delete so existing subscriptions remain valid)
     */
    async deactivatePlan(planId) {
        if (!planId) throw new Error('Plan ID is required');
        const data = await api.put(`/gymdb/plans/${planId}`, { isActive: false });
        return data;
    },

    /**
     * Hard delete a plan if supported
     */
    async deletePlan(planId) {
        if (!planId) throw new Error('Plan ID is required');
        try {
            const data = await api.delete(`/gymdb/plans/${planId}`);
            return data;
        } catch (_) {
            // Fallback to soft delete
            return this.deactivatePlan(planId);
        }
    }
};

export default clientPlansService;

