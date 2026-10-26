import React from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

/**
 * Reusable Confirmation Dialog for SaaS applications
 * Adheres to frontend-architect rules (reusable, compact, accessible, zero inline styles)
 */
export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onClose,
  onCancel,
  title = 'Confirm',
  description,
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  variant,
  type = 'warning',
  confirmType,
  loading = false
}) {
  if (!isOpen) return null;

  const resolvedDescription = description || message || 'You are already Logged on another browser/device.\nDo you want to Log in here?';
  const resolvedVariant = variant || confirmType || type || 'warning';

  const handleCancel = () => {
    if (loading) return;
    if (onClose) onClose();
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (loading) return;
    if (onConfirm) {
      await onConfirm();
    }
    if (onClose) onClose();
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const isWarning = resolvedVariant === 'warning';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
    >
      <div
        className="w-full max-w-[420px] bg-white dark:bg-[#1a1f2e] rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-white/10 animate-scale-up relative text-left"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isWarning
                ? 'bg-[#fff5ee] text-[#ff6200]'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            {isWarning ? (
              <HelpCircle className="w-6 h-6 stroke-[2] text-[#ff6200]" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            )}
          </div>
          <div className="pr-4 pt-0.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
              {title}
            </h3>
            <div className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal whitespace-pre-line">
              {resolvedDescription}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="min-w-[96px] px-5 py-2.5 rounded-xl text-sm font-semibold text-[#334155] dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`min-w-[96px] px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all cursor-pointer disabled:opacity-60 ${
              isWarning
                ? 'bg-[#ff6200] hover:bg-[#e85800] active:scale-95 shadow-[#ff6200]/25'
                : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            }`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
