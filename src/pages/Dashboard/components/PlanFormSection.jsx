import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAlert } from '../../../context/AlertContext';

import GymLoader from '../../../components/GymLoader';

const PlanFormModal = ({ gym, planId, onClose, onSuccess }) => {
    const { showAlert } = useAlert();
    const isEditMode = !!planId;
    const [loading, setLoading] = useState(isEditMode);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        validity: '', // days
        price: '',
        discountPercent: '0',
        description: '',
        planType: 'monthly',
        duration: '1.5', // hours
        features: ''
    });

    useEffect(() => {
        const fetchPlanData = async () => {
            if (!isEditMode || !gym?.id) return;

            try {
                const plansRes = await api.get(`/gymdb/plans/gym/${gym.id}`);
                if (plansRes.success) {
                    const plan = plansRes.plans.find(p => p.id === planId);
                    if (plan) {
                        setFormData({
                            name: plan.name,
                            validity: plan.validity.toString(),
                            price: plan.price.toString(),
                            discountPercent: plan.discountPercent.toString(),
                            description: plan.description || '',
                            planType: plan.planType,
                            duration: plan.duration.toString(),
                            features: Array.isArray(plan.features) ? plan.features.join(', ') : (plan.features || '')
                        });
                    } else {
                        console.error('Plan not found in gym plans');
                    }
                }
            } catch (err) {
                console.error('Error fetching plan data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlanData();
    }, [planId, gym?.id, isEditMode]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFeaturesChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, features: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...formData,
                validity: Number(formData.validity),
                price: Number(formData.price),
                discountPercent: Number(formData.discountPercent),
                duration: Number(formData.duration),
                features: formData.features
            };

            let data;
            if (isEditMode) {
                data = await api.put(`/gymdb/plans/${planId}`, payload);
            } else {
                data = await api.post(`/gymdb/${gym.id}/plans`, payload);
            }

            if (data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            console.error('Error saving plan:', err);
            showAlert({
                title: 'Save Failed',
                message: err.message || 'We could not save your plan. Please check the details and try again.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
                <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 flex items-center justify-center">
                    <GymLoader text="Loading plan details..." />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{isEditMode ? 'Edit Plan' : 'Create Plan'}</h2>
                        <p className="text-slate-500 text-sm font-medium">
                            {isEditMode ? 'Modify existing membership details' : 'Configure a new membership package'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Decorative Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 transform translate-x-1/3 -translate-y-1/3">
                        <i className="fas fa-dumbbell text-[10rem] text-white"></i>
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                            <i className={`fas ${isEditMode ? 'fa-edit' : 'fa-magic'} text-xl text-white`}></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white mb-1">Plan Configuration</h3>
                            <p className="text-indigo-100 text-sm">
                                Set up the pricing, duration, and features for this membership tier.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">

                        {/* Basic Info Section */}
                        <div className="col-span-1 md:col-span-2 pb-2 border-b border-slate-50 mb-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-info-circle"></i> Basic Information
                            </h4>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Plan Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-tag text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <input
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="e.g. Gold Membership"
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Plan Type</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-layer-group text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <select
                                    name="planType"
                                    value={formData.planType}
                                    onChange={handleInputChange}
                                    className="block w-full pl-9 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer text-sm"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <i className="fas fa-chevron-down text-slate-400 text-xs"></i>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="col-span-1 md:col-span-2 mt-2 pb-2 border-b border-slate-50 mb-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-coins"></i> Pricing & Terms
                            </h4>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Price (₹)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-rupee-sign text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <input
                                    required
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Discount (%)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-percent text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <input
                                    type="number"
                                    name="discountPercent"
                                    value={formData.discountPercent}
                                    onChange={handleInputChange}
                                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Validity (Days)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-calendar-check text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <input
                                    required
                                    type="number"
                                    name="validity"
                                    value={formData.validity}
                                    onChange={handleInputChange}
                                    className={`block w-full pl-9 pr-3 py-3 border rounded-xl font-bold transition-all text-sm ${isEditMode
                                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500'
                                        }`}
                                    placeholder="30"
                                    disabled={isEditMode}
                                />
                            </div>
                            {isEditMode && (
                                <p className="text-xs text-amber-500 mt-1 font-bold ml-1 flex items-center gap-1 animate-pulse">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    Validity cannot be changed once created
                                </p>
                            )}
                        </div>

                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Daily Duration (Hrs)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i className="fas fa-stopwatch text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <input
                                    required
                                    type="number"
                                    step="0.5"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                                    placeholder="1.5"
                                />
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="col-span-1 md:col-span-2 mt-2 pb-2 border-b border-slate-50 mb-2">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-list-check"></i> Plan Features
                            </h4>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Included Benefits (Comma separated)</label>
                            <div className="relative group">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <i className="fas fa-check-double text-slate-400 group-focus-within:text-indigo-500 transition-colors text-sm"></i>
                                </div>
                                <textarea
                                    value={formData.features}
                                    onChange={handleFeaturesChange}
                                    className="block w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[100px] resize-y leading-relaxed text-sm"
                                    placeholder="e.g. Cardio Access, Free Weights, Sauna, Personal Locker, Weekend Access"
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 ml-1">Separate each feature with a comma to create a bulleted list.</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] bg-indigo-600 text-white py-3 rounded-xl font-black tracking-wider hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                        >
                            {submitting ? (
                                <i className="fas fa-spinner animate-spin"></i>
                            ) : (
                                <i className="fas fa-save"></i>
                            )}
                            {isEditMode ? 'SAVE CHANGES' : 'CREATE PLAN'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlanFormModal;
