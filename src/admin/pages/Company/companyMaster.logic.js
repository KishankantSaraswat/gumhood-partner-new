import { useState, useEffect, useMemo, createElement } from 'react';
import { 
    Mail, Phone, Globe, Edit2, Trash2, Users, Building2, Shield, Key, Server
} from 'lucide-react';
import { usePagination, useSorting } from '../../../common';
import companyService from '../../services/company.service';
import { useAlert } from '../../../context/AlertContext';
import { sanitizeText } from '../../../common/utils/inputFormatters';

export const INITIAL_FORM_DATA = {
    // A. Company Basic Details
    name: '',
    email: '',
    mobile_no: '',
    website: '',
    address: '',
    companylogo: '',
    backgroundImage: '',
    status: 1,
    client_id: '',

    // B. First Master User Credentials (client_company_user)
    userName: '',
    username: '',
    login_id: '',
    userEmail: '',
    password: 'Company@123',
    phone: '',

    // C. SMTP & Email Settings
    smtp_email: '',
    smtp_password: '',
    smtp_email_server: '',
    smtp_port: '587',
    smtp_cc_email: '',
    enable_ssl: 0,
    verify_ssl: 1,
    cc_to_smtp_email: 0,
    emailserver: '',

    // D. Operational & Admin Policies
    pagesize: '10',
    mailassignlimit: '',
    assigntimegap: '',
    auto_logout_session_time: '00:30:00',
    date_difference: '31',
    auto_generate_password: 0,
    admin_change_password: 0,
    admin_reset_password: 0,
    admin_reset_password_days: '',
    admin_previous_password_reused: 0,
    admin_enable_otp: 0,
    agent_enable_otp: 0,
    otp_attempt_count: '5',

    // E. Portal & Branding
    allowSelfServicePortal: 0,
    client_portal_domains: '',
    hide_captcha: 0,
    bannerJson: ''
};

export const FORM_TABS = [
    { id: 'basic', label: 'Company Basic Details', icon: Building2 },
    { id: 'master_user', label: 'Master User Credentials', icon: Key },
    { id: 'smtp', label: 'SMTP & Email', icon: Mail },
    { id: 'policies', label: 'Operational & Policies', icon: Shield },
    { id: 'portal', label: 'Portal & Branding', icon: Globe }
];

/**
 * Company Master Business Logic Hook
 */
