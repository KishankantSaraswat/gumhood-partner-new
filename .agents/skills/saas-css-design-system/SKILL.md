---
name: saas-css-design-system
description: Enforce a centralized, reusable, responsive CSS design system across all SaaS frontend pages and portals. Use when creating, updating, refactoring, or reviewing frontend UI and styles.
---

# SaaS CSS Design System Skill

## Goal

Maintain one consistent, professional, responsive UI across the entire SaaS product by reusing shared CSS, design tokens, and common UI components.

## 1. Inspect Before Changing

- Inspect the existing frontend folder structure, stylesheets, CSS variables, and reusable components before making changes.
- Identify existing styles that can be reused instead of creating duplicate rules.
- Check whether a common component or utility class already exists before creating another.
- Preserve existing functionality, routes, permissions, API integrations, and business logic.
- Do not perform a blind global CSS rewrite.

## 2. Centralize the Design System

Organize shared styles into logical modules appropriate to the existing project:

- Design tokens and theme variables
- CSS reset and base styles
- Typography
- Layout and spacing utilities
- Common component styles
- Form styles
- Table styles
- Light and dark themes
- Responsive styles
- Portal-specific styles

Import shared styles through one predictable application entry point.

Do not scatter global styling across individual pages.

## 3. Design Tokens

Define reusable CSS custom properties for:

- Primary, secondary, accent, and neutral colors
- Background and surface colors
- Text and muted text colors
- Success, warning, danger, and informational states
- Font families, sizes, weights, and line heights
- Spacing scale
- Border radius and border colors
- Shadows
- Control heights
- Sidebar width
- Page content width
- Layering and overlay levels

Use tokens instead of repeatedly hardcoding the same values.

Support light and dark themes through semantic variables. Avoid creating unrelated color values in individual pages.

## 4. Common CSS Classes

Create and maintain reusable classes for:

### Layout
- Page containers and page headers
- Page content and page actions
- Flexbox and grid layouts
- Alignment and wrapping
- Responsive columns
- Content sections

### Spacing
- Consistent margin and padding utilities
- Standard gap utilities
- Compact form layouts
- Section spacing

Use a limited, documented spacing scale. Avoid excessive spacing in data-heavy SaaS screens.

### Typography
- Page headings
- Section headings
- Body text
- Muted text
- Labels
- Captions
- Numeric values
- Truncation and wrapping

Never force all text to uppercase. Use normal capitalization and text-transform: capitalize only when appropriate.

### Components
- Buttons and icon buttons
- Cards and statistic cards
- Inputs, textareas, selects, and checkboxes
- Searchable and multiselect controls
- Data tables and pagination
- Badges and status indicators
- Alerts, tooltips, dropdowns, and menus
- Modals and confirmation dialogs
- Tabs, breadcrumbs, empty states, and loading skeletons

Reuse component classes consistently across pages.

## 5. Component Reuse Rules

- If a UI pattern is used more than once, evaluate it for extraction into a shared component.
- Keep reusable component logic separate from its visual styles.
- Keep page-specific business logic out of global CSS.
- Use common Button, Input, Select, DataTable, Modal, Badge, and Pagination components wherever appropriate.
- Use component variants or modifiers rather than duplicating complete styles.
- Do not build an enormous universal component when separate, focused components are clearer.
- Preserve accessibility, keyboard navigation, focus indicators, and disabled states.

## 6. CSS Naming and Scope

- Follow the naming convention already used by the project; otherwise, use consistent semantic names.
- Use descriptive class names rather than styling based on DOM structure.
- Avoid broad selectors that unintentionally affect other pages.
- Avoid unnecessary !important declarations.
- Avoid deeply nested selectors and excessive specificity.
- Do not use global element selectors to implement component-specific appearance.
- Avoid conflicting styles between Admin and Client portals.
- Use scoped component styles or CSS Modules where the project already supports them.

## 7. CSS Quality Rules

