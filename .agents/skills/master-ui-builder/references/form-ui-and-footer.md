# Master Form UI, Tabs & FormFooter Standards

Every Master Form in the application adheres to compact, high-density layouts, optional inner section tabs, strict field validation, and a standardized **FormFooter** with audit metadata, keyboard shortcuts, and permission enforcement.

---

## 1. Master Form Layout Structure

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Form Body (overflow-y-auto flex-1 p-5)                                 │
│                                                                        │
│  ┌─ Optional Inner Section Tabs (AnimatedTabs / Sub-tabs) ──────────┐  │
│  │  [General Info]   [Accounting & Tax]   [Configurations]          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─ Fieldset: General Information (form-fieldset) ───────────────────┐  │
│  │  <legend className="form-legend">Basic Attributes</legend>        │  │
│  │                                                                   │  │
│  │  Grid: 6 Columns (form-grid-6)                                    │  │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────┐    │  │
│  │  │ Code *       │ Name *       │ Category *   │ Status Pill  │    │  │
│  │  │ [INPUT]      │ [INPUT]      │ [SELECT]     │ [CHECKBOX]   │    │  │
│  │  │ Error msg    │ Error msg    │ Error msg    │              │    │  │
│  │  └──────────────┴──────────────┴──────────────┴──────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│ FormFooter (Sticky Bottom Bar)                                         │
│ ├─ Left: Created By: John (12 Oct) │ Updated By: Admin (14 Oct)        │
│ └─ Right: [Cancel (Esc)]  [Save / Update (Permission Guarded)]         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Standard Master Form Component Template

```tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FormFooter } from "@/components/common/FormFooter";
import { sanitizeText, sanitizeNumber, handleNumberKeyDown } from "@/utils/inputFormatters";

interface MasterEntityFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MasterEntityForm({
  initialData,
  onSuccess,
  onCancel,
}: MasterEntityFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    name: initialData?.name || "",
    category_id: initialData?.category_id ? String(initialData.category_id) : "",
    rate: initialData?.rate !== undefined ? String(initialData.rate) : "",
    status: initialData ? initialData.status !== false : true,
  });

  const isEditing = Boolean(initialData?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!formData.code.trim() || !formData.name.trim() || !formData.category_id) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        category_id: Number(formData.category_id),
        rate: formData.rate ? Number(formData.rate) : 0,
        status: formData.status,
      };

      if (isEditing) {
        await api.put(`/admin/entity-master/${initialData.id}`, payload);
        toast.success("Record updated successfully");
      } else {
        await api.post("/admin/entity-master", payload);
        toast.success("Record created successfully");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="common-surface flex flex-col min-h-0 flex-1 overflow-hidden shadow-sm">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0" autoComplete="off">
        {/* ── Scrollable Form Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <fieldset className="form-fieldset space-y-4">
            <legend className="form-legend">General Details</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-2">
              {/* Code */}
              <div className="space-y-1">
                <label className="form-label">
                  Entity Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. COD-001"
                  maxLength={30}
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: sanitizeText(e.target.value) })
                  }
                />
                <p className={`text-red-500 text-[11px] ${showErrors && !formData.code ? "visible" : "invisible"}`}>
                  Code is required
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1 lg:col-span-2">
                <label className="form-label">
                  Entity Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Primary Vendor Unit"
                  maxLength={100}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: sanitizeText(e.target.value) })
                  }
                />
                <p className={`text-red-500 text-[11px] ${showErrors && !formData.name ? "visible" : "invisible"}`}>
                  Name is required
                </p>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1">
                <label className="form-label">
                  Category <span className="text-danger">*</span>
                </label>
                <SearchableSelect
                  options={[
                    { value: "1", label: "Retail" },
                    { value: "2", label: "Wholesale" },
                  ]}
                  value={formData.category_id}
                  onChange={(val) => setFormData({ ...formData, category_id: val })}
                  placeholder="Select Category"
                />
                <p className={`text-red-500 text-[11px] ${showErrors && !formData.category_id ? "visible" : "invisible"}`}>
                  Category is required
                </p>
              </div>

              {/* Rate */}
              <div className="space-y-1">
                <label className="form-label">Default Rate</label>
                <input
                  type="text"
                  inputMode="numeric"
                  onKeyDown={handleNumberKeyDown}
                  className="input w-full text-right"
                  placeholder="0.00"
                  value={formData.rate}
                  onChange={(e) =>
                    setFormData({ ...formData, rate: sanitizeNumber(e.target.value) })
                  }
                />
              </div>

              {/* Status Toggle */}
              <div className="space-y-1 flex flex-col justify-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="form-checkbox text-primary h-4 w-4 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-800">Active</span>
                </label>
              </div>
            </div>
          </fieldset>
        </div>

        {/* ── Standard Sticky FormFooter ── */}
        <FormFooter
          onCancel={onCancel}
          isEditing={isEditing}
          isSubmitting={submitting}
          submitLabel={isEditing ? "Update" : "Save"}
          cancelLabel="Cancel"
          createdBy={initialData?.created_by_name || initialData?.cr_usr}
          createdAt={initialData?.created_at}
          updatedBy={initialData?.updated_by_name || initialData?.md_usr}
          updatedAt={initialData?.updated_at}
        />
      </form>
    </div>
  );
}
```

---

## 3. FormFooter Component Specification

The common `FormFooter` component handles button actions, keyboard shortcuts, and audit information:

- **Audit Metadata (Left)**:
  - If editing, displays `Created by [User] ([Date])` and `Updated by [User] ([Date])`.
  - Stays hidden during new record creation.
- **Escape Key Listener**:
  - Automatically captures the `Esc` key to trigger `onCancel()`, unless an open input or modal is active.
- **Cancel Button**:
  - Displays left arrow icon (`MoveLeft`) and customizable label (`Cancel` or `List`).
- **Save / Update Button**:
  - Wrapped inside `<PermissionGuard action={isEditing ? 'edit' : 'add'}>`.
  - Disables itself and changes text to `Processing...` while `isSubmitting === true` to prevent double-clicks.

