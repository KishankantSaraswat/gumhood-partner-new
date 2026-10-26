import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useForgotPasswordLogic = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleForgotPassword = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/password/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Something went wrong');

            setSuccess(true);
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        loading,
        error,
        success,
        handleForgotPassword,
        navigate
    };
};

