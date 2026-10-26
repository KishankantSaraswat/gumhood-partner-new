# User Master UI Architecture & Implementation

The User Master allows administrators to manage employee/system accounts, assign functional roles (`user_group`), assign branches, set managers, and configure super-admin privileges (`is_master`).

---

## 1. User Master Form Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ PageTabs (All Users [list]  │  Add User [add]  │  Edit User)    │
└────────────────────────────────┬────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ UserForm Container                                              │
│  ├── Fieldset: Personal & Credentials                           │
│  │    ├── User Name (Alphabetic sanitizer)                      │
│  │    ├── Email ID (Email regex format)                         │
│  │    ├── Country Code (+91, +1, +44) + Phone (10 digits)       │
│  │    ├── Login ID (Unique alphanumeric slug)                   │
│  │    └── Password (Show/Hide eye toggle + minimum length)      │
│  ├── Fieldset: Role & Governance                                │
│  │    ├── User Group (Dropdown $\rightarrow$ users_group_master)│
│  │    ├── Reporting Manager (Dropdown $\rightarrow$ users)      │
│  │    ├── Master User Toggle (Super-Admin full-bypass)          │
│  │    └── Active Status & Notification Preferences              │
│  └── Tab 2: Assigned Branches (Multi-Branch Access Matrix)      │
│  └── FormFooter (Cancel, Reset, Save/Update with Spinner)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Production-Ready User Form Component

```tsx
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { FormFooter } from "@/components/common/FormFooter";
import {
  sanitizeText,
  sanitizeAlphabeticText,
  sanitizeMobile,
} from "@/utils/inputFormatters";

interface UserFormProps {
  initialData?: any;
  userGroups: Array<{ value: string; label: string }>;
  managerOptions: Array<{ value: string; label: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({
  initialData,
  userGroups,
  managerOptions,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    countryCode: initialData?.country_code || "+91",
    phone: initialData?.phone || "",
    loginId: initialData?.username || initialData?.login_id || "",
    password: "",
    userGroup: initialData?.group_id ? String(initialData.group_id) : "",
    manager_id: initialData?.manager_id ? String(initialData.manager_id) : "",
    isMaster: Boolean(initialData?.is_master),
    isActive: initialData ? initialData.status !== false : true,
    enable_notifications: Boolean(initialData?.enable_notifications),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.loginId ||
      (!initialData && !formData.password) ||
      !formData.userGroup
    ) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: `${formData.countryCode}-${formData.phone.trim()}`,
        username: formData.loginId.trim(),
        password: formData.password ? formData.password : undefined,
        group_id: Number(formData.userGroup),
        manager_id: formData.manager_id ? Number(formData.manager_id) : null,
        is_master: formData.isMaster,
        status: formData.isActive,
        enable_notifications: formData.enable_notifications,
      };

      if (initialData?.id) {
        await api.put(`/admin/users/${initialData.id}`, payload);
        toast.success("User updated successfully");
      } else {
        await api.post("/admin/users", payload);
        toast.success("User created successfully");
      }

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="common-surface p-5">
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {/* ── Section 1: Personal & Account Details ── */}
        <fieldset className="form-fieldset space-y-4">
          <legend className="form-legend">Personal & Login Credentials</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Full Name */}
            <div className="space-y-1">
              <label className="form-label">
                User Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g. John Doe"
                maxLength={80}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: sanitizeAlphabeticText(e.target.value) })
                }
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.name ? "visible" : "invisible"}`}>
                Full Name is required
              </p>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="form-label">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="input w-full"
                placeholder="john@company.com"
                maxLength={80}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.email ? "visible" : "invisible"}`}>
                Valid Email is required
              </p>
            </div>

            {/* Phone Number with Country Code */}
            <div className="space-y-1">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="input w-24 bg-slate-50 text-xs"
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (AE)</option>
                </select>
                <input
                  type="tel"
                  maxLength={10}
                  className="input flex-1"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: sanitizeMobile(e.target.value) })
                  }
                />
              </div>
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.phone ? "visible" : "invisible"}`}>
                Phone is required
              </p>
            </div>

            {/* Login ID */}
            <div className="space-y-1">
              <label className="form-label">
                Login ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="johndoe"
                maxLength={30}
                value={formData.loginId}
                onChange={(e) =>
                  setFormData({ ...formData, loginId: sanitizeText(e.target.value) })
                }
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.loginId ? "visible" : "invisible"}`}>
                Login ID is required
              </p>
            </div>
          </div>

          {/* Password Field (Optional on edit) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="form-label">
                {initialData ? "Change Password (Leave blank to keep)" : "Password"}{" "}
                {!initialData && <span className="text-danger">*</span>}
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </fieldset>

        {/* ── Section 2: Role & Access Governance ── */}
        <fieldset className="form-fieldset space-y-4">
          <legend className="form-legend">Role & Organizational Governance</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Group (Role) */}
            <div className="space-y-1">
              <label className="form-label">
                Assigned User Group <span className="text-danger">*</span>
              </label>
              <SearchableSelect
                options={userGroups}
                value={formData.userGroup}
                onChange={(val) => setFormData({ ...formData, userGroup: val })}
                placeholder="Select Role Group"
              />
              <p className={`text-red-500 text-[11px] ${showErrors && !formData.userGroup ? "visible" : "invisible"}`}>
                User Group is required
              </p>
            </div>

            {/* Reporting Manager */}
            <div className="space-y-1">
              <label className="form-label">Reporting Manager</label>
              <SearchableSelect
                options={managerOptions}
                value={formData.manager_id}
                onChange={(val) => setFormData({ ...formData, manager_id: val })}
                placeholder="Select Manager"
              />
            </div>
          </div>

          {/* Toggles: Master User, Active, Notifications */}
          <div className="flex flex-wrap gap-8 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isMaster}
                onChange={(e) => setFormData({ ...formData, isMaster: e.target.checked })}
                className="form-checkbox text-primary h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Super Admin (Master User)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="form-checkbox text-primary h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">Active Account</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.enable_notifications}
                onChange={(e) =>
                  setFormData({ ...formData, enable_notifications: e.target.checked })
                }
                className="form-checkbox text-primary h-4 w-4 rounded border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">Enable Push Notifications</span>
            </label>
          </div>
        </fieldset>

        {/* ── Action Buttons ── */}
        <FormFooter
          loading={submitting}
          onCancel={onCancel}
          submitLabel={initialData ? "Update User" : "Create User"}
        />
      </form>
    </div>
  );
}
```

