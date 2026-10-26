import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, X } from "lucide-react";

/**
 * Common SearchableSelect Dropdown Component
 * 
 * Supports:
 * - Real-time filtering / fuzzy search
 * - Keyboard navigation (Up/Down arrows, Enter to select, Escape to close)
 * - Portal rendering with viewport collision detection
 * - Clearable selection
 * - Form validation (hidden native input for HTML5 required)
 * - Dark mode & SaaS theme integration
 */
export function SearchableSelect({
  options = [],
  value = "",
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  className = "",
  required = false,
  disabled = false,
  name,
  onClick,
  onFocus,
  onEnter,
  accentColor = "orange",
  disablePortal = false,
  isClearable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownStyles, setDropdownStyles] = useState({});
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize options into { value, label } format
  const normalizedOptions = useMemo(() => {
    return (options || []).map((opt) => {
      if (typeof opt === "object" && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.id,
          label: opt.label !== undefined ? opt.label : (opt.name || opt.title || String(opt.value || "")),
          ...opt,
        };
      }
      return {
        value: opt,
        label: String(opt),
      };
    });
  }, [options]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic dropdown positioning with viewport detection (above / below)
  const calculatePosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const dropdownHeight = 260; // Max expected height
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldFlip = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

    if (disablePortal) {
      setDropdownStyles({
        position: "absolute",
        top: shouldFlip ? "auto" : "calc(100% + 4px)",
        bottom: shouldFlip ? "calc(100% + 4px)" : "auto",
        left: 0,
        width: "100%",
        zIndex: 99999,
      });
    } else {
      setDropdownStyles({
        position: "fixed",
        top: shouldFlip ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
  };

  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      calculatePosition();
      const handleScrollResize = () => calculatePosition();
      window.addEventListener("scroll", handleScrollResize, true);
      window.addEventListener("resize", handleScrollResize);
      return () => {
        window.removeEventListener("scroll", handleScrollResize, true);
        window.removeEventListener("resize", handleScrollResize);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    setFocusedIndex(-1);
  }, [search, isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 30);
    }
  }, [isOpen]);

  const filteredOptions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return normalizedOptions;
    return normalizedOptions.filter((opt) =>
      String(opt.label || "").toLowerCase().includes(term)
    );
  }, [normalizedOptions, search]);

  const selectedOption = useMemo(() => {
    return normalizedOptions.find(
      (opt) => String(opt.value) === String(value)
    );
  }, [normalizedOptions, value]);

  const openDropdown = () => {
    if (disabled) return;
    calculatePosition();
    setIsOpen(true);
    setSearch("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      openDropdown();
    }
  };

  const handleSelect = (val) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
    toggleRef.current?.focus();
    if (onEnter) {
      setTimeout(() => wrapperRef.current?.closest("form")?.requestSubmit(), 0);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange("");
    }
  };

  const getToggleBorderClass = () => {
    if (!isOpen) {
      return "border-slate-300 dark:border-white/10 hover:border-slate-400 dark:hover:border-white/20 shadow-xs";
    }
    return "ring-2 theme-input";
  };

  const getSelectedTextClass = () => {
    if (!selectedOption) {
      return "text-slate-500 dark:text-slate-400 truncate font-normal";
    }
    return "text-slate-800 dark:text-slate-100 font-semibold truncate";
  };

  const getChevronClass = () => {
    return `w-4 h-4 transition-transform flex-shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`;
  };

  const getItemClass = (isSelected, isFocused) => {
    if (isSelected) {
      return "font-semibold";
    }
    if (isFocused) {
      return "bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-medium";
    }
    return "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 font-normal";
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div
        ref={toggleRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full min-h-[34px] px-3 py-1.5 rounded-xl border bg-white dark:bg-[#161a26] cursor-pointer flex justify-between items-center transition-all text-xs font-sans select-none ${
          disabled
            ? "opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#10131d] text-slate-500"
            : ""
        } ${getToggleBorderClass()}`}
        style={isOpen ? { borderColor: 'var(--app-primary)', boxShadow: '0 0 0 2px var(--color-primary-glow)' } : {}}
        onClick={() => {
          if (onClick) onClick();
          toggleDropdown();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) {
              if (onClick) onClick();
              toggleDropdown();
            }
          } else if (e.key === "ArrowDown" && !disabled) {
            e.preventDefault();
            if (!isOpen) {
              if (onClick) onClick();
              openDropdown();
            }
          }
        }}
        onFocus={onFocus}
      >
        <span
          className={getSelectedTextClass()}
          title={selectedOption ? String(selectedOption.label) : placeholder}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {isClearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e);
                }
              }}
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={getChevronClass()} />
        </div>
      </div>

      {/* Hidden input for form requirement / validation */}
      {required && (
        <input
          type="text"
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          value={value || ""}
          required={required}
          name={name}
          onChange={() => {}}
          tabIndex={-1}
        />
      )}

      {mounted && isOpen && (() => {
        const dropdownNode = (
          <div
            ref={menuRef}
            style={dropdownStyles}
            className="font-sans text-xs bg-white dark:bg-[#1a1f2e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-64 flex flex-col overflow-hidden pointer-events-auto z-[99999] animate-scale-up"
          >
            {/* Search Input Field */}
            <div className="p-2 border-b border-slate-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1f2e] z-10">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-500 outline-none theme-input transition-all font-medium"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setFocusedIndex((prev) =>
                        prev < filteredOptions.length - 1 ? prev + 1 : prev
                      );
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                    } else if (e.key === "Enter") {
                      e.preventDefault();
                      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
                        const opt = filteredOptions[focusedIndex];
                        handleSelect(String(opt.value));
                      } else if (filteredOptions.length === 1) {
                        handleSelect(String(filteredOptions[0].value));
                      } else if (onEnter) {
                        setIsOpen(false);
                        wrapperRef.current?.closest("form")?.requestSubmit();
                      }
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      setIsOpen(false);
                      toggleRef.current?.focus();
                    }
                  }}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto flex-1 p-1 max-h-48 custom-scrollbar">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(value);
                  const isFocused = focusedIndex === idx;
                  return (
                    <div
                      key={opt.value ?? idx}
                      className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between transition-colors ${getItemClass(
                        isSelected,
                        isFocused
                      )}`}
                      style={isSelected ? { backgroundColor: 'var(--color-primary-light)', color: 'var(--app-primary)' } : {}}
                      onClick={() => handleSelect(String(opt.value))}
                      onMouseEnter={() => setFocusedIndex(idx)}
                    >
                      <span className="truncate pr-2" title={String(opt.label)}>
                        {opt.label}
                      </span>
                      {isSelected && (
                        <Check
                          className="w-3.5 h-3.5 shrink-0"
                          style={{ color: 'var(--app-primary)' }}
                        />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 text-center font-normal">
                  No results found.
                </div>
              )}
            </div>
          </div>
        );

        return disablePortal
          ? dropdownNode
          : createPortal(dropdownNode, document.body);
      })()}
    </div>
  );
}

export default SearchableSelect;
