import React from 'react';
import { ClientLayout } from '@/client/components/ClientLayout';
import { ClientTransactionMasterPage } from './ClientTransactionMasterPage';

/**
 * Standalone Transaction History Page wrapped in ClientLayout
 */
export const TransactionPage = () => {
    return (
        <ClientLayout activeRoute="/payment-history" activeTitle="Transaction History">
            <ClientTransactionMasterPage />
        </ClientLayout>
    );
};

export default TransactionPage;

