import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Shield, Lock, Hourglass, Check, ArrowRight, Loader2, Info } from 'lucide-react';

const SubscriptionOverlay = ({ gym, onPaymentSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            const { order, key } = await api.post('/partner-subscription/create-order');
            
            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: "GymsHood Partner",
                description: `Subscription for ${gym.name}`,
                order_id: order.id,
                handler: async (response) => {
                    setLoading(true);
                    try {
                        await api.post('/partner-subscription/verify-payment', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        onPaymentSuccess();
                    } catch (err) {
                        setError("Payment verification failed. Please contact support.");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: (gym.contactEmail || 'partner@gymshood.com').split('@')[0],
                    email: gym.contactEmail || '',
                    contact: gym.phone || ''
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setError(response.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (err) {
            console.error('Payment initialization failed:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const isExpired = gym.subscriptionStatus === 'expired';

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden animate-modal-in border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
                
                {/* Left Side: Brand & Status (2/5 on desktop) */}
                <div className="md:w-2/5 bg-indigo-600 p-8 text-white relative flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 mx-auto border border-white/30 shadow-xl">
                            {isExpired ? <Hourglass className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight">
                            {isExpired ? 'Subscription Expired' : 'Activation Required'}
                        </h2>
                        <p className="text-indigo-100 font-medium text-sm md:text-base max-w-[240px] mx-auto opacity-90">
                            {isExpired 
                                ? 'Maintain your business growth' 
                                : 'Unlock full potential of your business'} by activating your partner plan.
                        </p>
                    </div>
                    
                    <div className="mt-8 relative z-10 hidden md:block">
                        <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-widest">
                            <Shield className="w-4 h-4" />
                            Secure Partnership
                        </div>
                    </div>
                </div>

                {/* Right Side: Plan & Action (3/5 on desktop) */}
                <div className="md:w-3/5 p-6 md:p-10 flex flex-col overflow-y-auto">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest block mb-1">Plan Assigned</span>
                                <h3 className="text-xl font-bold text-slate-800">Growth Partner Plan</h3>
                            </div>
                            <span className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Recommended</span>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100 flex items-baseline gap-2">
                             <div className="flex flex-col">
                                <span className="text-3xl font-black text-slate-900">₹{gym.assignedPlan?.price}</span>
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter">for {gym.assignedPlan?.duration} Days Access</span>
                             </div>
                             <div className="ml-auto bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold">GST INCLUDED</div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3 h-3" /> Included Features
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    'Analytics Dashboard',
                                    'Plan Management',
                                    'QR Attendance',
                                    'Revenue Reports'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-white border border-slate-50 p-3 rounded-xl shadow-sm">
                                        <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-3 animate-shake">
                                <div className="p-1 bg-red-100 rounded-full">
                                    <Info className="w-4 h-4" />
                                </div>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-slate-900 text-white h-14 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:pointer-events-none shadow-xl shadow-slate-200"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span>Activate Partner Portal</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                        
                        <div className="flex items-center justify-center gap-4 mt-6 opacity-50">
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                SECURE END-TO-END PAYMENT
                             </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionOverlay;
