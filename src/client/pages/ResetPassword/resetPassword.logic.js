import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const useResetPasswordLogic = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    const [step, setStep] = useState(1); // 1: OTP, 2: New Password
    const [formData, setFormData] = useState({
        email: emailFromState,
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [resetSessionId, setResetSessionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleVerifyOTP = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/verify-reset-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: formData.otp })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Invalid OTP');

            setResetSessionId(data.resetSessionId);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/reset`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resetSessionId,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Failed to reset password');

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        setStep,
        formData,
        setFormData,
        loading,
        error,
        success,
        showPassword,
        setShowPassword,
        handleVerifyOTP,
        handleResetPassword,
        navigate
    };
};

