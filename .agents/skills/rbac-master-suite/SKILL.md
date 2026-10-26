---
name: rbac-master-suite
description: >-
  Comprehensive guide and production blueprints for User Master, Menu Master,
  User Groups, Group-Wise Permission Matrices, and User Permission Overrides UI.
  Use when building or modifying user administration screens, navigation trees,
  role-based access control (RBAC), and permission guard enforcement in frontend applications.
---

# RBAC, User Master & Menu Management Suite

This skill provides the architectural foundation, UI templates, state management patterns, and permission cascade algorithms for enterprise Role-Based Access Control (RBAC).

---

## 1. The 5 Pillars of Enterprise Access Control

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Menu Master (client_menu_master)                         │
│    Defines system modules, route paths, icons, & hierarchy. │
└──────────────────────────────┬──────────────────────────────┘
                               │ (linked via page_id)
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│ 2. User Groups (users_group_master)                         │
│    Defines functional roles (Admin, Branch Manager, Cashier)│
└──────────────────────────────┬──────────────────────────────┘
                               │ (has many)
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│ 3. Group Permissions Matrix (users_group_rights)            │
│    Default baseline rights for the group across all menus:  │
│    [View]  [Add]  [Edit]  [Delete]  [Excel]  [All]          │
└──────────────────────────────┬──────────────────────────────┘
                               │ (assigned to)
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│ 4. User Master (users)                                      │
│    Individual accounts with credentials, group, & branches. │
└──────────────────────────────┬──────────────────────────────┘
                               │ (optional user-specific override)
                               ▼
┌──────────────────────────────┴──────────────────────────────┐
│ 5. User Permission Overrides (users_master_rights)          │
│    Individual custom overrides that take precedence over    │
│    group rights for that specific user.                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. The 5 Granular Action Flags

Every system page grants 5 individual permissions:
1. **`view`** (`view_right`): Access to the menu item, page route, and list tables.
2. **`add`** (`add_right`): Ability to view the "Add" tab and create new records.
3. **`edit`** (`edit_right`): Ability to view "Edit" controls and update records.
4. **`delete`** (`delete_right`): Ability to delete or deactivate records.
5. **`excel`** (`excel_right`): Ability to export data tables to CSV/Excel.
6. **`all`**: Shorthand helper checking all 5 permissions simultaneously.

---

## 3. Strict Permission Cascade Rules

When managing or rendering permissions in the frontend UI, strictly enforce:

1. **The View Prerequisite Rule**:
   - If a user has `add`, `edit`, `delete`, or `excel` enabled for a screen, **`view` MUST automatically be enabled** (`view = true`).
   - If `view` is unchecked, **ALL other actions (`add`, `edit`, `delete`, `excel`, `all`) MUST immediately be disabled** for that screen.

2. **Parent-Child Tree Cascade Rule**:
   - A child sub-menu can **never** be accessed if its parent menu's `view` is disabled.
   - When enabling `view` on a child sub-menu, the parent menu's `view` MUST automatically be enabled.
   - When unchecking `view` on a parent menu, all child sub-menus MUST automatically have all permissions cleared.

3. **Master User Super-Admin Bypass**:
   - If `user.is_master === true` (or super-admin), bypass all permission matrices — grant `view: true, add: true, edit: true, delete: true, excel: true` universally.

4. **Resolution Priority**:
   ```text
   is_master === true  ──►  Full Super-Admin Access
           │ (no)
           ▼
   users_master_rights  ──►  Specific User Overrides (if exists)
           │ (no override)
           ▼
   users_group_rights   ──►  Group Baseline Rights (user.group_id)
           │ (no group)
           ▼
   Default Fallback     ──►  Access Denied (view = false, add = false, ...)
   ```

---

## 4. Topic References & Implementation Blueprints

Explore these deep-dive reference guides for copy-pasteable UI code:

- 👥 **[User Master UI Blueprint](./references/user-master-ui.md)**  
  User listing DataTable, filter panel, multi-tab create/edit form, phone formatters, password visibility toggle, assigned branches selector, and status badges.

- 🗂️ **[Menu Master Management UI](./references/menu-master-ui.md)**  
  Hierarchical navigation tree management, parent-child dropdowns, section prioritization, Lucide icon selectors, URL slugs, and app menu toggles.

- 🛡️ **[Group Permissions Matrix UI](./references/group-permissions-matrix-ui.md)**  
  Tree-table permission matrix with collapsible menu rows, individual action checkboxes, bulk column-header toggles, parent-child cascade auto-selection, and API save handlers.

- 🏢 **[User Group Master UI](./references/user-group-master-ui.md)**  
  Role group CRUD, IP whitelisting configuration, member counts, and quick shortcuts to permission matrix editing.

- 🔒 **[Frontend Permission Guard & Context](./references/frontend-permission-guard.md)**  
  `PermissionsContext`, `usePermissions()` hook, `<PermissionGuard>` component wrapper, table action filtering, and unauthorized route redirect handlers.

