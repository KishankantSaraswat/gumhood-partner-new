import { useState, useEffect, useMemo } from 'react';
import { companyService } from '../../services/company.service';
import { globalMenuService } from '../../services/menu.service';
import { useAlert } from '../../../context/AlertContext';

/**
 * Company Permissions Business Logic Hook
 * Dedicated to managing granular client menu permissions for companies.
 * Uses getAllClientMenu to fetch client-facing menus (isClientMenu = true).
 */
export const useCompanyPermissionsLogic = ({ initialCompanyId } = {}) => {
    const { showAlert } = useAlert();

    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(initialCompanyId ? String(initialCompanyId) : '');
    const [menus, setMenus] = useState([]);
    const [permissions, setPermissions] = useState({}); // { [page_id]: { view, add, edit, delete, excel } }
    const [initialPermissions, setInitialPermissions] = useState({});
    const [expandedNodeIds, setExpandedNodeIds] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initial load: Fetch companies & client menu tree
    useEffect(() => {
        loadInitialData();
    }, [initialCompanyId]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [companiesData, menusTree] = await Promise.all([
                companyService.getAllCompanies(),
                globalMenuService.getAllClientMenu({ asTree: true })
            ]);

            const companyList = Array.isArray(companiesData) ? companiesData : (companiesData?.companies || []);
            setCompanies(companyList);

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

            // Select initialCompanyId or first company
            if (companyList.length > 0) {
                const targetId = initialCompanyId ? String(initialCompanyId) : (selectedCompanyId || String(companyList[0].id));
                setSelectedCompanyId(targetId);
                await loadCompanyRights(targetId, menuList);
            }
        } catch (err) {
            console.error('Failed to load company permissions data:', err);
            showAlert({
                type: 'error',
                title: 'Data Load Error',
                message: err.message || 'Could not load companies or client menu hierarchy.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Load rights for a specific company
    const loadCompanyRights = async (companyId, menuTree = menus) => {
        if (!companyId) return;
        setLoading(true);
        try {
            const rights = await companyService.getCompanyRights(companyId);
            const rightsMap = {};

            // Helper to collect all page IDs from client menu tree
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

            // Overlay company rights from backend matrix
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
            console.error(`Error loading rights for company ${companyId}:`, err);
            showAlert({
                type: 'error',
                title: 'Rights Error',
                message: 'Failed to retrieve permissions for the selected company.'
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle company dropdown change
    const handleCompanyChange = async (e) => {
        const newCompanyId = e.target.value;
        setSelectedCompanyId(newCompanyId);
        await loadCompanyRights(newCompanyId);
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
        if (!selectedCompanyId) {
            showAlert({
                type: 'warning',
                title: 'No Company Selected',
                message: 'Please choose a company to update permissions.'
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

            await companyService.saveCompanyRights(selectedCompanyId, rightsArray);
            setInitialPermissions(JSON.parse(JSON.stringify(permissions)));

            const companyName = companies.find(c => String(c.id) === String(selectedCompanyId))?.name || 'Selected Company';
            showAlert({
                type: 'success',
                title: 'Permissions Saved',
                message: `Permissions updated successfully for company "${companyName}".`
            });
        } catch (err) {
            console.error('Failed to save company permissions:', err);
            showAlert({
                type: 'error',
                title: 'Save Failed',
                message: err.message || 'An error occurred while saving company permissions.'
            });
        } finally {
            setSaving(false);
        }
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(permissions) !== JSON.stringify(initialPermissions);
    }, [permissions, initialPermissions]);

    return {
        companies,
        selectedCompanyId,
        setSelectedCompanyId,
        menus,
        permissions,
        loading,
        saving,
        flatDisplayRows,
        hasUnsavedChanges,
        loadInitialData,
        loadCompanyRights,
        handleCompanyChange,
        toggleExpand,
        handleRightChange,
        isColumnAllSelected,
        handleColumnToggle,
        handleSaveChanges
    };
};

