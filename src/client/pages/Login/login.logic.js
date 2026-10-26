import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAuthService } from '../../services/auth.service';

export const AUTH_TABS = [
    { id: 'password', label: 'Password' },
    { id: 'otp', label: 'OTP Login' }
];

/**
 * Client Portal Login Business Logic Hook
 */
export function useClientLoginLogic() {
    const navigate = useNavigate();

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
    const [confirmMessage, setConfirmMessage] = useState('You are already Logged on another browser/device.\nDo you want to Log in here?');

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

    const performLogin = async (consent = false) => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const data = await clientAuthService.loginWithPassword(
                formData.email.trim(),
                formData.password,
                consent
            );

            // Backend asks for confirmation if already logged in elsewhere
            if (
                data?.requireConsent ||
                data?.require_consent ||
                data?.isAlreadyLoggedIn ||
                data?.data?.requireConsent ||
                data?.data?.require_consent ||
                data?.code === 'SESSION_ACTIVE' ||
                data?.data?.code === 'SESSION_ACTIVE'
            ) {
                const backendMsg = data.message || data.data?.message;
                setConfirmMessage(backendMsg || 'You are already Logged on another browser/device.\nDo you want to Log in here?');
                setShowConfirm(true);
                setLoading(false);
                return;
            }

            if (!data.success && !data.token) throw new Error(data.message || 'Login failed');

            localStorage.clear();
            const token = data.token || 'client_session_token';
            localStorage.setItem('gymshood_token', token);
            localStorage.setItem('token', token);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }
            if (data.company || data.company_details) {
                const companyData = data.company || data.company_details;
                localStorage.setItem('company', JSON.stringify(companyData));
                localStorage.setItem('client_company', JSON.stringify(companyData));
            }
            if (data.group) {
                localStorage.setItem('group', JSON.stringify(data.group));
            }
            const role = data.group?.group_name || (data.user?.isCompanyOwner ? 'Company Owner' : 'Club Manager');
            localStorage.setItem('role', role);

            if (data.rights || data.effective_rights) {
                const rightsData = data.rights || data.effective_rights;
                localStorage.setItem('rights', JSON.stringify(rightsData));
                localStorage.setItem('user_rights', JSON.stringify(rightsData));
            }
            if (data.menus) {
                localStorage.setItem('menus', JSON.stringify(data.menus));
                localStorage.setItem('client_menus', JSON.stringify(data.menus));
            }
            if (data.gym_id || data.user?.gym_id || data.company?.id) {
                localStorage.setItem('active_gym_id', data.gym_id || data.user?.gym_id || data.company?.id);
                localStorage.setItem('gym_id', data.gym_id || data.user?.gym_id || data.company?.id);
            }
            if (data.branch_id || data.user?.branch_id) {
                localStorage.setItem('active_branch_id', data.branch_id || data.user?.branch_id);
                localStorage.setItem('branch_id', data.branch_id || data.user?.branch_id);
            }

            window.location.href = '/dashboard';
        } catch (err) {
            console.error('Login error:', err);
            const errMsg = (err.message || '').toLowerCase();
            const errCode = (err.code || err.response?.code || err.data?.code || err.response?.data?.code || '').toLowerCase();
            const status = err.status || err.response?.status;
            const respMsg = (err.response?.message || err.data?.message || err.response?.data?.message || '').toLowerCase();
            
            if (
                status === 409 ||
                errCode === 'session_active' ||
                errMsg.includes('already logged') ||
                errMsg.includes('another device') ||
                errMsg.includes('another browser') ||
                errMsg.includes('session active') ||
                errMsg.includes('active session') ||
                respMsg.includes('already logged') ||
                respMsg.includes('another device') ||
                respMsg.includes('another browser') ||
                respMsg.includes('session active') ||
                respMsg.includes('active session')
            ) {
                const backendMsg = err.response?.message || err.data?.message || err.message;
                setConfirmMessage(backendMsg || 'You are already Logged on another browser/device.\nDo you want to Log in here?');
                setShowConfirm(true);
            } else {
                setError(err.message || 'Login failed. Please check credentials.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        await performLogin(false);
    };

    const handleConfirmSessionOverride = async () => {
        setShowConfirm(false);
        if (authMode === 'password') {
            await performLogin(true);
        } else {
            await performVerifyOtp(true);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!formData.email) {
            setError('Please enter your email or phone number');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await clientAuthService.sendForgotPasswordOtp(formData.email);
            setOtpSent(true);
            setMessage(res.message || 'OTP dispatched to your registered credentials.');
        } catch (err) {
            console.error('Send OTP error:', err);
            setError(err.message || 'Could not dispatch OTP.');
        } finally {
            setLoading(false);
        }
    };

    const performVerifyOtp = async (consent = false) => {
        if (!formData.otp) {
            setError('Please enter the OTP');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await clientAuthService.verifyResetOtp(formData.email, formData.otp);
            if (res.token) {
                navigate(`/reset-password?token=${res.token}&email=${encodeURIComponent(formData.email)}`);
            } else {
                setMessage(res.message || 'OTP Verified successfully.');
            }
        } catch (err) {
            console.error('Verify OTP error:', err);
            setError(err.message || 'Invalid or expired OTP.');
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
        confirmMessage,
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

export default useClientLoginLogic;

