---
name: master-ui-builder
description: >-
  Comprehensive guide and production blueprints for building Master CRUD screens in SaaS applications.
  Enforces standardized PageTabs navigation (List vs Add/Edit), common DataTable integration (sorting,
  pagination, search, filter panels, action buttons), tab-based form layouts, and standardized FormFooter
  with Save/Cancel/Update buttons, keyboard Esc shortcuts, audit metadata, and PermissionGuard enforcement.
---

# Master UI & Common DataTable Builder Skill

This skill provides the definitive blueprint for creating enterprise SaaS Master screens (e.g. Products, Brands, Machines, Vendors, Branches, Tax Categories, Ledgers).

Every Master module in the application follows a strict, unified architectural pattern:

```text
┌───────────────────────────────────────────────────────────────────────────┐
│ PageTabs (All Records [List]  │  Add Record [Add]  │  Edit Record [Edit]) │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      ▼
             ┌────────────────────────┴────────────────────────┐
             ▼ (activeTab === 'list')                          ▼ (activeTab === 'add' / 'edit')
┌───────────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│ LIST VIEW                                 │     │ FORM VIEW (Add / Edit Master)             │
│ ├── FilterPanel (Collapsible / Top Bar)   │     │ ├── Tab Navigation (if multi-section)     │
│ ├── Common DataTable                      │     │ ├── Fieldsets & Form Grids (6 columns)    │
│ │   ├── Column configs & S.No             │     │ ├── Input Sanitization & Validation       │
│ │   ├── Server/Client Sorting & Page No   │     │ └── FormFooter (Sticky bottom bar)        │
│ │   ├── StatusBadge (Active/Inactive)     │     │     ├── Left: Created / Updated Audit Info│
│ │   └── ActionButtons (Edit, Delete)      │     │     ├── Cancel Button (Esc shortcut)      │
│ └── ConfirmDialog (Delete confirmation)   │     │     └── Save / Update Button (w/ Spinner) │
└───────────────────────────────────────────┘     └───────────────────────────────────────────┘
```

---

## 1. Core Workflow for Any Master Screen

To build or modify any Master module, follow this 4-step structure:

1. **Orchestrator Page (`page.tsx`)**:
   - Manages `activeTab` (`'list' | 'add'`) and `editingRecord`.
   - Embeds `PageTabs` at the top with `listLabel`, `addLabel`, `editLabel`.
   - Coordinates switching between the List View and the Form View.
2. **Filter & DataTable (`DataTable`)**:
   - Standard columns: S.No, Primary Code, Name, Foreign Relational Attributes, Status Pill, Action Buttons.
   - Standard hooks: `usePagination()` and `useSorting()`.
   - Real-time debounced or onApply filtering with `FilterPanel`.
3. **Master Form Layout (`*Form.tsx`)**:
   - Compact 6-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-x-4 gap-y-2`).
   - Standardized input sanitizers (`sanitizeText`, `sanitizeNumber`, `handleNumberKeyDown`).
   - Field-level red error feedback triggered on submit attempt (`showErrors && !field`).
4. **Standard Form Footer (`FormFooter`)**:
   - Sticky bottom placement (`sticky bottom-0 bg-white border-t rounded-b-2xl`).
   - Audit trail on the left: Created by/at, Updated by/at (visible during Edit).
   - Right actions: Cancel button (triggers `onCancel` or `Esc` key) and Save/Update button wrapped in `<PermissionGuard>`.

---

## 2. Topic References & Implementation Blueprints

Explore these dedicated reference guides for copy-pasteable production templates:

- 🏗️ **[Master Page Architecture](./references/master-page-architecture.md)**  
  Complete orchestrator page template coordinating `PageTabs`, data fetching, pagination, sorting, delete confirmation dialogs, and edit state transitions.

- 📊 **[Common DataTable & Filter Guide](./references/common-datatable-guide.md)**  
  How to configure the common `DataTable`, column definitions, column alignment standards, `FilterPanel` search integration, `StatusBadge` pills, and `ActionButtons`.

- 📋 **[Form UI Tabs & FormFooter Guide](./references/form-ui-and-footer.md)**  
  Detailed form layout patterns, multi-tab form navigation, input formatters, field validation states, and full documentation on the sticky `FormFooter` component.

- ⚡ **[Dynamic Master Pattern](./references/dynamic-master-pattern.md)**  
  Schema-driven dynamic master generation for lightweight master tables (single configuration object generates complete CRUD with table and form automatically).

