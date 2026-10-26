# Theme-Based Application Shell: Sidebar, Header & Navigation Architecture

In modern SaaS applications, the shell (Sidebar + Header + Content Canvas) is the primary user touchpoint. A theme-driven shell dynamically reflects the active brand palette, supports collapsible navigation, offers in-sidebar menu search, handles permission-filtered routes, provides context switchers (e.g. Financial Year, Branch), and includes an interactive user profile dropdown with a live theme palette switcher.

---

## 1. Architectural Blueprint of the Shell

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ThemeProvider (data-theme="blue|yellow|green|orange|red|violet", data-mode) │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ App Layout Canvas (flex h-screen overflow-hidden)                           │
│                                                                             │
│  ┌───────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │ THEMED SIDEBAR        │  │ THEMED HEADER (Glassmorphic, Sticky)       │  │
│  │ (Glassmorphic)        │  │  - Breadcrumb / Page Title                 │  │
│  │  - Brand Logo / Avatar│  │  - Context Dropdown (FY / Branch / Org)    │  │
│  │  - Search Menu Filter │  │  - Notification Center (Unread Badge)      │  │
│  │  - Dynamic Nav Trees  │  │  - Profile Avatar (Themed Ring Glow)       │  │
│  │  - Active Pill Accent │  │  - Palette Color Picker & Signout Dropdown │  │
│  │  - Collapse / Expand  │  ├────────────────────────────────────────────┤  │
│  │  - Mobile Flyout Mode │  │ MAIN SCROLLABLE CONTENT CANVAS             │  │
│  │                       │  │  (min-w-0 flex-1 overflow-y-auto px-4 py-2)│  │
│  └───────────────────────┘  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dynamic Theme Gradients with `color-mix()`

Instead of hardcoded hex values, the shell derives its glassmorphic backdrops, active pills, and glows dynamically from CSS variables using modern CSS `color-mix`:

```css
/* Sidebar Glassmorphic Theme Gradient */
.themed-sidebar-bg {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--grad-primary-from) 7%, #ffffff) 0%,
    #ffffff 48%,
    color-mix(in srgb, var(--grad-primary-to) 5%, #fafbfc) 100%
  );
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(203, 213, 225, 0.55);
  box-shadow: 6px 0 24px rgba(15, 23, 42, 0.04);
}

/* Header Glassmorphic Theme Gradient */
.themed-header-bg {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--grad-primary-from) 7%, #ffffff) 0%,
    #ffffff 48%,
    color-mix(in srgb, var(--grad-primary-to) 5%, #ffffff) 100%
  );
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(203, 213, 225, 0.55);
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

/* Themed Active Navigation Item */
.themed-nav-active {
  color: #ffffff !important;
  font-weight: 700 !important;
  background: linear-gradient(135deg, var(--grad-primary-from) 0%, var(--grad-primary-to) 100%) !important;
  box-shadow: var(--shadow-primary) !important;
}

/* Themed Avatar with Glowing Ring */
.themed-avatar-ring {
  background: linear-gradient(135deg, var(--grad-primary-from) 0%, var(--grad-primary-to) 100%);
  box-shadow: 0 0 0 2px var(--color-surface), 0 0 0 4px var(--color-primary-glow);
}
```

---

## 3. The Sidebar Architecture

### 3.1 Hook Layer: `useSidebar.ts`
Handles navigation filtering, collapse persistence in `localStorage`, expanded sub-menu tracking, and mobile drawer state:

