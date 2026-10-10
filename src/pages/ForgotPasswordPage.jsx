import React from 'react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

    const handleForgotPassword = async (e) => {
        e.preventDefault();
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

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center relative overflow-hidden py-6 sm:py-8 px-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-200/40 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-200/40 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDuration: '5s' }}></div>
            </div>

            <div className="w-full max-w-sm mx-auto animate-fade-in-up">
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Login</span>
                </button>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
                    <div className="text-center mb-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Forgot Password?</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Enter your email to receive an OTP</p>
                    </div>

                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">{error}</div>}
                    {success && <div className="mb-4 p-3 bg-green-50 text-green-600 text-xs rounded-lg font-medium border border-green-100">OTP sent successfully! Redirecting...</div>}

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="you@gym.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-indigo-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
