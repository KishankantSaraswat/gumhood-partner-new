import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import GymLoader from '../../../components/GymLoader';
import { useAlert } from '../../../context/AlertContext';

const CashPaymentSection = () => {
    const { showAlert } = useAlert();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionModal, setShowRejectionModal] = useState(null);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        console.log('\n========== PARTNER DASHBOARD - FETCH PENDING REQUESTS ==========');
        console.log('[CashPaymentSection] Fetching pending cash requests...');

        try {
            console.log('[CashPaymentSection] API Endpoint: /gymdb/gym/pending-requests');
            const data = await api.get('/gymdb/gym/pending-requests');

            console.log('[CashPaymentSection] API Response:', {
                success: data.success,
                count: data.count,
                dataLength: data.data?.length || 0
            });

            if (data.success) {
                console.log('[CashPaymentSection] Setting pending requests:', data.data.length);
                if (data.data.length > 0) {
                    console.log('[CashPaymentSection] Sample request:', {
                        id: data.data[0].id,
                        userId: data.data[0].userId?.id,
                        userName: data.data[0].userId?.name,
                        amount: data.data[0].amount,
                        status: data.data[0].status,
                        planName: data.data[0].metadata?.planId?.name
                    });
                }
                setPendingRequests(data.data);
            } else {
                console.warn('[CashPaymentSection] API returned success: false');
            }
            console.log('========== PARTNER DASHBOARD - FETCH COMPLETE ==========\n');
        } catch (err) {
            console.error('[CashPaymentSection] Error fetching pending requests:', err);
            console.error('[CashPaymentSection] Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            console.log('========== PARTNER DASHBOARD - FETCH FAILED ==========\n');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (walletTransactionId) => {
        console.log('[CashPaymentSection] Approving transaction:', walletTransactionId);
        setProcessing(walletTransactionId);
        try {
            const data = await api.post('/gymdb/plans/approve-cash', {
                walletTransactionId
            });
            console.log('[CashPaymentSection] Approval response:', data);
            if (data.success) {
                // Remove the approved request from the list
                setPendingRequests(prev =>
                    prev.filter(req => req.id !== walletTransactionId)
                );
                showAlert({
                    title: 'Payment Approved',
                    message: 'The cash payment has been successfully recorded and approved.',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error('[CashPaymentSection] Error approving cash payment:', err);
            showAlert({
                title: 'Approval Failed',
                message: err.message || 'We could not approve the cash payment. Please try again.',
                type: 'error'
            });
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!showRejectionModal) return;

        console.log('[CashPaymentSection] Rejecting transaction:', showRejectionModal, 'Reason:', rejectionReason);
        setProcessing(showRejectionModal);
        try {
            const data = await api.post('/gymdb/plans/reject-cash', {
                walletTransactionId: showRejectionModal,
                reason: rejectionReason || 'Payment rejected by gym owner'
            });
            console.log('[CashPaymentSection] Rejection response:', data);
            if (data.success) {
                // Remove the rejected request from the list
                setPendingRequests(prev =>
                    prev.filter(req => req.id !== showRejectionModal)
                );
                setShowRejectionModal(null);
                setRejectionReason('');
                showAlert({
                    title: 'Payment Rejected',
                    message: 'The cash payment has been rejected and the user has been notified.',
                    type: 'success'
                });
            }
        } catch (err) {
            console.error('Error rejecting cash payment:', err);
            showAlert({
                title: 'Rejection Failed',
                message: err.message || 'We could not reject the cash payment. Please try again.',
                type: 'error'
            });
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <GymLoader text="Loading enrollment requests..." />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Enrollment Requests</h2>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">Approve or reject enrollment requests from users</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold text-center sm:text-left self-start sm:self-auto">
                        {pendingRequests.length} Pending
                    </div>
                </div>
            </div>

            {/* Pending Requests List */}
            {pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl sm:rounded-2xl p-8 sm:p-12 border border-slate-100 text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <i className="fas fa-check-circle text-xl sm:text-2xl"></i>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">All caught up!</h3>
                    <p className="text-sm sm:text-base text-slate-500">No pending enrollment requests at the moment.</p>
                </div>
            ) : (
                <div className="space-y-3 sm:space-y-4">
                    {pendingRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-100 hover:shadow-lg transition-all">
                            {/* Mobile Layout: Stacked */}
                            <div className="flex flex-col gap-4">
                                {/* User Info & Amount Row */}
                                <div className="flex items-start justify-between gap-3">
                                    {/* User Info */}
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                                            {request.userId?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 truncate">
                                                {request.userId?.name || 'Unknown User'}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-500 truncate">{request.userId?.email}</p>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <i className="fas fa-calendar-alt"></i>
                                                    <span className="truncate">{formatDate(request.createdAt)}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <i className="fas fa-tag"></i>
                                                    <span className="truncate">{request.metadata?.planId?.name}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amount - Desktop */}
                                    <div className="hidden sm:block text-right flex-shrink-0">
                                        <div className="text-2xl font-bold text-slate-900">
                                            ₹{request.amount}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount - Mobile */}
                                <div className="sm:hidden flex items-center justify-between py-2 border-y border-slate-100">
                                    <span className="text-sm text-slate-500">Amount</span>
                                    <span className="text-xl font-bold text-slate-900">₹{request.amount}</span>
                                </div>

                                {/* Plan Details */}
                                {request.metadata?.planId && (
                                    <div className="pt-3 sm:pt-4 border-t border-slate-100">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div>
                                                <p className="text-slate-500">Plan Type</p>
                                                <p className="font-bold text-slate-900 truncate">{request.metadata.planId.planType}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Validity</p>
                                                <p className="font-bold text-slate-900">{request.metadata.planId.validity} days</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Duration</p>
                                                <p className="font-bold text-slate-900">{request.metadata.planId.duration} hours</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Original Price</p>
                                                <p className="font-bold text-slate-900">₹{request.metadata.planId.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={processing === request.id}
                                        className="flex-1 px-4 py-2.5 sm:py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        {processing === request.id ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check"></i>
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setShowRejectionModal(request.id)}
                                        disabled={processing === request.id}
                                        className="flex-1 px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        <i className="fas fa-times"></i>
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full animate-modal-in">
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Reject Enrollment Request</h3>
                        <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">Please provide a reason for rejecting this enrollment request.</p>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full p-3 border border-slate-200 rounded-xl resize-none h-20 sm:h-24 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                            <button
                                onClick={() => {
                                    setShowRejectionModal(null);
                                    setRejectionReason('');
                                }}
                                className="flex-1 px-4 py-2.5 sm:py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm sm:text-base"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={processing === showRejectionModal}
                                className="flex-1 px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {processing === showRejectionModal ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin mr-2"></i>
                                        Rejecting...
                                    </>
                                ) : (
                                    'Reject Payment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashPaymentSection;