```typescript
import { useState, useEffect, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
  icon?: any;
  children?: NavItem[];
  badge?: string | number;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export function useSidebar(navSections: NavSection[], user?: any) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [collapsed, setCollapsedState] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  // 1. Sync collapse preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved !== null) {
      setCollapsedState(saved === "true");
    }
  }, []);

  const setCollapsed = (val: boolean) => {
    setCollapsedState(val);
    localStorage.setItem("sidebar_collapsed", String(val));
  };

  // 2. Auto-expand parent menu matching current URL
  useEffect(() => {
    const nextExpanded = { ...expandedMenus };
    let changed = false;

    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children?.some((c) => pathname.startsWith(c.href))) {
          if (!nextExpanded[item.label]) {
            nextExpanded[item.label] = true;
            changed = true;
          }
        }
      });
    });

    if (changed) setExpandedMenus(nextExpanded);
  }, [pathname, navSections]);

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // 3. In-Sidebar Search Filter
  const filteredNavSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;
    const query = searchQuery.toLowerCase();

    return navSections
      .map((section) => ({
        ...section,
        items: section.items
          .map((item) => {
            const matchesParent = item.label.toLowerCase().includes(query);
            const matchingChildren = item.children?.filter((c) =>
              c.label.toLowerCase().includes(query)
            );

            if (matchesParent || (matchingChildren && matchingChildren.length > 0)) {
              return {
                ...item,
                children: matchingChildren && matchingChildren.length > 0 ? matchingChildren : item.children,
              };
            }
            return null;
          })
          .filter(Boolean) as NavItem[],
      }))
      .filter((s) => s.items.length > 0);
  }, [navSections, searchQuery]);

  return {
    collapsed,
    setCollapsed,
    searchQuery,
    setSearchQuery,
    expandedMenus,
    toggleMenu,
    filteredNavSections,
    pathname,
    searchParams,
  };
}
```

### 3.2 Presentation Component: `Sidebar.tsx`
Features responsive desktop/mobile widths, collapse toggle, menu search input, animated expansion arrows, and active styling:

```tsx
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import { useSidebar, NavSection, NavItem } from "./useSidebar";

interface SidebarProps {
  navSections: NavSection[];
  user: any;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ navSections, user, isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const {
    collapsed,
    setCollapsed,
    searchQuery,
    setSearchQuery,
    expandedMenus,
    toggleMenu,
    filteredNavSections,
    pathname,
  } = useSidebar(navSections, user);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`
          themed-sidebar-bg flex-shrink-0 flex flex-col h-screen fixed md:relative z-50 md:z-40
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0 w-[260px] shadow-2xl" : "-translate-x-full md:translate-x-0"}
          ${collapsed ? "md:w-[76px]" : "md:w-[260px]"}
        `}
      >
        {/* Brand Header */}
        <div className={`flex items-center h-14 shrink-0 px-4 border-b border-slate-200/60 justify-between`}>
          <Link href="/admin" className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              SB
            </div>
            {!collapsed && (
              <span className="font-bold text-sm text-slate-900 tracking-tight truncate">
                SanBridge SaaS
              </span>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* In-Sidebar Search Bar (Visible when expanded) */}
        {!collapsed && (
          <div className="p-3 pb-1 shrink-0">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search menus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs bg-slate-100/90 border border-slate-200/80 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:border-primary/50 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>
        )}

        {/* Navigation Items Canvas */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 min-h-0">
          {filteredNavSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!collapsed && section.title && (
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = !!expandedMenus[item.label];
                const isActive = pathname === item.href || (hasChildren && item.children!.some((c) => pathname === c.href));

                if (hasChildren) {
                  return (
                    <div key={item.label} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.label)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer
                          ${isActive ? "text-primary font-bold bg-primary/8" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"}
                          ${collapsed ? "justify-center" : ""}
                        `}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`} />}
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!collapsed && (
                          isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      {/* Sub-menu items */}
                      {!collapsed && isExpanded && (
                        <div className="pl-6 space-y-1 border-l-2 border-slate-200/80 ml-4 my-1">
                          {item.children!.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => onCloseMobile?.()}
                                className={`
                                  block py-1.5 px-3 text-[12px] font-medium rounded-lg transition-all
                                  ${isChildActive ? "themed-nav-active" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/80"}
                                `}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onCloseMobile?.()}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all
                      ${isActive ? "themed-nav-active" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"}
                      ${collapsed ? "justify-center" : ""}
                    `}
                  >
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
```

---

## 4. The Header Architecture

### 4.1 Hook Layer: `useHeader.ts`
Manages global contexts (Financial Year, Branch), notification popover, profile dropdown, and theme selection:

```typescript
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/ThemeContext";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useHeader(user?: any) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const profileRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [selectedFinYearId, setSelectedFinYearId] = useState<string>("");

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const res = await api.get("/admin/master/financial-years");
        if (res.success && res.data) {
          setFinancialYears(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch context", err);
      }
    };
    fetchContext();

    const storedFY = localStorage.getItem("fin_year_id") || user?.fin_year_id;
    if (storedFY) setSelectedFinYearId(String(storedFY));
  }, [user]);

  const handleFinYearChange = async (val: string) => {
    setSelectedFinYearId(val);
    localStorage.setItem("fin_year_id", val);
    try {
      await api.put("/auth/set-fin-year", { fin_year_id: Number(val) });
      toast.success("Financial Year updated");
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside, true);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [isProfileOpen]);

  return {
    theme,
    setTheme,
    profileRef,
    isProfileOpen,
    setIsProfileOpen,
    financialYears,
    selectedFinYearId,
    handleFinYearChange,
    handleSignOut,
  };
}
```

### 4.2 Presentation Component: `Header.tsx`
Displays breadcrumb title, mobile toggle, Context Switcher, Notification trigger, and the **Profile Dropdown with Live Theme Palette Swatches**:

```tsx
import React from "react";
import { Menu as MenuIcon, Bell, Settings, LogOut } from "lucide-react";
import { useHeader } from "./useHeader";
import { SearchableSelect } from "@/components/common/SearchableSelect";

