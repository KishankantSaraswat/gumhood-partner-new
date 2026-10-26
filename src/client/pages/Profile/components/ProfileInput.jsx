import React from 'react';
import { AlertCircle } from 'lucide-react';
import { SearchableSelect } from '../../../../common';

export const ProfileInput = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon: IconComponent,
    error,
    required = false,
    disabled = false,
    maxLength,
    helperText,
    as = 'input',
    rows = 3,
    options = [],
    className = '',
    inputClassName = '',
    ...props
}) => {
    const isError = !!error;

    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label 
                        htmlFor={name}
                        className="block text-xs font-bold text-slate-700 dark:text-slate-300"
                    >
                        {label} {required && <span className="text-rose-500 font-bold">*</span>}
                    </label>
                    {helperText && !isError && (
                        <span className="text-[10px] text-slate-400 font-medium">
                            {helperText}
                        </span>
                    )}
                </div>
            )}

            <div className={`relative flex items-center rounded-xl bg-white dark:bg-white/5 border transition-all shadow-2xs group ${
 isError 
 ? 'border-rose-500 ring-1 ring-rose-500/20' 
 : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
 } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-white/5' : ''}`}>
                {IconComponent && (
                    <div className="pl-3 pr-1 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors shrink-0">
                        <IconComponent className="w-3.5 h-3.5" />
                    </div>
                )}

                {as === 'textarea' ? (
                    <textarea
                        id={name}
                        name={name}
                        rows={rows}
                        value={value ?? ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        className={`w-full p-2.5 bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none leading-relaxed ${inputClassName}`}
                        {...props}
                    />
                ) : as === 'select' ? (
                    <SearchableSelect
                        options={options}
                        value={value ?? ''}
                        onChange={(val) => {
                            if (onChange) {
                                onChange({
                                    target: {
                                        name,
                                        value: val
                                    }
                                });
                            }
                        }}
                        disabled={disabled}
                        placeholder={placeholder || 'Select...'}
                        className={`w-full border-0 shadow-none !bg-transparent ${inputClassName}`}
                        disablePortal={false}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value ?? ''}
                        onChange={onChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        maxLength={maxLength}
                        className={`w-full h-9 px-3 bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 outline-none ${
 IconComponent ? 'pl-1.5' : ''
 } ${inputClassName}`}
                        {...props}
                    />
                )}

                {isError && (
                    <div className="pr-3 text-rose-500 shrink-0">
                        <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            {isError && (
                <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 animate-fade-in pl-0.5">
                    <span>{error}</span>
                </p>
            )}

            {as === 'textarea' && maxLength && (
                <div className="text-right text-[10px] text-slate-400 font-mono pr-1">
                    {(value || '').length}/{maxLength}
                </div>
            )}
        </div>
    );
};

export default ProfileInput;

