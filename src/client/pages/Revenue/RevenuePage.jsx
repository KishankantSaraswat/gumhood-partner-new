import React from 'react';
import { ClientLayout } from '@/client/components/ClientLayout';
import { ClientRevenueMasterPage } from './ClientRevenueMasterPage';

/**
 * Standalone Revenue Analytics Page wrapped in ClientLayout
 */
export const RevenuePage = () => {
    return (
        <ClientLayout activeRoute="/revenue" activeTitle="Revenue Analytics & Intelligence">
            <ClientRevenueMasterPage />
        </ClientLayout>
    );
};

export default RevenuePage;

