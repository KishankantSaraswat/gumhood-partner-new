import { useState, useEffect, useMemo } from 'react';
import rbacService from '../../services/rbac.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_USER_FORM = {
    name: '',
    email: '',
    phone: '',
    phone_code: '+91',
    login_id: '',
    password: '',
    group_id: '',
    manager_id: '',
    is_master: false,
    status: true,
    enable_notifications: false
};

export const useUserMasterLogic = () => {
    const { showAlert } = useAlert();

    // Tabs: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filters
    const [filterUsername, setFilterUsername] = useState('');
    const [filterLoginId, setFilterLoginId] = useState('');
    const [filterPhone, setFilterPhone] = useState('');
    const [filterGroup, setFilterGroup] = useState('all');
    const [filterManager, setFilterManager] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'name', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 50 });

    // Create / Edit User Form State
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(INITIAL_USER_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    // Delete Confirmation Modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, userId: null, userName: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [usersData, groupsData] = await Promise.all([
                rbacService.getUsers(),
                rbacService.getGroups()
            ]);

            const usersList = Array.isArray(usersData) ? usersData : (usersData.users || usersData.data || []);
            const groupsList = Array.isArray(groupsData) ? groupsData : (groupsData.groups || groupsData.data || []);

            setUsers(usersList);
            setGroups(groupsList);
        } catch (err) {
            console.error('Failed to load users or groups:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Failed',
                message: err.message || 'Could not fetch users or user groups.'
            });
        } finally {
            setLoading(false);
        }
    };

    // User Form actions
    const handleCreateClick = () => {
        setEditingUser(null);
        setFormData({
            ...INITIAL_USER_FORM,
            group_id: groups.length > 0 ? String(groups[0].id) : ''
        });
        setFormErrors({});
        setShowPassword(false);
        setActiveTab('form');
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            phone_code: user.phone_code || '+91',
            login_id: user.login_id || user.username || user.email?.split('@')[0] || user.name || '',
            password: '',
            group_id: user.group_id ? String(user.group_id) : '',
            manager_id: user.manager_id ? String(user.manager_id) : '',
            is_master: Boolean(user.is_master || user.group?.group_name === 'Master'),
            status: user.status !== false && user.status !== 0,
            enable_notifications: Boolean(user.enable_notifications)
        });
        setFormErrors({});
        setShowPassword(false);
        setActiveTab('form');
    };

    const validateUserForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = 'User name is required.';
        if (!formData.email.trim()) {
            errors.email = 'Email address is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address.';
        }

        if (!formData.login_id.trim()) {
            errors.login_id = 'Login ID is required.';
        }

        if (!editingUser && !formData.password) {
            errors.password = 'Password is required.';
        } else if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
        }

        if (!formData.group_id) {
            errors.group_id = 'User Group is required.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmitUserForm = async (e) => {
        if (e) e.preventDefault();
        if (!validateUserForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                group_id: Number(formData.group_id),
                manager_id: formData.manager_id ? Number(formData.manager_id) : null,
                is_master: Boolean(formData.is_master),
                status: Boolean(formData.status),
                login_id: formData.login_id.trim(),
                enable_notifications: Boolean(formData.enable_notifications)
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (editingUser) {
                await rbacService.updateUser(editingUser.id, payload);
                showAlert({
                    type: 'success',
                    title: 'User Updated',
                    message: `User "${payload.name}" updated successfully.`
                });
            } else {
                await rbacService.createUser(payload);
                showAlert({
                    type: 'success',
                    title: 'User Created',
                    message: `User "${payload.name}" created successfully.`
                });
            }

            await fetchInitialData();
            setActiveTab('list');
        } catch (err) {
            console.error('Error saving user:', err);
            showAlert({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Could not save user information.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteUser = (user) => {
        setDeleteModal({
            isOpen: true,
            userId: user.id,
            userName: user.name || user.email
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.userId) return;
        setIsDeleting(true);
        try {
            await rbacService.deleteUser(deleteModal.userId);
            showAlert({
                type: 'success',
                title: 'User Deleted',
                message: `User "${deleteModal.userName}" removed successfully.`
            });
            setDeleteModal({ isOpen: false, userId: null, userName: '' });
            await fetchInitialData();
        } catch (err) {
            console.error('Failed to delete user:', err);
            showAlert({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || 'Could not delete the selected user.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResetFilters = () => {
        setFilterUsername('');
        setFilterLoginId('');
        setFilterPhone('');
        setFilterGroup('all');
        setFilterManager('all');
        setFilterStatus('all');
        pagination.resetPagination();
    };

    // Filtered Users List
    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesUsername = !filterUsername.trim() || 
                (u.name || '').toLowerCase().includes(filterUsername.toLowerCase());
            
            const userLoginId = u.login_id || u.username || u.email?.split('@')[0] || u.name || '';
            const matchesLoginId = !filterLoginId.trim() || 
                userLoginId.toLowerCase().includes(filterLoginId.toLowerCase());

            const matchesPhone = !filterPhone.trim() || 
                (u.phone || '').toLowerCase().includes(filterPhone.toLowerCase());

            const matchesGroup = filterGroup === 'all' || String(u.group_id) === String(filterGroup);

            const matchesManager = filterManager === 'all' || String(u.manager_id) === String(filterManager);

            const isActive = u.status !== false && u.status !== 0;
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'active' && isActive) || 
                (filterStatus === 'inactive' && !isActive);

            return matchesUsername && matchesLoginId && matchesPhone && matchesGroup && matchesManager && matchesStatus;
        });
    }, [users, filterUsername, filterLoginId, filterPhone, filterGroup, filterManager, filterStatus]);

    // Sorted Users
    const sortedUsers = useMemo(() => {
        if (!sortKey) return filteredUsers;
        return [...filteredUsers].sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortKey, sortDirection]);

    // Paginated slice
    const paginatedUsers = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedUsers.slice(start, start + pagination.rowsPerPage);
    }, [sortedUsers, pagination.currentPage, pagination.rowsPerPage]);

    return {
        activeTab,
        setActiveTab,
        users,
        groups,
        loading,
        submitting,
        filterUsername,
        setFilterUsername,
        filterLoginId,
        setFilterLoginId,
        filterPhone,
        setFilterPhone,
        filterGroup,
        setFilterGroup,
        filterManager,
        setFilterManager,
        filterStatus,
        setFilterStatus,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingUser,
        setEditingUser,
        formData,
        setFormData,
        formErrors,
        showPassword,
        setShowPassword,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchInitialData,
        handleCreateClick,
        handleEditClick,
        handleSubmitUserForm,
        handleDeleteUser,
        handleConfirmDelete,
        handleResetFilters,
        filteredUsers,
        paginatedUsers
    };
};

