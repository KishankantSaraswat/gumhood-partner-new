import React from 'react';
import { ClientLayout } from '../../components/ClientLayout';
import { Profile } from './index';

export const ProfilePage = () => {
    return (
        <ClientLayout activeRoute="/profile" activeTitle="Facility Profile & Settings">
            <Profile />
        </ClientLayout>
    );
};

export default ProfilePage;

