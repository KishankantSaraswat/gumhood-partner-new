import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const CustomAlert = ({
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
                    icon: <CheckCircle2 className="w-12 h-12 text-emerald-500" />,
                    bg: 'bg-emerald-50',
                    border: 'border-emerald-100',
                    button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'
                };
            case 'error':
                return {
                    icon: <XCircle className="w-12 h-12 text-rose-500" />,
                    bg: 'bg-rose-50',
                    border: 'border-rose-100',
                    button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
                    bg: 'bg-amber-50',
                    border: 'border-amber-100',
                    button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                };
            default: // info
                return {
                    icon: <Info className="w-12 h-12 text-violet-500" />,
                    bg: 'bg-violet-50',
                    border: 'border-violet-100',
                    button: 'bg-violet-600 hover:bg-violet-700 shadow-violet-100'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={handleClose}
            ></div>

            <div className={`bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative p-8 border border-slate-100 transition-all duration-300 transform ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-all text-slate-400"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl ${styles.bg} flex items-center justify-center mb-6 shadow-inner border ${styles.border}`}>
                        {styles.icon}
                    </div>

                    {title && (
                        <h3 className="text-xl font-black text-slate-900 mb-2 leading-tight">
                            {title}
                        </h3>
                    )}

                    <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => {
                                if (primaryButton.onClick) primaryButton.onClick();
                                handleClose();
                            }}
                            className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95 ${styles.button}`}
                        >
                            {primaryButton.text}
                        </button>

                        {secondaryButton && (
                            <button
                                onClick={() => {
                                    if (secondaryButton.onClick) secondaryButton.onClick();
                                    handleClose();
                                }}
                                className="w-full py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100 active:scale-95"
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
