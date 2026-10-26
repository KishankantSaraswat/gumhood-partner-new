import { useState, useEffect, useMemo } from 'react';
import clientRbacService, { getStoredCompanyId } from '../../services/clientRbac.service';
import { useAlert } from '../../../context/AlertContext';

export const useClientGroupPermissionsLogic = ({ initialGroupId } = {}) => {
    const { showAlert } = useAlert();

    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(initialGroupId ? String(initialGroupId) : '');
    const [menus, setMenus] = useState([]);
    const [permissions, setPermissions] = useState({}); // { [page_id]: { view, add, edit, delete, excel } }
    const [initialPermissions, setInitialPermissions] = useState({});
    const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load: Fetch company user groups & client menus
    useEffect(() => {
        loadInitialData();
    }, [initialGroupId]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const companyId = getStoredCompanyId();
            const [groupsData, menusTree] = await Promise.all([
                clientRbacService.getGroups(companyId),
                clientRbacService.getClientMenus({ asTree: true })
            ]);

            const groupList = Array.isArray(groupsData) ? groupsData : (groupsData.groups || groupsData.data || []);
            setGroups(groupList);

            const menuList = Array.isArray(menusTree) ? menusTree : (menusTree.menus || menusTree.data || []);
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

            // Select initialGroupId or first group
            if (groupList.length > 0) {
                const targetId = initialGroupId ? String(initialGroupId) : (selectedGroupId || String(groupList[0].id));
                setSelectedGroupId(targetId);
                await loadGroupRights(targetId, menuList);
            }
        } catch (err) {
            console.error('Failed to load group permissions data:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Error',
                message: err.message || 'Could not load user groups or client menu structure.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load rights for a specific group
    const loadGroupRights = async (groupId, menuTree = menus) => {
        if (!groupId) return;
        setLoading(true);
        try {
            const rights = await clientRbacService.getGroupRights(groupId);
            const rightsMap = {};

            // Collect all page IDs from menu tree or rights
            const rightsList = Array.isArray(rights) ? rights : (rights?.rights || []);

            // If menuTree is empty, derive directly from backend rights response
            let effectiveMenus = menuTree && menuTree.length > 0 ? menuTree : [];
            if (effectiveMenus.length === 0 && rightsList.length > 0) {
                effectiveMenus = rightsList.map(r => ({
                    id: r.pageId || r.page_id,
                    pageId: r.pageId || r.page_id,
                    menuCode: r.menuCode,
                    menuName: r.menuName || r.menuLabel,
                    menuLabel: r.menuLabel || r.menuName,
                    route: r.route,
                    icon: r.icon,
                    companyAllowed: r.companyAllowed !== false,
                    children: []
                }));
                setMenus(effectiveMenus);
            }

            const collectPageIds = (items) => {
                items.forEach(item => {
                    const pid = String(item.pageId || item.id);
                    rightsMap[pid] = {
                        view: false,
                        add: false,
                        edit: false,
                        delete: false,
                        excel: false,
                        companyAllowed: item.companyAllowed !== false
                    };
                    if (item.children && item.children.length > 0) {
                        collectPageIds(item.children);
                    }
                });
            };
            collectPageIds(effectiveMenus);

            // Overlay database rights (supports both camelCase and snake_case)
            if (Array.isArray(rightsList)) {
                rightsList.forEach(r => {
                    const pid = String(r.pageId || r.page_id || r.id);
                    rightsMap[pid] = {
                        view: Boolean(r.viewRight ?? r.view_right ?? r.view),
                        add: Boolean(r.addRight ?? r.add_right ?? r.add),
                        edit: Boolean(r.editRight ?? r.edit_right ?? r.edit),
                        delete: Boolean(r.deleteRight ?? r.delete_right ?? r.delete),
                        excel: Boolean(r.excelRight ?? r.excel_right ?? r.excel),
                        companyAllowed: r.companyAllowed !== false
                    };
                });
            }

            setPermissions(rightsMap);
            setInitialPermissions(JSON.parse(JSON.stringify(rightsMap)));
        } catch (err) {
            console.error(`Error loading rights for group ${groupId}:`, err);
            showAlert({
                type: 'error',
                title: 'Rights Load Failed',
                message: err.message || 'Could not load group permissions matrix.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGroupChange = async (e) => {
        const nextId = (e && typeof e === 'object' && 'target' in e) ? e.target.value : e;
        setSelectedGroupId(nextId);
        if (nextId) {
            await loadGroupRights(nextId, menus);
        } else {
            setPermissions({});
            setInitialPermissions({});
        }
    };

    const toggleExpand = (nodeId) => {
        const sId = String(nodeId);
        setExpandedNodeIds(prev => {
            const next = new Set(prev);
            if (next.has(sId)) {
                next.delete(sId);
            } else {
                next.add(sId);
            }
            return next;
        });
    };

    // Handle individual permission checkbox toggle
    const handleRightChange = (pageId, rightType, value) => {
        const sId = String(pageId);
        setPermissions(prev => {
            const next = { ...prev };
            const current = next[sId] ? { ...next[sId] } : { view: false, add: false, edit: false, delete: false, excel: false };

            if (rightType === 'all') {
                const targetState = Boolean(value);
                current.view = targetState;
                current.add = targetState;
                current.edit = targetState;
                current.delete = targetState;
                current.excel = targetState;
            } else {
                current[rightType] = Boolean(value);
                // If checking add, edit, delete or excel, auto-check view
                if (Boolean(value) && rightType !== 'view') {
                    current.view = true;
                }
                // If unchecking view, auto-uncheck other rights
                if (!Boolean(value) && rightType === 'view') {
                    current.add = false;
                    current.edit = false;
                    current.delete = false;
                    current.excel = false;
                }
            }

            next[sId] = current;

            // Cascade to descendants if parent row toggled
            const cascadeChildren = (parentId, state, type) => {
                const findNode = (items) => {
                    for (const item of items) {
                        if (String(item.id) === String(parentId)) return item;
                        if (item.children) {
                            const found = findNode(item.children);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                const node = findNode(menus);
                if (node && node.children && node.children.length > 0) {
                    const applyChildren = (childrenList) => {
                        childrenList.forEach(child => {
                            const cId = String(child.id);
                            const childRights = next[cId] ? { ...next[cId] } : { view: false, add: false, edit: false, delete: false, excel: false };
                            if (type === 'all') {
                                childRights.view = state;
                                childRights.add = state;
                                childRights.edit = state;
                                childRights.delete = state;
                                childRights.excel = state;
                            } else {
                                childRights[type] = state;
                                if (state && type !== 'view') childRights.view = true;
                                if (!state && type === 'view') {
                                    childRights.add = false;
                                    childRights.edit = false;
                                    childRights.delete = false;
                                    childRights.excel = false;
                                }
                            }
                            next[cId] = childRights;
                            if (child.children && child.children.length > 0) {
                                applyChildren(child.children);
                            }
                        });
                    };
                    applyChildren(node.children);
                }
            };

            cascadeChildren(pageId, current[rightType] ?? current.view, rightType);

            return next;
        });
    };

    // Column-level select/deselect all
    const isColumnAllSelected = (rightType) => {
        const pageIds = Object.keys(permissions);
        if (pageIds.length === 0) return false;

        if (rightType === 'all') {
            return pageIds.every(id => {
                const p = permissions[id];
                return p && p.view && p.add && p.edit && p.delete && p.excel;
            });
        }

        return pageIds.every(id => permissions[id] && permissions[id][rightType]);
    };

    const handleColumnToggle = (rightType) => {
        const currentlyAll = isColumnAllSelected(rightType);
        const targetState = !currentlyAll;

        setPermissions(prev => {
            const next = {};
            Object.keys(prev).forEach(pageId => {
                const p = { ...prev[pageId] };
                if (rightType === 'all') {
                    p.view = targetState;
                    p.add = targetState;
                    p.edit = targetState;
                    p.delete = targetState;
                    p.excel = targetState;
                } else {
                    p[rightType] = targetState;
                    if (targetState && rightType !== 'view') p.view = true;
                    if (!targetState && rightType === 'view') {
                        p.add = false;
                        p.edit = false;
                        p.delete = false;
                        p.excel = false;
                    }
                }
                next[pageId] = p;
            });
            return next;
        });
    };

    // Check if there are unsaved modifications
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(permissions) !== JSON.stringify(initialPermissions);
    }, [permissions, initialPermissions]);

    // Save changes
    const handleSaveChanges = async () => {
        if (!selectedGroupId) {
            showAlert({
                type: 'warning',
                title: 'No Group Selected',
                message: 'Please select a role group first.'
            });
            return;
        }

        setSaving(true);
        try {
            const rightsArray = Object.keys(permissions).map(pageId => ({
                pageId: Number(pageId),
                viewRight: Boolean(permissions[pageId]?.view),
                addRight: Boolean(permissions[pageId]?.add),
                editRight: Boolean(permissions[pageId]?.edit),
                deleteRight: Boolean(permissions[pageId]?.delete),
                excelRight: Boolean(permissions[pageId]?.excel)
            }));

            await clientRbacService.saveGroupRights(selectedGroupId, rightsArray);

            setInitialPermissions(JSON.parse(JSON.stringify(permissions)));
            showAlert({
                type: 'success',
                title: 'Permissions Saved',
                message: `Permissions updated successfully for role group.`
            });
        } catch (err) {
            console.error('Failed to save group permissions:', err);
            showAlert({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'Could not save permissions.'
            });
        } finally {
            setSaving(false);
        }
    };

    // Flatten tree structure for rendering
    const flatDisplayRows = useMemo(() => {
        const rows = [];
        let sNoCounter = 1;

        const traverse = (items, level = 0) => {
            items.forEach(item => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                const isExpanded = expandedNodeIds.has(String(item.id));

                rows.push({
                    sNo: sNoCounter++,
                    id: item.id,
                    pageId: item.id,
                    name: item.menuName || item.menu_name || item.name || 'Unnamed Page',
                    code: item.menuCode || item.menu_code || item.code || '',
                    route: item.route || '',
                    level,
                    hasChildren,
                    isExpanded
                });

                if (hasChildren && isExpanded) {
                    traverse(item.children, level + 1);
                }
            });
        };

        traverse(menus);
        return rows;
    }, [menus, expandedNodeIds]);

    return {
        groups,
        selectedGroupId,
        permissions,
        loading,
        saving,
        flatDisplayRows,
        hasUnsavedChanges,
        handleGroupChange,
        toggleExpand,
        handleRightChange,
        isColumnAllSelected,
        handleColumnToggle,
        handleSaveChanges
    };
};

export default useClientGroupPermissionsLogic;

