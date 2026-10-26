# Menu Master Management UI Blueprint

The Menu Master (`client_menu_master`) defines the system's structural skeleton: navigation categories, sub-menus, route URLs, security slugs (`master_name`), and presentation icons.

---

## 1. Schema & Attribute Matrix

| Field | Type | Description |
| :--- | :--- | :--- |
| **`menu_name`** | `string` | Display label in sidebar and header (e.g. `Purchase Invoices`). |
| **`menu_url`** | `string` | Next.js frontend route (e.g. `/admin/inventory/purchase-invoice`). |
| **`master_name`**| `string` | Unique identifier slug for permission checks (e.g. `purchase_invoice_master`). |
| **`parent_menu_id`**| `string \| null` | Self-referencing FK. Empty for top-level root modules. |
| **`section_name`** | `string` | Grouping header in the sidebar (e.g. `Inventory Management`). |
| **`section_priority`** | `number` | Ordering weight of the section header. |
| **`priority`** | `number` | Ordering weight of the menu item within its section. |
| **`icon`** | `string` | Lucide icon name (e.g. `ShoppingBag`, `Boxes`, `FileText`). |
| **`app_menu`** | `boolean` | Flag indicating whether this module appears in mobile app navigation. |
| **`status`** | `boolean` | Active/Inactive visibility toggle. |

---

## 2. Production-Ready Menu Form Component

```tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FormFooter } from "@/components/common/FormFooter";
import { sanitizeText, handleNumberKeyDown } from "@/utils/inputFormatters";

interface ClientMenu {
  id?: string;
  menu_name: string;
  menu_url: string;
  master_name: string;
  parent_menu_id: string;
  section_name: string;
  section_priority: number;
  priority: number;
  icon: string;
  app_menu: boolean;
  status: boolean;
}

interface MenuFormProps {
  initialData?: ClientMenu | null;
  parentMenuOptions: Array<{ value: string; label: string }>;
  existingSections: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function MenuMasterForm({
  initialData,
  parentMenuOptions,
  existingSections,
  onSuccess,
  onCancel,
}: MenuFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);

  const [formData, setFormData] = useState<ClientMenu>({
    menu_name: initialData?.menu_name || "",
    menu_url: initialData?.menu_url || "",
    master_name: initialData?.master_name || "",
    parent_menu_id: initialData?.parent_menu_id || "",
    section_name: initialData?.section_name || "",
    section_priority: initialData?.section_priority || 1,
    priority: initialData?.priority || 1,
    icon: initialData?.icon || "",
    app_menu: Boolean(initialData?.app_menu),
    status: initialData ? initialData.status !== false : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!formData.menu_name || !formData.menu_url || !formData.master_name || !formData.section_name) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        parent_menu_id: formData.parent_menu_id ? formData.parent_menu_id : null,
        priority: Number(formData.priority),
        section_priority: Number(formData.section_priority),
      };

      if (initialData?.id) {
        await api.put(`/admin/client-menus/${initialData.id}`, payload);
        toast.success("Menu item updated successfully");
      } else {
        await api.post("/admin/client-menus", payload);
        toast.success("Menu item created successfully");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="common-surface p-5">
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="form-fieldset space-y-4">
          <legend className="form-legend">Menu Identification & Routing</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Menu Name */}
            <div className="space-y-1">
              <label className="form-label">
                Menu Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g. Purchase Orders"
                value={formData.menu_name}
                onChange={(e) =>
                  setFormData({ ...formData, menu_name: sanitizeText(e.target.value) })
                }
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.menu_name ? "visible" : "invisible"}`}>
                Menu Name is required
              </p>
            </div>

            {/* Menu URL Route */}
            <div className="space-y-1">
              <label className="form-label">
                Route Path (URL) <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="/admin/inventory/purchase-orders"
                value={formData.menu_url}
                onChange={(e) =>
                  setFormData({ ...formData, menu_url: sanitizeText(e.target.value) })
                }
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.menu_url ? "visible" : "invisible"}`}>
                Route URL is required
              </p>
            </div>

            {/* Master Slug */}
            <div className="space-y-1">
              <label className="form-label">
                Master Slug <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="purchase_order_master"
                value={formData.master_name}
                onChange={(e) =>
                  setFormData({ ...formData, master_name: sanitizeText(e.target.value) })
                }
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.master_name ? "visible" : "invisible"}`}>
                Master Slug is required
              </p>
            </div>

            {/* Parent Menu */}
            <div className="space-y-1">
              <label className="form-label">Parent Menu (Optional)</label>
              <SearchableSelect
                options={[{ value: "", label: "None (Top Level)" }, ...parentMenuOptions]}
                value={formData.parent_menu_id}
                onChange={(val) => setFormData({ ...formData, parent_menu_id: val })}
                placeholder="Select Parent"
              />
            </div>
          </div>
        </fieldset>

        {/* ── Section & Ordering ── */}
        <fieldset className="form-fieldset space-y-4">
          <legend className="form-legend">Grouping & Visual Presentation</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Section Name */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="form-label">
                  Section Name <span className="text-danger">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSection(!isCustomSection)}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  {isCustomSection ? "Choose Existing" : "+ New Section"}
                </button>
              </div>

              {isCustomSection ? (
                <input
                  type="text"
                  className="input w-full"
                  placeholder="e.g. Warehouse Operations"
                  value={formData.section_name}
                  onChange={(e) => setFormData({ ...formData, section_name: e.target.value })}
                />
              ) : (
                <SearchableSelect
                  options={existingSections.map((s) => ({ value: s, label: s }))}
                  value={formData.section_name}
                  onChange={(val) => setFormData({ ...formData, section_name: val })}
                  placeholder="Select Section"
                />
              )}
            </div>

            {/* Priority in Section */}
            <div className="space-y-1">
              <label className="form-label">Menu Priority (Order)</label>
              <input
                type="number"
                onKeyDown={handleNumberKeyDown}
                className="input w-full"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              />
            </div>

            {/* Section Priority */}
            <div className="space-y-1">
              <label className="form-label">Section Priority (Order)</label>
              <input
                type="number"
                onKeyDown={handleNumberKeyDown}
                className="input w-full"
                value={formData.section_priority}
                onChange={(e) =>
                  setFormData({ ...formData, section_priority: Number(e.target.value) })
                }
              />
            </div>

            {/* Lucide Icon Name */}
            <div className="space-y-1">
              <label className="form-label">Icon Identifier</label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g. Package, ShoppingBag"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: sanitizeText(e.target.value) })}
              />
            </div>
          </div>

          {/* Visibility Flags */}
          <div className="flex flex-wrap gap-8 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="form-checkbox text-primary h-4 w-4 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Active</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.app_menu}
                onChange={(e) => setFormData({ ...formData, app_menu: e.target.checked })}
                className="form-checkbox text-primary h-4 w-4 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Show on Mobile App Menu</span>
            </label>
          </div>
        </fieldset>

        <FormFooter
          loading={submitting}
          onCancel={onCancel}
          submitLabel={initialData ? "Update Menu" : "Create Menu"}
        />
      </form>
    </div>
  );
}
```

