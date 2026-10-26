import React from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { AnimatedTabs, ConfirmDialog } from '../../../common';
import { useAdminLoginLogic, ADMIN_AUTH_TABS } from './login.logic';

/**
 * Super Admin Login Page Component (/admin/login)
 */
export const AdminLoginPage = () => {
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
        handleConfirmSessionOverride,
        handleTabChange,
        handleInputChange,
        togglePasswordVisibility,
        handlePasswordLogin,
        handleSendOtp,
        handleVerifyOtp,
        setOtpSent,
        navigateTo
    } = useAdminLoginLogic();

    return (
        <div className="auth-page-container">
            <div className="auth-content-wrapper">
                <div className="auth-card animate-scale-up">
                    {/* Header with Admin Shield Indicator */}
                    <div className="text-center mb-5">
                        <div className="w-11 h-11 mx-auto mb-2.5 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shadow-xs">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h2 className="auth-card-title">
                            Admin Portal
                        </h2>
                        <div className="auth-card-divider" />
                    </div>

                    {/* Animated Tab Switcher */}
                    <div className="mb-5">
                        <AnimatedTabs
                            tabs={ADMIN_AUTH_TABS}
                            activeTab={authMode}
                            onChange={handleTabChange}
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
                                    Admin Username / Email <span className="form-label-required">*</span>
                                </label>
                                <div className="form-input-wrapper">
                                    <div className="form-input-icon">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        autoComplete="username"
                                        placeholder="admin@gymshood.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        disabled={loading}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="form-label">
                                    Master Password <span className="form-label-required">*</span>
                                </label>
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
                                        Authenticating Admin...
                                    </span>
                                ) : (
                                    'Access Admin Hub'
                                )}
                            </button>
                        </form>
                    )}

                    {/* OTP Login Form */}
                    {authMode === 'otp' && (
                        <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
                            <div>
                                <label className="form-label">
                                    Administrator Email <span className="form-label-required">*</span>
                                </label>
                                <div className="form-input-wrapper">
                                    <div className="form-input-icon">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="admin@gymshood.com"
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
                                        6-Digit Security OTP <span className="form-label-required">*</span>
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
                                    'Send Security Code'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Nav to Client Portal */}
                    <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                        <p className="text-xs text-slate-500">
                            Looking for Partner & Gym Operator login?{' '}
                            <button
                                type="button"
                                onClick={() => navigateTo('/login')}
                                className="font-bold text-orange-600 hover:text-orange-700 hover:underline"
                            >
                                Client Portal &rarr;
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
                message={"You are already Logged on another browser/device.\nDo you want to Log in here?"}
                confirmText="Yes"
                cancelText="Cancel"
                type="warning"
            />
        </div>
    );
};

export default AdminLoginPage;

