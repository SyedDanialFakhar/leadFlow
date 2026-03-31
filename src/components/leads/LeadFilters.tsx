import type { LeadFilters } from '@/types';
import { PLATFORMS, CITIES, STATUSES, ENRICHMENT_STATUSES } from '@/utils/constants';
import { X, Search } from 'lucide-react';

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFilterChange: <K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => void;
  onClear: () => void;
}

export function LeadFiltersBar({ filters, onFilterChange, onClear }: LeadFiltersBarProps) {
  const selectCls = 'rounded-lg border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search..."
          value={filters.search ?? ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="rounded-lg border bg-card pl-9 pr-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <select className={selectCls} value={filters.platform ?? 'all'} onChange={(e) => onFilterChange('platform', e.target.value as LeadFilters['platform'])}>
        <option value="all">All Platforms</option>
        {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>

      <select className={selectCls} value={filters.city ?? 'all'} onChange={(e) => onFilterChange('city', e.target.value as LeadFilters['city'])}>
        <option value="all">All Cities</option>
        {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>

      <select className={selectCls} value={filters.status ?? 'all'} onChange={(e) => onFilterChange('status', e.target.value as LeadFilters['status'])}>
        <option value="all">All Statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select className={selectCls} value={filters.enrichmentStatus ?? 'all'} onChange={(e) => onFilterChange('enrichmentStatus', e.target.value as LeadFilters['enrichmentStatus'])}>
        <option value="all">All Enrichment</option>
        {ENRICHMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <input type="checkbox" checked={filters.followUpOnly ?? false} onChange={(e) => onFilterChange('followUpOnly', e.target.checked)} className="rounded" />
        Follow-up only
      </label>

      <input type="date" value={filters.dateFrom ?? ''} onChange={(e) => onFilterChange('dateFrom', e.target.value)} className={selectCls} />
      <input type="date" value={filters.dateTo ?? ''} onChange={(e) => onFilterChange('dateTo', e.target.value)} className={selectCls} />

      <button onClick={onClear} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted">
        <X className="h-3 w-3" /> Clear
      </button>
    </div>
  );
}
