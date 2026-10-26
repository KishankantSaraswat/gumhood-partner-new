import React from 'react';
import { ClientRevenueMasterPage } from '../Revenue/ClientRevenueMasterPage';

/**
 * Backward compatibility wrapper delegating directly to the upgraded ClientRevenueMasterPage
 */
export const RevenueSection = ({ gym }) => {
    return <ClientRevenueMasterPage gym={gym} />;
};

export default RevenueSection;
