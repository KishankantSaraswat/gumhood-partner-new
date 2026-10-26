import React from 'react';
import { ClientLayout } from '@/client/components/ClientLayout';
import { ClientAnnouncementMasterPage } from './ClientAnnouncementMasterPage';

/**
 * Standalone Announcements Page wrapped in ClientLayout
 */
export const AnnouncementPage = () => {
    return (
        <ClientLayout activeRoute="/announcements" activeTitle="Member Announcements">
            <ClientAnnouncementMasterPage />
        </ClientLayout>
    );
};

export default AnnouncementPage;

