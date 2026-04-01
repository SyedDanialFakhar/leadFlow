import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { findEmailByDomain, getHunterUsage } from '@/services/hunterApi';
import { searchApolloContact } from '@/services/apolloApi';
import { updateLead } from '@/services/leadsService';
import type { Lead } from '@/types';
import { getRecommendedContactRole } from '@/utils/contactPicker';

export function useEnrichment() {
  const qc = useQueryClient();
  const [isEnriching, setIsEnriching] = useState(false);
  const [hunterCredits, setHunterCredits] = useState({ used: 0, limit: 25 });
  const [apolloCredits, setApolloCredits] = useState({ used: 0, limit: 5 });

  const refreshCredits = useCallback(async () => {
    try {
      const usage = await getHunterUsage();
      setHunterCredits(usage);
    } catch { /* ignore */ }
  }, []);

  const enrichWithHunter = useCallback(async (lead: Lead) => {
    if (lead.isRecruitmentAgency || lead.noAgencyDisclaimer) {
      throw new Error('Cannot spend credits on agency/no-agency leads');
    }

    setIsEnriching(true);
    try {
      const domain = lead.companyWebsite
        ? new URL(lead.companyWebsite.startsWith('http') ? lead.companyWebsite : `https://${lead.companyWebsite}`).hostname
        : `${lead.companyName.toLowerCase().replace(/\s+/g, '')}.com.au`;

      const names = lead.contactName?.split(' ') ?? [];
      const result = await findEmailByDomain(domain, names[0], names.slice(1).join(' '));

      if (result) {
        await updateLead(lead.id, {
          contactEmail: result.email,
          contactName: lead.contactName ?? (`${result.firstName} ${result.lastName}`.trim() || null),
          contactJobTitle: lead.contactJobTitle ?? (result.position || null),
          enrichmentStatus: 'enriched',
        });
      } else {
        await updateLead(lead.id, { enrichmentStatus: 'not_found' });
      }

      await refreshCredits();
      qc.invalidateQueries({ queryKey: ['leads'] });
      return result;
    } finally {
      setIsEnriching(false);
    }
  }, [qc, refreshCredits]);

  const enrichWithApollo = useCallback(async (lead: Lead) => {
    if (lead.isRecruitmentAgency || lead.noAgencyDisclaimer) {
      throw new Error('Cannot spend credits on agency/no-agency leads');
    }

    setIsEnriching(true);
    try {
      const role = getRecommendedContactRole(lead.companyEmployeeCount);
      // Refined query: Company + Role + City for better accuracy
      const result = await searchApolloContact(lead.companyName, role, lead.city);

      if (result) {
        await updateLead(lead.id, {
          contactEmail: result.email || lead.contactEmail,
          contactName: `${result.firstName} ${result.lastName}`.trim() || lead.contactName,
          contactJobTitle: result.title || lead.contactJobTitle,
          contactPhone: result.phone || lead.contactPhone,
          contactLinkedinUrl: result.linkedinUrl || lead.contactLinkedinUrl,
          companyEmployeeCount: result.employeeCount?.toString() || lead.companyEmployeeCount,
          enrichmentStatus: result.email ? 'enriched' : 'not_found',
        });

        if (result.phone) {
          setApolloCredits((prev) => ({ ...prev, used: prev.used + 1 }));
        }
      } else {
        await updateLead(lead.id, { enrichmentStatus: 'not_found' });
      }

      qc.invalidateQueries({ queryKey: ['leads'] });
      return result;
    } finally {
      setIsEnriching(false);
    }
  }, [qc]);

  const skipLead = useCallback(async (leadId: string) => {
    await updateLead(leadId, { enrichmentStatus: 'not_found' });
    qc.invalidateQueries({ queryKey: ['leads'] });
  }, [qc]);

  return {
    isEnriching,
    hunterCredits,
    apolloCredits,
    refreshCredits,
    enrichWithHunter,
    enrichWithApollo,
    skipLead,
  };
}
