import React from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AnimatedTabs, ConfirmDialog } from '../../../common';
import { useClientLoginLogic, AUTH_TABS } from './login.logic';

/**
 * Pure presentation UI component for the Client Portal Login Page
 */
export const LoginPage = () => {
    const {
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
        navigateTo
    } = useClientLoginLogic();

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-card animate-scale-up">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h2 className="auth-card-title">
                            Account Login
                        </h2>
                        <div className="auth-card-divider" />
                    </div>

                    {/* Animated Tab Switcher */}
                    <div className="mb-5">
                        <AnimatedTabs
                            tabs={AUTH_TABS}
                            activeTab={authMode}
                            onChange={handleTabChange}
                            layoutId="loginAuthModeTab"
                        />
                    </div>

                    {/* Feedback Messages */}
                    {error && (
                        <div className="form-alert-error animate-fade-in">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="form-alert-success animate-fade-in">
                            {message}
                        </div>
                    )}

                    {/* Password Login Form */}
                    {authMode === 'password' && (
                        <form onSubmit={handlePasswordLogin} className="space-y-4">
                            <div>
                                <label className="form-label">
                                    Username/Email ID <span className="form-label-required">*</span>
                                </label>
                                <div className="form-input-wrapper">
                                    <div className="form-input-icon">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        autoComplete="username"
                                        placeholder="Enter registered email or mobile"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="form-label !mb-0">
                                        Password <span className="form-label-required">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => navigateTo('/forgot-password')}
                                        className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="form-input-wrapper">
                                    <div className="form-input-icon">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="••••••••••••"
                                        required
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        disabled={loading}
                                        className="form-input form-input-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="form-password-toggle form-toggle-password-btn"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="form-submit-btn btn-submit-primary w-full mt-4 py-3 px-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Authenticating...
                                    </span>
                                ) : (
                                    'Secure Login'
                                )}
                            </button>
                        </form>
                    )}

                    {/* OTP Login Form */}
                    {authMode === 'otp' && (
                        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                            <div>
                                <label className="form-label">
                                    Email or Phone <span className="form-label-required">*</span>
                                </label>
                                <div className="form-input-wrapper">
                                    <div className="form-input-icon">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter email or mobile number"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading || otpSent}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {otpSent && (
                                <div className="animate-fade-in">
                                    <label className="form-label">
                                        Enter 6-Digit OTP <span className="form-label-required">*</span>
                                    </label>
                                    <div className="form-input-wrapper">
                                        <div className="form-input-icon">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="123456"
                                            required
                                            value={formData.otp}
                                            onChange={(e) => handleInputChange('otp', e.target.value)}
                                            disabled={loading}
                                            className="form-input form-input-otp"
                                        />
                                    </div>
                                    <div className="mt-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setOtpSent(false)}
                                            className="text-xs text-orange-600 hover:underline"
                                        >
                                            Change email or resend?
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="form-submit-btn btn-submit-primary w-full mt-4 py-3 px-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 hover:from-amber-300 hover:to-orange-500 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </span>
                                ) : otpSent ? (
                                    'Verify OTP & Enter'
                                ) : (
                                    'Send Security OTP'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Nav */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-center text-xs text-slate-500">
                        <p>
                            Don't have a Partner account?{' '}
                            <button
                                type="button"
                                onClick={() => navigateTo('/signup')}
                                className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
                            >
                                Sign Up as Gym Partner
                            </button>
                        </p>
                        <p className="text-[11px] text-slate-400">
                            Super Administrator?{' '}
                            <button
                                type="button"
                                onClick={() => navigateTo('/admin/login')}
                                className="font-bold text-slate-600 hover:text-orange-600 hover:underline"
                            >
                                Admin Portal &rarr;
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* Concurrent Session Override Dialog */}
            <ConfirmDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSessionOverride}
                title="Confirm"
                message={confirmMessage || "You are already Logged on another browser/device.\nDo you want to Log in here?"}
                confirmText="Yes"
                cancelText="Cancel"
                type="warning"
            />
        </div>
    );
};

export default LoginPage;

