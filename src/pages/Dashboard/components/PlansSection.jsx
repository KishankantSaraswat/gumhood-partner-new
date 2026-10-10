import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAlert } from '../../../context/AlertContext';


const PlansSection = ({ gym, onCreatePlan, onEditPlan }) => {
    const { showAlert } = useAlert();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        if (!gym?.id) return;
        try {
            const data = await api.get(`/gymdb/plans/gym/${gym.id}`);
            if (data.success) {
                setPlans(data.plans);
            }
        } catch (err) {
            console.error('Error fetching plans:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, [gym?.id]);

    const handleDelete = async (planId) => {
        if (!window.confirm('Are you sure you want to deactivate this plan? Users will no longer be able to purchase it.')) return;

        try {
            const data = await api.put(`/gymdb/plans/${planId}`, { isActive: false });
            if (data.success) {
                fetchPlans();
            }
        } catch (err) {
            console.error('Error deleting plan:', err);
            showAlert({
                title: 'Deactivation Failed',
                message: err.message || 'We could not deactivate this plan. Please try again.',
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-900">Membership Plans</h2>
                <button
                    onClick={onCreatePlan}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95"
                >
                    <i className="fas fa-plus"></i>
                    Add New Plan
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!Array.isArray(plans) || plans.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-tags text-slate-300 text-2xl"></i>
                        </div>
                        <p className="text-slate-400 font-bold">No active plans found</p>
                        <button
                            onClick={onCreatePlan}
                            className="mt-4 text-indigo-600 font-bold hover:underline"
                        >
                            Create your first plan
                        </button>
                    </div>
                ) : (
                    plans.map((plan) => (
                        <div key={plan.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all border-b-4 border-b-indigo-500">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                                        {plan.planType}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">₹{plan.price || 0}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{plan.validity || 0} Days</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                {(Array.isArray(plan.features) ? plan.features : (plan.features?.split(',') || [])).map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center flex-shrink-0">
                                            <i className="fas fa-check text-[10px]"></i>
                                        </div>
                                        {feature}
                                    </div>
                                ))}
                                <div className="flex items-center gap-3 text-sm text-slate-600 font-medium pt-2 border-t border-slate-50">
                                    <i className="fas fa-clock text-indigo-400 w-5"></i>
                                    {plan.duration || 0} Hours duration
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => onEditPlan(plan.id)}
                                    className="flex-1 bg-slate-50 text-slate-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlansSection;
