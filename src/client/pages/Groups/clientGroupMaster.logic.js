import { useState, useEffect, useMemo } from 'react';
import clientRbacService, { getStoredCompanyId } from '../../services/clientRbac.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_CLIENT_GROUP_FORM = {
    group_name: '',
    allow_ip: '',
    status: true
};

export const useClientGroupMasterLogic = ({ onNavigate } = {}) => {
    const { showAlert } = useAlert();

    // Tabs: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [groupNameFilter, setGroupNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'group_name', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 25 });

    // Form state
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState(INITIAL_CLIENT_GROUP_FORM);
    const [formErrors, setFormErrors] = useState({});

    // Delete modal state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, groupId: null, groupName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const companyId = getStoredCompanyId();
            const data = await clientRbacService.getGroups(companyId);
            const list = Array.isArray(data) ? data : (data.groups || data.data || []);
            setGroups(list);
        } catch (err) {
            console.error('Failed to load user groups:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Failed',
                message: err.message || 'Could not fetch user groups.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingGroup(null);
        setFormData(INITIAL_CLIENT_GROUP_FORM);
        setFormErrors({});
        setActiveTab('form');
    };

    const handleEditClick = (group) => {
        setEditingGroup(group);
        setFormData({
            group_name: group.group_name || '',
            allow_ip: group.allow_ip || '',
            status: group.status !== false && group.status !== 0
        });
        setFormErrors({});
        setActiveTab('form');
    };

    const handleCancelForm = () => {
        setEditingGroup(null);
        setFormData(INITIAL_CLIENT_GROUP_FORM);
        setFormErrors({});
        setActiveTab('list');
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.group_name.trim()) {
            errors.group_name = 'Group Name is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitForm = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const companyId = getStoredCompanyId();
            if (editingGroup) {
                await clientRbacService.updateGroup(editingGroup.id, {
                    ...formData,
                    companyId
                });
                showAlert({
                    type: 'success',
                    title: 'Group Updated',
                    message: `User group "${formData.group_name}" updated successfully.`
                });
            } else {
                await clientRbacService.createGroup({
                    ...formData,
                    companyId
                });
                showAlert({
                    type: 'success',
                    title: 'Group Created',
                    message: `User group "${formData.group_name}" created successfully.`
                });
            }

            await fetchGroups();
            handleCancelForm();
        } catch (err) {
            console.error('Failed to save group:', err);
            showAlert({
                type: 'error',
                title: editingGroup ? 'Update Failed' : 'Creation Failed',
                message: err.message || 'Could not save user group.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (group) => {
        setDeleteModal({
            isOpen: true,
            groupId: group.id,
            groupName: group.group_name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.groupId) return;
        setIsDeleting(true);
        try {
            await clientRbacService.deleteGroup(deleteModal.groupId);
            showAlert({
                type: 'success',
                title: 'Group Deleted',
                message: `Group "${deleteModal.groupName}" was deleted successfully.`
            });
            setDeleteModal({ isOpen: false, groupId: null, groupName: '' });
            await fetchGroups();
        } catch (err) {
            console.error('Failed to delete group:', err);
            showAlert({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || 'Could not delete user group.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResetFilters = () => {
        setGroupNameFilter('');
        setStatusFilter('all');
    };

    const filteredGroups = useMemo(() => {
        return groups.filter(group => {
            if (groupNameFilter && !group.group_name?.toLowerCase().includes(groupNameFilter.toLowerCase())) {
                return false;
            }
            if (statusFilter !== 'all') {
                const isActive = group.status !== false && group.status !== 0;
                if (statusFilter === 'active' && !isActive) return false;
                if (statusFilter === 'inactive' && isActive) return false;
            }
            return true;
        }).sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            if (sortDirection === 'asc') return String(valA).localeCompare(String(valB));
            return String(valB).localeCompare(String(valA));
        });
    }, [groups, groupNameFilter, statusFilter, sortKey, sortDirection]);

    const paginatedGroups = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredGroups.slice(start, start + pagination.rowsPerPage);
    }, [filteredGroups, pagination.currentPage, pagination.rowsPerPage]);

    return {
        activeTab,
        setActiveTab,
        groups,
        loading,
        submitting,
        groupNameFilter,
        setGroupNameFilter,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingGroup,
        setEditingGroup,
        formData,
        setFormData,
        formErrors,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchGroups,
        handleCreateClick,
        handleEditClick,
        handleCancelForm,
        handleSubmitForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleResetFilters,
        filteredGroups,
        paginatedGroups
    };
};

export default useClientGroupMasterLogic;

