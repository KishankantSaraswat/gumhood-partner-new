import React, { createContext, useContext, useState, useEffect } from 'react';
import rbacService from '../admin/services/rbac.service';

/**
 * PageRights interface
 * {
 *   view: boolean;
 *   add: boolean;
 *   edit: boolean;
 *   delete: boolean;
 *   excel: boolean;
 * }
 */
const DEFAULT_RIGHTS = {
    view: false,
    add: false,
    edit: false,
    delete: false,
    excel: false
};

const FULL_ADMIN_RIGHTS = {
    view: true,
    add: true,
    edit: true,
    delete: true,
    excel: true
};

const PermissionsContext = createContext(null);

export const PermissionsProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [rightsMap, setRightsMap] = useState(new Map());
    const [authorizedMenus, setAuthorizedMenus] = useState([]);
    const [loading, setLoading] = useState(true);

    const refreshPermissions = async () => {
        try {
            // Read stored session user & rights
            let currentUser = null;
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser && storedUser !== 'undefined') {
                    currentUser = JSON.parse(storedUser);
                }
            } catch (e) {
                console.warn('Could not parse stored user:', e);
            }
            setUser(currentUser);

            // Only fetch from /admin/menus/me if user is an admin or on the admin portal
            const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
            const role = (localStorage.getItem('role') || currentUser?.role || '').toLowerCase();
            const isAdminUser = role.includes('admin') || Boolean(localStorage.getItem('admin'));

            let menus = [];
            if (isAdminPath || isAdminUser) {
                try {
                    menus = await rbacService.getAuthorizedMenus();
                } catch (e) {
                    menus = [];
                }
            } else {
                // Client company users: read cached client menus
                try {
                    const storedClientMenus = localStorage.getItem('client_menus') || localStorage.getItem('menus');
                    if (storedClientMenus) {
                        menus = JSON.parse(storedClientMenus) || [];
                    }
                } catch (_) {}
            }

            setAuthorizedMenus(menus);

            const map = new Map();

            // Populate map from authorized menus
            const traverse = (items) => {
                if (!Array.isArray(items)) return;
                items.forEach(item => {
                    const pageRights = {
                        view: Boolean(item.view_right ?? item.view ?? true),
                        add: Boolean(item.add_right ?? item.add),
                        edit: Boolean(item.edit_right ?? item.edit),
                        delete: Boolean(item.delete_right ?? item.delete),
                        excel: Boolean(item.excel_right ?? item.excel)
                    };

                    if (item.route) map.set(item.route.toLowerCase(), pageRights);
                    if (item.menu_code || item.menuCode) map.set((item.menu_code || item.menuCode).toLowerCase(), pageRights);
                    if (item.id) map.set(String(item.id), pageRights);

                    if (item.children && item.children.length > 0) {
                        traverse(item.children);
                    }
                });
            };
            traverse(menus);

            // Also check localStorage user_rights fallback
            const storedRights = localStorage.getItem('user_rights');
            if (storedRights) {
                try {
                    const parsedRights = JSON.parse(storedRights);
                    if (Array.isArray(parsedRights)) {
                        parsedRights.forEach(r => {
                            const rObj = {
                                view: Boolean(r.view_right ?? r.view),
                                add: Boolean(r.add_right ?? r.add),
                                edit: Boolean(r.edit_right ?? r.edit),
                                delete: Boolean(r.delete_right ?? r.delete),
                                excel: Boolean(r.excel_right ?? r.excel)
                            };
                            if (r.route) map.set(r.route.toLowerCase(), rObj);
                            if (r.page_id) map.set(String(r.page_id), rObj);
                        });
                    }
                } catch (e) {
                    console.warn('Error parsing cached user_rights:', e);
                }
            }

            setRightsMap(map);
        } catch (err) {
            console.warn('Permissions initialization note:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshPermissions();
    }, []);

    /**
     * Check if user has permission for an action on a given route / menu identifier
     * @param {string} action - 'view' | 'add' | 'edit' | 'delete' | 'excel'
     * @param {string} identifier - route path or menuCode
     */
    const hasPermission = (action, identifier) => {
        // Rule 3: Master User Super-Admin Bypass
        if (user?.is_master === true || user?.role === 'super_admin' || user?.isMaster === true) {
            return true;
        }

        if (!identifier) {
            // General query without identifier
            return true;
        }

        const key = String(identifier).toLowerCase();
        const rights = rightsMap.get(key);

        if (!rights) {
            // Fallback for default pages or fallback permission
            return true;
        }

        return Boolean(rights[action]);
    };

    return (
        <PermissionsContext.Provider value={{
            user,
            isMaster: Boolean(user?.is_master || user?.role === 'super_admin'),
            authorizedMenus,
            hasPermission,
            refreshPermissions,
            loading
        }}>
            {children}
        </PermissionsContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionsContext);
    if (!context) {
        // Graceful fallback if used outside provider
        return {
            user: null,
            isMaster: true,
            authorizedMenus: [],
            hasPermission: () => true,
            refreshPermissions: () => {},
            loading: false
        };
    }
    return context;
};

export default PermissionsContext;

