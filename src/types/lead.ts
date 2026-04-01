// src/types/lead.ts
export type LeadStatus = 'new' | 'assessed' | 'called' | 'accepted' | 'rejected' | 'closed' | 'deleted';
export type EnrichmentStatus = 'pending' | 'enriched' | 'not_found' | 'failed';
export type Platform = 'seek' | 'linkedin';
export type City = 'Melbourne' | 'Sydney' | 'Brisbane';

export interface Lead {
  id: string;
  createdAt: string;
  updatedAt: string;
  datePosted: string;
  jobAdUrl: string;
  platform: Platform;
  city: City;
  companyName: string;
  jobTitle: string;
  contactName: string | null;
  contactJobTitle: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactLinkedinUrl: string | null;
  companyEmployeeCount: string | null;
  companyLinkedinUrl: string | null;
  companyWebsite: string | null;
  isRecruitmentAgency: boolean;
  noAgencyDisclaimer: boolean;
  adDescription: string | null;
  reportingTo: string | null;
  applicantCount: number | null;
  opsComments: string | null;
  charlieFeedback: string | null;
  status: LeadStatus;
  enrichmentStatus: EnrichmentStatus;
  emailSent: boolean;
  emailSentAt: string | null;
  followUpRequired: boolean;
  followUpCount: number;
  lastFollowUpAt: string | null;
  rejectionReason: string | null;
  rawScrapeData: Record<string, unknown> | null;
}

export interface LeadFilters {
  platform?: Platform | 'all';
  city?: City | 'all';
  status?: LeadStatus | 'all';
  enrichmentStatus?: EnrichmentStatus | 'all';
  followUpOnly?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LeadStats {
  total: number;
  newToday: number;
  awaitingEnrichment: number;
  followUpNeeded: number;
  accepted: number;
  rejected: number;
  called: number;
}
