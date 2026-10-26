import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { ToastContainer } from '../common/components/Toast';
import CustomAlert from '../common/components/CustomAlert';

const AlertContext = createContext(null);

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [modalAlert, setModalAlert] = useState(null);

    // Remove toast by id
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Main show notification handler
    const showAlert = useCallback((options) => {
        if (!options) return;

        // Support string shorthand: showAlert("Changes saved")
        const normalized = typeof options === 'string'
            ? { message: options, type: 'info' }
            : { ...options };

        // If explicit modal flag is requested or custom interactive buttons are attached, show modal dialog
        if (normalized.modal || (normalized.primaryButton && normalized.primaryButton.onClick)) {
            setModalAlert(normalized);
            return;
        }

        // Default: Add modern Toast notification
        const id = normalized.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newToast = {
            id,
            title: normalized.title,
            message: normalized.message || normalized.text,
            type: normalized.type || 'info',
            duration: normalized.duration !== undefined ? normalized.duration : 4000,
            onClose: (toastId) => {
                if (normalized.onClose) normalized.onClose();
                removeToast(toastId);
            }
        };

        setToasts((prev) => {
            // Keep at most 4 active toasts stacked
            const next = [...prev, newToast];
            return next.length > 4 ? next.slice(next.length - 4) : next;
        });

        return id;
    }, [removeToast]);

    const hideAlert = useCallback((id) => {
        if (id) {
            removeToast(id);
        } else {
            setModalAlert(null);
            setToasts([]);
        }
    }, [removeToast]);

    // Convenience toast helpers
    const toast = useMemo(() => ({
        success: (message, title = 'Success', options = {}) =>
            showAlert({ ...options, message, title, type: 'success' }),
        error: (message, title = 'Error', options = {}) =>
            showAlert({ ...options, message, title, type: 'error' }),
        warning: (message, title = 'Attention', options = {}) =>
            showAlert({ ...options, message, title, type: 'warning' }),
        info: (message, title = 'Notification', options = {}) =>
            showAlert({ ...options, message, title, type: 'info' })
    }), [showAlert]);

    return (
        <AlertContext.Provider value={{ showAlert, showToast: showAlert, hideAlert, removeToast, toast }}>
            {children}

            {/* Non-intrusive Modern Toast Container */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Backward-compatible Modal fallback if explicitly requested */}
            {modalAlert && (
                <CustomAlert
                    {...modalAlert}
                    onClose={() => {
                        if (modalAlert.onClose) modalAlert.onClose();
                        setModalAlert(null);
                    }}
                />
            )}
        </AlertContext.Provider>
    );
};

export default AlertContext;
