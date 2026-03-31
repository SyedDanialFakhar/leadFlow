import type { Lead, LeadFilters } from '@/types';
import { isAfter, isBefore, parseISO, startOfDay } from 'date-fns';

export function applyFilters(leads: Lead[], filters: LeadFilters): Lead[] {
  return leads.filter((lead) => {
    if (filters.platform && filters.platform !== 'all' && lead.platform !== filters.platform) return false;
    if (filters.city && filters.city !== 'all' && lead.city !== filters.city) return false;
    if (filters.status && filters.status !== 'all' && lead.status !== filters.status) return false;
    if (filters.enrichmentStatus && filters.enrichmentStatus !== 'all' && lead.enrichmentStatus !== filters.enrichmentStatus) return false;
    if (filters.followUpOnly && !lead.followUpRequired) return false;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = [
        lead.companyName, lead.jobTitle, lead.contactName,
        lead.contactEmail, lead.city,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    if (filters.dateFrom) {
      const from = startOfDay(parseISO(filters.dateFrom));
      if (isBefore(parseISO(lead.datePosted), from)) return false;
    }

    if (filters.dateTo) {
      const to = startOfDay(parseISO(filters.dateTo));
      if (isAfter(parseISO(lead.datePosted), to)) return false;
    }

    return true;
  });
}
