# Frontend Permission Guard, Context & Enforcement

Granular permissions must be enforced at both the route level and the component level. If a user lacks `add` permission, the "Add New" button must not be visible. If they lack `view`, they must not be allowed to open the page.

---

## 1. Permissions Context & Provider (`PermissionsContext.tsx`)

Resolves active route permissions using **longest prefix URL matching**:

```tsx
"use client";

import React, { createContext, useContext } from "react";
import { usePathname } from "next/navigation";

export interface PageRights {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  excel: boolean;
}

interface PermissionsContextType {
  urlPermissionsMap: Map<string, PageRights>;
  currentPermissions: PageRights;
  hasPermission: (action: keyof PageRights) => boolean;
}

const DEFAULT_RIGHTS: PageRights = {
  view: false,
  add: false,
  edit: false,
  delete: false,
  excel: false,
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({
  urlPermissionsMap,
  children,
}: {
  urlPermissionsMap: Map<string, PageRights>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Longest Prefix Matching Algorithm
  let currentPermissions: PageRights = DEFAULT_RIGHTS;
  let longestMatch = -1;

  urlPermissionsMap.forEach((rights, url) => {
    if (url && pathname.startsWith(url) && url.length > longestMatch) {
      currentPermissions = rights;
      longestMatch = url.length;
    }
  });

  const hasPermission = (action: keyof PageRights): boolean => {
    return Boolean(currentPermissions[action]);
  };

  return (
    <PermissionsContext.Provider value={{ urlPermissionsMap, currentPermissions, hasPermission }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
```

---

## 2. Declarative Permission Guard Component (`PermissionGuard.tsx`)

Conditionally mounts its children based on the user's rights on the current screen:

```tsx
"use client";

import React from "react";
import { usePermissions, PageRights } from "@/context/PermissionsContext";

interface PermissionGuardProps {
  action: keyof PageRights;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({ action, fallback = null, children }: PermissionGuardProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 3. Usage Examples Across Pages & Components

### A. Guarding the "Add New" Tab in `PageTabs`
```tsx
import { PageTabs } from "@/components/common/PageTabs";
import { PermissionGuard } from "@/components/common/PermissionGuard";

// Inside PageTabs.tsx:
<PermissionGuard action={isEditing ? "edit" : "add"}>
  <button
    type="button"
    onClick={() => onTabChange("add")}
    className={tabClass(isAddActive)}
  >
    <span>{isEditing ? "Edit Record" : "Add Record"}</span>
  </button>
</PermissionGuard>
```

### B. Guarding Table Row Actions
```tsx
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { Edit2, Trash2 } from "lucide-react";

export function TableRowActions({ row, onEdit, onDelete }: any) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <PermissionGuard action="edit">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="p-1 rounded text-slate-500 hover:text-primary hover:bg-slate-100"
          title="Edit Record"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </PermissionGuard>

      <PermissionGuard action="delete">
        <button
          type="button"
          onClick={() => onDelete(row)}
          className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50"
          title="Delete Record"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </PermissionGuard>
    </div>
  );
}
```

### C. Guarding Export to Excel Button
```tsx
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { FileSpreadsheet } from "lucide-react";

<PermissionGuard action="excel">
  <button
    type="button"
    onClick={handleExportExcel}
    className="btn-secondary h-9 px-3 text-xs gap-1.5"
  >
    <FileSpreadsheet className="w-3.5 h-3.5" />
    Export CSV
  </button>
</PermissionGuard>
```

