import React from 'react';
import { ClientLayout } from '@/client/components/ClientLayout';
import { ClientMemberMasterPage } from './ClientMemberMasterPage';

/**
 * Standalone Members Page wrapped in ClientLayout
 */
export const MemberPage = () => {
    return (
        <ClientLayout activeRoute="/active-members" activeTitle="Facility Member Directory">
            <ClientMemberMasterPage />
        </ClientLayout>
    );
};

export default MemberPage;

