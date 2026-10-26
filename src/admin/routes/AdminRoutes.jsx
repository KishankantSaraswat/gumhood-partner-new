import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminLoginPage from '../pages/Login/LoginPage';
import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage';

/**
 * Super Admin Protected Route Guard
 * Redirects unauthenticated users to /admin/login instead of rendering login in-place.
 */
export const AdminRouteGuard = ({ children }) => {
    const token = localStorage.getItem('gymshood_token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }
    return children ? children : <AdminDashboardPage />;
};

/**
 * Super Admin Login Route Guard
 * Prevents already authenticated admins from getting stuck on the login page.
 */
export const AdminLoginGuard = () => {
    const token = localStorage.getItem('gymshood_token');
    if (token) {
        return <Navigate to="/admin/dashboard" replace />;
    }
    return <AdminLoginPage />;
};

/**
 * Super Admin Portal Routing Module
 */
export const AdminRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<AdminLoginGuard />} />
            <Route 
                path="/dashboard" 
                element={
                    <AdminRouteGuard>
                        <AdminDashboardPage />
                    </AdminRouteGuard>
                } 
            />
            <Route 
                path="/*" 
                element={
                    <AdminRouteGuard>
                        <AdminDashboardPage />
                    </AdminRouteGuard>
                } 
            />
        </Routes>
    );
};

export default AdminRoutes;

