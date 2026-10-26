import React, { useState, useEffect } from 'react';
import api from '@/common/utils/api';
import { GymLoader } from '@/common';

const PaymentHistorySection = ({ gym, onOpenSettlementModal }) => {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterType, setFilterType] = useState('All');
    const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'settlements'

    const fetchPaymentData = async () => {
        try {
            setLoading(true);
            // Fetch transactions
            const transactionsRes = await api.get('/gymdb/api/transactions');
            if (transactionsRes.success) {
                setTransactions(transactionsRes.data);
            }
        } catch (err) {
            console.error('Error fetching payment data:', err);
            setError('Failed to load transaction history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (gym?.id) {
            fetchPaymentData();
        }
    }, [gym?.id]);

    const filteredTransactions = transactions.filter(txn => {
        if (filterType === 'All') return true;
        return txn.type === filterType;
    });

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <GymLoader text="Loading transaction history..." />
        </div>
    );

    if (error) return (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl border border-red-100 text-center">
            <i className="fas fa-exclamation-circle text-3xl mb-3"></i>
            <p className="font-bold">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl font-bold"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Split Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest mb-2">Total Balance</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tight">
                            ₹{transactions.reduce((acc, t) => acc + (t.type === 'Credit' ? t.amount : -t.amount), 0).toLocaleString()}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                            <i className="fas fa-wallet text-sm"></i>
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 tracking-widest">Wallet Balance</span>
                    </div>
                </div>

                {/* Contact Admin Card */}
                <div className="md:col-span-2 bg-[#4f46e5] bg-gradient-to-r from-[#4f46e5] to-[#6366f1] p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
                    
                    <div className="relative z-10 w-full sm:w-auto">
                        <h2 className="text-2xl font-black text-white tracking-tight mb-2">Contact Admin</h2>
                        <p className="text-indigo-100 text-sm font-medium">Get in touch with us directly for any queries or support</p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                        <button 
                            onClick={() => window.location.href = 'mailto:admin@gymshood.com'}
                            className="px-6 py-3.5 bg-white text-[#4f46e5] font-black text-[11px] tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                        >
                            <i className="fas fa-paper-plane text-[13px] text-indigo-400"></i>
                            Email Us
                        </button>
                        <button 
                            onClick={() => window.open('https://api.whatsapp.com/send?phone=917023340058', '_blank')} 
                            className="px-6 py-3.5 bg-[#25D366] text-white font-black text-[11px] tracking-widest rounded-xl hover:bg-[#20bd5a] transition-all shadow-lg shadow-[#25D366]/30 flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap"
                        >
                            <i className="fab fa-whatsapp text-[15px]"></i>
                            WhatsApp
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs font-black text-slate-400 tracking-[0.2em]">Transaction Log</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Enrollment Details</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {transactions.length > 0 ? (
                                transactions.map((txn, idx) => (
                                    <tr key={txn.id || idx} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'Credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
 }`}>
                                                    <i className={`fas ${txn.type === 'Credit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-sm`}></i>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm">{txn.reason || 'Enrollment Record'}</p>
                                                    <p className="text-[10px] text-slate-400 font-black tracking-tighter">ID: {txn.razorpayOrderId || txn.id?.substring(0, 12)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-slate-600">
                                                {new Date(txn.createdAt).toLocaleDateString(undefined, {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-black tracking-widest">
                                                {new Date(txn.createdAt).toLocaleTimeString(undefined, {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <p className={`text-lg font-black ${txn.type === 'Credit' ? 'text-emerald-600' : 'text-slate-900'
 }`}>
                                                ₹{txn.amount.toLocaleString()}
                                            </p>
                                            <p className={`text-[10px] font-black tracking-widest ${txn.status === 'Completed' ? 'text-slate-400' : 'text-amber-500'
 }`}>
                                                {txn.status}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                <i className="fas fa-receipt text-2xl"></i>
                                            </div>
                                            <p className="text-slate-400 font-bold">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentHistorySection;
