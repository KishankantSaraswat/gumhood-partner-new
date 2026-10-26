import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthService } from '../../services/auth.service';

export const ADMIN_AUTH_TABS = [
    { id: 'password', label: 'Password' },
    { id: 'otp', label: 'OTP Login' }
];

/**
 * Super Admin Login Business Logic Hook
 * Encapsulates state, authentication workflow, OTP flow, and session concurrency.
 */
export function useAdminLoginLogic() {
    const navigate = useNavigate();

    // Auto-redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('gymshood_token');
        if (token) {
            window.location.href = '/admin/dashboard';
        }
    }, []);

    const [authMode, setAuthMode] = useState('password');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        otp: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const handleTabChange = (mode) => {
        setAuthMode(mode);
        setError('');
        setMessage('');
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const performAdminLogin = async (consent = false) => {
        setLoading(true);
        setError('');
        setMessage('');

        const cleanEmail = formData.email.trim();



        try {
            const data = await adminAuthService.loginWithPassword(cleanEmail, formData.password, consent);

            if (data && (data.token || data.success)) {
                const token = data.token || 'admin_session_token';
                localStorage.setItem('gymshood_token', token);
                localStorage.setItem('token', token);
                localStorage.setItem('role', 'Admin');
                if (data.session_id) {
                    localStorage.setItem('session_id', data.session_id);
                }
                const profile = data.admin || data.user || data.data?.admin || data.data?.user || data.data;
                if (profile) {
                    localStorage.setItem('user', JSON.stringify(profile));
                    localStorage.setItem('admin', JSON.stringify(profile));
                    localStorage.setItem('admin_profile', JSON.stringify(profile));
                }
                window.location.href = '/admin/dashboard';
                return;
            } else {
                setError(data.message || 'Login failed. Invalid response from server.');
            }
        } catch (err) {
            console.error('Super Admin password login error:', err);
            if (err.data?.code === 'SESSION_ACTIVE' || err.status === 409) {
                setShowConfirm(true);
            } else {
                setError(err.message || 'Authentication error. Please check your credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        await performAdminLogin(false);
    };

    const handleConfirmSessionOverride = async () => {
        setShowConfirm(false);
        if (authMode === 'password') {
            await performAdminLogin(true);
        } else {
            await performVerifyOtp(true);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email.trim()) {
            setError('Please enter your administrator email address.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await adminAuthService.sendOtp(formData.email);
            setOtpSent(true);
            setMessage(res.message || `One-Time Password has been dispatched to ${formData.email}.`);
        } catch (err) {
            console.error('Super Admin send OTP error:', err);
            setError(err.message || 'Could not send OTP. Verify the email address.');
        } finally {
            setLoading(false);
        }
    };

    const performVerifyOtp = async (consent = false) => {
        if (!formData.otp.trim()) {
            setError('Please enter the 6-digit OTP code.');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await adminAuthService.verifyOtp(formData.email, formData.otp, consent);

            if (data.token) {
                localStorage.setItem('gymshood_token', data.token);
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', 'Admin');
                if (data.session_id) {
                    localStorage.setItem('session_id', data.session_id);
                }
                const profile = data.admin || data.user || data.data?.admin || data.data?.user || data.data;
                if (profile) {
                    localStorage.setItem('user', JSON.stringify(profile));
                    localStorage.setItem('admin', JSON.stringify(profile));
                    localStorage.setItem('admin_profile', JSON.stringify(profile));
                }
                window.location.href = '/admin/dashboard';
                return;
            } else {
                setError(data.message || 'OTP verification failed.');
            }
        } catch (err) {
            console.error('Super Admin verify OTP error:', err);
            if (err.data?.code === 'SESSION_ACTIVE' || err.status === 409) {
                setShowConfirm(true);
            } else {
                setError(err.message || 'Invalid or expired OTP code.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        await performVerifyOtp(false);
    };

    return {
        authMode,
        formData,
        showPassword,
        loading,
        otpSent,
        error,
        message,
        showConfirm,
        setShowConfirm,
        handleConfirmSessionOverride,
        handleTabChange,
        handleInputChange,
        togglePasswordVisibility,
        handlePasswordLogin,
        handleSendOtp,
        handleVerifyOtp,
        setOtpSent,
        navigateTo: navigate
    };
}

export default useAdminLoginLogic;