export function useCompanyMasterLogic() {
    const { showAlert } = useAlert();
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Filter panel states
    const [filterName, setFilterName] = useState('');
    const [filterContact, setFilterContact] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting & Pagination
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'name', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 50 });

    // Editing & Form states
    const [editingId, setEditingId] = useState(null);
    const [formTab, setFormTab] = useState('basic');
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [showSmtpPassword, setShowSmtpPassword] = useState(false);
    const [showMasterPassword, setShowMasterPassword] = useState(false);

    // Delete Confirmation Modal
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal state for managing company groups & users
    const [manageModalCompany, setManageModalCompany] = useState(null);
    const [manageActiveTab, setManageActiveTab] = useState('users');
    const [companyUsers, setCompanyUsers] = useState([]);
    const [companyGroups, setCompanyGroups] = useState([]);
    const [manageLoading, setManageLoading] = useState(false);
    
    // User creation / edit form
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        groupId: '',
        managerId: '',
        isCompanyOwner: false,
        status: true,
        permissions: []
    });
    const [userFormErrors, setUserFormErrors] = useState({});
    const [creatingUser, setCreatingUser] = useState(false);

    // Group / Role rights creation form
    const [newGroupForm, setNewGroupForm] = useState({
        group_name: '',
        allow_ip: '',
        rights: [
            { page_id: 1, page_name: 'Dashboard', view_right: true, add_right: true, edit_right: true, delete_right: true, excel_right: true },
            { page_id: 2, page_name: 'Members', view_right: true, add_right: true, edit_right: true, delete_right: false, excel_right: true },
            { page_id: 3, page_name: 'Trainers & Staff', view_right: true, add_right: true, edit_right: false, delete_right: false, excel_right: false },
            { page_id: 4, page_name: 'Billing & POS', view_right: true, add_right: true, edit_right: true, delete_right: false, excel_right: true },
            { page_id: 5, page_name: 'Reports & Analytics', view_right: true, add_right: false, edit_right: false, delete_right: false, excel_right: true },
            { page_id: 6, page_name: 'Settings & Security', view_right: true, add_right: false, edit_right: false, delete_right: false, excel_right: false },
        ]
    });
    const [groupFormErrors, setGroupFormErrors] = useState({});
    const [creatingGroup, setCreatingGroup] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await companyService.getAllCompanies();
            setCompanies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Could not load companies from API:', err.message);
            setCompanies((prev) => prev.length > 0 ? prev : [
                {
                    id: 1,
                    name: 'Gymshood HQ Corp',
                    email: 'corp@gymshood.com',
                    mobile_no: '+91 9876543210',
                    website: 'https://gymshood.com',
                    address: 'Level 4, Business Bay, Mumbai',
                    status: 1,
                    created_date: new Date().toISOString()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = useMemo(() => {
        return companies.filter((c) => {
            const matchName = !filterName.trim() || 
                (c.name || '').toLowerCase().includes(filterName.toLowerCase());
            
            const matchContact = !filterContact.trim() || 
                (c.email || '').toLowerCase().includes(filterContact.toLowerCase()) ||
                (c.mobile_no || '').includes(filterContact);
            
            const isCompanyActive = Number(c.status) === 1 || c.status === true;
            const matchStatus = statusFilter === 'all' 
                ? true 
                : statusFilter === 'active' 
                    ? isCompanyActive 
                    : !isCompanyActive;

            return matchName && matchContact && matchStatus;
        });
    }, [companies, filterName, filterContact, statusFilter]);

    const sortedCompanies = useMemo(() => {
        if (!sortKey) return filteredCompanies;
        return [...filteredCompanies].sort((a, b) => {
            let valA = a[sortKey] ?? '';
            let valB = b[sortKey] ?? '';
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredCompanies, sortKey, sortDirection]);

    const paginatedCompanies = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedCompanies.slice(start, start + pagination.rowsPerPage);
    }, [sortedCompanies, pagination.currentPage, pagination.rowsPerPage]);

    const validateForm = () => {
        const errs = {};
        if (!formData.name?.trim()) {
            errs.name = 'Company Name is required';
        }

        if (formData.email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email.trim())) {
                errs.email = 'Enter a valid company email address';
            }
        }

        if (formData.userEmail?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.userEmail.trim())) {
                errs.userEmail = 'Enter a valid master user email address';
            }
        }

        if (formData.smtp_email?.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.smtp_email.trim())) {
                errs.smtp_email = 'Enter a valid SMTP email address';
            }
        }

        if (formData.bannerJson?.trim()) {
            try {
                JSON.parse(formData.bannerJson.trim());
            } catch (_) {
                errs.bannerJson = 'Banner JSON must be valid JSON format';
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => {
            const next = { ...prev, [field]: value };
            
            // Smart auto-population for Master User credentials during creation
            if (!editingId) {
                if (field === 'name') {
                    if (!prev.userName || prev.userName === prev.name) {
                        next.userName = value;
                    }
                    if (!prev.username || prev.username.endsWith('_admin')) {
                        const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').slice(0, 20);
                        if (slug) {
                            next.username = `${slug}_admin`;
                            if (!prev.login_id || prev.login_id.endsWith('_admin')) {
                                next.login_id = `${slug}_admin`;
                            }
                        }
                    }
                }
                if (field === 'email') {
                    if (!prev.userEmail || prev.userEmail === prev.email) {
                        next.userEmail = value;
                    }
                }
                if (field === 'mobile_no') {
                    if (!prev.phone || prev.phone === prev.mobile_no) {
                        next.phone = value;
                    }
                }
            }

            return next;
        });

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(INITIAL_FORM_DATA);
        setErrors({});
        setShowMasterPassword(false);
        setShowSmtpPassword(false);
        setFormTab('basic');
        setViewMode('form');
    };

    const handleOpenEdit = (company) => {
        setEditingId(company.id);
        setFormData({
            ...INITIAL_FORM_DATA,
            ...company,
            backgroundImage: company.backgroundImage || company.background_image || '',
            status: company.status !== undefined ? Number(company.status) : 1,
            enable_ssl: Number(company.enable_ssl || 0),
            verify_ssl: Number(company.verify_ssl ?? 1),
            cc_to_smtp_email: Number(company.cc_to_smtp_email || 0),
            auto_generate_password: Number(company.auto_generate_password || 0),
            admin_change_password: Number(company.admin_change_password || 0),
            admin_reset_password: Number(company.admin_reset_password || 0),
            admin_previous_password_reused: company.admin_previous_password_reused !== null && company.admin_previous_password_reused !== undefined ? Number(company.admin_previous_password_reused) : 0,
            admin_enable_otp: Number(company.admin_enable_otp || 0),
            agent_enable_otp: Number(company.agent_enable_otp || 0),
            allowSelfServicePortal: Number(company.allowSelfServicePortal || 0),
            hide_captcha: Number(company.hide_captcha || 0),
            date_difference: company.date_difference !== null && company.date_difference !== undefined ? String(company.date_difference) : '31'
        });
        setErrors({});
        setShowMasterPassword(false);
        setShowSmtpPassword(false);
        setFormTab('basic');
        setViewMode('form');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showAlert({
                title: 'Validation Failed',
                message: 'Please review the highlighted errors before saving.',
                type: 'warning'
            });
            return;
        }

        // Construct clean payload strictly composed of Categories A, B, C, D, E
        const payload = {
            // A. Company Basic Details
            name: formData.name ? String(formData.name).trim() : '',
            email: formData.email ? String(formData.email).trim() : null,
            mobile_no: formData.mobile_no ? String(formData.mobile_no).trim() : null,
            website: formData.website ? String(formData.website).trim() : null,
            address: formData.address ? String(formData.address).trim() : null,
            companylogo: formData.companylogo ? String(formData.companylogo).trim() : null,
            backgroundImage: formData.backgroundImage ? String(formData.backgroundImage).trim() : null,
            status: Number(formData.status) === 1 ? 1 : 0,
            client_id: formData.client_id ? Number(formData.client_id) : null,

            // B. First Master User Credentials (client_company_user)
            userName: formData.userName || formData.name || null,
            username: formData.username || (formData.email ? formData.email.split('@')[0] : null) || null,
            login_id: formData.login_id || formData.username || formData.email || null,
            userEmail: formData.userEmail || formData.email || null,
            password: formData.password || 'Company@123',
            phone: formData.phone || formData.mobile_no || null,

            // C. SMTP & Email Settings
            smtp_email: formData.smtp_email ? String(formData.smtp_email).trim() : null,
            smtp_password: formData.smtp_password ? String(formData.smtp_password).trim() : null,
            smtp_email_server: formData.smtp_email_server ? String(formData.smtp_email_server).trim() : null,
            smtp_port: formData.smtp_port ? String(formData.smtp_port).trim() : null,
            smtp_cc_email: formData.smtp_cc_email ? String(formData.smtp_cc_email).trim() : null,
            enable_ssl: Number(formData.enable_ssl) === 1 ? 1 : 0,
            verify_ssl: Number(formData.verify_ssl) === 1 ? 1 : 0,
            cc_to_smtp_email: Number(formData.cc_to_smtp_email) === 1 ? 1 : 0,
            emailserver: formData.emailserver ? String(formData.emailserver).trim() : null,

            // D. Operational & Admin Policies
            pagesize: formData.pagesize ? String(formData.pagesize).trim() : null,
            mailassignlimit: formData.mailassignlimit ? String(formData.mailassignlimit).trim() : null,
            assigntimegap: formData.assigntimegap ? String(formData.assigntimegap).trim() : null,
            auto_logout_session_time: formData.auto_logout_session_time ? String(formData.auto_logout_session_time).trim() : null,
            date_difference: formData.date_difference ? String(formData.date_difference).trim() : '31',
            auto_generate_password: Number(formData.auto_generate_password) === 1 ? 1 : 0,
            admin_change_password: Number(formData.admin_change_password) === 1 ? 1 : 0,
            admin_reset_password: Number(formData.admin_reset_password) === 1 ? 1 : 0,
            admin_reset_password_days: formData.admin_reset_password_days ? String(formData.admin_reset_password_days).trim() : null,
            admin_previous_password_reused: formData.admin_previous_password_reused !== null && formData.admin_previous_password_reused !== undefined ? Number(formData.admin_previous_password_reused) : null,
            admin_enable_otp: Number(formData.admin_enable_otp) === 1 ? 1 : 0,
            agent_enable_otp: Number(formData.agent_enable_otp) === 1 ? 1 : 0,
            otp_attempt_count: formData.otp_attempt_count ? String(formData.otp_attempt_count).trim() : null,

            // E. Portal & Branding
            allowSelfServicePortal: Number(formData.allowSelfServicePortal) === 1 ? 1 : 0,
            client_portal_domains: formData.client_portal_domains ? String(formData.client_portal_domains).trim() : null,
            hide_captcha: Number(formData.hide_captcha) === 1 ? 1 : 0,
            bannerJson: formData.bannerJson ? String(formData.bannerJson).trim() : null
        };

        setSubmitting(true);
        try {
            if (editingId) {
                const res = await companyService.updateCompany(editingId, payload);
                const updatedComp = res?.company || { ...payload, id: editingId };
                setCompanies((prev) => prev.map((c) => c.id === editingId ? { ...c, ...updatedComp } : c));
                showAlert({
                    title: 'Company Updated',
                    message: res?.message || `Company "${payload.name}" updated successfully.`,
                    type: 'success'
                });
            } else {
                const res = await companyService.createCompany(payload);
                const createdComp = res?.company || { ...payload, id: res?.id || Date.now(), created_date: new Date().toISOString() };
                setCompanies((prev) => [createdComp, ...prev]);
                showAlert({
                    title: 'Company & Master User Created',
                    message: res?.message || `Company "${payload.name}" and first master user created successfully.`,
                    type: 'success'
                });
            }
            setViewMode('list');
        } catch (err) {
            showAlert({
                title: 'Operation Failed',
                message: err.message || 'An error occurred while saving company details.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (company) => {
        setDeleteModal({
            isOpen: true,
            id: company.id,
            name: company.name
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await companyService.deleteCompany(deleteModal.id);
            setCompanies((prev) => prev.filter((c) => c.id !== deleteModal.id));
            showAlert({
                title: 'Company Deleted',
                message: `Company "${deleteModal.name}" was successfully removed.`,
                type: 'success'
            });
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (err) {
            showAlert({
                title: 'Deletion Failed',
                message: err.message || 'Unable to delete company record.',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenManageModal = async (company) => {
        setManageModalCompany(company);
        setManageActiveTab('users');
        setManageLoading(true);
        setUserFormErrors({});
        setGroupFormErrors({});
        try {
            const [usersData, groupsData] = await Promise.all([
                companyService.getCompanyUsers(company.id),
                companyService.getCompanyGroups(company.id)
            ]);
            setCompanyUsers(Array.isArray(usersData) ? usersData : []);
            setCompanyGroups(Array.isArray(groupsData) ? groupsData : []);
        } catch (err) {
            console.warn('Could not load company users or groups:', err.message);
            setCompanyGroups([
                { id: 1, group_name: 'Branch Manager', allow_ip: '', created_at: new Date().toISOString() },
                { id: 2, group_name: 'Gym Operator / Receptionist', allow_ip: '', created_at: new Date().toISOString() }
            ]);
            setCompanyUsers([
                { id: 1, name: `${company.name} Partner Staff`, email: company.email || 'partner@gymshood.com', mobile: company.mobile_no || '9876543210', group_name: 'Branch Manager' }
            ]);
        } finally {
            setManageLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setNewUserForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || user.mobile || '',
            password: '',
            groupId: user.groupId || user.group_id || '',
            managerId: user.managerId || '',
            isCompanyOwner: Boolean(user.isCompanyOwner),
            status: user.status !== undefined ? Boolean(user.status) : true,
            permissions: user.permissions || []
        });
        setUserFormErrors({});
    };

    const handleResetUserForm = () => {
        setEditingUserId(null);
        setNewUserForm({
            name: '',
            email: '',
            phone: '',
            password: '',
            groupId: '',
            managerId: '',
            isCompanyOwner: false,
            status: true,
            permissions: []
        });
        setUserFormErrors({});
    };

    const handleCreateOrUpdateUser = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!newUserForm.name.trim()) errs.name = 'User Name is required';
        if (!newUserForm.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUserForm.email.trim())) {
            errs.email = 'Enter a valid email address';
        }
        
        if (!editingUserId && (!newUserForm.password || newUserForm.password.length < 6)) {
            errs.password = 'Password must be at least 6 characters';
        } else if (editingUserId && newUserForm.password && newUserForm.password.length < 6) {
            errs.password = 'Password must be at least 6 characters if updating';
        }

        if (Object.keys(errs).length > 0) {
            setUserFormErrors(errs);
            return;
        }

        setCreatingUser(true);
        try {
            const payload = {
                name: newUserForm.name.trim(),
                email: newUserForm.email.trim(),
                phone: newUserForm.phone.trim(),
                companyId: manageModalCompany.id,
                groupId: newUserForm.groupId ? Number(newUserForm.groupId) : null,
                managerId: newUserForm.managerId ? Number(newUserForm.managerId) : null,
                isCompanyOwner: Boolean(newUserForm.isCompanyOwner),
                status: Boolean(newUserForm.status),
                permissions: newUserForm.permissions || []
            };

            if (newUserForm.password) {
                payload.password = newUserForm.password;
            }

            if (editingUserId) {
                const res = await companyService.updateCompanyUser(editingUserId, payload);
                const updated = res?.user || {
                    id: editingUserId,
                    ...payload,
                    group_name: companyGroups.find((g) => g.id === Number(payload.groupId))?.group_name || 'Staff'
                };

                setCompanyUsers((prev) => prev.map((u) => u.id === editingUserId ? { ...u, ...updated } : u));
                handleResetUserForm();
                showAlert({
                    title: 'User Updated',
                    message: `User ${payload.name} has been updated successfully.`,
                    type: 'success'
                });
            } else {
                const res = await companyService.createCompanyUser(payload);
                const created = res?.user || {
                    id: Date.now(),
                    ...payload,
                    group_name: companyGroups.find((g) => g.id === Number(payload.groupId))?.group_name || 'Staff'
                };

                setCompanyUsers((prev) => [created, ...prev]);
                handleResetUserForm();
                showAlert({
                    title: 'User Created',
                    message: `User ${payload.name} created. They can now log in using company login.`,
                    type: 'success'
                });
            }
        } catch (err) {
            showAlert({
                title: editingUserId ? 'Update Failed' : 'Creation Failed',
                message: err.message || 'Operation failed for client company user.',
                type: 'error'
            });
        } finally {
            setCreatingUser(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!newGroupForm.group_name.trim()) errs.group_name = 'Group / Role Name is required';

        if (Object.keys(errs).length > 0) {
            setGroupFormErrors(errs);
            return;
        }

        setCreatingGroup(true);
        try {
            const payload = {
                group_name: newGroupForm.group_name.trim(),
                allow_ip: newGroupForm.allow_ip.trim() || null,
                company_id: manageModalCompany.id,
                rights: newGroupForm.rights
            };

            const res = await companyService.createCompanyGroup(payload);
            const created = res?.group || {
                id: Date.now(),
                group_name: payload.group_name,
                allow_ip: payload.allow_ip,
                created_at: new Date().toISOString()
            };

            setCompanyGroups((prev) => [...prev, created]);
            setNewGroupForm((prev) => ({
                ...prev,
                group_name: '',
                allow_ip: ''
            }));
            setGroupFormErrors({});
            showAlert({
                title: 'Group Created',
                message: `Role group "${payload.group_name}" created with configured page rights.`,
                type: 'success'
            });
        } catch (err) {
            showAlert({
                title: 'Creation Failed',
                message: err.message || 'Could not create group rights.',
                type: 'error'
            });
        } finally {
            setCreatingGroup(false);
        }
    };

    const handleToggleRight = (index, rightKey) => {
        setNewGroupForm((prev) => {
            const updatedRights = [...prev.rights];
            updatedRights[index] = {
                ...updatedRights[index],
                [rightKey]: !updatedRights[index][rightKey]
            };
            return { ...prev, rights: updatedRights };
        });
    };

    return {
        viewMode,
        setViewMode,
        companies,
        loading,
        submitting,
        filterName,
        setFilterName,
        filterContact,
        setFilterContact,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        filteredCompanies,
        paginatedCompanies,

        editingId,
        setEditingId,
        formTab,
        setFormTab,
        formData,
        errors,
        showSmtpPassword,
        setShowSmtpPassword,
        showMasterPassword,
        setShowMasterPassword,
        handleInputChange,
        handleOpenCreate,
        handleOpenEdit,
        handleOpenManageModal,
        handleSubmit,
        loadCompanies,
        deleteModal,
        setDeleteModal,
        handleDeleteClick,
        handleConfirmDelete,
        isDeleting,
        manageModalCompany,
        setManageModalCompany,
        manageActiveTab,
        setManageActiveTab,
        companyUsers,
        companyGroups,
        manageLoading,
        editingUserId,
        newUserForm,
        setNewUserForm,
        userFormErrors,
        creatingUser,
        handleEditUser,
        handleResetUserForm,
        handleCreateOrUpdateUser,
        newGroupForm,
        setNewGroupForm,
        groupFormErrors,
        creatingGroup,
        handleCreateGroup,
        handleToggleRight,
        formTabs: FORM_TABS
    };
}

export default useCompanyMasterLogic;
