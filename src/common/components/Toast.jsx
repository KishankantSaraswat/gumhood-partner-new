import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Visual styling configuration for Toast types
 */
const TOAST_TYPES = {
    success: {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        bar: 'bg-emerald-500',
        ring: 'hover:border-emerald-500/40',
        icon: CheckCircle2,
        defaultTitle: 'Success'
    },
    error: {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        bar: 'bg-rose-500',
        ring: 'hover:border-rose-500/40',
        icon: XCircle,
        defaultTitle: 'Error'
    },
    warning: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        bar: 'bg-amber-500',
        ring: 'hover:border-amber-500/40',
        icon: AlertTriangle,
        defaultTitle: 'Attention'
    },
    info: {
        badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
        bar: 'bg-sky-500',
        ring: 'hover:border-sky-500/40',
        icon: Info,
        defaultTitle: 'Notification'
    }
};

/**
 * Individual Toast notification item with auto-dismiss and pause-on-hover
 */
export const ToastItem = ({
    id,
    title,
    message,
    type = 'info',
    duration = 4000,
    onClose
}) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const IconComponent = config.icon;
    const resolvedTitle = title || config.defaultTitle;

    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);
    const startTimeRef = useRef(Date.now());
    const remainingTimeRef = useRef(duration);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!duration || duration <= 0) return;

        let frameId;
        const tick = () => {
            if (!isPaused) {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = Math.max(0, remainingTimeRef.current - elapsed);
                const percent = (remaining / duration) * 100;
                setProgress(percent);

                if (remaining <= 0) {
                    onClose(id);
                    return;
                }
            }
            frameId = requestAnimationFrame(tick);
        };

        startTimeRef.current = Date.now();
        frameId = requestAnimationFrame(tick);

        return () => {
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [duration, isPaused, id, onClose]);

    const handleMouseEnter = () => {
        if (!duration) return;
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        if (!duration) return;
        startTimeRef.current = Date.now();
        setIsPaused(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -16, scale: 0.94, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 60, scale: 0.92, filter: 'blur(2px)' }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-4 shadow-xl shadow-slate-950/10 border border-slate-200/80 dark:border-slate-800/80 transition-colors ${config.ring}`}
            role="status"
            aria-live="polite"
        >
            <div className="flex items-start gap-3">
                {/* Status Icon Badge */}
                <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${config.badge}`}>
                    <IconComponent className="w-5 h-5" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                    {resolvedTitle && (
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {resolvedTitle}
                        </h4>
                    )}
                    {message && (
                        <p className="mt-1 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed break-words">
                            {message}
                        </p>
                    )}
                </div>

                {/* Dismiss Button */}
                <button
                    type="button"
                    onClick={() => onClose(id)}
                    className="shrink-0 -mr-1 -mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    aria-label="Dismiss toast"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Countdown Progress Bar */}
            {duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
                    <div
                        className={`h-full ${config.bar} transition-all duration-75`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </motion.div>
    );
};

/**
 * Toast Container positioned in the viewport
 */
export const ToastContainer = ({ toasts, onClose }) => {
    return (
        <aside
            aria-label="Notifications"
            className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </aside>
    );
};

export default ToastContainer;

