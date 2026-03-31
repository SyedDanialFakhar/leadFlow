import { useState } from 'react';
import type { Lead, LeadStatus } from '@/types';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/utils/cn';
import { STATUSES, LEADS_PER_PAGE } from '@/utils/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeadTableProps {
  leads: Lead[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onClickLead: (lead: Lead) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

export function LeadTable({ leads, selectedIds, onSelect, onClickLead, onStatusChange }: LeadTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(leads.length / LEADS_PER_PAGE));
  const pageLeads = leads.slice(page * LEADS_PER_PAGE, (page + 1) * LEADS_PER_PAGE);

  const allSelected = pageLeads.length > 0 && pageLeads.every((l) => selectedIds.includes(l.id));

  const toggleAll = () => {
    if (allSelected) {
      onSelect(selectedIds.filter((id) => !pageLeads.some((l) => l.id === id)));
    } else {
      const newIds = new Set(selectedIds);
      pageLeads.forEach((l) => newIds.add(l.id));
      onSelect(Array.from(newIds));
    }
  };

  const toggleOne = (id: string) => {
    onSelect(selectedIds.includes(id) ? selectedIds.filter((i) => i !== id) : [...selectedIds, id]);
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3"><input type="checkbox" checked={allSelected} onChange={toggleAll} /></th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Job Title</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Enrichment</th>
            </tr>
          </thead>
          <tbody>
            {pageLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onClickLead(lead)}
                className={cn(
                  'cursor-pointer border-b last:border-0 hover:bg-muted/30 transition-colors',
                  lead.followUpRequired && 'border-l-2 border-l-warning',
                  lead.status === 'converted' && 'border-l-2 border-l-success',
                )}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedIds.includes(lead.id)} onChange={() => toggleOne(lead.id)} />
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(lead.datePosted)}</td>
                <td className="px-4 py-3 font-medium text-card-foreground">{lead.companyName}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.jobTitle}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.contactName ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{lead.contactEmail ?? '—'}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{lead.platform}</td>
                <td className="px-4 py-3 text-muted-foreground">{lead.city}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="rounded border bg-card px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><StatusBadge status={lead.enrichmentStatus} type="enrichment" /></td>
              </tr>
            ))}
            {pageLeads.length === 0 && (
              <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">No leads found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-3">
        <span className="text-xs text-muted-foreground">{leads.length} leads total</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
