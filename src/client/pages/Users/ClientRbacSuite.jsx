import React, { useState, useEffect } from 'react';
import { Users, Shield, KeyRound, UserCheck } from 'lucide-react';
import { AnimatedTabs } from '../../../common';
import { ClientUserMasterPage } from './ClientUserMasterPage';
import { ClientGroupMasterPage } from '../Groups/ClientGroupMasterPage';
import { ClientGroupPermissionsPage } from '../Permissions/ClientGroupPermissionsPage';
import { ClientUserPermissionsPage } from '../Permissions/ClientUserPermissionsPage';

const RBAC_TABS = [
    { id: 'users', label: 'Staff Users', icon: Users },
    { id: 'groups', label: 'Roles & Groups', icon: Shield },
    { id: 'group-permissions', label: 'Group Permissions', icon: KeyRound },
    { id: 'user-permissions', label: 'User Permissions', icon: UserCheck }
];

export const ClientRbacSuite = ({ initialTab = 'users', initialTargetId = null, onNavigate }) => {
    const [currentTab, setCurrentTab] = useState(initialTab);
    const [targetId, setTargetId] = useState(initialTargetId);

    useEffect(() => {
        if (initialTab) {
            const mapped = initialTab === 'user-master' ? 'users' :
                           initialTab === 'user-groups' ? 'groups' : initialTab;
            setCurrentTab(mapped);
        }
        if (initialTargetId) {
            setTargetId(initialTargetId);
        }
    }, [initialTab, initialTargetId]);

    const handleInternalNavigate = (sec, params) => {
        if (params?.userId) setTargetId(params.userId);
        if (params?.groupId) setTargetId(params.groupId);

        const targetTab = sec === 'user-permissions' ? 'user-permissions' :
                          sec === 'group-permissions' ? 'group-permissions' :
                          sec === 'user-groups' || sec === 'groups' ? 'groups' : 'users';

        setCurrentTab(targetTab);
        if (onNavigate) {
            onNavigate(sec, params);
        }
    };

    return (
        <div className="h-full flex-1 flex flex-col min-h-0 overflow-hidden space-y-3 max-w-[1600px] mx-auto w-full">
            {/* Top Sub-Navigation Tabs */}
            <div className="shrink-0 flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2.5">
                <AnimatedTabs
                    tabs={RBAC_TABS}
                    activeTab={currentTab}
                    onChange={(id) => {
                        setCurrentTab(id);
                        if (onNavigate) {
                            const sec = id === 'users' ? 'users' :
                                        id === 'groups' ? 'user-groups' : id;
                            onNavigate(sec);
                        }
                    }}
                    layoutId="clientRbacSuiteTab"
                />
            </div>

            {/* Active Content */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {currentTab === 'users' && (
                    <ClientUserMasterPage onNavigate={handleInternalNavigate} />
                )}

                {currentTab === 'groups' && (
                    <ClientGroupMasterPage onNavigate={handleInternalNavigate} />
                )}

                {currentTab === 'group-permissions' && (
                    <ClientGroupPermissionsPage initialGroupId={targetId} />
                )}

                {currentTab === 'user-permissions' && (
                    <ClientUserPermissionsPage initialUserId={targetId} />
                )}
            </div>
        </div>
    );
};

export default ClientRbacSuite;

