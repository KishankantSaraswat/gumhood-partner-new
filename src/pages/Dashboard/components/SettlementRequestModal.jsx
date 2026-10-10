import React, { useState } from 'react';
import api from '../../../utils/api';

const SettlementRequestModal = ({ gym, balance, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [bankDetails, setBankDetails] = useState({
        upiId: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleBankChange = (e) => {
        const { name, value } = e.target;
        setBankDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const requestAmount = parseFloat(amount);
        if (isNaN(requestAmount) || requestAmount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (requestAmount > balance) {
            setError('Amount exceeds your current balance');
            return;
        }

        if (!bankDetails.upiId && !bankDetails.accountNumber) {
            setError('Please provide at least a UPI ID or Account details');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/payment/request-settlement', {
                gymId: gym.id,
                amount: requestAmount,
                bankDetails
            });

            if (response.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Settlement request error:', err);
            setError(err.message || 'Failed to submit settlement request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h2 className="text-xl font-black text-slate-900">Request Settlement</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                        <p className="text-3xl font-black text-indigo-600">₹{balance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Amount to Withdraw</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-4 pl-10 pr-4 text-slate-900 font-bold outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-black text-slate-900 mb-4">Bank / UPI Details</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UPI ID</label>
                                    <input
                                        type="text"
                                        name="upiId"
                                        value={bankDetails.upiId}
                                        onChange={handleBankChange}
                                        placeholder="e.g. gymname@upi"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                                        <input
                                            type="text"
                                            name="accountNumber"
                                            value={bankDetails.accountNumber}
                                            onChange={handleBankChange}
                                            placeholder="Account No."
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                                        <input
                                            type="text"
                                            name="ifscCode"
                                            value={bankDetails.ifscCode}
                                            onChange={handleBankChange}
                                            placeholder="IFSC"
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Holder Name</label>
                                    <input
                                        type="text"
                                        name="accountHolderName"
                                        value={bankDetails.accountHolderName}
                                        onChange={handleBankChange}
                                        placeholder="Full Name"
                                        className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-xl py-3 px-4 text-sm font-bold outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}

                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-[10px] text-amber-700 leading-relaxed">
                        Note: Settlement requests are usually processed within 2-3 business days.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SettlementRequestModal;
