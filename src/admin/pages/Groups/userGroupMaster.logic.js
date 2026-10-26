import { useState, useEffect, useMemo } from 'react';
import rbacService from '../../services/rbac.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_FORM = {
    group_name: '',
    allow_ip: '',
    status: true
};

export const useUserGroupMasterLogic = () => {
    const { showAlert } = useAlert();

    // Tabs: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters matching Runwaybites (Group Name, Status)
    const [groupNameFilter, setGroupNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'group_name', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 100 });

    // Editing State
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});

    // Delete Confirmation
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, groupId: null, groupName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const data = await rbacService.getGroups();
            const list = Array.isArray(data) ? data : (data.groups || data.data || []);
            setGroups(list);
        } catch (err) {
            console.error('Failed to fetch user groups:', err);
            showAlert({
                type: 'error',
                title: 'Error loading user groups',
                message: err.message || 'Could not load group records from backend.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setEditingGroup(null);
        setFormData(INITIAL_FORM);
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

    const validateForm = () => {
        const errors = {};
        if (!formData.group_name.trim()) {
            errors.group_name = 'User group name is required.';
        } else if (formData.group_name.trim().length < 2) {
            errors.group_name = 'Group name must be at least 2 characters.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitForm = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                group_name: formData.group_name.trim(),
                allow_ip: formData.allow_ip.trim() || null,
                status: formData.status
            };

            if (editingGroup) {
                await rbacService.updateGroup(editingGroup.id, payload);
                showAlert({
                    type: 'success',
                    title: 'Group Updated',
                    message: `User group "${payload.group_name}" updated successfully.`
                });
            } else {
                await rbacService.createGroup(payload);
                showAlert({
                    type: 'success',
                    title: 'Group Created',
                    message: `User group "${payload.group_name}" created successfully.`
                });
            }

            await fetchGroups();
            setActiveTab('list');
        } catch (err) {
            console.error('Error saving user group:', err);
            showAlert({
                type: 'error',
                title: 'Failed to Save Group',
                message: err.message || 'Could not save user group details.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (group) => {
        if (group.group_name?.toLowerCase() === 'master' || group.id === 1) {
            showAlert({
                type: 'warning',
                title: 'Action Prohibited',
                message: 'The Master administrative group is protected and cannot be deleted.'
            });
            return;
        }

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
            await rbacService.deleteGroup(deleteModal.groupId);
            showAlert({
                type: 'success',
                title: 'Group Deleted',
                message: `User group "${deleteModal.groupName}" removed successfully.`
            });
            setDeleteModal({ isOpen: false, groupId: null, groupName: '' });
            await fetchGroups();
        } catch (err) {
            console.error('Failed to delete group:', err);
            showAlert({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || 'Could not delete the specified user group.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResetFilters = () => {
        setGroupNameFilter('');
        setStatusFilter('all');
        pagination.resetPagination();
    };

    // Filtered group list
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const matchesName = !groupNameFilter.trim() || 
                (g.group_name || '').toLowerCase().includes(groupNameFilter.toLowerCase());
            
            const isGroupActive = g.status !== false && g.status !== 0;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && isGroupActive) ||
                (statusFilter === 'inactive' && !isGroupActive);

            return matchesName && matchesStatus;
        });
    }, [groups, groupNameFilter, statusFilter]);

    // Sorted groups
    const sortedGroups = useMemo(() => {
        if (!sortKey) return filteredGroups;
        return [...filteredGroups].sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredGroups, sortKey, sortDirection]);

    // Paginated slice
    const paginatedGroups = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedGroups.slice(start, start + pagination.rowsPerPage);
    }, [sortedGroups, pagination.currentPage, pagination.rowsPerPage]);

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
        handleSubmitForm,
        handleDeleteClick,
        handleConfirmDelete,
        handleResetFilters,
        filteredGroups,
        paginatedGroups
    };
};