- Never add inline CSS or inline style objects for ordinary static presentation.
- Never add duplicate CSS without checking existing styles.
- Never create a new stylesheet for every page when the styles can be shared.
- Before adding a class, search for an existing equivalent.
- Before modifying a shared class, check all pages and components that depend on it.
- Keep selectors small, readable, and maintainable.
- Avoid unnecessary animations, excessive shadows, gradients, and decorative effects.
- Use transitions only where they improve usability.
- Respect reduced-motion preferences.
- Never hide important information solely through responsive CSS.

## 8. Forms and Validation

- Use a consistent label, control, hint, and error layout.
- Keep field spacing compact and consistent.
- Support required, disabled, read-only, focused, invalid, and successful states.
- Make validation errors visible and accessible.
- Use proper input types, labels, and semantic form elements.
- Never rely on CSS alone for validation.
- Keep actual validation rules in application logic or the form validation layer.

## 9. Tables and Data-Heavy Screens

- Use shared table wrappers, headers, cells, row states, and pagination.
- Keep table spacing compact while preserving readability.
- Support horizontal overflow on narrow screens.
- Standardize empty, loading, error, and no-results states.
- Maintain visible focus and adequate contrast.
- Do not use global table styles that break unrelated tables.
- Keep sorting, filtering, permissions, and data fetching in application logic.

## 10. Responsive Design

- Follow the existing project's breakpoint conventions.
- Define a small, consistent set of responsive breakpoints.
- Make forms, tables, dialogs, navigation, cards, and dashboards usable on mobile.
- Avoid fixed widths that cause horizontal overflow.
- Use responsive grid and flex layouts.
- Test narrow screens, tablets, and desktop layouts.
- Ensure responsive changes do not remove essential actions or data.

## 11. Admin and Client Portals

- Use the same foundational design tokens and shared components in both portals.
- Keep portal-specific layouts, navigation, and branding scoped to their respective portals.
- Do not duplicate the entire design system to achieve a different portal appearance.
- Keep sidebar, header, content area, and mobile navigation behavior consistent.
- Ensure permission-based menu visibility is controlled by application logic, not CSS.
- Ensure tenant branding changes semantic tokens rather than requiring page-by-page CSS overrides.

## 12. Light and Dark Themes

- Use semantic tokens for page backgrounds, surfaces, borders, text, controls, and overlays.
- Verify every common component in both themes.
- Check contrast for muted text, placeholders, badges, and disabled states.
- Do not implement dark mode by applying a simple inversion filter.
- Avoid hardcoded light-theme colors inside reusable components.
- Preserve readable tables, charts, dropdowns, and modal surfaces in both themes.

## 13. Required Workflow

For every UI task:

1. Inspect the existing page and shared styles.
2. Identify reusable classes and components.
3. Define the smallest necessary design-system changes.
4. Implement or update shared styles first when appropriate.
5. Update the page to consume shared classes and components.
6. Keep business logic separate from presentation.
7. Check all affected pages for regressions.
8. Test light and dark themes where supported.
9. Test responsive layouts and interactive states.
10. Remove redundant CSS introduced by the refactor.
11. Run the available lint, build, and test commands.
12. Report what changed, which shared components were reused, and any remaining issues.

## 14. Definition of Done

A task is complete only when:

- Existing functionality remains intact.
- Shared CSS is reused instead of duplicated.
- New tokens and classes have clear, consistent names.
- Admin and Client portals remain correctly scoped.
- Forms, tables, dialogs, and navigation remain usable.
- Light and dark themes work where supported.
- Responsive behavior has been checked.
- No unnecessary inline styling or !important overrides were introduced.
- The application builds successfully, or any existing failure is clearly reported.
- Changes are limited to the requested scope.

## Final Principle

Build the design system once, reuse it everywhere, and improve it centrally. Every page should look like part of the same SaaS product without sacrificing the needs of individual screens.

