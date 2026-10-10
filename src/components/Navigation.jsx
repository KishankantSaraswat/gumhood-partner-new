import React, { useState, useEffect } from 'react';
import { Dumbbell, Menu, X } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';

const Navigation = ({ isDark = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const isPartnerPage = location.pathname === '/partner' || location.pathname === '/signup';

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md'} border-b border-slate-200/50`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2 cursor-pointer transform hover:scale-105 transition-transform" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Dumbbell className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                                Gymshood
                            </span>
                            {isPartnerPage && (
                                <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase ml-0.5">
                                    Partner
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        {isPartnerPage ? (
                            <>
                                <a href="#success" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Success Module</a>
                                <a href="#services" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Services Hub</a>
                                <a href="#growth" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Growth</a>
                                <a href="#onboarding" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Onboarding</a>
                            </>
                        ) : (
                            <>
                                <a href="#how-it-works" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">How it Works</a>
                                <a href="#features" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Features</a>
                                <a href="#video" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Demo</a>
                                <Link to="/partner" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">For Gyms</Link>
                            </>
                        )}
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <button onClick={() => navigate('/login')} className="text-slate-600 hover:text-indigo-600 font-medium px-4 py-2 transition-colors">
                            {isPartnerPage ? 'Partner Login' : 'Log in'}
                        </button>
                        <button
                            onClick={() => isPartnerPage ? navigate('/signup') : navigate('/signup')}
                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            {isPartnerPage ? 'Register Your Gym' : 'Get App'}
                        </button>
                    </div>

                    <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {isOpen && (
                    <div className="md:hidden py-4 space-y-2 animate-fade-in">
                        {isPartnerPage ? (
                            <>
                                <a href="#success" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Success Module</a>
                                <a href="#services" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Services Hub</a>
                                <a href="#growth" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Growth</a>
                                <a href="#onboarding" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Onboarding</a>
                            </>
                        ) : (
                            <>
                                <a href="#how-it-works" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">How it Works</a>
                                <a href="#features" className="block px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Features</a>
                                <Link to="/partner" className="block w-full text-left px-3 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-lg" onClick={() => setIsOpen(false)}>For Gyms</Link>
                            </>
                        )}
                        <div className="pt-4 flex flex-col gap-3">
                            <button onClick={() => { navigate('/login'); setIsOpen(false); }} className="w-full py-3 text-slate-600 font-medium border border-slate-200 rounded-xl">
                                {isPartnerPage ? 'Partner Login' : 'Log in'}
                            </button>
                            <button
                                onClick={() => { navigate('/signup'); setIsOpen(false); }}
                                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl shadow-lg"
                            >
                                {isPartnerPage ? 'Register Your Gym' : 'Get App'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navigation;
