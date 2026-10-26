# Tab-Based Forms Blueprint

Tab-based forms are essential for complex enterprise applications where entities have dozens of fields (e.g. Basic Details, Pricing, Tax & Accounts, Contact Information, Configurations, Permissions). Splitting a large form across tabs reduces cognitive overload, organizes related domain attributes, and provides a polished user experience.

---

## 1. Architectural Principles

1. **Single Source of Truth (Unified Form State)**:
   - Keep the entire form state in a single state object (or React Hook Form) in the parent component.
   - Do NOT maintain disconnected states in separate tab subcomponents; passing `formData` and `setFormData` (or form methods) ensures that switching tabs never loses unsubmitted edits.

2. **Cross-Tab Validation & Auto-Focus**:
   - When the user clicks **Save / Submit**, run validation across **ALL** tabs simultaneously.
   - If validation errors occur, identify the **first tab that contains an error** and automatically switch `activeTab` to that tab.
   - Render a red badge or error dot on any tab that has validation failures.

3. **Active Tab Indicator Animation**:
   - Use Framer Motion's `layoutId` pill indicator (`<motion.div layoutId="form-tab-pill" />`) to provide fluid, high-end tab switching.

4. **Structured Fieldsets & Legends**:
   - Group fields inside `<fieldset className="form-fieldset">` with `<legend className="form-legend">`.
   - Use standard compact grids: `form-grid-6` (or `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3`).

---

## 2. Complete Tab-Based Form Pattern

Here is the standard, production-tested implementation template:

```tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { CustomDatePicker } from "@/components/common/CustomDatePicker";
import { FormFooter } from "@/components/common/FormFooter";
import { sanitizeText, sanitizeNumber, handleNumberKeyDown } from "@/utils/inputFormatters";

interface TabItem {
  id: string;
  label: string;
}

const TABS: TabItem[] = [
  { id: "basic", label: "Basic Details" },
  { id: "accounts", label: "Accounts & Tax" },
  { id: "config", label: "Configuration" },
];

export function MachineTabbedForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  // 1. Unified Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    brand_id: initialData?.brand_id || "",
    tax_category_id: initialData?.tax_category_id || "",
    ledger_id: initialData?.ledger_id || "",
    callback_timeout: initialData?.callback_timeout || "30",
    is_active: initialData?.is_active ?? true,
    govt_push_enabled: initialData?.govt_push_enabled ?? false,
  });

  // 2. Tab Error Map Calculation
  const tabErrors: Record<string, boolean> = {
    basic: !formData.name || !formData.code || !formData.brand_id,
    accounts: !formData.ledger_id,
    config: formData.govt_push_enabled && !formData.callback_timeout,
  };

  const hasAnyErrors = Object.values(tabErrors).some(Boolean);

  // 3. Submit Handler with Auto-Switching
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (hasAnyErrors) {
      // Find first tab with error and jump to it
      const firstErrorTab = TABS.find((tab) => tabErrors[tab.id])?.id;
      if (firstErrorTab) {
        setActiveTab(firstErrorTab);
      }
      toast.error("Please fill in all required fields before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        callback_timeout: Number(formData.callback_timeout),
      };

      // Call API Service
      // await entityService.save(payload);
      toast.success("Saved successfully!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="common-surface p-4 flex flex-col gap-4">
      {/* ── Tab Header with Framer Motion Pill ── */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 w-max">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const hasError = showErrors && tabErrors[tab.id];

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                isActive ? "text-primary font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="tabbed-form-active-pill"
                  className="absolute inset-0 bg-white rounded-lg shadow-xs border border-slate-200/90 z-[-1]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span>{tab.label}</span>
              {hasError && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Form Body ── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tab 1: Basic Details */}
        {activeTab === "basic" && (
          <fieldset className="form-fieldset space-y-3">
            <legend className="form-legend">Basic Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="form-label">
                  Entity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: sanitizeText(e.target.value) })
                  }
                />
                <p
                  className={`text-red-500 text-[11px] ${
                    showErrors && !formData.name ? "visible" : "invisible"
                  }`}
                >
                  Entity Name is required
                </p>
              </div>

              <div className="space-y-1">
                <label className="form-label">
                  Entity Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. ENT-001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: sanitizeText(e.target.value) })
                  }
                />
                <p
                  className={`text-red-500 text-[11px] ${
                    showErrors && !formData.code ? "visible" : "invisible"
                  }`}
                >
                  Entity Code is required
                </p>
              </div>
            </div>
          </fieldset>
        )}

        {/* Tab 2: Accounts & Tax */}
        {activeTab === "accounts" && (
          <fieldset className="form-fieldset space-y-3">
            <legend className="form-legend">Financial & Tax Accounting</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="form-label">
                  Ledger Account <span className="text-danger">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: "1", label: "General Sales A/C" },
                    { value: "2", label: "Inventory Purchase A/C" },
                  ]}
                  value={formData.ledger_id}
                  onChange={(val) => setFormData({ ...formData, ledger_id: val })}
                  placeholder="Select Ledger"
                />
                <p
                  className={`text-red-500 text-[11px] ${
                    showErrors && !formData.ledger_id ? "visible" : "invisible"
                  }`}
                >
                  Ledger is required
                </p>
              </div>
            </div>
          </fieldset>
        )}

        {/* Tab 3: Configuration */}
        {activeTab === "config" && (
          <fieldset className="form-fieldset space-y-3">
            <legend className="form-legend">System Integration</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="form-label">Timeout (Seconds)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  onKeyDown={handleNumberKeyDown}
                  className="input w-full"
                  value={formData.callback_timeout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      callback_timeout: sanitizeNumber(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </fieldset>
        )}

        {/* ── Form Footer: Actions & Tab Traversal ── */}
        <FormFooter
          loading={submitting}
          onCancel={onCancel}
          submitLabel={initialData ? "Update" : "Save"}
          extraActions={
            <div className="flex items-center gap-2">
              {activeTab !== TABS[0].id && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
                    setActiveTab(TABS[currentIndex - 1].id);
                  }}
                  className="btn-secondary"
                >
                  Previous
                </button>
              )}
              {activeTab !== TABS[TABS.length - 1].id && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = TABS.findIndex((t) => t.id === activeTab);
                    setActiveTab(TABS[currentIndex + 1].id);
                  }}
                  className="btn-primary"
                >
                  Next
                </button>
              )}
            </div>
          }
        />
      </form>
    </div>
  );
}
```

---

## 3. Best Practices Checklist for Forms

- [ ] **Tab Preservation**: Form values in unvisited or inactive tabs remain intact when switching back and forth.
- [ ] **Clean Layout**: Compact labels, `form-label` class, `text-danger` for asterisks `*`.
- [ ] **Error Visibility**: When errors are triggered, tabs with invalid inputs highlight an indicator dot or badge.
- [ ] **Sanitized Inputs**: All text inputs sanitize strings (`sanitizeText`), numeric inputs restrict keys (`handleNumberKeyDown`), and dates normalize to `YYYY-MM-DD`.
- [ ] **Submitting State**: Disable all buttons, show `Loader2` spinner on submit, and block duplicate clicks.

