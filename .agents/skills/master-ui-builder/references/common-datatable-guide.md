# Common DataTable & Filter Integration Guide

The common `DataTable` component provides an enterprise-ready, accessible, and high-performance tabular interface with column customization, sorting, pagination, and action controls.

---

## 1. Column Definition Contract

Each column is defined using the `Column<T>` interface:

```typescript
export interface Column<T> {
  key: string;                                          // Field accessor key
  title: string;                                        // Column header text
  align?: "left" | "center" | "right";                  // Alignment standard
  sortable?: boolean;                                   // Enables column sorting
  width?: string;                                       // CSS width (e.g. '140px')
  render?: (row: T, index: number) => React.ReactNode;  // Custom cell renderer
}
```

---

## 2. Mandatory Column Alignment Standards

Strictly apply these alignments across all table columns:

| Data Type | Column Alignment | Formatting Example |
| :--- | :---: | :--- |
| **S.No / Row Index** | **Left** or **Center** | `1`, `2`, `3` |
| **Codes / IDs / Slugs** | **Left** | `<span className="font-bold">MACH-001</span>` |
| **Names / Descriptions** | **Left** | Regular title-cased text |
| **Dates / Timestamps** | **Left** | `15 Oct 2026` or `DD-MM-YYYY` |
| **Quantities / Counts / Txns** | **Right** | Comma-separated numbers (`1,450`) |
| **Amounts / Currency** | **Right** | `₹ 12,450.00` |
| **Percentages / Rates** | **Right** | `18.00%` |
| **Status Badges / Pills** | **Center** | `<StatusBadge status={...} type="pill" />` |
| **Action Buttons** | **Center** | `<ActionButtons onEdit={...} onDelete={...} />` |

---

## 3. Standard DataTable Implementation Example

```tsx
import { DataTable, Column } from "@/components/common/DataTable";
import { ActionButtons } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { usePagination } from "@/components/common/DataTable/hooks/usePagination";
import { useSorting } from "@/components/common/DataTable/hooks/useSorting";

interface Product {
  id: string;
  item_code: string;
  item_name: string;
  category_name: string;
  selling_price: number;
  stock_quantity: number;
  status: boolean;
}

export function ProductTable({
  products,
  loading,
  totalRecords,
  onEdit,
  onDelete,
}: {
  products: Product[];
  loading: boolean;
  totalRecords: number;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  const pagination = usePagination();
  const { sortKey, sortDirection, handleSort } = useSorting();

  const columns: Column<Product>[] = [
    {
      key: "item_code",
      title: "Item Code",
      align: "left",
      sortable: true,
      render: (row) => <span className="font-bold text-slate-900">{row.item_code}</span>,
    },
    {
      key: "item_name",
      title: "Product Name",
      align: "left",
      sortable: true,
      render: (row) => <span className="font-medium text-slate-700">{row.item_name}</span>,
    },
    {
      key: "category_name",
      title: "Category",
      align: "left",
      sortable: true,
    },
    {
      key: "stock_quantity",
      title: "Stock",
      align: "right",
      sortable: true,
      render: (row) => row.stock_quantity.toLocaleString(),
    },
    {
      key: "selling_price",
      title: "Price",
      align: "right",
      sortable: true,
      render: (row) => `₹ ${row.selling_price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    {
      key: "status",
      title: "Status",
      align: "center",
      render: (row) => <StatusBadge status={row.status ? "active" : "inactive"} type="pill" />,
    },
    {
      key: "actions",
      title: "Actions",
      align: "center",
      render: (row) => (
        <ActionButtons
          onEdit={() => onEdit(row)}
          onDelete={() => onDelete(row)}
        />
      ),
    },
  ];

  return (
    <DataTable
      tableId="product-master-table"
      columns={columns}
      data={products}
      loading={loading}
      emptyMessage="No products found."
      showSno={true}
      sorting={{
        sortKey,
        sortDirection,
        onSort: handleSort,
      }}
      pagination={{
        currentPage: pagination.currentPage,
        totalPages: Math.ceil(totalRecords / pagination.rowsPerPage) || 1,
        totalRecords: totalRecords,
        rowsPerPage: pagination.rowsPerPage,
        onPageChange: pagination.handlePageChange,
        onRowsPerPageChange: pagination.handleRowsPerPageChange,
      }}
    />
  );
}
```

---

## 4. FilterPanel Usage

The `FilterPanel` wraps search filters in a collapsible card with **Apply** and **Reset** triggers:

```tsx
import { FilterPanel } from "@/components/common/FilterPanel";
import { SearchableSelect } from "@/components/common/SearchableSelect";

<FilterPanel
  onApply={fetchRecords}
  onReset={() => {
    setFilters({ name: "", category_id: "", status: "" });
    fetchRecords();
  }}
>
  <div>
    <input
      type="text"
      placeholder="Search Product Name"
      value={filters.name}
      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
      className="input w-full"
    />
  </div>
  <div>
    <SearchableSelect
      options={categoryOptions}
      value={filters.category_id}
      onChange={(val) => setFilters({ ...filters, category_id: val })}
      placeholder="Select Category"
    />
  </div>
</FilterPanel>
```

