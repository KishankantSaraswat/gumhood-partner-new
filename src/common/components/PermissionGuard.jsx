import React from 'react';
import { usePermissions } from '../../context/PermissionsContext';

/**
 * Declarative Permission Guard Component
 * 
 * Conditionally mounts its children based on the user's rights:
 * <PermissionGuard action="add" identifier="/admin/users">
 *    <button>+ Add User</button>
 * </PermissionGuard>
 */
export const PermissionGuard = ({ 
    action = 'view', 
    identifier, 
    fallback = null, 
    children 
}) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(action, identifier)) {
        return fallback;
    }

    return <>{children}</>;
};

export default PermissionGuard;

