# Table Column Alignment & Data Presentation Standards

Enterprise SaaS applications revolve around dense, scannable data presentation. Consistent column alignment, pagination, and formatting directly determine usability and data comprehension.

---

## 1. Mandatory Table Column Alignment Rules

Strictly apply these alignment rules across every table (`DataTable`, `GroupedDataTable`, custom summary tables):

| Data Type | Column Alignment | Formatting Convention |
| :--- | :---: | :--- |
| **Text / Names / Descriptions** | **Left** (`text-left`) | Capitalize normal text; never use uppercase CSS transforms. |
| **Numbers / Quantities / Counts** | **Right** (`text-right`) | Comma-separated integers (e.g. `1,250`). Numeric headers right-align with numbers. |
| **Currency / Monetary Amounts** | **Right** (`text-right`) | Symbol + 2 decimals (e.g. `₹ 1,499.00` or `$ 1,499.00`). |
| **Percentages / Ratios** | **Right** (`text-right`) | Decimals + `%` (e.g. `18.50%`). |
| **Dates / Timestamps** | **Left** (`text-left`) | Standard format (e.g. `DD-MM-YYYY` or `15 Oct 2026`). |
| **IDs / Codes / SKU / Serial** | **Left** (`text-left`) | Monospace font or bold text (e.g. `MACH-001`, `INV-8291`). |
| **Status / Badges / Pills** | **Center** (`text-center`) | Centered `StatusBadge` or colored pill. |
| **Actions (Edit, Delete, More)** | **Center** (`text-center`) | Centered icon buttons or dropdown triggers. |

---

## 2. Standard Column Definition Object

```typescript
export interface TableColumn<T> {
  key: string;
  title: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

// Example Column Configuration
export const orderColumns: TableColumn<Order>[] = [
  {
    key: "order_number",
    title: "Order #",
    align: "left",
    sortable: true,
  },
  {
    key: "order_date",
    title: "Date",
    align: "left",
    sortable: true,
    render: (row) => formatDate(row.order_date),
  },
  {
    key: "customer_name",
    title: "Customer",
    align: "left",
  },
  {
    key: "total_items",
    title: "Qty",
    align: "right",
    render: (row) => formatNumber(row.total_items),
  },
  {
    key: "total_amount",
    title: "Amount",
    align: "right",
    sortable: true,
    render: (row) => formatCurrency(row.total_amount),
  },
  {
    key: "status",
    title: "Status",
    align: "center",
    render: (row) => <StatusBadge status={row.status} type="pill" />,
  },
  {
    key: "actions",
    title: "Actions",
    align: "center",
    render: (row) => <RowActionDropdown row={row} />,
  },
];
```

---

## 3. High-Density Table Styles

```css
/* Dense Enterprise Table */
.data-table-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background-color: var(--color-surface-hover);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
}

.data-table-cell {
  font-size: 0.8125rem;
  color: var(--color-text);
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.data-table-row:hover {
  background-color: var(--color-surface-hover);
}
```

