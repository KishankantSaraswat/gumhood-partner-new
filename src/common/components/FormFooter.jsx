import React, { useEffect } from 'react';
import { Loader2, X, Check, Save, ArrowLeft } from 'lucide-react';
import { PermissionGuard } from './PermissionGuard';

/**
 * FormFooter - Separate sticky/fixed bottom action bar for Master forms
 * Matches the reference design (e.g. Runwaybites / Master CRUD forms):
 * Displays audit metadata on left and [<- List / Cancel] and [Save / Update] pills on the right.
 *
 * @param {() => void} onCancel
 * @param {() => void} [onSubmit]
 * @param {() => void} [onSave] - Alias for onSubmit
 * @param {boolean} [submitting=false]
 * @param {boolean} [isSubmitting=false] - Alias for submitting
 * @param {boolean} [isEditing=false]
 * @param {boolean} [isEdit=false] - Alias for isEditing
 * @param {string} [submitText]
 * @param {string} [saveLabel] - Label when creating
 * @param {string} [updateLabel] - Label when updating
 * @param {string} [cancelText]
 * @param {{by?: string, at?: string}} [createdInfo]
 * @param {{by?: string, at?: string}} [updatedInfo]
 * @param {string} [permission]
 * @param {string} [className='']
 */
export const FormFooter = ({
    onCancel,
    onSubmit,
    onSave,
    submitting = false,
    isSubmitting = false,
    isEditing = false,
    isEdit = false,
    submitText,
    saveLabel,
    updateLabel,
    cancelText,
    createdInfo,
    updatedInfo,
    permission,
    className = ''
}) => {
    const isBusy = submitting || isSubmitting;
    const editing = isEditing || isEdit;
    const handleAction = onSubmit || onSave;

    // Listen for Escape key to trigger cancel
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onCancel && !isBusy) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel, isBusy]);

    const resolvedSubmitText = submitText || (editing ? (updateLabel || 'Update') : (saveLabel || 'Save'));
    const resolvedCancelText = cancelText || (editing ? 'Cancel' : 'LIST');

    const submitButton = (
        <button
            type={handleAction ? "button" : "submit"}
            onClick={handleAction}
            disabled={isBusy}
            className="btn-theme-primary inline-flex items-center justify-center gap-1.5 px-6 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all duration-150 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
                background: 'var(--gradient-primary, var(--app-primary))',
                boxShadow: 'var(--shadow-primary)'
            }}
        >
            {isBusy ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                </>
            ) : (
                <span>{resolvedSubmitText}</span>
            )}
        </button>
    );

    return (
        <div className={`w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-white dark:bg-[#121622] border border-slate-200/90 dark:border-white/10 rounded-2xl shadow-xs transition-colors ${className}`}>
            {/* Left: Audit Trail / Status */}
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                {editing ? (
                    <>
                        {createdInfo?.by && (
                            <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Created by: </span>
                                <span>{createdInfo.by}</span>
                                {createdInfo.at && <span className="ml-1 opacity-75">({createdInfo.at})</span>}
                            </div>
                        )}
                        {updatedInfo?.by && (
                            <div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Updated by: </span>
                                <span>{updatedInfo.by}</span>
                                {updatedInfo.at && <span className="ml-1 opacity-75">({updatedInfo.at})</span>}
                            </div>
                        )}
                        {!createdInfo?.by && !updatedInfo?.by && (
                            <span className="italic text-slate-400">Editing existing record</span>
                        )}
                    </>
                ) : (
                    <span className="italic text-slate-400 dark:text-slate-500">Creating new record</span>
                )}
            </div>

            {/* Right: Cancel / List Button & Primary Save Button */}
            <div className="flex items-center gap-2.5">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                        title="Back to List (Esc)"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>{resolvedCancelText}</span>
                    </button>
                )}

                {permission ? (
                    <PermissionGuard permission={permission} fallback={<span className="text-xs text-rose-500 italic">No save permission</span>}>
                        {submitButton}
                    </PermissionGuard>
                ) : (
                    submitButton
                )}
            </div>
        </div>
    );
};

export default FormFooter;

