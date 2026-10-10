import React from 'react';
import { CheckCircle, Mail, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-fade-in-up">
                <div className="bg-indigo-600 p-8 text-center text-white relative h-48 flex flex-col items-center justify-center">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-4 left-10 w-24 h-24 rounded-full bg-white blur-2xl"></div>
                        <div className="absolute bottom-4 right-10 w-32 h-32 rounded-full bg-white blur-3xl"></div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-4 ring-1 ring-white/50">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Registration Submitted!</h1>
                </div>

                <div className="p-8 md:p-12">
                    <div className="space-y-8">
                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100">
                                <ShieldCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold mb-1">Secure Storage</p>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Your documents are stored securely and encrypted using industry-standard protocols.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                                <Mail className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold mb-1">Verification Process</p>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Our verification team will review your application within <span className="text-slate-900 font-bold">24-48 hours</span>. Once approved, you will receive your login credentials via email.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                <Phone className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-slate-900 font-semibold mb-1">Support & Help</p>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    If you need immediate assistance or have questions, please call our support team at:
                                    <span className="block mt-1 text-indigo-600 font-bold text-lg">+91 8923834362</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/partner')}
                            className="flex-1 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 bg-white border-2 border-slate-200 text-slate-900 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            Go to Login <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessPage;
