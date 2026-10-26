# Master Page Orchestrator Architecture

The Master Page (`app/admin/[entity]/page.tsx`) coordinates the switching between the **DataTable List View** and the **Add/Edit Form View** using the standard `PageTabs` component.

---

## 1. Complete Production-Ready Master Page Template

```tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { PageTabs } from "@/components/common/PageTabs";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterPanel } from "@/components/common/FilterPanel";
import { ActionButtons } from "@/components/common/ActionButtons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { usePagination } from "@/components/common/DataTable/hooks/usePagination";
import { useSorting } from "@/components/common/DataTable/hooks/useSorting";
import { MasterEntityForm } from "./components/MasterEntityForm";

export default function MasterEntityPage() {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);

  // Table Data & Loading
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Pagination & Sorting Hooks
  const pagination = usePagination();
  const { sortKey, sortDirection, handleSort } = useSorting();

  // Search Filters
  const [searchFilters, setSearchFilters] = useState({
    code: "",
    name: "",
    status: "",
  });

  // 1. Fetch Paginated Records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        page_no: pagination.currentPage,
        page_size: pagination.rowsPerPage,
        sort_by: sortKey || "created_at",
        sort_type: sortDirection ? sortDirection.toUpperCase() : "DESC",
        search: searchFilters,
      };

      const res = await api.post("/admin/masterlist", payload, undefined, {
        master_name: "entity_master",
      });

      if (res.success && res.data) {
        setRecords(res.data.record || []);
        setTotalRecords(res.data.pagination?.total || res.data.record?.length || 0);
      } else {
        setRecords([]);
        setTotalRecords(0);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.rowsPerPage, sortKey, sortDirection, searchFilters]);

  useEffect(() => {
    if (activeTab === "list") {
      fetchRecords();
    }
  }, [fetchRecords, activeTab]);

  // 2. Action Handlers
  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setActiveTab("add");
  };

  const handleAddNewClick = () => {
    setEditingRecord(null);
    setActiveTab("add");
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    try {
      const res = await api.delete(`/admin/entity-master/${recordToDelete.id}`);
      if (res.success) {
        toast.success("Record deleted successfully");
        setRecordToDelete(null);
        fetchRecords();
      } else {
        toast.error(res.error || "Failed to delete record");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while deleting");
    }
  };

  // 3. DataTable Column Definitions
  const columns: Column<any>[] = [
    {
      key: "code",
      title: "Code",
      align: "left",
      sortable: true,
      render: (row) => <span className="font-bold text-slate-800">{row.code}</span>,
    },
    {
      key: "name",
      title: "Name",
      align: "left",
      sortable: true,
      render: (row) => <span className="font-semibold text-slate-700">{row.name}</span>,
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
          onEdit={() => handleEditClick(row)}
          onDelete={() => setRecordToDelete({ id: row.id, name: row.name })}
        />
      ),
    },
  ];

  return (
    <div className="space-y-2 flex flex-col min-h-0 h-[calc(100vh-75px)]">
      {/* ── Top View Switcher (PageTabs) ── */}
      <PageTabs
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === "list") {
            setActiveTab("list");
            setEditingRecord(null);
          } else {
            handleAddNewClick();
          }
        }}
        isEditing={Boolean(editingRecord)}
        listLabel="All Entities"
        addLabel="Add Entity"
        editLabel="Edit Entity"
      />

      {/* ── View 1: List Mode ── */}
      {activeTab === "list" && (
        <div className="space-y-3 flex-1 flex flex-col min-h-0">
          {/* Collapsible Search / Filter Panel */}
          <FilterPanel
            onApply={fetchRecords}
            onReset={() => {
              setSearchFilters({ code: "", name: "", status: "" });
              fetchRecords();
            }}
          >
            <div>
              <input
                type="text"
                placeholder="Search Code"
                value={searchFilters.code}
                onChange={(e) => setSearchFilters({ ...searchFilters, code: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Search Name"
                value={searchFilters.name}
                onChange={(e) => setSearchFilters({ ...searchFilters, name: e.target.value })}
                className="input w-full"
              />
            </div>
          </FilterPanel>

          {/* Common DataTable */}
          <div className="flex-1 min-h-0">
            <DataTable
              tableId="entity-master-list"
              columns={columns}
              data={records}
              loading={loading}
              emptyMessage="No entities found matching your search."
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
          </div>
        </div>
      )}

      {/* ── View 2: Form Mode (Add or Edit) ── */}
      {activeTab === "add" && (
        <MasterEntityForm
          initialData={editingRecord}
          onSuccess={() => {
            setActiveTab("list");
            setEditingRecord(null);
            fetchRecords();
          }}
          onCancel={() => {
            setActiveTab("list");
            setEditingRecord(null);
          }}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        title="Delete Record"
        description={`Are you sure you want to delete "${recordToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onClose={() => setRecordToDelete(null)}
      />
    </div>
  );
}
```

