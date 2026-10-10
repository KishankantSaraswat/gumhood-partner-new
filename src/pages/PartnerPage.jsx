import React from 'react';
import { ArrowRight, Play, Zap, TrendingUp, Rocket, Users, Trophy, Check, Shield, Globe, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const PartnerPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 min-h-screen">
            <Navigation />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4 animate-pulse" style={{ animationDuration: '4s' }}></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-100/50 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 animate-pulse" style={{ animationDuration: '5s' }}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-8 border border-indigo-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                15,000+ New Partners Monthly
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-slate-900">
                                Partner with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Gymshood</span>
                            </h1>

                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Join the fastest-growing fitness network. We help you scale from setup to your first 50 bookings and beyond.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button onClick={() => navigate('/signup')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2">
                                    Register Your Gym <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                    <Play className="w-5 h-5 text-indigo-600" /> Watch Success Stories
                                </button>
                            </div>

                            <div className="mt-8 text-sm text-slate-500 font-medium">
                                <p className="flex items-center justify-center lg:justify-start gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Onboarding takes just 10-15 minutes
                                </p>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative animate-fade-in-right">
                            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-2 border border-slate-100 transform hover:rotate-0 rotate-1 transition-all duration-500">
                                <img src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&q=80" alt="Gym Owner" className="rounded-2xl w-full object-cover h-[400px]" />

                                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/50 animate-fade-in">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <TrendingUp className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase">Revenue Growth</p>
                                            <p className="text-lg font-bold text-slate-900">+45% in 90 Days</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Success Module */}
            <section id="success" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">New Partner Success Module</h2>
                        <p className="text-lg text-slate-600">A structured 3-level guide to help you get your first ~50 bookings.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Rocket, level: 'LEVEL 1', title: 'Launch & Setup', desc: 'Complete your profile and set up your gallery.', rewards: ['Visibility Boost', 'Verified Badge'], color: 'indigo', delay: '0s' },
                            { icon: Users, level: 'LEVEL 2', title: 'First 50 Bookings', desc: 'Run promotions and gather reviews.', rewards: ['Ad Credits', 'Featured Listing'], color: 'purple', delay: '0.2s' },
                            { icon: Trophy, level: 'LEVEL 3', title: 'Growth & Scale', desc: 'Master advanced tools and expand offerings.', rewards: ['Lower Commission', 'Account Manager'], color: 'green', delay: '0.4s' }
                        ].map((level, i) => (
                            <div key={i} className="bg-slate-50 rounded-3xl p-8 border border-slate-100 relative overflow-hidden transform hover:-translate-y-2 hover:shadow-xl transition-all animate-fade-in-up" style={{ animationDelay: level.delay }}>
                                <div className={`absolute top-0 right-0 bg-${level.color}-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl`}>
                                    {level.level}
                                </div>
                                <div className={`w-14 h-14 rounded-xl bg-${level.color}-100 text-${level.color}-600 flex items-center justify-center mb-6 transform hover:rotate-12 transition-transform`}>
                                    <level.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{level.title}</h3>
                                <p className="text-slate-600 mb-6">{level.desc}</p>
                                <div className="border-t border-slate-200 pt-4">
                                    <p className="text-sm font-bold text-slate-500 mb-2">REWARDS</p>
                                    <ul className="text-sm text-slate-600 space-y-2">
                                        {level.rewards.map((reward, j) => (
                                            <li key={j} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" /> {reward}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Hub */}
            <section id="services" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
                        <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Comprehensive Services Hub</h2>
                        <p className="text-lg text-slate-600">Everything you need to manage and grow your fitness business in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { icon: BarChart, title: 'Analytics Dashboard', desc: 'Monitor your bookings, revenue, and customer feedback in real-time.' },
                            { icon: Globe, title: 'Marketing Tools', desc: 'Promote your gym to thousands of local fitness enthusiasts effortlessly.' },
                            { icon: Shield, title: 'Secure Payments', desc: 'Automated billing and instant transfers directly to your bank account.' }
                        ].map((service, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:scale-105 transition-all animate-fade-in-up">
                                <div className="w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                                    <service.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-600">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Growth */}
            <section id="growth" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="lg:w-1/2 text-center lg:text-left">
                                <h2 className="text-4xl lg:text-5xl font-bold mb-6">Scale Your Local Presence</h2>
                                <p className="text-xl text-indigo-100 mb-8">Gymshood partners see an average 45% increase in footfall within the first 3 months. Join the network that works for you.</p>
                                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                    <button onClick={() => navigate('/signup')} className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg transform hover:scale-105">
                                        Start Growing Now
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Active Users', value: '50k+' },
                                    { label: 'Cities Covered', value: '12+' },
                                    { label: 'Booking Growth', value: '180%' },
                                    { label: 'Partner Satis.', value: '98%' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                        <p className="text-3xl font-bold mb-1">{stat.value}</p>
                                        <p className="text-sm text-indigo-100">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Onboarding */}
            <section id="onboarding" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-16">Seamless Onboarding Process</h2>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-12">
                        {[
                            { step: '1', title: 'Register', desc: 'Fill out your gym details' },
                            { step: '2', title: 'Verify', desc: 'Upload necessary docs' },
                            { step: '3', title: 'Go Live', desc: 'Accept your first booking' }
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-center gap-4 relative">
                                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-200">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                                    <p className="text-slate-600 max-w-[200px]">{item.desc}</p>
                                </div>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-8 left-[calc(100%+0.5rem)] w-16 h-0.5 bg-slate-200"></div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate('/signup')} className="mt-20 bg-indigo-600 text-white px-12 py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105">
                        Register Your Gym
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default PartnerPage;
