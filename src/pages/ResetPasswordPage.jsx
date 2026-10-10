import React from 'react';
import { Lock, ShieldCheck, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const emailFromState = location.state?.email || '';

    const [step, setStep] = React.useState(1); // 1: OTP, 2: New Password
    const [formData, setFormData] = React.useState({
        email: emailFromState,
        otp: '',
        password: '',
        confirmPassword: ''
    });
    const [resetSessionId, setResetSessionId] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
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
        e.preventDefault();
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

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center relative overflow-hidden py-6 sm:py-8 px-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-200/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDuration: '5s' }}></div>
            </div>

            <div className="w-full max-w-sm mx-auto animate-fade-in-up">
                <button
                    onClick={() => step === 1 ? navigate('/forgot-password') : setStep(1)}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">{step === 1 ? 'Back to Forgot Password' : 'Change OTP'}</span>
                </button>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
                    <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                            {step === 1 ? 'Verify OTP' : 'Set New Password'}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">
                            {step === 1
                                ? `We've sent a code to ${formData.email}`
                                : 'Choose a strong password for your account'}
                        </p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs rounded-lg font-medium border border-green-100">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Enter 6-digit OTP</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2.5 text-sm tracking-[0.5em] font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                                        placeholder="000000"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.otp || formData.otp.length !== 6}
                                className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-9 sm:pl-10 pr-10 py-2.5 sm:py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !formData.password || !formData.confirmPassword}
                                className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
