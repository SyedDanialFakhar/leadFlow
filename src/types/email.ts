export interface EmailTemplate {
  subject: string;
  bodyHtml: string;
}

export interface EmailQueueItem {
  id: string;
  createdAt: string;
  leadId: string;
  toEmail: string;
  toName: string;
  subject: string;
  bodyHtml: string;
  status: 'queued' | 'sent' | 'failed' | 'skipped';
  sentAt: string | null;
  errorMessage: string | null;
  retryCount: number;
}

export interface EmailStats {
  sentToday: number;
  dailyLimit: number;
  queued: number;
  failed: number;
}
