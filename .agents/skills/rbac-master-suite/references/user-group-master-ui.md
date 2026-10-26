# User Group Master & Role Governance UI Blueprint

User Groups (`users_group_master`) represent functional business roles (e.g., `Branch Accountant`, `Operations Lead`, `Inventory Manager`). Permission rights are assigned to groups, and users inherit their permissions by belonging to a group.

---

## 1. Schema & Functional Rules

- **`group_name`** (`string`, mandatory): Unique role title.
- **`allow_ip`** (`string`, optional): Comma-separated IP whitelist (e.g. `192.168.1.1, 10.0.0.1/24`). If set, users in this group can only log in from these addresses.
- **`status`** (`boolean`): Active/Inactive toggle.

---

## 2. Production-Ready User Group Form Component

```tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { FormFooter } from "@/components/common/FormFooter";
import { sanitizeText } from "@/utils/inputFormatters";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface UserGroup {
  id?: string;
  group_name: string;
  allow_ip?: string;
  status: boolean;
}

export function UserGroupForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData?: UserGroup | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [formData, setFormData] = useState({
    group_name: initialData?.group_name || "",
    allow_ip: initialData?.allow_ip || "",
    status: initialData ? initialData.status !== false : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    if (!formData.group_name.trim()) {
      toast.error("Group Name is mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        group_name: formData.group_name.trim(),
        allow_ip: formData.allow_ip.trim() || null,
        status: formData.status,
      };

      if (initialData?.id) {
        await api.put(`/admin/user-groups/${initialData.id}`, payload);
        toast.success("User Group updated successfully");
      } else {
        await api.post("/admin/user-groups", payload);
        toast.success("User Group created successfully");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user group");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="common-surface p-5 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="form-fieldset space-y-4">
          <legend className="form-legend">Role Details & Network Security</legend>

          {/* Group Name */}
          <div className="space-y-1">
            <label className="form-label">
              User Group Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="e.g. Regional Store Manager"
              maxLength={60}
              value={formData.group_name}
              onChange={(e) =>
                setFormData({ ...formData, group_name: sanitizeText(e.target.value) })
              }
            />
            <p className={`text-red-500 text-[11px] ${showErrors && !formData.group_name ? "visible" : "invisible"}`}>
              Group Name is required
            </p>
          </div>

          {/* IP Whitelist */}
          <div className="space-y-1">
            <label className="form-label">Allowed IP Addresses (Optional)</label>
            <input
              type="text"
              className="input w-full font-mono text-xs"
              placeholder="e.g. 192.168.1.1, 10.0.0.1/24"
              value={formData.allow_ip}
              onChange={(e) => setFormData({ ...formData, allow_ip: e.target.value })}
            />
            <span className="text-[11px] text-slate-400">
              Leave blank to allow login from any network location.
            </span>
          </div>

          {/* Active Status */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="form-checkbox text-primary h-4 w-4 rounded"
              />
              <span className="text-xs font-semibold text-slate-800">Active Role Group</span>
            </label>
          </div>
        </fieldset>

        {/* Shortcut to Configure Permissions */}
        {initialData?.id && (
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Configure Granular Rights</p>
              <p className="text-[11px] text-slate-500">
                Define View, Add, Edit, and Delete access for this group
              </p>
            </div>
            <Link
              href={`/admin/users/group-permissions?group=${initialData.id}`}
              className="btn-primary text-xs h-8 px-3 gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Edit Matrix
            </Link>
          </div>
        )}

        <FormFooter
          loading={submitting}
          onCancel={onCancel}
          submitLabel={initialData ? "Update Group" : "Create Group"}
        />
      </form>
    </div>
  );
}
```

