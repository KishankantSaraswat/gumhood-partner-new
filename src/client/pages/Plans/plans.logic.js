import { useState, useEffect, useMemo, useCallback } from 'react';
import { clientPlansService } from './plans.service';
import { useAlert } from '@/context/AlertContext';
import { usePagination, useSorting } from '@/common';

export const POPULAR_FEATURES = [
    'Gym Access',
    'Locker Room',
    'Cardio Zone',
    'Steam / Sauna',
    'Free WiFi',
    'Personal Trainer',
    'Diet & Nutrition Plan',
    'Shower Facility',
    'Crossfit Arena',
    'Towel Service',
    'Weekend Access',
    'Guest Passes'
];

export const INITIAL_PLAN_FORM = {
    name: '',
    planType: 'monthly',
    price: '',
    discountPercent: '0',
    validity: '30',
    duration: '1.5',
    description: '',
    features: 'Gym Access, Locker Room, Cardio Zone',
    featuresList: ['Gym Access', 'Locker Room', 'Cardio Zone'],
    isActive: true
};

export const useClientPlanMasterLogic = ({ gym, onNavigate } = {}) => {
    const { showAlert } = useAlert();

    // Active Gym ID resolution
    const resolvedGymId = useMemo(() => {
        return gym?.id || gym?._id || gym?.gymId || localStorage.getItem('active_gym_id') || 2;
    }, [gym]);

    // Active Navigation Tabs: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterSearch, setFilterSearch] = useState('');
    const [filterPlanType, setFilterPlanType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ 
        initialSortKey: 'name', 
        initialSortDirection: 'asc' 
    });
    const pagination = usePagination({ initialRowsPerPage: 15 });

    // Create / Edit State
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState(INITIAL_PLAN_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [customBenefitInput, setCustomBenefitInput] = useState('');

    // Delete / Deactivate Modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, planId: null, planName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Gym Plans
    const fetchPlans = useCallback(async () => {
        if (!resolvedGymId) return;
        setLoading(true);
        try {
            const res = await clientPlansService.getPlans(resolvedGymId);
            if (res.success) {
                setPlans(res.plans);
            } else {
                setPlans([]);
            }
        } catch (err) {
            console.error('Error fetching plans in logic:', err);
            showAlert({
                type: 'error',
                title: 'Failed to Load Plans',
                message: err.message || 'Could not retrieve membership plans for this facility.'
            });
        } finally {
            setLoading(false);
        }
    }, [resolvedGymId, showAlert]);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // Initiate Create Form
    const handleCreateClick = () => {
        setEditingPlan(null);
        setFormData(INITIAL_PLAN_FORM);
        setFormErrors({});
        setCustomBenefitInput('');
        setActiveTab('form');
    };

    // Initiate Edit Form
    const handleEditClick = (plan) => {
        setEditingPlan(plan);
        const rawFeatures = Array.isArray(plan.features) 
            ? plan.features.join(', ') 
            : (plan.features || '');
        const featuresArray = rawFeatures
            .split(',')
            .map(f => f.trim())
            .filter(Boolean);

        setFormData({
            name: plan.name || '',
            planType: plan.planType || 'monthly',
            price: plan.price !== undefined ? String(plan.price) : '',
            discountPercent: plan.discountPercent !== undefined ? String(plan.discountPercent) : '0',
            validity: plan.validity !== undefined ? String(plan.validity) : '30',
            duration: plan.duration !== undefined ? String(plan.duration) : '1.5',
            description: plan.description || '',
            features: rawFeatures,
            featuresList: featuresArray,
            isActive: plan.isActive !== false
        });
        setFormErrors({});
        setCustomBenefitInput('');
        setActiveTab('form');
    };

    // Cancel Form
    const handleCancelForm = () => {
        setEditingPlan(null);
        setFormData(INITIAL_PLAN_FORM);
        setFormErrors({});
        setCustomBenefitInput('');
        setActiveTab('list');
    };

    // Feature tags handling
    const handleToggleFeature = (feature) => {
        setFormData(prev => {
            const exists = prev.featuresList.includes(feature);
            const nextList = exists 
                ? prev.featuresList.filter(f => f !== feature)
                : [...prev.featuresList, feature];
            return {
                ...prev,
                featuresList: nextList,
                features: nextList.join(', ')
            };
        });
    };

    const handleAddCustomBenefit = () => {
        const trimmed = customBenefitInput.trim();
        if (!trimmed) return;
        setFormData(prev => {
            if (prev.featuresList.includes(trimmed)) return prev;
            const nextList = [...prev.featuresList, trimmed];
            return {
                ...prev,
                featuresList: nextList,
                features: nextList.join(', ')
            };
        });
        setCustomBenefitInput('');
    };

    const handleRemoveFeature = (featureToRemove) => {
        setFormData(prev => {
            const nextList = prev.featuresList.filter(f => f !== featureToRemove);
            return {
                ...prev,
                featuresList: nextList,
                features: nextList.join(', ')
            };
        });
    };

    // Form Validation
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Plan Name is required';
        }
        if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            errors.price = 'Please enter a valid price greater than 0';
        }
        if (!formData.validity || isNaN(Number(formData.validity)) || Number(formData.validity) <= 0) {
            errors.validity = 'Validity period (in days) is required';
        }
        if (!formData.duration || isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
            errors.duration = 'Daily duration (in hours) is required';
        }
        const disc = Number(formData.discountPercent);
        if (isNaN(disc) || disc < 0 || disc > 100) {
            errors.discountPercent = 'Discount must be between 0% and 100%';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form Submit
    const handleSubmitPlanForm = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                planType: formData.planType,
                price: Number(formData.price),
                discountPercent: Number(formData.discountPercent || 0),
                validity: Number(formData.validity),
                duration: Number(formData.duration),
                description: formData.description.trim(),
                features: formData.featuresList.join(', '),
                isActive: formData.isActive
            };

            if (editingPlan) {
                const planId = editingPlan.id || editingPlan._id;
                await clientPlansService.updatePlan(planId, payload);
                showAlert({
                    type: 'success',
                    title: 'Plan Updated',
                    message: `Membership plan "${payload.name}" updated successfully.`
                });
            } else {
                await clientPlansService.createPlan(resolvedGymId, payload);
                showAlert({
                    type: 'success',
                    title: 'Plan Created',
                    message: `New membership plan "${payload.name}" created successfully.`
                });
            }

            handleCancelForm();
            await fetchPlans();
        } catch (err) {
            console.error('Error saving plan:', err);
            showAlert({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'We could not save this membership plan. Please check the details and try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete / Deactivate Plan
    const handleDeleteClick = (plan) => {
        setDeleteModal({
            isOpen: true,
            planId: plan.id || plan._id,
            planName: plan.name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.planId) return;
        setIsDeleting(true);
        try {
            await clientPlansService.deactivatePlan(deleteModal.planId);
            showAlert({
                type: 'success',
                title: 'Plan Deactivated',
                message: `Membership plan "${deleteModal.planName}" is now inactive.`
            });
            setDeleteModal({ isOpen: false, planId: null, planName: '' });
            await fetchPlans();
        } catch (err) {
            console.error('Error deactivating plan:', err);
            showAlert({
                type: 'error',
                title: 'Action Failed',
                message: err.message || 'Could not deactivate the selected plan.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (plan) => {
        try {
            const planId = plan.id || plan._id;
            const newStatus = plan.isActive === false;
            await clientPlansService.updatePlan(planId, {
                ...plan,
                isActive: newStatus
            });
            showAlert({
                type: 'success',
                title: newStatus ? 'Plan Activated' : 'Plan Deactivated',
                message: `Plan "${plan.name}" is now ${newStatus ? 'active' : 'inactive'}.`
            });
            await fetchPlans();
        } catch (err) {
            console.error('Error toggling status:', err);
            showAlert({
                type: 'error',
                title: 'Status Update Failed',
                message: err.message || 'Could not update plan status.'
            });
        }
    };

    const handleResetFilters = () => {
        setFilterSearch('');
        setFilterPlanType('all');
        setFilterStatus('all');
    };

    // Filtered Plans
    const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            const q = filterSearch.toLowerCase().trim();
            const matchesSearch = !q || 
                (plan.name && plan.name.toLowerCase().includes(q)) ||
                (plan.description && plan.description.toLowerCase().includes(q)) ||
                (plan.features && plan.features.toLowerCase().includes(q));

            const matchesType = filterPlanType === 'all' || 
                (plan.planType && plan.planType.toLowerCase() === filterPlanType.toLowerCase());

            const isActive = plan.isActive !== false;
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && isActive) ||
                (filterStatus === 'inactive' && !isActive);

            return matchesSearch && matchesType && matchesStatus;
        });
    }, [plans, filterSearch, filterPlanType, filterStatus]);

    // Sorted Plans
    const sortedPlans = useMemo(() => {
        if (!sortKey) return filteredPlans;
        return [...filteredPlans].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];

            if (sortKey === 'price' || sortKey === 'validity' || sortKey === 'duration') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const strA = String(aVal || '').toLowerCase();
            const strB = String(bVal || '').toLowerCase();
            return sortDirection === 'asc' 
                ? strA.localeCompare(strB) 
                : strB.localeCompare(strA);
        });
    }, [filteredPlans, sortKey, sortDirection]);

    // Paginated Plans
    const paginatedPlans = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedPlans.slice(start, start + pagination.rowsPerPage);
    }, [sortedPlans, pagination.currentPage, pagination.rowsPerPage]);

    // Computed Net Price for current Form
    const computedNetPrice = useMemo(() => {
        const p = Number(formData.price) || 0;
        const d = Number(formData.discountPercent) || 0;
        if (p <= 0) return 0;
        return Math.max(0, p - (p * d) / 100);
    }, [formData.price, formData.discountPercent]);

    return {
        resolvedGymId,
        activeTab,
        setActiveTab,
        plans,
        loading,
        submitting,
        filterSearch,
        setFilterSearch,
        filterPlanType,
        setFilterPlanType,
        filterStatus,
        setFilterStatus,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingPlan,
        formData,
        setFormData,
        formErrors,
        setFormErrors,
        customBenefitInput,
        setCustomBenefitInput,
        computedNetPrice,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchPlans,
        handleCreateClick,
        handleEditClick,
        handleCancelForm,
        handleToggleFeature,
        handleAddCustomBenefit,
        handleRemoveFeature,
        handleSubmitPlanForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleToggleStatus,
        handleResetFilters,
        filteredPlans,
        paginatedPlans
    };
};

export default useClientPlanMasterLogic;

