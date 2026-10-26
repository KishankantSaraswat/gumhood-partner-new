# Executive SaaS Dashboard & Analytics Architecture

Building high-performance enterprise dashboards requires strict separation between high-frequency state management, API synchronization, data aggregation, and responsive visualization.

---

## 1. The 7-Layer Dashboard Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Data & State Orchestrator: useDashboardData()            │
│    (API fetching, date range math, KPI aggregation, caching)│
└──────────────┬──────────────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Page Orchestrator: DashboardPage                         │
│    ├── Guard: DashboardAccessDenied (if unauthorized)       │
│    └── Skeleton: DashboardSkeleton (while loading)          │
└──────────────┬──────────────────────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Filter Bar: DashboardFilterBar                           │
│    (Range presets, custom date picker, entity filters, sync)│
├─────────────────────────────────────────────────────────────┤
│ 4. Executive KPI Grid: DashboardKpiGrid                     │
│    (StatCards with trend badges, % change, click-to-inspect)│
├─────────────────────────────────────────────────────────────┤
│ 5. Analytics & Charts: DashboardChartsSection               │
│    (Area/Line revenue trends, hourly spikes, product donuts)│
├─────────────────────────────────────────────────────────────┤
│ 6. Performance Breakdown: MachineMetricsTable / TopRankings │
│    (Sortable micro-tables with status badges & progress bars│
├─────────────────────────────────────────────────────────────┤
│ 7. Drill-Down Inspection Modal: DashboardKpiModal           │
│    (Detailed paginated DataTable of records behind any KPI) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Layer 1: The Custom Data Hook (`useDashboardData.ts`)

Never place API fetching or data aggregation directly inside presentation dashboard components. Extract everything into a clean custom hook:

```typescript
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState<string>("30d");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  
  // Drill-down KPI modal state
  const [activeKpi, setActiveKpi] = useState<string | null>(null);

  // Raw & Processed Stats
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    aov: 0,
    growthRate: 0,
    revenueChartData: [] as Array<{ date: string; revenue: number; orders: number }>,
    topProducts: [] as Array<{ name: string; sales: number; revenue: number }>,
  });

  const fetchStats = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = {
        range,
        startDate: range === "custom" ? customStartDate : undefined,
        endDate: range === "custom" ? customEndDate : undefined,
        brandId: brandFilter !== "all" ? brandFilter : undefined,
      };

      const res = await api.get("/admin/dashboard/metrics", { params });
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, customStartDate, customEndDate, brandFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    loading,
    refreshing,
    range,
    setRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    brandFilter,
    setBrandFilter,
    stats,
    activeKpi,
    setActiveKpi,
    refresh: () => fetchStats(true),
  };
}
```

---

## 3. Layer 2: Filter Bar (`DashboardFilterBar.tsx`)

A compact, highly functional filter bar with standard period presets (`Today`, `7D`, `30D`, `MTD`, `Custom`), entity select, and an animated refresh button:

```tsx
import React from "react";
import { RefreshCw, Calendar } from "lucide-react";
import { CustomDatePicker } from "@/components/common/CustomDatePicker";

interface FilterBarProps {
  range: string;
  setRange: (r: string) => void;
  customStartDate: string;
  setCustomStartDate: (d: string) => void;
  customEndDate: string;
  setCustomEndDate: (d: string) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardFilterBar({
  range,
  setRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  refreshing,
  onRefresh,
}: FilterBarProps) {
  const PRESETS = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 Days" },
    { id: "30d", label: "Last 30 Days" },
    { id: "mtd", label: "Month to Date" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="common-surface p-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Range Presets */}
      <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setRange(p.id)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              range === p.id
                ? "bg-white text-primary font-bold shadow-2xs border border-slate-200/90"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Pickers (visible only when 'custom' selected) */}
      {range === "custom" && (
        <div className="flex items-center gap-2">
          <CustomDatePicker
            value={customStartDate}
            onChange={setCustomStartDate}
            placeholder="From Date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <CustomDatePicker
            value={customEndDate}
            onChange={setCustomEndDate}
            placeholder="To Date"
          />
        </div>
      )}

      {/* Refresh Button with Spinner Animation */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="btn-icon w-9 h-9 cursor-pointer"
        title="Refresh Metrics"
      >
        <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}
```

---

## 4. Layer 3: Interactive Metric / KPI Cards (`StatCard`)

Standard metric cards must display:
- **Clean Label & Accent Icon**
- **Formatted Primary Value** (currency with symbol, comma-separated integers)
- **Trend Pill** (positive green, negative red, neutral slate)
- **Comparison Context** ("vs previous 30 days")
- **Interactive Cursor** when drilldown inspection is available

```tsx
import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: number; // e.g. +12.5 or -4.2
  icon: LucideIcon;
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  onClick,
}: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      className={`common-surface p-4 flex flex-col justify-between transition-all duration-200 ${
        onClick ? "cursor-pointer hover:border-primary/40 hover:shadow-md active:scale-[0.99]" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="my-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
      </div>

      <div className="flex items-center justify-between text-xs">
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
        {subValue && <span className="text-slate-400">{subValue}</span>}
      </div>
    </div>
  );
}
```

---

## 5. Layer 4: Recharts Integration Standards

When rendering charts in SaaS dashboards:
1. Wrap all charts inside `<ResponsiveContainer width="100%" height={320}>`.
2. Use CSS Variables or Theme Colors for stroke/fill gradients (`var(--color-primary)`).
3. Use custom `<Tooltip />` formatters so tooltip numbers render with formatted currency or units.
4. Render an empty message state if data array is empty (`data.length === 0`).

