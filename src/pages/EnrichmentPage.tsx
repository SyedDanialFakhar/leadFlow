import { useLeads } from '@/hooks/useLeads';
import { useEnrichment } from '@/hooks/useEnrichment';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { EnrichmentPanel } from '@/components/enrichment/EnrichmentPanel';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { useEffect } from 'react';

export default function EnrichmentPage() {
  const { leads, isLoading } = useLeads();
  const { isEnriching, hunterCredits, apolloCredits, refreshCredits, enrichWithHunter, enrichWithApollo, skipLead } = useEnrichment();
  const { showToast } = useToastContext();

  useEffect(() => { refreshCredits(); }, [refreshCredits]);

  if (isLoading) return <Layout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></Layout>;

  return (
    <Layout>
      <PageHeader title="Enrichment" description="Find contact details for your leads" />
      <EnrichmentPanel
        leads={leads}
        isEnriching={isEnriching}
        hunterCredits={hunterCredits}
        apolloCredits={apolloCredits}
        onHunter={async (lead) => { try { const r = await enrichWithHunter(lead); showToast(r ? `Found: ${r.email}` : 'No email found', r ? 'success' : 'warning'); } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); } }}
        onApollo={async (lead) => { try { const r = await enrichWithApollo(lead); showToast(r ? `Found: ${r.email}` : 'No result', r ? 'success' : 'warning'); } catch (e) { showToast(e instanceof Error ? e.message : 'Failed', 'error'); } }}
        onSkip={async (id) => { await skipLead(id); showToast('Lead skipped', 'info'); }}
      />
    </Layout>
  );
}
