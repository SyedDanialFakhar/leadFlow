import type { Lead } from '@/types';

export function csvExportLeads(leads: Lead[]): string {
  const headers = [
    'Date Posted', 'Company', 'Job Title', 'Platform', 'City',
    'Contact Name', 'Contact Title', 'Email', 'Phone', 'LinkedIn',
    'Company Size', 'Status', 'Enrichment', 'Follow-Up',
  ];

  const rows = leads.map((l) => [
    l.datePosted, l.companyName, l.jobTitle, l.platform, l.city,
    l.contactName ?? '', l.contactJobTitle ?? '', l.contactEmail ?? '',
    l.contactPhone ?? '', l.contactLinkedinUrl ?? '',
    l.companyEmployeeCount ?? '', l.status, l.enrichmentStatus,
    l.followUpRequired ? 'Yes' : 'No',
  ]);

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  return lines.join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
