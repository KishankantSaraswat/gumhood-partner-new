import React from 'react';
import { ClientLayout } from '@/client/components/ClientLayout';
import { ClientEnrollmentMasterPage } from './ClientEnrollmentMasterPage';

/**
 * Standalone Enrollment Requests Page wrapped in ClientLayout
 */
export const EnrollmentPage = () => {
    return (
        <ClientLayout activeRoute="/cash-payments" activeTitle="Enrollment & Cash Requests">
            <ClientEnrollmentMasterPage />
        </ClientLayout>
    );
};

export default EnrollmentPage;

