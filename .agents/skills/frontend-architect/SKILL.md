---
name: frontend-architect
description: Strict frontend engineering skill for SaaS applications. Enforces reusable common components, clean separation of UI and business logic, existing CSS reuse, comprehensive form validation, compact UI, minimal code, and production-quality verification. Use for every frontend feature, page, form, dashboard, component, refactor, and bug fix.
---

# Frontend Architect — Mandatory Rules

## 1. Core Workflow

Always follow:

SEARCH → UNDERSTAND → REUSE → IMPLEMENT → VERIFY

Before writing code:
- Inspect the existing project structure and conventions.
- Read package.json and applicable project instructions.
- Find existing components, hooks, utilities, CSS, and API services.
- Understand the existing business logic and expected behavior.
- Identify what can be reused or extended.

Never create new code before checking whether equivalent code already exists.

## 2. Build Common SaaS Components First

Maintain a reusable common component library for components frequently
used in SaaS applications.

Examples include:

- Button, IconButton, and ActionButton
- Input, Textarea, and PasswordInput
- Select, SearchableSelect, and MultiSelect
- DataTable with sorting, searching, filtering, and pagination
- Checkbox, RadioGroup, and Switch
- DatePicker and DateRangePicker
- FormField and validation error messages
- Modal, ConfirmationDialog, and Drawer
- Dropdown, Tooltip, and Popover
- Tabs, Badge, Avatar, and Card
- SearchBar, FilterPanel, and Pagination
- LoadingSpinner, Skeleton, EmptyState, and ErrorState
- FileUpload and notification/toast components

These are examples, not instructions to create every component immediately.

Mandatory rules:

1. Inspect the current common component library before creating anything.
2. If a suitable component exists, reuse or extend it.
3. If a component is needed in multiple places, extract it into a
   separate reusable component.
4. Build shared components with configurable props and consistent behavior.
5. Keep components generic; keep feature-specific business rules outside
   generic shared components.
6. Do not duplicate an existing component under a different name.
7. Do not build a large component library without a real requirement.
8. Keep the common component API simple and consistent.

## 3. DataTable Standards

Whenever a SaaS application needs a data table, inspect the existing
table implementation first.

Reuse or extend the common DataTable to support applicable features:

- Global search and column-specific filters
- Sorting and pagination
- Configurable columns and row actions
- Loading, empty, and error states
- Responsive layouts
- Row selection and bulk actions when required
- Server-side pagination, sorting, and filtering for large datasets
- Consistent formatting for dates, numbers, and status badges
- Accessible column headers and keyboard interactions

Do not implement every feature for every table. Enable only what the
screen requires.

Avoid duplicating table markup, sorting logic, pagination logic,
or filtering logic across pages.

## 4. Separate UI and Business Logic

Never mix complex business logic with UI rendering.

Follow the existing architecture and separate responsibilities into:

- Pages: compose screens and coordinate page-level behavior.
- Components: render UI and handle simple presentation interactions.
- Hooks: manage reusable stateful UI behavior.
- Services: handle API communication and response normalization.
- Schemas/validators: define reusable validation rules.
- Utilities: implement shared, framework-independent operations.
- Types: define request, response, and component contracts.

Rules:

- Keep components small, readable, and focused.
- Extract reusable logic into hooks, services, or utilities.
- Avoid API requests directly inside presentation components when
  the project uses a service layer.
- Do not duplicate business rules across pages.
- Do not move simple code into unnecessary abstractions.
- Follow existing project conventions instead of restructuring
  the entire application unnecessarily.

## 5. CSS and Styling Rules

STRICT RULE: NEVER USE INLINE CSS.

Do not use:
- HTML style attributes
- React inline style objects
- Dynamic inline styles as a shortcut for normal styling

Before adding any CSS:

1. Search for existing relevant classes and selectors.
2. Inspect the current stylesheet and design tokens.
3. Check whether the existing component already supports the style.
4. Reuse existing CSS wherever possible.
5. Add a new class only when existing styles cannot satisfy the requirement.

Use the existing CSS architecture, including CSS Modules or regular
CSS, according to the project.

Rules:

- Never introduce a new styling library without approval.
- Avoid duplicate selectors and conflicting overrides.
- Do not create multiple classes for identical styling.
- Use existing variables for colors, spacing, typography, and borders.
- Avoid unnecessary !important declarations.
- Keep responsive styles organized and maintainable.
- Never use CSS transformations to force uppercase text.
- Use normal text capitalization; use text-transform: capitalize
  only when appropriate.
- Never uppercase entire labels, buttons, headings, or table columns
  merely for visual styling.

## 6. Compact and Attractive UI

Design clean, professional SaaS interfaces with minimal wasted space.

- Keep vertical spacing between form fields compact and consistent.
- Use tight but readable padding in cards, forms, tables, and dialogs.
- Align labels, inputs, buttons, and validation messages consistently.
- Avoid unnecessarily large margins and oversized controls.
- Maintain clear visual hierarchy without excessive decoration.
- Keep forms easy to scan and efficient to use.
- Ensure compact layouts remain accessible and usable on mobile.
- Use consistent input heights, button sizes, and border radii.
- Avoid horizontal overflow and inconsistent alignment.

