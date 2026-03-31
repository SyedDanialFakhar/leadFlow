import type { Lead } from '@/types';
import { getRecommendedContactRole } from '@/utils/contactPicker';
import { buildLinkedInSearchUrl, buildGoogleSearchUrl } from '@/services/linkedinScraper';
import { Spinner } from '@/components/ui/Spinner';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { ExternalLink, Search, Globe, SkipForward } from 'lucide-react';

interface EnrichmentPanelProps {
  leads: Lead[];
  isEnriching: boolean;
  hunterCredits: { used: number; limit: number };
  apolloCredits: { used: number; limit: number };
  onHunter: (lead: Lead) => void;
  onApollo: (lead: Lead) => void;
  onSkip: (id: string) => void;
}

export function EnrichmentPanel({
  leads, isEnriching, hunterCredits, apolloCredits,
  onHunter, onApollo, onSkip,
}: EnrichmentPanelProps) {
  const pendingLeads = leads.filter((l) => l.enrichmentStatus === 'pending' && !l.isRecruitmentAgency && !l.noAgencyDisclaimer);

  return (
    <div className="space-y-4">
      {/* Credit counters */}
      <div className="flex gap-4">
        <div className="rounded-xl border bg-card px-5 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Hunter.io</p>
          <p className="text-lg font-bold text-card-foreground">{hunterCredits.used}/{hunterCredits.limit} <span className="text-xs font-normal text-muted-foreground">used</span></p>
        </div>
        <div className="rounded-xl border bg-card px-5 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Apollo Phones</p>
          <p className="text-lg font-bold text-card-foreground">{apolloCredits.used}/{apolloCredits.limit} <span className="text-xs font-normal text-muted-foreground">used</span></p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Recommended Role</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLeads.map((lead) => {
                const role = getRecommendedContactRole(lead.companyEmployeeCount);
                return (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-card-foreground">{lead.companyName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.contactName ?? '—'}</td>
                    <td className="px-5 py-3 text-xs text-primary">{role}</td>
                    <td className="px-5 py-3 text-muted-foreground">{lead.companyEmployeeCount ?? '—'}</td>
                    <td className="px-5 py-3"><StatusBadge status={lead.enrichmentStatus} type="enrichment" /></td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => onHunter(lead)}
                          disabled={isEnriching}
                          className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                          title="Find Email (Hunter)"
                        >
                          {isEnriching ? <Spinner size="sm" /> : 'Hunter'}
                        </button>
                        <button
                          onClick={() => onApollo(lead)}
                          disabled={isEnriching}
                          className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                        >
                          Apollo
                        </button>
                        <a
                          href={buildLinkedInSearchUrl(lead.companyName, role)}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" /> LinkedIn
                        </a>
                        <a
                          href={buildGoogleSearchUrl(lead.companyName, role, lead.city)}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Globe className="h-3 w-3" /> Google
                        </a>
                        <button
                          onClick={() => onSkip(lead.id)}
                          className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <SkipForward className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pendingLeads.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No leads awaiting enrichment</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
