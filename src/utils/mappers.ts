import type { Lead, ScrapeRun, EmailQueueItem } from '@/types';

// DB row (snake_case) -> Lead (camelCase)
export function dbRowToLead(row: Record<string, unknown>): Lead {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    datePosted: row.date_posted as string,
    jobAdUrl: row.job_ad_url as string,
    platform: row.platform as Lead['platform'],
    city: row.city as Lead['city'],
    companyName: row.company_name as string,
    jobTitle: row.job_title as string,
    contactName: (row.contact_name as string) ?? null,
    contactJobTitle: (row.contact_job_title as string) ?? null,
    contactEmail: (row.contact_email as string) ?? null,
    contactPhone: (row.contact_phone as string) ?? null,
    contactLinkedinUrl: (row.contact_linkedin_url as string) ?? null,
    companyEmployeeCount: (row.company_employee_count as string) ?? null,
    companyLinkedinUrl: (row.company_linkedin_url as string) ?? null,
    companyWebsite: (row.company_website as string) ?? null,
    isRecruitmentAgency: (row.is_recruitment_agency as boolean) ?? false,
    noAgencyDisclaimer: (row.no_agency_disclaimer as boolean) ?? false,
    adDescription: (row.ad_description as string) ?? null,
    reportingTo: (row.reporting_to as string) ?? null,
    applicantCount: (row.applicant_count as number) ?? null,
    opsComments: (row.ops_comments as string) ?? null,
    charlieFeedback: (row.charlie_feedback as string) ?? null,
    status: row.status as Lead['status'],
    enrichmentStatus: row.enrichment_status as Lead['enrichmentStatus'],
    emailSent: (row.email_sent as boolean) ?? false,
    emailSentAt: (row.email_sent_at as string) ?? null,
    followUpRequired: (row.follow_up_required as boolean) ?? false,
    followUpCount: (row.follow_up_count as number) ?? 0,
    lastFollowUpAt: (row.last_follow_up_at as string) ?? null,
    rejectionReason: (row.rejection_reason as string) ?? null,
    rawScrapeData: (row.raw_scrape_data as Record<string, unknown>) ?? null,
  };
}

export function leadToDbRow(lead: Partial<Lead>): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  if (lead.datePosted !== undefined) map.date_posted = lead.datePosted;
  if (lead.jobAdUrl !== undefined) map.job_ad_url = lead.jobAdUrl;
  if (lead.platform !== undefined) map.platform = lead.platform;
  if (lead.city !== undefined) map.city = lead.city;
  if (lead.companyName !== undefined) map.company_name = lead.companyName;
  if (lead.jobTitle !== undefined) map.job_title = lead.jobTitle;
  if (lead.contactName !== undefined) map.contact_name = lead.contactName;
  if (lead.contactJobTitle !== undefined) map.contact_job_title = lead.contactJobTitle;
  if (lead.contactEmail !== undefined) map.contact_email = lead.contactEmail;
  if (lead.contactPhone !== undefined) map.contact_phone = lead.contactPhone;
  if (lead.contactLinkedinUrl !== undefined) map.contact_linkedin_url = lead.contactLinkedinUrl;
  if (lead.companyEmployeeCount !== undefined) map.company_employee_count = lead.companyEmployeeCount;
  if (lead.companyLinkedinUrl !== undefined) map.company_linkedin_url = lead.companyLinkedinUrl;
  if (lead.companyWebsite !== undefined) map.company_website = lead.companyWebsite;
  if (lead.isRecruitmentAgency !== undefined) map.is_recruitment_agency = lead.isRecruitmentAgency;
  if (lead.noAgencyDisclaimer !== undefined) map.no_agency_disclaimer = lead.noAgencyDisclaimer;
  if (lead.adDescription !== undefined) map.ad_description = lead.adDescription;
  if (lead.reportingTo !== undefined) map.reporting_to = lead.reportingTo;
  if (lead.applicantCount !== undefined) map.applicant_count = lead.applicantCount;
  if (lead.opsComments !== undefined) map.ops_comments = lead.opsComments;
  if (lead.charlieFeedback !== undefined) map.charlie_feedback = lead.charlieFeedback;
  if (lead.status !== undefined) map.status = lead.status;
  if (lead.enrichmentStatus !== undefined) map.enrichment_status = lead.enrichmentStatus;
  if (lead.emailSent !== undefined) map.email_sent = lead.emailSent;
  if (lead.emailSentAt !== undefined) map.email_sent_at = lead.emailSentAt;
  if (lead.followUpRequired !== undefined) map.follow_up_required = lead.followUpRequired;
  if (lead.followUpCount !== undefined) map.follow_up_count = lead.followUpCount;
  if (lead.lastFollowUpAt !== undefined) map.last_follow_up_at = lead.lastFollowUpAt;
  if (lead.rejectionReason !== undefined) map.rejection_reason = lead.rejectionReason;
  if (lead.rawScrapeData !== undefined) map.raw_scrape_data = lead.rawScrapeData;
  map.updated_at = new Date().toISOString();
  return map;
}

export function dbRowToScrapeRun(row: Record<string, unknown>): ScrapeRun {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    platform: row.platform as string,
    city: row.city as string,
    jobTitleQuery: row.job_title_query as string,
    status: row.status as ScrapeRun['status'],
    leadsFound: (row.leads_found as number) ?? 0,
    leadsFilteredOut: (row.leads_filtered_out as number) ?? 0,
    leadsAdded: (row.leads_added as number) ?? 0,
    errorMessage: (row.error_message as string) ?? null,
    completedAt: (row.completed_at as string) ?? null,
    apifyRunId: (row.apify_run_id as string) ?? null,
  };
}

export function dbRowToEmailQueue(row: Record<string, unknown>): EmailQueueItem {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    leadId: row.lead_id as string,
    toEmail: row.to_email as string,
    toName: row.to_name as string,
    subject: row.subject as string,
    bodyHtml: row.body_html as string,
    status: row.status as EmailQueueItem['status'],
    sentAt: (row.sent_at as string) ?? null,
    errorMessage: (row.error_message as string) ?? null,
    retryCount: (row.retry_count as number) ?? 0,
  };
}
