/**
 * Universal Input Sanitization and Formatting Utilities
 * Standardized across all Master forms and inputs.
 */

/**
 * Strips leading whitespace while allowing single spaces between words.
 * Trims excessive whitespace.
 */
export const sanitizeText = (val) => {
    if (typeof val !== 'string') return '';
    return val.replace(/^\s+/, '');
};

/**
 * Sanitizes numeric input, keeping only digits and optionally a single decimal point.
 */
export const sanitizeNumber = (val, allowDecimal = true) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (allowDecimal) {
        // Keep digits and at most one decimal point
        const parts = str.replace(/[^\d.]/g, '').split('.');
        if (parts.length > 2) {
            return `${parts[0]}.${parts.slice(1).join('')}`;
        }
        return parts.join('.');
    }
    return str.replace(/\D/g, '');
};

/**
 * Prevents non-numeric key strokes in number-only inputs.
 * Allows backspace, delete, tab, arrows, copy/paste, and '.' if decimals are allowed.
 */
export const handleNumberKeyDown = (e, allowDecimal = true) => {
    // Navigation and control keys
    if (
        ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key) ||
        (e.ctrlKey || e.metaKey) // Allow copy/paste/select-all
    ) {
        return;
    }

    if (allowDecimal && e.key === '.') {
        // Disallow if decimal already exists
        if (e.target.value.includes('.')) {
            e.preventDefault();
        }
        return;
    }

    // Block anything that isn't a digit 0-9
    if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
    }
};

