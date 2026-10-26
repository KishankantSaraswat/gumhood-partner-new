import { useState, useEffect, useMemo, useCallback } from 'react';
import clientMemberService from '../../services/clientMember.service';
import { clientPlansService } from '../Plans/plans.service';
import { getStoredCompanyId } from '../../services/clientRbac.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_CLIENT_MEMBER_FORM = {
    name: '',
    email: '',
    phone: '',
    password: '',
    gender: 'male', // 'male' | 'female' | 'other'
    age: '',
    height: '',
    weight: '',
    planId: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'active'
};

export const useClientMemberLogic = ({ gym, onNavigate } = {}) => {
    const { showAlert } = useAlert();

    // Tabs: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPlan, setFilterPlan] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'name', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 25 });

    // Create / Edit Member Form State
    const [editingMember, setEditingMember] = useState(null);
    const [formData, setFormData] = useState(INITIAL_CLIENT_MEMBER_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // View Details Modal State
    const [viewModal, setViewModal] = useState({ isOpen: false, member: null, details: null, loading: false });

    // Delete Confirmation Modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, memberId: null, memberName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // Resolve gym ID
    const gymId = useMemo(() => {
        if (gym?.id) return gym.id;
        if (gym?._id) return gym._id;
        return getStoredCompanyId();
    }, [gym]);

    // Initial Data Fetch
    const fetchInitialData = useCallback(async () => {
        if (!gymId) return;
        setLoading(true);
        try {
            const [membersRes, plansRes] = await Promise.all([
                clientMemberService.getMembers({ gymId, page: 1, limit: 100 }),
                clientPlansService.getPlans(gymId).catch(() => ({ plans: [] }))
            ]);

            const membersList = Array.isArray(membersRes.members) 
                ? membersRes.members 
                : (Array.isArray(membersRes.data) ? membersRes.data : []);
            
            const plansList = Array.isArray(plansRes.plans) 
                ? plansRes.plans 
                : (Array.isArray(plansRes.data) ? plansRes.data : []);

            setMembers(membersList);
            setPlans(plansList);
        } catch (err) {
            console.error('Failed to load gym members or plans:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Failed',
                message: err.message || 'Could not fetch gym members.'
            });
        } finally {
            setLoading(false);
        }
    }, [gymId, showAlert]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Member Form Actions
    const handleCreateClick = () => {
        setEditingMember(null);
        setFormData(INITIAL_CLIENT_MEMBER_FORM);
        setFormErrors({});
        setShowPassword(false);
        setActiveTab('form');
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        const fitness = member.fitnessProfile || {};
        const plan = member.plan || {};

        setFormData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            password: '',
            gender: fitness.gender || 'male',
            age: fitness.age !== undefined && fitness.age !== null ? String(fitness.age) : '',
            height: fitness.height !== undefined && fitness.height !== null ? String(fitness.height) : '',
            weight: fitness.weight !== undefined && fitness.weight !== null ? String(fitness.weight) : '',
            planId: plan.planId ? String(plan.planId) : '',
            startDate: plan.purchaseDate ? new Date(plan.purchaseDate).toISOString().split('T')[0] : '',
            expiryDate: plan.expiryDate ? new Date(plan.expiryDate).toISOString().split('T')[0] : '',
            status: member.status || 'active'
        });
        setFormErrors({});
        setShowPassword(false);
        setActiveTab('form');
    };

    const handleCancelForm = () => {
        setEditingMember(null);
        setFormData(INITIAL_CLIENT_MEMBER_FORM);
        setFormErrors({});
        setActiveTab('list');
    };

    // Form Validation
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'Member Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (formData.phone.replace(/\D/g, '').length < 10) {
            errors.phone = 'Phone number must have at least 10 digits';
        }
        if (!editingMember && formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (formData.age && (Number(formData.age) < 5 || Number(formData.age) > 120)) {
            errors.age = 'Enter a valid age (5 - 120)';
        }
        if (formData.height && Number(formData.height) < 0) {
            errors.height = 'Height cannot be negative';
        }
        if (formData.weight && Number(formData.weight) < 0) {
            errors.weight = 'Weight cannot be negative';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit Member Form (Create / Update)
    const handleSubmitMemberForm = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) {
            showAlert({
                type: 'warning',
                title: 'Validation Error',
                message: 'Please resolve errors in the form before submitting.'
            });
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                gymId,
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                gender: formData.gender,
                age: formData.age ? Number(formData.age) : undefined,
                height: formData.height ? Number(formData.height) : undefined,
                weight: formData.weight ? Number(formData.weight) : undefined,
                status: formData.status
            };

            if (formData.password) {
                payload.password = formData.password;
            }
            if (formData.planId) {
                payload.planId = Number(formData.planId);
            }
            if (formData.startDate) {
                payload.startDate = formData.startDate;
            }
            if (formData.expiryDate) {
                payload.expiryDate = formData.expiryDate;
            }

            if (editingMember) {
                await clientMemberService.updateMember(editingMember.id, payload);
                showAlert({
                    type: 'success',
                    title: 'Member Updated',
                    message: `Member profile for "${formData.name}" has been successfully updated.`
                });
            } else {
                await clientMemberService.createMember(payload);
                showAlert({
                    type: 'success',
                    title: 'Member Enrolled',
                    message: `New member "${formData.name}" was registered and credentials provisioned.`
                });
            }

            await fetchInitialData();
            handleCancelForm();
        } catch (err) {
            console.error('Failed to save gym member:', err);
            showAlert({
                type: 'error',
                title: editingMember ? 'Update Failed' : 'Creation Failed',
                message: err.response?.data?.message || err.message || 'Error processing member request.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // View Details Modal Handler
    const handleViewMember = async (member) => {
        setViewModal({ isOpen: true, member, details: null, loading: true });
        try {
            const res = await clientMemberService.getMemberById(member.id, gymId);
            setViewModal({ isOpen: true, member, details: res.member || res, loading: false });
        } catch (err) {
            console.warn('Could not load detailed member audit, falling back to row cache:', err);
            setViewModal({ isOpen: true, member, details: member, loading: false });
        }
    };

    const handleCloseViewModal = () => {
        setViewModal({ isOpen: false, member: null, details: null, loading: false });
    };

    // Delete / Deactivate Handler
    const handleDeleteMember = (member) => {
        setDeleteModal({
            isOpen: true,
            memberId: member.id,
            memberName: member.name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.memberId) return;
        setIsDeleting(true);
        try {
            await clientMemberService.deleteMember(deleteModal.memberId, gymId);
            showAlert({
                type: 'success',
                title: 'Member Removed',
                message: `Member "${deleteModal.memberName}" was deactivated and active plans expired.`
            });
            setDeleteModal({ isOpen: false, memberId: null, memberName: '' });
            await fetchInitialData();
        } catch (err) {
            console.error('Failed to deactivate member:', err);
            showAlert({
                type: 'error',
                title: 'Deactivation Failed',
                message: err.response?.data?.message || err.message || 'Could not deactivate member.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Reset Filters
    const handleResetFilters = () => {
        setFilterSearch('');
        setFilterStatus('all');
        setFilterPlan('all');
    };

    // Filtered Members
    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            if (filterStatus !== 'all' && member.status !== filterStatus) return false;
            if (filterPlan !== 'all') {
                const memberPlanId = String(member.plan?.planId || member.plan?.id || '');
                if (memberPlanId !== String(filterPlan)) return false;
            }
            if (filterSearch.trim()) {
                const s = filterSearch.toLowerCase().trim();
                const nameMatches = (member.name || '').toLowerCase().includes(s);
                const emailMatches = (member.email || '').toLowerCase().includes(s);
                const phoneMatches = (member.phone || '').includes(s);
                const planMatches = (member.plan?.planName || '').toLowerCase().includes(s);
                if (!nameMatches && !emailMatches && !phoneMatches && !planMatches) return false;
            }
            return true;
        });
    }, [members, filterStatus, filterPlan, filterSearch]);

    // Sorted Members
    const sortedMembers = useMemo(() => {
        const sorted = [...filteredMembers];
        sorted.sort((a, b) => {
            let valA = a[sortKey];
            let valB = b[sortKey];

            if (sortKey === 'name') {
                valA = (a.name || '').toLowerCase();
                valB = (b.name || '').toLowerCase();
            } else if (sortKey === 'email') {
                valA = (a.email || '').toLowerCase();
                valB = (b.email || '').toLowerCase();
            } else if (sortKey === 'planName') {
                valA = (a.plan?.planName || '').toLowerCase();
                valB = (b.plan?.planName || '').toLowerCase();
            } else if (sortKey === 'remainingDays') {
                valA = a.plan?.remainingDays ?? -1;
                valB = b.plan?.remainingDays ?? -1;
            } else if (sortKey === 'joinedAt') {
                valA = new Date(a.joinedAt || 0).getTime();
                valB = new Date(b.joinedAt || 0).getTime();
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [filteredMembers, sortKey, sortDirection]);

    // Paginated Members
    const paginatedMembers = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedMembers.slice(start, start + pagination.rowsPerPage);
    }, [sortedMembers, pagination.currentPage, pagination.rowsPerPage]);

    // KPI Counters
    const kpiStats = useMemo(() => {
        const total = members.length;
        const activeCount = members.filter(m => m.status === 'active').length;
        const inactiveCount = members.filter(m => m.status === 'inactive').length;
        const withPlanCount = members.filter(m => m.plan && !m.plan.isExpired).length;
        return { total, activeCount, inactiveCount, withPlanCount };
    }, [members]);

    return {
        activeTab,
        setActiveTab,
        members,
        plans,
        loading,
        submitting,
        filterSearch,
        setFilterSearch,
        filterStatus,
        setFilterStatus,
        filterPlan,
        setFilterPlan,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingMember,
        setEditingMember,
        formData,
        setFormData,
        formErrors,
        showPassword,
        setShowPassword,
        viewModal,
        handleViewMember,
        handleCloseViewModal,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchInitialData,
        handleCreateClick,
        handleEditClick,
        handleCancelForm,
        handleSubmitMemberForm,
        handleDeleteMember,
        handleConfirmDelete,
        handleResetFilters,
        filteredMembers,
        paginatedMembers,
        kpiStats
    };
};

export default useClientMemberLogic;
