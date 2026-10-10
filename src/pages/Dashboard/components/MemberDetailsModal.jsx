import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';

const MemberDetailsModal = ({ planId, onClose }) => {
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!planId) return;
            setLoading(true);
            try {
                const response = await api.get(`/gymdb/dashboard/member/details/${planId}`);
                if (response.success) {
                    setMember(response.member);
                } else {
                    setError(response.message || "Failed to fetch details");
                }
            } catch (err) {
                console.error("Error fetching member details:", err);
                const msg = err.response?.data?.message || err.message || "Error loading details";
                setError(msg);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [planId]);

    if (!planId) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-scale-in">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-10"
                >
                    <i className="fas fa-times"></i>
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        <p className="text-slate-500 text-sm font-medium">Loading details...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-64 text-red-500">
                        <i className="fas fa-exclamation-circle text-2xl mb-2"></i>
                        <p>{error}</p>
                    </div>
                ) : member && (
                    <div className="flex flex-col h-full overflow-y-auto">
                        {/* Header Profile Section */}
                        <div className="bg-slate-50 p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-black border-4 border-white shadow-sm overflow-hidden">
                                {member.photo ? (
                                    <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    member.name?.[0]?.toUpperCase()
                                )}
                            </div>
                            <div className="text-center sm:text-left">
                                <h2 className="text-2xl font-black text-slate-900">{member.name}</h2>
                                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                                        <i className="fas fa-envelope text-indigo-500"></i> {member.email}
                                    </span>
                                    {!member.isExpired ? (
                                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                                            <i className="fas fa-check-circle"></i> Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full font-bold">
                                            <i className="fas fa-times-circle"></i> Expired
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Plan Info */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Plan Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Plan Name</span>
                                        <span className="text-sm font-bold text-slate-900">{member.planName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Amount Deducted</span>
                                        <span className="text-sm font-bold text-slate-900">₹{member.amountDeducted}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Dates</span>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-900">{new Date(member.purchaseDate).toLocaleDateString()}</div>
                                            <div className="text-xs text-slate-400">to {new Date(member.expiryDate).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Info */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Usage & Activity</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Workout Duration</span>
                                        <span className="text-sm font-bold text-slate-900">{member.workoutDurationHours} hrs</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Used Days</span>
                                        <span className="text-sm font-bold text-slate-900">{member.usedDays} days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-slate-500">Remaining</span>
                                        <span className="text-sm font-bold text-indigo-600">{member.remainingDays} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Refund History - Full Width */}
                        <div className="px-6 pb-6">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Refund History</h3>
                                {member.refundHistory && member.refundHistory.length > 0 ? (
                                    <div className="space-y-2">
                                        {member.refundHistory.map((refund, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">₹{refund.amount} refunded</div>
                                                    <div className="text-xs text-slate-500">{refund.reason || 'No reason provided'}</div>
                                                </div>
                                                <div className="text-xs font-medium text-slate-400">
                                                    {new Date(refund.date).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic text-center py-2">No refund history found</p>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDetailsModal;
