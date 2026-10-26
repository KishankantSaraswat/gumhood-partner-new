import { useState, useEffect, useMemo } from 'react';
import globalMenuService from '../../services/menu.service';
import { useAlert } from '../../../context/AlertContext';
import { usePagination, useSorting } from '../../../common';

export const INITIAL_FORM = {
    menuName: '',
    route: '',
    sectionName: 'Config',
    parentId: '',
    icon: '',
    masterName: '',
    menuPriority: 0,
    sectionPriority: 0,
    isActive: true,
    isAppMenu: false,
    isClientMenu: false
};

export const useGlobalMenuMasterLogic = () => {
    const { showAlert } = useAlert();
    
    // Primary Tab state: 'list' | 'form'
    const [activeTab, setActiveTab] = useState('list');

    // Data state
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(false);

    // Search and Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [urlFilter, setUrlFilter] = useState('');
    const [parentFilter, setParentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Sorting & Pagination hooks for DataTable
    const { sortKey, sortDirection, handleSort } = useSorting({ initialSortKey: 'sort_order', initialSortDirection: 'asc' });
    const pagination = usePagination({ initialRowsPerPage: 100 });

    // Editing & Form state
    const [editingMenu, setEditingMenu] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // Delete confirmation state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, menuId: null, menuName: '', hasChildren: false });
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch menus on mount
    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const data = await globalMenuService.getAllMenus({ asTree: true });
            const list = Array.isArray(data) ? data : (data.menus || data.data || []);
            setMenus(list);
        } catch (err) {
            console.error('Error fetching global menus:', err);
            showAlert({
                title: 'Failed to Load Menus',
                message: err.message || 'Unable to retrieve global menu list from server.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Calculate normalized tree structure
    const treeData = useMemo(() => {
        const hasChildrenArrays = menus.some(m => Array.isArray(m.children) && m.children.length > 0);
        if (hasChildrenArrays) {
            return menus;
        }
        return globalMenuService.buildTree(menus);
    }, [menus]);

    // Flatten tree for table view with Section and Priority fallbacks
    const flatMenuList = useMemo(() => {
        const flatten = (items, parentName = '', parentPriority = null) => {
            let res = [];
            items.forEach(item => {
                const secName = item.section_name || item.sectionName || parentName || 'Config';
                const secPriority = item.section_priority ?? item.sectionPriority ?? parentPriority ?? 8;
                const itemCopy = { 
                    ...item, 
                    parentName: secName,
                    parentPriority: secPriority,
                    menuPriority: item.sort_order ?? item.sortOrder ?? item.menu_priority ?? 1
                };
                res.push(itemCopy);
                if (item.children && item.children.length > 0) {
                    res = res.concat(flatten(
                        item.children, 
                        item.menu_name || item.menuName,
                        item.sort_order ?? item.sortOrder ?? 0
                    ));
                }
            });
            return res;
        };
        return flatten(treeData);
    }, [treeData]);

    // Available parent options for dropdown selectors
    const parentOptions = useMemo(() => {
        return globalMenuService.flattenForDropdown(treeData, 0, editingMenu?.id);
    }, [treeData, editingMenu]);

    // Filtered flat list for DataTable
    const filteredRecords = useMemo(() => {
        return flatMenuList.filter(item => {
            const name = (item.menu_name || item.menuName || '').toLowerCase();
            const code = (item.menu_code || item.menuCode || item.master_name || '').toLowerCase();
            const route = (item.route || '').toLowerCase();
            const parentId = String(item.parent_id !== undefined ? (item.parent_id || '') : (item.parentId || ''));
            const active = item.is_active ?? item.isActive ?? true;

            const matchesName = !nameFilter || name.includes(nameFilter.toLowerCase()) || code.includes(nameFilter.toLowerCase());
            const matchesUrl = !urlFilter || route.includes(urlFilter.toLowerCase());
            const matchesParent = parentFilter === 'all' || parentId === parentFilter;
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && active) || 
                (statusFilter === 'inactive' && !active);

            return matchesName && matchesUrl && matchesParent && matchesStatus;
        });
    }, [flatMenuList, nameFilter, urlFilter, parentFilter, statusFilter]);

    // Sorted records
    const sortedRecords = useMemo(() => {
        if (!sortKey) return filteredRecords;
        return [...filteredRecords].sort((a, b) => {
            let valA, valB;
            if (sortKey === 'menu_details') {
                valA = (a.menu_name || a.menuName || '').toLowerCase();
                valB = (b.menu_name || b.menuName || '').toLowerCase();
            } else if (sortKey === 'section') {
                valA = (a.parentName || '').toLowerCase();
                valB = (b.parentName || '').toLowerCase();
            } else if (sortKey === 'sort_order') {
                valA = a.menuPriority ?? a.sort_order ?? a.sortOrder ?? 0;
                valB = b.menuPriority ?? b.sort_order ?? b.sortOrder ?? 0;
            } else if (sortKey === 'status') {
                valA = (a.is_active ?? a.isActive ?? true) ? 1 : 0;
                valB = (b.is_active ?? b.isActive ?? true) ? 1 : 0;
            } else {
                valA = a[sortKey] ?? '';
                valB = b[sortKey] ?? '';
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredRecords, sortKey, sortDirection]);

    // Paginated slice for current page
    const paginatedRecords = useMemo(() => {
        const start = (pagination.currentPage - 1) * pagination.rowsPerPage;
        return sortedRecords.slice(start, start + pagination.rowsPerPage);
    }, [sortedRecords, pagination.currentPage, pagination.rowsPerPage]);

    // Reset all search filters
    const handleResetFilters = () => {
        setNameFilter('');
        setUrlFilter('');
        setParentFilter('all');
        setStatusFilter('all');
        pagination.resetPagination();
    };

    // Open Add Form
    const handleOpenCreateForm = (presetParentId = '') => {
        setEditingMenu(null);
        setFormData({
            ...INITIAL_FORM,
            parentId: presetParentId || '',
            menuPriority: (flatMenuList.length + 1)
        });
        setFormErrors({});
        setActiveTab('form');
    };

    // Open Edit Form
    const handleOpenEditForm = (menu) => {
        setEditingMenu(menu);
        setFormData({
            menuName: menu.menu_name || menu.menuName || '',
            route: menu.route || '',
            sectionName: menu.section_name || menu.sectionName || menu.parentName || 'Config',
            parentId: menu.parent_id !== undefined ? (menu.parent_id || '') : (menu.parentId || ''),
            icon: menu.icon || '',
            masterName: menu.menu_code || menu.menuCode || menu.master_name || '',
            menuPriority: menu.sort_order ?? menu.sortOrder ?? menu.menu_priority ?? 0,
            sectionPriority: menu.section_priority ?? menu.sectionPriority ?? menu.parentPriority ?? 0,
            isActive: menu.is_active !== undefined ? Boolean(menu.is_active) : (menu.isActive ?? true),
            isAppMenu: Boolean(menu.is_app_menu ?? menu.platform === 'mobile'),
            isClientMenu: Boolean(menu.is_client_menu ?? menu.isClientMenu ?? false)
        });
        setFormErrors({});
        setActiveTab('form');
    };

    // Validation
    const validateForm = () => {
        const errors = {};
        if (!formData.menuName.trim()) {
            errors.menuName = 'Menu Name is required';
        }
        if (!formData.route.trim()) {
            errors.route = 'Menu URL is required (e.g. /admin/path)';
        }
        if (!formData.masterName.trim()) {
            errors.masterName = 'Master Name is required';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Form Submit
    const handleFormSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const payload = {
                parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
                menuCode: formData.masterName.trim().toUpperCase(),
                masterName: formData.masterName.trim().toUpperCase(),
                menuName: formData.menuName.trim(),
                route: formData.route.trim(),
                icon: formData.icon.trim() || null,
                sortOrder: parseInt(formData.menuPriority, 10) || 0,
                menuPriority: parseInt(formData.menuPriority, 10) || 0,
                sectionName: formData.sectionName || 'Config',
                sectionPriority: parseInt(formData.sectionPriority, 10) || 0,
                isActive: Boolean(formData.isActive),
                isAppMenu: Boolean(formData.isAppMenu),
                isClientMenu: Boolean(formData.isClientMenu),
                is_client_menu: Boolean(formData.isClientMenu),
                platform: formData.isAppMenu ? 'mobile' : 'web'
            };

            if (editingMenu) {
                await globalMenuService.updateMenu(editingMenu.id, payload);
                showAlert({
                    title: 'Menu Updated',
                    message: `Menu "${formData.menuName}" has been successfully updated.`,
                    type: 'success'
                });
            } else {
                await globalMenuService.createMenu(payload);
                showAlert({
                    title: 'Menu Created',
                    message: `Menu "${formData.menuName}" has been successfully created.`,
                    type: 'success'
                });
            }
            setActiveTab('list');
            await fetchMenus();
        } catch (err) {
            console.error('Save menu error:', err);
            showAlert({
                title: 'Save Failed',
                message: err.message || 'An error occurred while saving the menu item.',
                type: 'error'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Delete handling
    const handlePromptDelete = (menu) => {
        const hasChildren = Array.isArray(menu.children) && menu.children.length > 0;
        setDeleteModal({
            isOpen: true,
            menuId: menu.id,
            menuName: menu.menu_name || menu.menuName,
            hasChildren
        });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.menuId) return;
        setIsDeleting(true);
        try {
            await globalMenuService.deleteMenu(deleteModal.menuId);
            showAlert({
                title: 'Menu Deleted',
                message: `Global menu "${deleteModal.menuName}" has been removed.`,
                type: 'success'
            });
            setDeleteModal({ isOpen: false, menuId: null, menuName: '', hasChildren: false });
            fetchMenus();
        } catch (err) {
            showAlert({
                title: 'Delete Failed',
                message: err.message || 'Failed to delete global menu item.',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        activeTab,
        setActiveTab,
        menus,
        loading,
        nameFilter,
        setNameFilter,
        urlFilter,
        setUrlFilter,
        parentFilter,
        setParentFilter,
        statusFilter,
        setStatusFilter,
        sortKey,
        sortDirection,
        handleSort,
        pagination,
        editingMenu,
        setEditingMenu,
        formData,
        setFormData,
        formErrors,
        setFormErrors,
        submitting,
        deleteModal,
        setDeleteModal,
        isDeleting,
        fetchMenus,
        treeData,
        flatMenuList,
        parentOptions,
        filteredRecords,
        paginatedRecords,
        handleResetFilters,
        handleOpenCreateForm,
        handleOpenEditForm,
        handleFormSubmit,
        handlePromptDelete,
        handleConfirmDelete
    };
};

