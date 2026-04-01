import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLeads, fetchLeadStats, createLead, updateLead, deleteLead, bulkUpdateLeadStatus } from '@/services/leadsService';
import type { Lead, LeadStatus } from '@/types';
import { csvExportLeads, downloadCSV } from '@/utils/csvExport';
import { format } from 'date-fns';

export function useLeads() {
  const qc = useQueryClient();

  const leadsQuery = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const statsQuery = useQuery({
    queryKey: ['lead-stats'],
    queryFn: fetchLeadStats,
  });

  const createMutation = useMutation({
    mutationFn: (lead: Partial<Lead>) => createLead(lead),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) => updateLead(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: LeadStatus }) => bulkUpdateLeadStatus(ids, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
    },
  });

  const exportToCSV = () => {
    if (!leadsQuery.data) return;
    const csv = csvExportLeads(leadsQuery.data);
    downloadCSV(csv, `leadflow-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  return {
    leads: leadsQuery.data ?? [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    stats: statsQuery.data ?? { total: 0, newToday: 0, awaitingEnrichment: 0, followUpNeeded: 0, accepted: 0, rejected: 0, called: 0 },
    createLead: createMutation.mutateAsync,
    updateLead: updateMutation.mutateAsync,
    deleteLead: deleteMutation.mutateAsync,
    bulkUpdateStatus: bulkMutation.mutateAsync,
    exportToCSV,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