Do not sacrifice readability or accessibility just to reduce spacing.

## 7. Form Validation — Mandatory

Every form field must have appropriate validation before implementation
is considered complete.

First inspect existing schemas, validators, form libraries, and backend
validation. Reuse them instead of duplicating validation logic.

For each field, consider applicable rules:

- Required versus optional
- Correct data type and format
- Minimum and maximum length
- Numeric minimum, maximum, precision, and valid ranges
- Email, phone, URL, date, and identifier formats
- Valid selections for select and multi-select controls
- Allowed file types, file sizes, and upload limits
- Cross-field dependencies and conditional validation
- Duplicate values where uniqueness is required
- Whitespace trimming and empty-string handling
- Invalid, missing, or malformed server responses

Additional requirements:

- Display clear, field-specific validation messages.
- Show errors near the relevant field.
- Validate on the appropriate events, such as blur or submit.
- Prevent duplicate form submissions.
- Preserve entered data when a recoverable request fails.
- Handle server-side validation errors.
- Do not rely exclusively on frontend validation.
- Keep validation rules in reusable schemas or validators when appropriate.
- Do not invent arbitrary restrictions without a business requirement.
- Do not silently discard invalid input.

Use the existing validation library if the project already has one.
Do not add a new dependency without approval.

## 8. Minimal and Clean Code

Always choose the simplest maintainable implementation.

- Write the minimum code needed to solve the requirement correctly.
- Reuse existing functions, hooks, components, and constants.
- Avoid repeated conditions, duplicated API calls, and copied markup.
- Remove unused imports, variables, and dead code related to your changes.
- Use meaningful names and consistent formatting.
- Prefer early returns and simple control flow where appropriate.
- Avoid deeply nested conditions and unnecessarily long functions.
- Do not create abstractions used only once unless they provide a clear benefit.
- Do not create one enormous component for an entire feature.
- Avoid unnecessary comments that repeat the code.
- Do not compress code so aggressively that it becomes difficult to read.
- Never sacrifice correctness, validation, or accessibility to reduce lines.

## 9. SaaS Application Requirements

Where applicable, preserve the existing multi-tenant structure:

Company → Branch → Users → Roles/Groups → Permissions

- Respect the authenticated company and selected branch.
- Render navigation and actions according to authorized permissions.
- Reuse database-driven menus and permission mechanisms.
- Support web/mobile menu visibility when required.
- Reuse existing authentication and API services.
- Handle unauthorized and expired-session responses correctly.
- Never hardcode permissions when the project provides a permission system.
- Never treat hiding a frontend button as backend authorization.
- Never expose API secrets or sensitive server configuration.

Do not assume every project uses this exact hierarchy. Follow the
actual requirements and existing implementation.

## 10. API and State Management

- Reuse the existing API client and request interceptors.
- Follow the actual backend request and response contracts.
- Keep API communication outside presentation components when appropriate.
- Handle loading, success, empty, and error states.
- Prevent duplicate submissions and unnecessary requests.
- Avoid stale state and race conditions where relevant.
- Reuse existing state-management patterns.
- Do not fabricate production data or silently swallow errors.

Never change backend contracts without authorization and an explicit need.

## 11. Safe Implementation

Before modifying existing files:

- Identify dependencies and affected screens.
- Understand the current behavior.
- Search for reusable logic and styles.
- Make the smallest appropriate change.
- Preserve working functionality.
- Avoid unrelated refactoring.
- Do not overwrite existing implementations blindly.
- Ask for clarification when a critical requirement is ambiguous.

## 12. Verification Checklist

Before completing the task, verify:

[ ] Existing components and CSS were inspected first.
[ ] Existing code was reused wherever appropriate.
[ ] Repeated components were extracted where beneficial.
[ ] UI and business logic are properly separated.
[ ] No inline CSS was introduced.
[ ] Form fields have appropriate validation.
[ ] Labels and text use appropriate capitalization.
[ ] Spacing is compact, consistent, and readable.
[ ] No unnecessary code or duplicate logic was added.
[ ] Loading, empty, and error states are handled.
[ ] Responsive and accessibility requirements are considered.
[ ] Applicable lint, type-check, tests, and build commands were run.

Only mark a check complete when it has actually been verified.
If a check cannot be performed, report it as unverified.

## 13. Completion Report

After implementation, report:

1. What was changed.
2. Which files were changed.
3. Which common components and CSS were reused.
4. Which new reusable components were created and why.
5. Which validation rules were implemented.
6. Which verification commands were run and their actual results.
7. Any remaining issues or unverified behavior.

## Final Principle

SEARCH BEFORE CREATING.
REUSE BEFORE DUPLICATING.
SEPARATE UI FROM BUSINESS LOGIC.
NEVER USE INLINE CSS.
VALIDATE EVERY FIELD.
KEEP THE UI COMPACT.
WRITE MINIMUM CLEAN CODE.
VERIFY BEFORE CLAIMING SUCCESS.

