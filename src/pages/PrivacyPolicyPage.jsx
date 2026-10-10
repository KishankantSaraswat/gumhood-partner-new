import React from 'react';
import { Shield, Mail, Calendar, ExternalLink, ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Navigation />

            {/* Header Section */}
            <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-smooth mb-4 sm:mb-6 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-medium">Back</span>
                    </button>

                    <div className="flex items-center gap-3 sm:gap-4 mb-4">
                        <div className="p-2.5 sm:p-3 bg-indigo-50 rounded-xl sm:rounded-2xl text-indigo-600">
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-500 font-medium">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-400" />
                            <span>Effective: 2025-07-06</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            <span>GymsHood App</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <main className="py-8 sm:py-12 pb-20 sm:pb-32">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] shadow-soft border border-slate-100 p-6 sm:p-12 lg:p-16 animate-fade-in">

                        <div className="space-y-10 sm:space-y-16">
                            <div className="relative">
                                <div className="absolute -left-4 sm:-left-12 top-0 bottom-0 w-1 bg-indigo-600/10 rounded-full hidden sm:block"></div>
                                <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-medium">
                                    This privacy policy applies to the GymsHood app (hereby referred to as "Application") for mobile devices that was created by EDUIETY PRIVATE LIMITED (hereby referred to as "Service Provider") as a Free service. This service is intended for use "AS IS".
                                </p>
                            </div>

                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs sm:text-sm">01</span>
                                    Information Collection and Use
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                    The Application collects information when you download and use it. This information may include crucial technical data to ensure a smooth fitness experience:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {[
                                        "Device's IP Address",
                                        "Application Usage Details",
                                        "Visit Time and Date",
                                        "Operating System Version",
                                        "Session Duration"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-smooth group">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 group-hover:scale-125 transition-transform"></div>
                                            <span className="text-slate-700 text-sm font-semibold">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs sm:text-sm">02</span>
                                    Location Data Services
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                    The Application collects your device's location to help the Service Provider determine your approximate geographical location, which is used for:
                                </p>
                                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                    {[
                                        { title: "Geolocation Services", desc: "Utilizing location data to provide personalized content and nearby gym recommendations." },
                                        { title: "Analytics & Growth", desc: "Aggregated and anonymized data helps us identify trends and improve overall functionality." },
                                        { title: "Service Optimization", desc: "Transmission of anonymized data to external services to enhance the Application's performance." }
                                    ].map((item, i) => (
                                        <div key={i} className="group p-5 bg-gradient-to-br from-indigo-50/30 to-slate-50 border border-slate-200/60 rounded-2xl hover:shadow-medium transition-smooth">
                                            <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-indigo-500" />
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs sm:text-sm">03</span>
                                    Personal Data Requirements
                                </h2>
                                <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                    For a better experience, we may require certain personally identifiable information to personalize your fitness profile:
                                </p>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {["Email", "Name", "Gender", "Date of Birth", "Height", "Weight", "Location", "Job Profile", "City"].map((info, i) => (
                                        <div key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs sm:text-sm font-bold shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-smooth">
                                            {info}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-3">
                                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs sm:text-sm">04</span>
                                    External Services & Safety
                                </h2>
                                <div className="space-y-4">
                                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                                        We utilize industry-leading third-party services to ensure the best possible performance and analytics. Please review their policies:
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <a href="https://www.google.com/policies/privacy/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-medium border border-slate-200 rounded-2xl transition-smooth group font-bold text-slate-900 text-sm">
                                            Google Play Services
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                        </a>
                                        <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-medium border border-slate-200 rounded-2xl transition-smooth group font-bold text-slate-900 text-sm">
                                            Google Analytics for Firebase
                                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                        </a>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                                <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                                    <h3 className="font-bold mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-indigo-400" />
                                        Data Retention
                                    </h3>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        We retain your data for as long as you use the application. Contact us for any deletion requests.
                                    </p>
                                </div>
                                <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100">
                                    <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-500" />
                                        Children's Privacy
                                    </h3>
                                    <p className="text-sm text-indigo-800/80 leading-relaxed">
                                        We do not knowingly collect data from children under 13. Safety is our top priority.
                                    </p>
                                </div>
                            </div>

                            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
                                    <div className="max-w-md">
                                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Have Questions?</h2>
                                        <p className="text-indigo-100 mb-0 leading-relaxed">
                                            If you have any questions regarding privacy while using the Application, please reach out to us.
                                        </p>
                                    </div>
                                    <a
                                        href="mailto:mailgymshood@gmail.com"
                                        className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-slate-50 transition-smooth shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Email Support
                                    </a>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
