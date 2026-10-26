import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const CustomAlert = ({
    title,
    message,
    type = 'info',
    onClose,
    primaryButton = { text: 'OK', onClick: null },
    secondaryButton = null
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="w-10 h-10 text-emerald-500" />,
                    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
                    border: 'border-emerald-100 dark:border-emerald-900/50',
                    button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-10 h-10 text-rose-500" />,
                    bg: 'bg-rose-50 dark:bg-rose-950/40',
                    border: 'border-rose-100 dark:border-rose-900/50',
                    button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
                    bg: 'bg-amber-50 dark:bg-amber-950/40',
                    border: 'border-amber-100 dark:border-amber-900/50',
                    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                };
            default: // info
                return {
                    icon: <Info className="w-10 h-10 text-violet-500" />,
                    bg: 'bg-violet-50 dark:bg-violet-950/40',
                    border: 'border-violet-100 dark:border-violet-900/50',
                    button: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            <div className={`bg-white dark:bg-[#121622] w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative p-6 border border-slate-200 dark:border-white/10 transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label="Close alert"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-14 h-14 rounded-2xl ${styles.bg} flex items-center justify-center mb-4 border ${styles.border}`}>
                        {styles.icon}
                    </div>

                    {title && (
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                            {title}
                        </h3>
                    )}

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-2">
                        <button
                            onClick={() => {
                                if (primaryButton.onClick) primaryButton.onClick();
                                handleClose();
                            }}
                            className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer ${styles.button}`}
                        >
                            {primaryButton.text}
                        </button>

                        {secondaryButton && (
                            <button
                                onClick={() => {
                                    if (secondaryButton.onClick) secondaryButton.onClick();
                                    handleClose();
                                }}
                                className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-all border border-slate-200 dark:border-white/10 active:scale-95 cursor-pointer"
                            >
                                {secondaryButton.text}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomAlert;
