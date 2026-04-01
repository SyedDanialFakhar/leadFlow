import type { Lead } from '@/types';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { formatDate } from '@/utils/dateUtils';

interface RecentLeadsTableProps {
  leads: Lead[];
}

export function RecentLeadsTable({ leads }: RecentLeadsTableProps) {
  const recent = leads.slice(0, 10);

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-3">
        <h3 className="font-semibold text-card-foreground">Recent Leads</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">Job Title</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Date Posted</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((lead) => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-5 py-3 font-medium text-card-foreground">
                  <div className="flex flex-col">
                    <span>{lead.companyName}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{lead.city} • {lead.platform}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{lead.contactName ?? '—'}</td>
                <td className="px-5 py-3 text-muted-foreground truncate max-w-[150px]">{lead.jobTitle}</td>
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{lead.contactPhone ?? '—'}</td>
                <td className="px-5 py-3 text-muted-foreground">{lead.contactEmail ?? '—'}</td>
                <td className="px-5 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{formatDate(lead.datePosted)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No leads yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
