import { useState, useEffect, useMemo } from 'react';
import clientRbacService, { getStoredCompanyId } from '../../services/clientRbac.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_CLIENT_USER_FORM = {
    name: '',
    email: '',
    phone: '',
    phone_code: '+91',
    login_id: '',
    password: '',
    groupId: '',
    managerId: '',
    isCompanyOwner: false,
    status: true
};

export const useClientUserMasterLogic = ({ onNavigate } = {}) => {
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
    const pagination = usePagination({ initialRowsPerPage: 25 });

    // Create / Edit User Form State
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(INITIAL_CLIENT_USER_FORM);
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
            const companyId = getStoredCompanyId();
            const [usersData, groupsData] = await Promise.all([
                clientRbacService.getUsers(companyId),
                clientRbacService.getGroups(companyId)
            ]);

            const usersList = Array.isArray(usersData) ? usersData : (usersData.users || usersData.data || []);
            const groupsList = Array.isArray(groupsData) ? groupsData : (groupsData.groups || groupsData.data || []);

            setUsers(usersList);
            setGroups(groupsList);
        } catch (err) {
            console.error('Failed to load client staff users or groups:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Failed',
                message: err.message || 'Could not fetch company users or roles.'
            });
        } finally {
            setLoading(false);
        }
    };

    // User Form actions
    const handleCreateClick = () => {
        setEditingUser(null);
        setFormData({
            ...INITIAL_CLIENT_USER_FORM,
            groupId: groups.length > 0 ? String(groups[0].id) : ''
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
            login_id: user.login_id || user.username || user.loginId || user.email?.split('@')[0] || '',
            password: '',
            groupId: user.groupId || user.group_id ? String(user.groupId || user.group_id) : '',
            managerId: user.managerId || user.manager_id ? String(user.managerId || user.manager_id) : '',
            isCompanyOwner: Boolean(user.isCompanyOwner || user.is_company_owner),
            status: user.status !== false && user.status !== 0
        });
        setFormErrors({});
        setShowPassword(false);
        setActiveTab('form');
    };

    const handleCancelForm = () => {
        setEditingUser(null);
        setFormData(INITIAL_CLIENT_USER_FORM);
        setFormErrors({});
        setActiveTab('list');
    };

    // Form Validation
    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) {
            errors.name = 'User Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        if (!formData.login_id.trim()) {
            errors.login_id = 'Login ID is required';
        }
        if (!editingUser && !formData.password.trim()) {
            errors.password = 'Password is required for new user';
        } else if (formData.password && formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.groupId) {
            errors.groupId = 'Please select a User Group';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit handler
    const handleSubmitUserForm = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const companyId = getStoredCompanyId();
            if (editingUser) {
                await clientRbacService.updateUser(editingUser.id, {
                    ...formData,
                    companyId
                });
                showAlert({
                    type: 'success',
                    title: 'User Updated',
                    message: `User "${formData.name}" has been updated successfully.`
                });
            } else {
                await clientRbacService.createUser({
                    ...formData,
                    companyId
                });
                showAlert({
                    type: 'success',
                    title: 'User Created',
                    message: `User "${formData.name}" has been created successfully.`
                });
            }

            await fetchInitialData();
            handleCancelForm();
        } catch (err) {
            console.error('Failed to submit user:', err);
            showAlert({
                type: 'error',
                title: editingUser ? 'Update Failed' : 'Creation Failed',
                message: err.message || 'Operation failed. Please try again.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete actions
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
            await clientRbacService.deleteUser(deleteModal.userId);
            showAlert({
                type: 'success',
                title: 'User Deleted',
                message: `User "${deleteModal.userName}" was removed successfully.`
            });
            setDeleteModal({ isOpen: false, userId: null, userName: '' });
            await fetchInitialData();
        } catch (err) {
            console.error('Failed to delete user:', err);
            showAlert({
                type: 'error',
                title: 'Delete Failed',
                message: err.message || 'Could not delete user.'
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
    };

    // Filtered data calculation
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            if (filterUsername && !user.name?.toLowerCase().includes(filterUsername.toLowerCase())) return false;
            if (filterLoginId && !(user.login_id || user.username || user.loginId)?.toLowerCase().includes(filterLoginId.toLowerCase())) return false;
            if (filterPhone && !user.phone?.includes(filterPhone)) return false;
            if (filterGroup !== 'all' && String(user.groupId || user.group_id) !== String(filterGroup)) return false;
            if (filterManager !== 'all' && String(user.managerId || user.manager_id) !== String(filterManager)) return false;
            if (filterStatus !== 'all') {
                const isActive = user.status !== false && user.status !== 0;
                if (filterStatus === 'active' && !isActive) return false;
                if (filterStatus === 'inactive' && isActive) return false;
            }
            return true;
        }).sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            if (sortDirection === 'asc') return String(valA).localeCompare(String(valB));
            return String(valB).localeCompare(String(valA));
        });
    }, [users, filterUsername, filterLoginId, filterPhone, filterGroup, filterManager, filterStatus, sortKey, sortDirection]);

    const paginatedUsers = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return filteredUsers.slice(start, start + pagination.rowsPerPage);
    }, [filteredUsers, pagination.currentPage, pagination.rowsPerPage]);

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
        handleCancelForm,
        handleSubmitUserForm,
        handleDeleteUser,
        handleConfirmDelete,
        handleResetFilters,
        filteredUsers,
        paginatedUsers
    };
};

export default useClientUserMasterLogic;

