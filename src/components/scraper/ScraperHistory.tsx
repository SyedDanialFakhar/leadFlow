import type { ScrapeRun } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { Spinner } from '@/components/ui/Spinner';

interface ScraperHistoryProps {
  runs: ScrapeRun[];
  loading: boolean;
}

export function ScraperHistory({ runs, loading }: ScraperHistoryProps) {
  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-3">
        <h3 className="font-semibold text-card-foreground">Past Scrape Runs</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Platform</th>
              <th className="px-5 py-3">City</th>
              <th className="px-5 py-3">Query</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Found</th>
              <th className="px-5 py-3">Filtered</th>
              <th className="px-5 py-3">Added</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-5 py-3 text-muted-foreground whitespace-nowrap">{formatDateTime(run.createdAt)}</td>
                <td className="px-5 py-3 capitalize">{run.platform}</td>
                <td className="px-5 py-3">{run.city}</td>
                <td className="px-5 py-3 text-muted-foreground">{run.jobTitleQuery}</td>
                <td className="px-5 py-3"><StatusBadge status={run.status} /></td>
                <td className="px-5 py-3">{run.leadsFound}</td>
                <td className="px-5 py-3">{run.leadsFilteredOut}</td>
                <td className="px-5 py-3 font-medium">{run.leadsAdded}</td>
              </tr>
            ))}
            {runs.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No scrape runs yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
