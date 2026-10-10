import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, Wallet, Shield, Star, Menu, Users, Infinity, PiggyBank, Dumbbell, Search } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const HomePage = () => {
    const [credits, setCredits] = useState(24);

    useEffect(() => {
        const interval = setInterval(() => {
            setCredits(prev => prev === 24 ? 23 : 24);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDuration: '5s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up w-full">
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-indigo-100 animate-bounce-subtle">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                50% Average Savings vs Traditional Gyms
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6 text-slate-900">
                                Smart Gym Access with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Flexible Credits</span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed px-4 lg:px-0">
                                Pay for 30 days, get 30 workout credits. Use them whenever you want. They never expire. Access 50+ partner gyms with one simple app.
                            </p>

                            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-md mx-auto lg:mx-0 flex flex-col sm:flex-row gap-2 transform hover:scale-105 transition-transform">
                                <div className="flex-1 relative">
                                    <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 sm:w-5 h-4 sm:h-5" />
                                    <input type="text" placeholder="Enter your location..." className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base text-slate-700" />
                                </div>
                                <button className="bg-indigo-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95">
                                    Find Gyms
                                </button>
                            </div>

                            <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 font-medium">
                                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                                    <CheckCircle className="w-4 sm:w-5 h-4 sm:h-5 text-green-500" />
                                    No Contracts
                                </div>
                                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Cancel Anytime
                                </div>
                                <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    Instant Access
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative animate-fade-in-right">
                            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 transform hover:rotate-0 rotate-2 transition-all duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-slate-500">Current Balance</p>
                                        <h3 className="text-3xl font-bold text-slate-900 transition-all duration-300">{credits} Credits</h3>
                                    </div>
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transform hover:scale-105 transition-transform">
                                        <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=100&h=100&fit=crop" className="w-12 h-12 rounded-lg object-cover" alt="Gym" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">PowerHouse Gym</h4>
                                            <p className="text-xs text-slate-500">Checked in • 1 Credit used</p>
                                        </div>
                                        <span className="text-green-500 text-sm font-bold">-1 Credit</span>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 transform hover:scale-105 transition-transform">
                                        <img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&h=100&fit=crop" className="w-12 h-12 rounded-lg object-cover" alt="Gym" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">Elite Fitness</h4>
                                            <p className="text-xs text-slate-500">Yesterday • 1 Credit used</p>
                                        </div>
                                        <span className="text-green-500 text-sm font-bold">-1 Credit</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                                    <p className="text-sm text-slate-500">Expires: <span className="text-indigo-600 font-bold">NEVER</span></p>
                                    <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Top up +</button>
                                </div>
                            </div>

                            <div className="absolute -top-8 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">Bank-Level</p>
                                        <p className="text-sm font-bold text-slate-900">Security</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-float" style={{ animationDelay: '1s' }}>
                                <div className="flex items-center gap-3">
                                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                        <Star className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium">App Store</p>
                                        <p className="text-sm font-bold text-slate-900">4.9 Rating</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-10 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: '50+', label: 'Partner Gyms' },
                            { value: '1k+', label: 'Happy Users' },
                            { value: '50%', label: 'Avg. Savings' },
                            { value: '4.9', label: 'App Rating' }
                        ].map((stat, i) => (
                            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-1 hover:scale-110 transition-transform inline-block">{stat.value}</h3>
                                <p className="text-slate-500 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">How Gymshood Works</h2>
                        <p className="text-lg text-slate-600">Forget rigid memberships. Our credit system gives you the ultimate freedom to workout anywhere, anytime.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Search, title: '1. Browse Gyms', desc: 'Explore 50+ top-rated gyms, yoga studios, and fitness centers in your area.', color: 'indigo', delay: '0s' },
                            { icon: Wallet, title: '2. Buy Credits', desc: '1 Credit = 1 Workout. Credits never expire, so you never lose money.', color: 'purple', delay: '0.2s' },
                            { icon: CheckCircle, title: '3. Scan & Workout', desc: 'Show your QR code at the gym entrance, scan in, and start your workout!', color: 'green', delay: '0.4s' }
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 text-center transform hover:-translate-y-2 transition-all animate-fade-in-up" style={{ animationDelay: step.delay }}>
                                <div className={`w-20 h-20 mx-auto bg-${step.color}-50 rounded-2xl flex items-center justify-center text-${step.color}-600 mb-6 transform hover:rotate-12 transition-transform`}>
                                    <step.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                <p className="text-slate-600">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 animate-fade-in-left">
                            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Why Choose Gymshood?</h2>
                            <div className="space-y-8">
                                {[
                                    { icon: Infinity, title: 'Credits Never Expire', desc: 'Your Gymshood credits stay with you until you use them.', color: 'indigo' },
                                    { icon: PiggyBank, title: 'Save Money', desc: 'Pay only for the days you workout. Save up to 50% annually.', color: 'purple' },
                                    { icon: Dumbbell, title: 'Access Top Gyms', desc: 'Train at the best fitness centers in your city.', color: 'green' }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4 animate-fade-in-right" style={{ animationDelay: `${i * 0.2}s` }}>
                                        <div className={`flex-shrink-0 w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 transform hover:scale-110 transition-transform`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                                            <p className="text-slate-600">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:w-1/2 animate-fade-in-right">
                            <div className="relative w-64 h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden mx-auto transform hover:scale-105 transition-transform">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20"></div>
                                <div className="w-full h-full bg-white relative">
                                    <div className="p-4 bg-indigo-600 text-white pt-12 pb-6 rounded-b-3xl">
                                        <div className="flex justify-between items-center mb-4">
                                            <Menu className="w-5 h-5" />
                                            <span className="font-bold">Gymshood</span>
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Hello, User</h3>
                                        <p className="text-indigo-200">Let's workout today!</p>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="bg-white shadow-lg rounded-xl p-4 border border-slate-100 animate-fade-in">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-slate-500 text-sm">Balance</span>
                                                <span className="text-indigo-600 font-bold text-sm">Top up</span>
                                            </div>
                                            <div className="text-3xl font-bold text-slate-900">12 Credits</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomePage;
