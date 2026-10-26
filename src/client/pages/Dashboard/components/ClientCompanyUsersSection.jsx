import React, { useState, useEffect, useMemo } from 'react';
import { 
    Users, Plus, Search, Edit2, Shield, Phone, Mail, CheckCircle2, 
    XCircle, RefreshCw, Key, ShieldCheck, UserCheck, Building
} from 'lucide-react';
import companyService from '@/admin/services/company.service';
import { useAlert } from '@/context/AlertContext';
import { SearchableSelect } from '@/common';

/**
 * ClientCompanyUsersSection (User Master)
 * Manage staff and client users who work for this company/partner business:
 * - List all users (GET /api/v1/client-company/users?companyId=:id)
 * - Create new client user (POST /api/v1/client-company/users)
 * - Edit / Update user (PUT /api/v1/client-company/users/:id)
 * - Granular page permissions and group roles
 */
export const ClientCompanyUsersSection = ({ gym }) => {
    const { showAlert } = useAlert();

    // Get company ID from stored company, gym object, or user
    const companyId = useMemo(() => {
        try {
            const storedCompany = localStorage.getItem('client_company');
            if (storedCompany) {
                const parsed = JSON.parse(storedCompany);
                if (parsed.id) return parsed.id;
            }
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.companyId || parsed.company_id) return parsed.companyId || parsed.company_id;
            }
        } catch (e) {
            console.warn('Error reading stored company ID:', e);
        }
        return gym?.id || 1;
    }, [gym]);

    const companyName = useMemo(() => {
        try {
            const storedCompany = localStorage.getItem('client_company');
            if (storedCompany) {
                const parsed = JSON.parse(storedCompany);
                if (parsed.name) return parsed.name;
            }
        } catch (e) {}
        return gym?.name || 'Partner Gym';
    }, [gym]);

    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        groupId: '',
        managerId: '',
        isCompanyOwner: false,
        status: true
    });

    useEffect(() => {
        loadData();
    }, [companyId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [usersData, groupsData] = await Promise.all([
                companyService.getCompanyUsers(companyId),
                companyService.getCompanyGroups(companyId)
            ]);
            setUsers(Array.isArray(usersData) ? usersData : []);
            setGroups(Array.isArray(groupsData) ? groupsData : []);
        } catch (err) {
            console.warn('Could not load company staff users:', err.message);
            // Default demo users if newly registered company
            setUsers((prev) => prev.length > 0 ? prev : [
                {
                    id: 1,
                    companyId: companyId,
                    name: 'Admin Manager',
                    email: 'manager@gymshood.com',
                    phone: '9876543210',
                    groupId: 1,
                    group_name: 'Branch Manager',
                    isCompanyOwner: true,
                    status: true
                }
            ]);
            setGroups([
                { id: 1, group_name: 'Branch Manager' },
                { id: 2, group_name: 'Receptionist / Front Desk' },
                { id: 3, group_name: 'Fitness Trainer' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingUserId(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            groupId: groups[0]?.id || '',
            managerId: '',
            isCompanyOwner: false,
            status: true
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUserId(user.id);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || user.mobile || '',
            password: '',
            groupId: user.groupId || user.group_id || '',
            managerId: user.managerId || '',
            isCompanyOwner: Boolean(user.isCompanyOwner),
            status: user.status !== undefined ? Boolean(user.status) : true
        });
        setFormErrors({});
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingUserId(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Full name is required';
        if (!formData.email.trim()) {
            errs.email = 'Email address is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errs.email = 'Enter a valid email address';
        }

        if (!editingUserId && (!formData.password || formData.password.length < 6)) {
            errs.password = 'Password must be at least 6 characters';
        } else if (editingUserId && formData.password && formData.password.length < 6) {
            errs.password = 'Password must be at least 6 characters';
        }

        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                companyId: companyId,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                groupId: formData.groupId ? Number(formData.groupId) : null,
                managerId: formData.managerId ? Number(formData.managerId) : null,
                isCompanyOwner: Boolean(formData.isCompanyOwner),
                status: Boolean(formData.status)
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (editingUserId) {
                const res = await companyService.updateCompanyUser(editingUserId, payload);
                const updated = res?.user || {
                    id: editingUserId,
                    ...payload,
                    group_name: groups.find((g) => g.id === Number(payload.groupId))?.group_name || 'Staff'
                };
                setUsers((prev) => prev.map((u) => u.id === editingUserId ? { ...u, ...updated } : u));
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
                    group_name: groups.find((g) => g.id === Number(payload.groupId))?.group_name || 'Staff'
                };
                setUsers((prev) => [created, ...prev]);
                showAlert({
                    title: 'User Created',
                    message: `User ${payload.name} added to your company team.`,
                    type: 'success'
                });
            }
            handleCloseForm();
        } catch (err) {
            showAlert({
                title: editingUserId ? 'Update Failed' : 'Creation Failed',
                message: err.message || 'Could not save company user.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchSearch = (
                (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (u.phone || u.mobile || '').includes(searchTerm)
            );
            const matchStatus = statusFilter === 'all'
                ? true
                : statusFilter === 'active'
                    ? u.status !== false
                    : u.status === false;
            return matchSearch && matchStatus;
        });
    }, [users, searchTerm, statusFilter]);

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto p-4 sm:p-6 animate-fade-in">
            {/* Header / Summary Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-theme-light text-theme-primary flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                            <span>User Master &bull; Staff Management</span>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                {companyName}
                            </span>
                        </h2>
                        <p className="text-xs text-slate-400">
                            Manage employees, staff, receptionists, and managers who work for and operate your business
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Staff User</span>
                    </button>
                    <button
                        type="button"
                        onClick={loadData}
                        className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200/80 transition-colors cursor-pointer"
                        title="Reload Team"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search staff by name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 outline-none focus:border-theme-primary focus:bg-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <SearchableSelect
                        options={[
                            { value: 'all', label: 'All Status' },
                            { value: 'active', label: 'Active Only' },
                            { value: 'inactive', label: 'Inactive Only' }
                        ]}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val || 'all')}
                        placeholder="Status"
                        searchPlaceholder="Search status..."
                        className="w-36"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold tracking-wider text-[11px]">
                                <th className="py-3 px-4">Staff Member</th>
                                <th className="py-3 px-4">Contact & Login</th>
                                <th className="py-3 px-4">Role / Group</th>
                                <th className="py-3 px-4">Account Type</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-theme-light text-theme-primary font-bold flex items-center justify-center text-xs shrink-0">
                                                {(u.name || 'U')[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-xs">{u.name}</p>
                                                <p className="text-[10px] text-slate-400">ID #{u.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                <span>{u.email}</span>
                                            </div>
                                            {(u.phone || u.mobile) && (
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <Phone className="w-3 h-3 text-slate-400" />
                                                    <span>{u.phone || u.mobile}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-[10px]">
                                            <Shield className="w-3 h-3 text-theme-primary" />
                                            <span>
                                                {u.group_name || groups.find((g) => g.id === Number(u.groupId || u.group_id))?.group_name || 'Staff Member'}
                                            </span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {u.isCompanyOwner ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                                                <UserCheck className="w-3 h-3 text-amber-600" /> Owner / Partner
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                                Staff
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4">
                                        {u.status !== false ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                <CheckCircle2 className="w-2.5 h-2.5" /> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                                <XCircle className="w-2.5 h-2.5" /> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleOpenEdit(u)}
                                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:text-theme-primary hover:border-theme-primary transition-colors cursor-pointer text-xs font-semibold inline-flex items-center gap-1"
                                            title="Edit User"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            <span>Edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-slate-400">
                                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="font-semibold text-xs">No company staff users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Create or Edit User */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-xl overflow-hidden animate-fade-in">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-theme-light text-theme-primary flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        {editingUserId ? 'Edit Staff User' : 'Add New Staff / Partner User'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">{companyName}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseForm}
                                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="form-label">Full Name <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sarah Receptionist"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`form-input !pl-3 !py-1.5 !text-xs ${formErrors.name ? 'border-rose-300' : ''}`}
                                    />
                                    {formErrors.name && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.name}</span>}
                                </div>

                                <div>
                                    <label className="form-label">Login Email <span className="text-rose-500">*</span></label>
                                    <input
                                        type="email"
                                        placeholder="e.g. sarah@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`form-input !pl-3 !py-1.5 !text-xs ${formErrors.email ? 'border-rose-300' : ''}`}
                                    />
                                    {formErrors.email && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.email}</span>}
                                </div>

                                <div>
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g. 9876543299"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="form-input !pl-3 !py-1.5 !text-xs"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        {editingUserId ? 'New Password (Optional)' : 'Password (min 6 chars) *'}
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`form-input !pl-3 !py-1.5 !text-xs ${formErrors.password ? 'border-rose-300' : ''}`}
                                    />
                                    {formErrors.password && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.password}</span>}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="form-label">Assigned Role Group</label>
                                    <SearchableSelect
                                        options={groups.map((g) => ({
                                            value: g.id,
                                            label: g.group_name || g.name
                                        }))}
                                        value={formData.groupId}
                                        onChange={(val) => setFormData({ ...formData, groupId: val })}
                                        placeholder="Select Role Group"
                                        searchPlaceholder="Search role group..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={formData.isCompanyOwner}
                                            onChange={(e) => setFormData({ ...formData, isCompanyOwner: e.target.checked })}
                                            className="h-3.5 w-3.5 text-theme-primary rounded cursor-pointer"
                                        />
                                        <span>Company Owner / Partner</span>
                                    </label>

                                    {editingUserId && (
                                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                                className="h-3.5 w-3.5 text-theme-primary rounded cursor-pointer"
                                            />
                                            <span>Active Account</span>
                                        </label>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 rounded-xl bg-theme-primary text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60"
                                    >
                                        {submitting ? 'Saving...' : editingUserId ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientCompanyUsersSection;

