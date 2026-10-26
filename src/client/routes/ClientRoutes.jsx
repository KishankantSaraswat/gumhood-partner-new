import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import SignupPage from '../pages/Signup/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPassword/ResetPasswordPage';
import HomePage from '../pages/Public/HomePage';
import PartnerPage from '../pages/Public/PartnerPage';
import PrivacyPolicyPage from '../pages/Public/PrivacyPolicyPage';
import ProfilePage from '../pages/Profile/ProfilePage';

/**
 * Client Portal & Partner Route Guard
 */
export const ClientRouteGuard = ({ children }) => {
    const token = localStorage.getItem('gymshood_token');
    const role = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    let userRole = '';
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        userRole = user.role || user.role_name || '';
    } catch (_) {}

    const isAdmin = role?.toLowerCase() === 'admin' || role?.toLowerCase() === 'super_admin' || 
                    userRole?.toLowerCase() === 'admin' || userRole?.toLowerCase() === 'super_admin';

    if (isAdmin) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    return children;
};

/**
 * Client Portal Routing Module
 */
export const ClientRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route 
                path="/dashboard" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/dashboard/*" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/users" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/user-master" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/user-groups" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/group-permissions" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/user-permissions" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/profile" 
                element={
                    <ClientRouteGuard>
                        <ProfilePage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/plans" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/revenue" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/cash-payments" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/enrollment-requests" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/enrollments" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/client-members" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/member-master" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/active-members" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/members" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/expiring-soon" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/announcements" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/payment-history" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/transactions" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route 
                path="/users-and-roles" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
            <Route path="/home" element={<HomePage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route 
                path="/*" 
                element={
                    <ClientRouteGuard>
                        <DashboardPage />
                    </ClientRouteGuard>
                } 
            />
        </Routes>
    );
};

export default ClientRoutes;

