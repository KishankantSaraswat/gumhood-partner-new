import { useState, useEffect, useMemo } from 'react';
import { rbacService } from '../../services/rbac.service';
import { globalMenuService } from '../../services/menu.service';
import { useAlert } from '../../../context/AlertContext';

export const useUserPermissionsLogic = ({ initialUserId }) => {
    const { showAlert } = useAlert();

    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(initialUserId ? String(initialUserId) : '');
    const [menus, setMenus] = useState([]);
    const [permissions, setPermissions] = useState({}); // { [page_id]: { view, add, edit, delete, excel } }
    const [initialPermissions, setInitialPermissions] = useState({});
    const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load: Fetch admin users & menu tree
    useEffect(() => {
        loadInitialData();
    }, [initialUserId]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [usersData, menusTree] = await Promise.all([
                rbacService.getUsers(),
                globalMenuService.getAllAdminMenu({ asTree: true })
            ]);

            const userList = Array.isArray(usersData) ? usersData : [];
            setUsers(userList);

            const menuList = Array.isArray(menusTree) ? menusTree : [];
            setMenus(menuList);

            // Expand top-level parent menu nodes by default
            const parentIds = new Set();
            const collectParents = (items) => {
                items.forEach(item => {
                    if (item.children && item.children.length > 0) {
                        parentIds.add(String(item.id));
                        collectParents(item.children);
                    }
                });
            };
            collectParents(menuList);
            setExpandedNodeIds(parentIds);

            // Select initialUserId or first user
            if (userList.length > 0) {
                const targetId = initialUserId ? String(initialUserId) : (selectedUserId || String(userList[0].id));
                setSelectedUserId(targetId);
                await loadUserRights(targetId, menuList);
            }
        } catch (err) {
            console.error('Failed to load user permissions data:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Error',
                message: err.message || 'Could not load users or menu hierarchy.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load rights for a specific user
    const loadUserRights = async (userId, menuTree = menus) => {
        if (!userId) return;
        setLoading(true);
        try {
            const rights = await rbacService.getUserRights(userId);
            const rightsMap = {};

            // Helper to collect all page IDs from menu tree
            const collectPageIds = (items) => {
                items.forEach(item => {
                    rightsMap[String(item.id)] = {
                        view: false,
                        add: false,
                        edit: false,
                        delete: false,
                        excel: false
                    };
                    if (item.children && item.children.length > 0) {
                        collectPageIds(item.children);
                    }
                });
            };
            collectPageIds(menuTree);

            // Overlay user-level rights
            const rightsList = Array.isArray(rights) ? rights : (rights?.rights || []);
            if (Array.isArray(rightsList)) {
                rightsList.forEach(r => {
                    const pid = String(r.page_id || r.pageId);
                    if (rightsMap[pid]) {
                        rightsMap[pid] = {
                            view: Boolean(r.view_right ?? r.view),
                            add: Boolean(r.add_right ?? r.add),
                            edit: Boolean(r.edit_right ?? r.edit),
                            delete: Boolean(r.delete_right ?? r.delete),
                            excel: Boolean(r.excel_right ?? r.excel)
                        };
                    }
                });
            }

            setPermissions(rightsMap);
            setInitialPermissions(JSON.parse(JSON.stringify(rightsMap)));
        } catch (err) {
            console.error(`Error loading rights for user ${userId}:`, err);
            showAlert({
                type: 'error',
                title: 'Rights Error',
                message: 'Failed to retrieve permissions for the selected user.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle user dropdown change
    const handleUserChange = async (e) => {
        const newUserId = (e && typeof e === 'object' && 'target' in e) ? e.target.value : e;
        setSelectedUserId(newUserId);
        await loadUserRights(newUserId);
    };

    // Toggle tree node expansion
    const toggleExpand = (id) => {
        const sId = String(id);
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(sId)) next.delete(sId);
            else next.add(sId);
            return next;
        });
    };

    // Toggle permission for a single page
    const handleRightChange = (pageId, action, value) => {
        const pid = String(pageId);
        setPermissions(prev => {
            const next = { ...prev };
            const current = next[pid] ? { ...next[pid] } : { view: false, add: false, edit: false, delete: false, excel: false };

            if (action === 'all') {
                current.view = value;
                current.add = value;
                current.edit = value;
                current.delete = value;
                current.excel = value;
            } else if (action === 'view') {
                current.view = value;
                if (!value) {
                    current.add = false;
                    current.edit = false;
                    current.delete = false;
                    current.excel = false;
                }
            } else {
                current[action] = value;
                if (value) {
                    current.view = true;
                }
            }

            next[pid] = current;
            return next;
        });
    };

    // Flatten tree items for display
    const flatDisplayRows = useMemo(() => {
        const rows = [];
        let serialNumber = 1;

        const traverse = (nodes, level = 0, isParentExpanded = true) => {
            nodes.forEach(node => {
                const sId = String(node.id);
                const hasChildren = Array.isArray(node.children) && node.children.length > 0;
                const isExpanded = expandedNodeIds.has(sId);

                if (isParentExpanded) {
                    rows.push({
                        id: node.id,
                        sNo: serialNumber++,
                        name: node.menu_name || node.menuName || 'Untitled Page',
                        route: node.route || '',
                        hasChildren,
                        isExpanded,
                        level,
                        parentId: node.parent_id || node.parentId || null
                    });
                }

                if (hasChildren) {
                    traverse(node.children, level + 1, isParentExpanded && isExpanded);
                }
            });
        };

        traverse(menus, 0, true);
        return rows;
    }, [menus, expandedNodeIds]);

    // Check if entire column is selected
    const isColumnAllSelected = (action) => {
        if (flatDisplayRows.length === 0) return false;
        return flatDisplayRows.every(row => {
            const p = permissions[String(row.id)];
            if (!p) return false;
            if (action === 'all') {
                return p.view && p.add && p.edit && p.delete && p.excel;
            }
            return Boolean(p[action]);
        });
    };

    // Toggle entire column
    const handleColumnToggle = (action) => {
        const currentlyAll = isColumnAllSelected(action);
        const targetValue = !currentlyAll;

        setPermissions(prev => {
            const next = { ...prev };
            flatDisplayRows.forEach(row => {
                const pid = String(row.id);
                const current = next[pid] ? { ...next[pid] } : { view: false, add: false, edit: false, delete: false, excel: false };

                if (action === 'all') {
                    current.view = targetValue;
                    current.add = targetValue;
                    current.edit = targetValue;
                    current.delete = targetValue;
                    current.excel = targetValue;
                } else if (action === 'view') {
                    current.view = targetValue;
                    if (!targetValue) {
                        current.add = false;
                        current.edit = false;
                        current.delete = false;
                        current.excel = false;
                    }
                } else {
                    current[action] = targetValue;
                    if (targetValue) current.view = true;
                }

                next[pid] = current;
            });
            return next;
        });
    };

    // Save changes to backend
    const handleSaveChanges = async () => {
        if (!selectedUserId) {
            showAlert({
                type: 'warning',
                title: 'No User Selected',
                message: 'Please choose an admin user to update permissions.'
            });
            return;
        }

        setSaving(true);
        try {
            const rightsArray = Object.keys(permissions).map(pageId => ({
                page_id: Number(pageId),
                view_right: Boolean(permissions[pageId]?.view),
                add_right: Boolean(permissions[pageId]?.add),
                edit_right: Boolean(permissions[pageId]?.edit),
                excel_right: Boolean(permissions[pageId]?.excel),
                delete_right: Boolean(permissions[pageId]?.delete)
            }));

            await rbacService.saveUserRights(selectedUserId, rightsArray);
            setInitialPermissions(JSON.parse(JSON.stringify(permissions)));

            const userName = users.find(u => String(u.id) === String(selectedUserId))?.name || 'Selected User';
            showAlert({
                type: 'success',
                title: 'Permissions Saved',
                message: `Permissions updated successfully for user "${userName}".`
            });
        } catch (err) {
            console.error('Failed to save user permissions:', err);
            showAlert({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'An error occurred while saving user permissions.'
            });
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(permissions) !== JSON.stringify(initialPermissions);
    }, [permissions, initialPermissions]);

    return {
        users,
        selectedUserId,
        setSelectedUserId,
        menus,
        permissions,
        loading,
        saving,
        flatDisplayRows,
        hasUnsavedChanges,
        loadInitialData,
        loadUserRights,
        handleUserChange,
        toggleExpand,
        handleRightChange,
        isColumnAllSelected,
        handleColumnToggle,
        handleSaveChanges
    };
};

