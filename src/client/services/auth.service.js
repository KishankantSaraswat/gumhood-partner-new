import api from '../../common/utils/api';

/**
 * Client Portal & Partner Authentication Service
 */
export const clientAuthService = {
    /**
     * Authenticate client partner / company staff
     * Supports login via email, login_id, or username
     */
    loginWithPassword: async (identifier, password, consent = false) => {
        const cleanId = (identifier || '').trim();
        const payload = {
            email: cleanId,
            login_id: cleanId,
            username: cleanId,
            password,
            consent
        };

        const isSessionActiveErr = (err) => {
            const msg = (err?.message || '').toLowerCase();
            const code = (err?.data?.code || err?.response?.code || '').toLowerCase();
            return (
                err?.status === 409 ||
                code === 'session_active' ||
                msg.includes('already logged') ||
                msg.includes('another device') ||
                msg.includes('another browser') ||
                msg.includes('session active') ||
                msg.includes('active session')
            );
        };

        try {
            return await api.post('/api/v1/client-company/login', payload);
        } catch (clientErr) {
            if (isSessionActiveErr(clientErr)) throw clientErr;
            if (clientErr.status !== 404 && !clientErr.message?.includes('Cannot POST')) {
                throw clientErr;
            }
            try {
                return await api.post('/client-company/login', payload);
            } catch (fallbackErr) {
                if (isSessionActiveErr(fallbackErr)) throw fallbackErr;
                if (fallbackErr.status !== 404 && !fallbackErr.message?.includes('Cannot POST')) {
                    throw fallbackErr;
                }
                try {
                    return await api.post('/client/login', payload);
                } catch (err3) {
                    if (isSessionActiveErr(err3)) throw err3;
                    return await api.post('/auth/login', {
                        email: cleanId,
                        password,
                        role: 'GymOwner',
                        consent
                    });
                }
            }
        }
    },

    /**
     * Fetch authenticated client profile / session context (/me)
     */
    getProfileMe: async () => {
        try {
            return await api.get('/api/v1/client-company/me');
        } catch (err) {
            return await api.get('/client-company/me');
        }
    },

    /**
     * Direct Client Company Staff login
     */
    loginClientCompany: async (identifier, password, consent = false) => {
        const cleanId = (identifier || '').trim();
        const payload = {
            email: cleanId,
            login_id: cleanId,
            username: cleanId,
            password,
            consent
        };
        try {
            return await api.post('/api/v1/client-company/login', payload);
        } catch (err) {
            return await api.post('/client-company/login', payload);
        }
    },

    /**
     * Request an OTP for password recovery
     */
    sendForgotPasswordOtp: async (email) => {
        return await api.post('/auth/password/forgot', { email: email.trim() });
    },

    /**
     * Verify password recovery OTP
     */
    verifyResetOtp: async (email, otp) => {
        return await api.post('/auth/password/verify-reset-otp', {
            email: email.trim(),
            otp: otp.trim()
        });
    },

    /**
     * Reset password with token
     */
    resetPassword: async (token, newPassword) => {
        return await api.post('/auth/password/reset', {
            token,
            password: newPassword
        });
    },

    /**
     * Clear client session
     */
    logout: () => {
        localStorage.removeItem('gymshood_token');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('client_company');
        localStorage.removeItem('group');
        localStorage.removeItem('role');
        localStorage.removeItem('user_rights');
        localStorage.removeItem('client_menus');
        localStorage.removeItem('active_gym_id');
        localStorage.removeItem('active_branch_id');
        window.location.href = '/login';
    }
};

export default clientAuthService;

