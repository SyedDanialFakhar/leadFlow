export interface ScrapeConfig {
  platform: 'seek' | 'linkedin';
  city: 'Melbourne' | 'Sydney' | 'Brisbane';
  roleQuery: string;
  minAgeDays: number;
}

export interface ScrapeResult {
  jobAdUrl: string;
  companyName: string;
  jobTitle: string;
  datePosted: string;
  city: string;
  platform: string;
  contactName?: string;
  contactJobTitle?: string;
  applicantCount?: number;
  adDescription?: string;
  reportingTo?: string;
  companyEmployeeCount?: string;
  isRecruitmentAgency: boolean;
  noAgencyDisclaimer: boolean;
  isPromoted: boolean;
  rawData: Record<string, unknown>;
}

export interface ScrapeRun {
  id: string;
  createdAt: string;
  platform: string;
  city: string;
  jobTitleQuery: string;
  status: 'running' | 'completed' | 'failed';
  leadsFound: number;
  leadsFilteredOut: number;
  leadsAdded: number;
  errorMessage: string | null;
  completedAt: string | null;
  apifyRunId: string | null;
}

export interface ScrapeProgress {
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}
