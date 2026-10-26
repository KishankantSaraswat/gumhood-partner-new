---
name: frontend-blueprint
description: >-
  Comprehensive SaaS frontend engineering playbook and architectural guide.
  Use when designing, building, or refactoring frontend products, tab-based forms,
  executive analytics dashboards, tokenized theme systems, and reusable SaaS UI components.
---

# SaaS Frontend Engineering Blueprint

This skill is the master blueprint for developing modern, scalable, high-performance SaaS frontend applications. It encapsulates proven architectural patterns, compact UI standards, tab-based form engineering, executive dashboard systems, and tokenized multi-theme design systems.

---

## 1. Core Engineering Philosophy

Every frontend feature must adhere to the 5-step lifecycle:

```text
SEARCH  ───►  UNDERSTAND  ───►  REUSE  ───►  IMPLEMENT  ───►  VERIFY
```

1. **Search Before Creating**: Never write a new component, hook, CSS class, or utility before scanning the codebase for an existing one.
2. **Strict Separation of Concerns**:
   - **Pages (`app/**/page.tsx`)**: Routing, metadata, page title, layout container.
   - **Components (`components/`)**: Pure presentation, layout rendering, UI interaction.
   - **Hooks (`hooks/` or `use*.ts`)**: Business logic, API calls, state aggregation, caching, calculations.
   - **Services (`services/*.service.ts`)**: Direct HTTP client calls, payload normalization, error handling.
   - **Types & Schemas (`types.ts`, `schemas/`)**: Data contracts, validation rules, type safety.
3. **Strict Zero Inline CSS**: Never use React inline style objects (`style={{ ... }}`) or inline HTML attributes. Use tokenized design system classes and CSS variables.
4. **Compact, Information-Dense SaaS UI**: Tight, readable padding, 36–38px input heights, consistent 12–16px border radii, 6-column responsive grids, clean typography.
5. **Universal Validation**: Every form field must validate format, boundary, requirement, and sanitize inputs (e.g. trimming whitespace, numeric key-blocking).

---

## 2. Topic References & Detailed Guides

Explore these specialized deep-dive references when building specific modules:

- 📋 **[Tab-Based Forms Blueprint](./references/tabbed-forms.md)**  
  Architecture for multi-tab forms, unified state, active tab pill animations, cross-tab validation tracking, unsaved changes detection, and standard form footers.

- 📊 **[Dashboard & Analytics Architecture](./references/dashboard-builder.md)**  
  The 7-layer architecture for enterprise SaaS dashboards: custom hook separation, filter bars, KPI grid cards with trends, responsive Recharts sections, drilldown modals, and skeleton loaders.

- 🎨 **[Theme & Design System Guide](./references/theme-design-system.md)**  
  CSS variable tokens, multi-brand accent themes (`blue`, `green`, `orange`, `yellow`, `red`, `violet`), dark/light mode toggle, surface elevation hierarchy, and zero-inline-style rules.

- 📏 **[Table & Data Presentation Standards](./references/alignment-and-tables.md)**  
  Strict column alignment standards, server-side/client-side pagination, sorting, status badges, and action dropdowns.

---

## 3. Recommended Frontend Directory Structure

When starting or structuring any new product:

```text
src/
├── app/                          # Next.js App Router (or router pages)
│   ├── (auth)/login/             # Clean auth layout & page
│   ├── admin/                    # Authenticated administrative workspace
│   │   ├── dashboard/            # Executive dashboard modules
│   │   │   ├── useDashboardData.ts
│   │   │   ├── DashboardFilterBar.tsx
│   │   │   ├── DashboardKpiGrid.tsx
│   │   │   ├── DashboardChartsSection.tsx
│   │   │   ├── DashboardKpiModal.tsx
│   │   │   └── dashboardTypes.ts
│   │   └── [entity]/             # Feature module (e.g., machines, products, orders)
│   │       ├── page.tsx          # Orchestrator (PageTabs: List vs Add/Edit)
│   │       ├── components/       # Entity-specific form, modal, filter panels
│   │       ├── services/         # Entity-specific API communication
│   │       └── types.ts          # Entity data contracts
│   ├── globals.css               # Design system tokens, @theme variables, utilities
│   └── layout.tsx                # Root layout with ThemeProvider, Toaster, Auth
├── components/
│   ├── common/                   # Reusable shared components across the entire app
│   │   ├── PageTabs.tsx          # Top-level view switcher with spring pill indicator
│   │   ├── AnimatedTabs.tsx      # Sub-tabs / segmented controls
│   │   ├── DataTable/            # Enterprise table with sort, pagination, search
│   │   ├── SearchableSelect.tsx  # Async/sync searchable select with portal popover
│   │   ├── CustomDatePicker.tsx  # Styled date picker matching design system
│   │   ├── FormFooter.tsx        # Standard Save, Cancel, Next, Previous footer
│   │   ├── StatusBadge.tsx       # Standard colored status pill/badge
│   │   ├── PermissionGuard.tsx   # Granular permission check wrapper
│   │   └── FilterPanel.tsx       # Collapsible or top-bar filter panel
│   └── ui/                       # Low-level primitives (Modals, Tooltips, Toasts)
├── context/                      # Global React contexts (Theme, Auth, Notification)
├── hooks/                        # Generic reusable hooks (useDebounce, usePagination)
├── lib/                          # API client (Axios/Fetch instance, interceptors)
└── utils/                        # Sanitizers, formatters (currency, dates, numbers)
```

---

## 4. Key Commandments for New Products

1. **State Co-location**: Keep state as close to where it is used as possible. Never push local form state into global stores unless needed globally.
2. **Controlled Inputs with Sanitization**:
   - Sanitize text (`sanitizeText`) to strip trailing spaces or unwanted control characters.
   - Sanitize numbers (`sanitizeNumber`, `handleNumberKeyDown`) to prevent non-digit keystrokes and scientific notation `e`.
3. **Graceful Loading & Empty States**:
   - Always render animated skeletons (`Skeleton`) instead of blank white screens during data fetches.
   - Always render contextual `EmptyState` with a helpful description and an action button ("No records found. Click 'Add New' to create one.").
4. **Never Block the User**:
   - Show instantaneous optimistic UI where appropriate.
   - Prevent double submissions by disabling submit buttons and displaying a spinner (`Loader2 className="animate-spin"`).
5. **Responsive Density**:
   - Use `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6` for compact enterprise data entry.
   - Use `h-9` or `py-2 px-3` for inputs, buttons, and selects so users can view more data without excessive scrolling.

