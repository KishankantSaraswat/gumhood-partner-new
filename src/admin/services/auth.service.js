import api from '../../common/utils/api';

/**
 * Super Admin Authentication Service
 * Dedicated to Super Admin credential validation, OTP generation, and session state.
 */
export const adminAuthService = {
    /**
     * Authenticate Super Admin via Password
     */
    loginWithPassword: async (email, password, consent = false) => {
        const cleanEmail = email.trim();
        try {
            // Dedicated Super Admin Login endpoint
            return await api.post('/admin/login', {
                email: cleanEmail,
                password,
                consent
            });
        } catch (adminErr) {
            // Fallback to /auth/login with role: 'Admin' if /admin/login is not found
            if (adminErr.status === 404 || adminErr.message?.includes('Cannot POST /admin/login')) {
                return await api.post('/auth/login', {
                    email: cleanEmail,
                    password,
                    role: 'Admin',
                    consent
                });
            }
            throw adminErr;
        }
    },

    /**
     * Request OTP for Admin Login
     */
    sendOtp: async (email) => {
        return await api.post('/auth/send-otp', {
            email: email.trim(),
            role: 'Admin'
        });
    },

    /**
     * Verify Admin OTP
     */
    verifyOtp: async (email, otp, consent = false) => {
        return await api.post('/auth/verify-otp', {
            email: email.trim(),
            otp: otp.trim(),
            role: 'Admin',
            consent
        });
    },

    /**
     * Clear Admin Session State
     */
    logout: () => {
        localStorage.removeItem('gymshood_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('client_company');
        localStorage.removeItem('active_gym_id');
        localStorage.removeItem('active_branch_id');
    }
};

export default adminAuthService;

