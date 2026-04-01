export const PLATFORMS = ['seek', 'linkedin'] as const;
export const CITIES = ['Melbourne', 'Sydney', 'Brisbane'] as const;
export const STATUSES = ['new', 'assessed' , 'called', 'accepted', 'rejected', 'closed', 'deleted'] as const;
export const ENRICHMENT_STATUSES = ['pending', 'enriched', 'not_found', 'failed'] as const;

export const ROLE_QUERIES = [
  'Business Development Manager',
  'Account Manager',
  'Sales Manager',
  'Sales Representative',
] as const;

export const AGENCY_KEYWORDS = [
  'recruitment', 'recruiter', 'talent', 'staffing',
  'advisory', 'consulting', 'headhunt', 'executive search', 'people solutions',
];

export const NO_AGENCY_PHRASES = [
  'agencies do not contact', 'no agencies',
  'no recruitment agencies', 'unsolicited', 'agency fee',
];

export const MIN_AD_AGE_DAYS = 14;
export const MAX_EMPLOYEE_COUNT = 500;
export const DAILY_EMAIL_LIMIT = 100;
export const HUNTER_MONTHLY_LIMIT = 25;
export const APOLLO_PHONE_MONTHLY_LIMIT = 5;
export const LEADS_PER_PAGE = 25;

export const SETTING_KEYS = {
  APIFY_TOKEN: 'apify_token',
  HUNTER_API_KEY: 'hunter_api_key',
  APOLLO_API_KEY: 'apollo_api_key',
  RESEND_API_KEY: 'resend_api_key',
  SENDER_EMAIL: 'sender_email',
  SENDER_NAME: 'sender_name',
  DEFAULT_MIN_AGE: 'default_min_age',
  DEFAULT_CITIES: 'default_cities',
  DEFAULT_ROLE: 'default_role',
} as const;

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-secondary text-secondary-foreground',
  assessed: 'bg-primary/10 text-primary',
  called: 'bg-warning/10 text-warning',
  accepted: 'bg-success text-success-foreground font-semibold',
  rejected: 'bg-destructive text-destructive-foreground font-semibold',
  closed: 'bg-muted text-muted-foreground',
  deleted: 'bg-destructive/10 text-destructive line-through',
};

export const ENRICHMENT_COLORS: Record<string, string> = {
  pending: 'bg-secondary text-secondary-foreground',
  enriched: 'bg-success/10 text-success',
  not_found: 'bg-warning/10 text-warning',
  failed: 'bg-destructive/10 text-destructive',
};