const PALETTES = [
  { id: "base", label: "Indigo", bg: "bg-[#4f6ef7]" },
  { id: "blue", label: "Sky Blue", bg: "bg-[#3b82f6]" },
  { id: "green", label: "Emerald", bg: "bg-[#22c55e]" },
  { id: "orange", label: "Amber Orange", bg: "bg-[#f97316]" },
  { id: "red", label: "Rose Red", bg: "bg-[#ef4444]" },
  { id: "violet", label: "Purple Violet", bg: "bg-[#8b5cf6]" },
  { id: "yellow", label: "Warm Gold", bg: "bg-[#eab308]" },
] as const;

export function Header({
  pageTitle,
  user,
  onToggleMobileMenu,
}: {
  pageTitle: string;
  user: any;
  onToggleMobileMenu?: () => void;
}) {
  const {
    theme,
    setTheme,
    profileRef,
    isProfileOpen,
    setIsProfileOpen,
    financialYears,
    selectedFinYearId,
    handleFinYearChange,
    handleSignOut,
  } = useHeader(user);

  return (
    <header className="themed-header-bg h-12 shrink-0 flex items-center px-4 md:px-6 gap-3 sticky top-0 z-40">
      {/* Mobile Menu Button & Page Title */}
      <div className="flex-1 min-w-0 flex items-center gap-2.5">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
        )}
        <h2 className="font-bold text-xs sm:text-sm md:text-[15px] text-slate-800 tracking-tight truncate">
          {pageTitle}
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Context Switcher (e.g. FY) */}
        {financialYears.length > 0 && (
          <div className="w-32 sm:w-44">
            <SearchableSelect
              options={financialYears.map((fy) => ({
                label: fy.label || fy.name,
                value: String(fy.id || fy.value),
              }))}
              value={selectedFinYearId}
              onChange={handleFinYearChange}
              placeholder="Select FY"
            />
          </div>
        )}

        {/* Notifications Icon */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* User Profile Avatar with Themed Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="themed-avatar-ring w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-transform hover:scale-105"
          >
            {user?.name?.[0]?.toUpperCase() || "A"}
          </button>

          {/* Profile & Theme Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-3">
              {/* User Identity */}
              <div className="border-b border-slate-100 pb-2.5">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Admin User"}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>

              {/* Theme Palette Swatch Selector */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Theme Palette
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {PALETTES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setTheme(p.id as any)}
                      className={`w-5 h-5 rounded-full ${p.bg} transition-all cursor-pointer ${
                        theme === p.id ? "scale-125 ring-2 ring-primary ring-offset-2" : "opacity-75 hover:opacity-100"
                      }`}
                      title={p.label}
                    />
                  ))}
                </div>
              </div>

              <div className="h-px bg-slate-100" />

              {/* Action Buttons */}
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Account Settings
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-600 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

---

## 5. Complete Shell Integration (`admin/layout.tsx`)

Binds the Sidebar, Header, permissions provider, and scroll canvas into a unified layout:

```tsx
"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/admin/Sidebar/Sidebar";
import { Header } from "@/components/admin/Header/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const user = { name: "System Admin", email: "admin@enterprise.com" };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* 1. Themed Sidebar */}
      <Sidebar
        navSections={[]}
        user={user}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Themed Header */}
        <Header
          pageTitle="Dashboard"
          user={user}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Scrollable Content Viewport */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 p-3 sm:p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
```

