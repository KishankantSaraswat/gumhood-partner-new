# Schema-Driven Dynamic Master Pattern

For lightweight master tables (such as Tax Categories, Unit of Measurements, Expense Types, or Machine Brands), the application provides a **Schema-Driven Dynamic Master** engine (`<DynamicMaster />`) that automatically generates a full CRUD interface from a configuration object.

---

## 1. Field Configuration Schema

```typescript
export type FieldConfig = {
  type: "text" | "checkbox" | "number" | "select" | "image";
  label?: string;          // Form field and table column header
  required?: boolean;      // Displays red asterisk & checks validity on submit
  maxlength?: number;      // Maximum character limit
  sortable?: boolean;      // Enables column sorting in table
  searchable?: boolean;    // Generates a filter input in FilterPanel
  masterName?: string;     // For 'select' type: master name to populate options
  displayKey?: string;     // For 'select' type: display label field from backend
  hideInList?: boolean;    // Hides column from table, showing only in form
  listWidth?: string;      // Explicit column width in table
};

export type MasterConfig = Record<string, FieldConfig>;
```

---

## 2. Instant CRUD Master Creation (Example: Tax Category)

In just a few lines of code, you can generate a complete master module:

```tsx
"use client";

import DynamicMaster, { MasterConfig } from "@/app/admin/Master/DynamicMaster";

const taxCategoryConfig: MasterConfig = {
  tax_category: {
    type: "text",
    label: "Tax Category Name",
    required: true,
    sortable: true,
    searchable: true,
    maxlength: 60,
  },
  tax_rate: {
    type: "number",
    label: "Tax Rate (%)",
    required: true,
    sortable: true,
    listWidth: "120px",
  },
  hsn_code: {
    type: "text",
    label: "HSN / SAC Code",
    maxlength: 15,
    sortable: true,
  },
  status: {
    type: "checkbox",
    label: "Active Status",
    sortable: true,
  },
};

export default function TaxCategoryPage() {
  return (
    <DynamicMaster
      masterName="tax_category_master"
      title="Tax Category Master"
      config={taxCategoryConfig}
    />
  );
}
```

---

## 3. When to Use DynamicMaster vs Custom MasterForm

- **Use `<DynamicMaster />`** when:
  - The master has 1 to 6 straightforward fields.
  - Standard text, number, select, and status toggles suffice.
  - No complex cross-field dependencies, custom multi-tab workflows, or inline item grids are required.
- **Use Custom Master Form (`*Form.tsx`)** when:
  - The form has multi-tab navigation (e.g. Basic Details + Accounts + Branch Permissions).
  - Custom file attachments, multi-autocomplete, or dynamic calculations are needed.
  - Complex custom validation logic must run before submit.

