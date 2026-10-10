import React from 'react';
import { Dumbbell, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleLogin = async () => {
        setLoading(true);
        setError('');

        // Special Admin Login Check
        if (formData.email === 'adminhood@gmail.com' && formData.password === 'Admin@123') {
            // You might want to get a real token from backend for admin if possible, 
            // but for now we redirect. 
            // Ideally the backend login should return role='Admin' and we redirect based on that.
            // But if we want to force this specific creds for this dashboard:

            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        role: 'Admin' // Try login as Admin
                    })
                });
                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('gymshood_token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    localStorage.setItem('role', 'Admin');
                    navigate('/admin-dashboard');
                    setLoading(false);
                    return;
                }
            } catch (e) {
                //fallback or continue to normal flow if api fails? 
                // If specific hardcoded creds are desired regardless of backend:
                console.log("Admin API login failed, force redirecting for demo if needed. But better to rely on API.");
            }
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: 'GymOwner'
                })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || 'Login failed');

            // Clear old data and store fresh token
            localStorage.clear();
            localStorage.setItem('gymshood_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
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
                <div className="text-center mb-5 sm:mb-6 cursor-pointer" onClick={() => navigate('/partner')}>
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg mx-auto mb-3 transform hover:scale-110 transition-transform">
                        <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome Back</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Login to manage your gym</p>
                </div>

                <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-white/50">
                    {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">{error}</div>}

                    <div className="space-y-4 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="email"
                                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2.5 text-sm sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="you@gym.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="password"
                                    className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-2.5 text-sm sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end mt-1">
                                <button
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-2.5 sm:py-2.5 rounded-lg text-sm sm:text-base font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 mt-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <p className="text-xs sm:text-sm text-slate-500">
                            Don't have an account? <button onClick={() => navigate('/signup')} className="text-indigo-600 font-bold hover:underline">Register Your Gym</button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
