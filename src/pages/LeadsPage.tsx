import { useState } from 'react';
import { useLeads } from '@/hooks/useLeads';
import { useFilters } from '@/hooks/useFilters';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { LeadTable } from '@/components/leads/LeadTable';
import { LeadFiltersBar } from '@/components/leads/LeadFilters';
import { LeadDetailModal } from '@/components/leads/LeadDetailModal';
import { AddLeadModal } from '@/components/leads/AddLeadModal';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { applyFilters } from '@/utils/filterUtils';
import type { Lead, LeadStatus } from '@/types';
import { Plus, Download, Trash2 } from 'lucide-react';

export default function LeadsPage() {
  const { leads, isLoading, createLead, updateLead, deleteLead, bulkUpdateStatus, exportToCSV } = useLeads();
  const { filters, setFilter, clearFilters } = useFilters();
  const { showToast } = useToastContext();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = applyFilters(leads, filters);

  const handleStatusChange = async (id: string, status: LeadStatus) => {
    try {
      await updateLead({ id, updates: { status } });
      showToast('Status updated', 'success');
    } catch { showToast('Failed to update status', 'error'); }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkUpdateStatus({ ids: selectedIds, status: 'deleted' });
      setSelectedIds([]);
      showToast(`${selectedIds.length} leads marked as deleted`, 'success');
    } catch { showToast('Bulk update failed', 'error'); }
  };

  if (isLoading) return <Layout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Leads"
        description={`${filtered.length} leads`}
        actions={
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <button onClick={handleBulkDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" /> Delete {selectedIds.length}
              </button>
            )}
            <button onClick={exportToCSV} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> Add Lead
            </button>
          </div>
        }
      />
      <div className="space-y-4">
        <LeadFiltersBar filters={filters} onFilterChange={setFilter} onClear={clearFilters} />
        <LeadTable
          leads={filtered}
          selectedIds={selectedIds}
          onSelect={setSelectedIds}
          onClickLead={setDetailLead}
          onStatusChange={handleStatusChange}
        />
      </div>
      <LeadDetailModal
        lead={detailLead}
        isOpen={!!detailLead}
        onClose={() => setDetailLead(null)}
        onUpdate={async (id, updates) => { await updateLead({ id, updates }); }}
      />
      <AddLeadModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onCreate={async (lead) => { await createLead(lead); showToast('Lead added', 'success'); }}
      />
    </Layout>
  );
}
