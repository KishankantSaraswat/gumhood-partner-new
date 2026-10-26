# Group Permissions Matrix UI Blueprint

The Permissions Matrix allows administrators to configure granular capabilities (`view`, `add`, `edit`, `delete`, `excel`, `all`) for every module and sub-menu in a hierarchical tree table.

---

## 1. Full Production-Ready Permission Matrix Component

```tsx
"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Check, ShieldCheck, Loader2 } from "lucide-react";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { PermissionGuard } from "@/components/common/PermissionGuard";

interface MenuItem {
  id: string | number;
  menu_name: string;
  child_menus?: MenuItem[];
}

type PermissionAction = "view" | "add" | "edit" | "delete" | "excel" | "all";
type MenuPermissions = Record<PermissionAction, boolean>;

export function GroupPermissionsMatrix() {
  const [groups, setGroups] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [flatMenus, setFlatMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Matrix State: menuId -> { view, add, edit, delete, excel, all }
  const [permissions, setPermissions] = useState<Record<string, MenuPermissions>>({});

  // 1. Initial Load: Fetch Groups & Full Menu Tree
  useEffect(() => {
    const fetchInitData = async () => {
      setLoading(true);
      try {
        const [groupsRes, menusRes] = await Promise.all([
          api.post("/admin/master/options", {
            master_name: "user_group_master",
            includeInactive: false,
          }),
          api.get("/auth/menus"),
        ]);

        if (groupsRes.success && groupsRes.data?.options) {
          setGroups(groupsRes.data.options);
          if (groupsRes.data.options.length > 0) {
            setSelectedGroup(String(groupsRes.data.options[0].value));
          }
        }

        if (menusRes.success && menusRes.data) {
          const flat: MenuItem[] = [];
          const topLevel: MenuItem[] = [];

          menusRes.data.forEach((section: any) => {
            if (section.menus) {
              section.menus.forEach((m: MenuItem) => {
                topLevel.push(m);
                flat.push(m);
                if (m.child_menus?.length) {
                  flat.push(...m.child_menus);
                }
              });
            }
          });

          setMenus(topLevel);
          setFlatMenus(flat);
        }
      } catch (err: any) {
        toast.error("Failed to load permission matrix data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
  }, []);

  // 2. Fetch Group Rights when selectedGroup changes
  useEffect(() => {
    if (!selectedGroup) return;

    const fetchGroupRights = async () => {
      try {
        const res = await api.get(`/admin/user-groups/${selectedGroup}/rights`);
        const rightsData = res.success ? res.data : {};

        const initial: Record<string, MenuPermissions> = {};
        flatMenus.forEach((m) => {
          const mid = String(m.id);
          const r = rightsData[mid] || {};
          const isAll = r.view && r.add && r.edit && r.delete && r.excel;

          initial[mid] = {
            view: !!r.view,
            add: !!r.add,
            edit: !!r.edit,
            delete: !!r.delete,
            excel: !!r.excel,
            all: !!isAll,
          };
        });

        setPermissions(initial);
      } catch (err) {
        console.error("Failed to fetch group permissions", err);
      }
    };

    fetchGroupRights();
  }, [selectedGroup, flatMenus]);

  // 3. Helper: Recursively get all descendant IDs
  const getAllDescendantIds = (menuId: string): string[] => {
    const parent = flatMenus.find((m) => String(m.id) === String(menuId));
    if (!parent || !parent.child_menus) return [];

    let ids: string[] = [];
    parent.child_menus.forEach((child) => {
      ids.push(String(child.id));
      ids = ids.concat(getAllDescendantIds(String(child.id)));
    });
    return ids;
  };

  // 4. Helper: Find Parent ID
  const getParentId = (childId: string): string | null => {
    for (const m of flatMenus) {
      if (m.child_menus?.some((c) => String(c.id) === String(childId))) {
        return String(m.id);
      }
    }
    return null;
  };

  // 5. Permission Cascade Mutator
  const handleCheckboxChange = (menuId: string, field: PermissionAction, checked: boolean) => {
    setPermissions((prev) => {
      const next = { ...prev };
      const current = { ...(next[menuId] || { view: false, add: false, edit: false, delete: false, excel: false, all: false }) };
      const childIds = getAllDescendantIds(menuId);
      const parentId = getParentId(menuId);

      // A. "ALL" Toggle for this row
      if (field === "all") {
        const fields: PermissionAction[] = ["view", "add", "edit", "delete", "excel", "all"];
        fields.forEach((f) => (current[f] = checked));
        next[menuId] = current;

        // Apply to all children
        childIds.forEach((cId) => {
          next[cId] = { view: checked, add: checked, edit: checked, delete: checked, excel: checked, all: checked };
        });

        // If enabled, auto-enable parent view
        if (checked && parentId && next[parentId]) {
          next[parentId] = { ...next[parentId], view: true };
        }
        return next;
      }

      // B. Individual Action Toggle
      current[field] = checked;

      // PREREQUISITE: If add/edit/delete/excel checked -> view MUST be true
      if (field !== "view" && checked) {
        current.view = true;
      }

      // If view is unchecked -> clear all permissions on this menu and its children
      if (field === "view" && !checked) {
        current.add = false;
        current.edit = false;
        current.delete = false;
        current.excel = false;
        current.all = false;

        childIds.forEach((cId) => {
          next[cId] = { view: false, add: false, edit: false, delete: false, excel: false, all: false };
        });
      }

      // Recompute "all" status for this row
      current.all = current.view && current.add && current.edit && current.delete && current.excel;
      next[menuId] = current;

      // PARENT CASCADE: If view enabled on child -> auto-enable parent view
      if (checked && parentId && next[parentId]) {
        next[parentId] = { ...next[parentId], view: true };
      }

      return next;
    });
  };

  // 6. Header Bulk Column Toggle (e.g. toggle all "View" permissions across table)
  const handleColumnToggle = (field: PermissionAction) => {
    const isAllChecked = flatMenus.every((m) => permissions[String(m.id)]?.[field]);
    const targetState = !isAllChecked;

    setPermissions((prev) => {
      const next = { ...prev };
      flatMenus.forEach((m) => {
        const mid = String(m.id);
        const curr = { ...(next[mid] || { view: false, add: false, edit: false, delete: false, excel: false, all: false }) };

        if (field === "all") {
          curr.view = targetState;
          curr.add = targetState;
          curr.edit = targetState;
          curr.delete = targetState;
          curr.excel = targetState;
          curr.all = targetState;
        } else {
          curr[field] = targetState;
          if (field !== "view" && targetState) curr.view = true;
          if (field === "view" && !targetState) {
            curr.add = false;
            curr.edit = false;
            curr.delete = false;
            curr.excel = false;
            curr.all = false;
          }
          curr.all = curr.view && curr.add && curr.edit && curr.delete && curr.excel;
        }
        next[mid] = curr;
      });
      return next;
    });
  };

  // 7. Save Handler
  const handleSave = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    try {
      const res = await api.put(`/admin/user-groups/${selectedGroup}/rights`, permissions);
      if (res.success) {
        toast.success("Group permissions updated successfully");
      } else {
        toast.error(res.error || "Failed to update permissions");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  // 8. Expand/Collapse Node
  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Top Bar: Role Selector & Save Action ── */}
      <div className="common-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
            Target User Group
          </label>
          <SearchableSelect
            options={groups}
            value={selectedGroup}
            onChange={setSelectedGroup}
            placeholder="Select User Group"
          />
        </div>

        <PermissionGuard action="edit">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !selectedGroup}
            className="btn-primary w-full sm:w-auto h-10 px-6 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Save Permissions
          </button>
        </PermissionGuard>
      </div>

      {/* ── Permission Matrix Tree Table ── */}
      <div className="common-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-3 w-16 text-center">#</th>
                <th className="py-3 px-4 text-left">Module / Menu Name</th>
                <th className="py-3 px-2 w-20 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleColumnToggle("view")}>
                  View
                </th>
                <th className="py-3 px-2 w-20 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleColumnToggle("add")}>
                  Add
                </th>
                <th className="py-3 px-2 w-20 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleColumnToggle("edit")}>
                  Edit
                </th>
                <th className="py-3 px-2 w-20 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleColumnToggle("delete")}>
                  Delete
                </th>
                <th className="py-3 px-2 w-20 text-center cursor-pointer hover:bg-slate-100" onClick={() => handleColumnToggle("excel")}>
                  Excel
                </th>
                <th className="py-3 px-2 w-24 text-center cursor-pointer bg-slate-100/70 hover:bg-slate-200" onClick={() => handleColumnToggle("all")}>
                  All
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {menus.map((menu, idx) => renderTreeRow(menu, 0, String(idx + 1)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Helper Row Renderer
  function renderTreeRow(menu: MenuItem, level: number = 0, snoPrefix: string = ""): React.ReactNode {
    const mid = String(menu.id);
    const hasChildren = Boolean(menu.child_menus && menu.child_menus.length > 0);
    const isExpanded = expandedNodes.has(mid);
    const p = permissions[mid] || { view: false, add: false, edit: false, delete: false, excel: false, all: false };

    return (
      <React.Fragment key={mid}>
        <tr className={`hover:bg-primary/5 transition-colors ${level > 0 ? "bg-slate-50/40" : ""}`}>
          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">
            {snoPrefix}
          </td>
          <td className="py-2.5 px-4 whitespace-nowrap">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleExpand(mid)}
                  className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-slate-800 bg-slate-100"
                >
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300 mx-1.5" />
              )}
              <span className={`text-slate-900 ${level === 0 ? "font-bold" : "font-medium"}`}>
                {menu.menu_name}
              </span>
            </div>
          </td>

          {/* Checkboxes */}
          {(["view", "add", "edit", "delete", "excel"] as PermissionAction[]).map((act) => (
            <td key={act} className="py-2.5 px-2 text-center">
              <label className="flex items-center justify-center w-full h-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={p[act]}
                  onChange={(e) => handleCheckboxChange(mid, act, e.target.checked)}
                  className="form-checkbox text-primary rounded h-4 w-4 border-slate-300 focus:ring-primary cursor-pointer"
                />
              </label>
            </td>
          ))}

          {/* All Column */}
          <td className="py-2.5 px-2 text-center bg-slate-50/50">
            <label className="flex items-center justify-center w-full h-full cursor-pointer">
              <input
                type="checkbox"
                checked={p.all}
                onChange={(e) => handleCheckboxChange(mid, "all", e.target.checked)}
                className="form-checkbox text-primary rounded h-4 w-4 border-slate-300 focus:ring-primary cursor-pointer"
              />
            </label>
          </td>
        </tr>

        {/* Recursive Children Rows */}
        {hasChildren &&
          isExpanded &&
          menu.child_menus!.map((child, cIdx) =>
            renderTreeRow(child, level + 1, `${snoPrefix}.${cIdx + 1}`)
          )}
      </React.Fragment>
    );
  }
}
```

