import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchEmailQueue, getEmailsSentToday, addToEmailQueue, sendQueuedEmail, sendAllQueued, getLeadsDueForFollowUp } from '@/services/emailService';
import type { Lead, EmailTemplate, EmailQueueItem } from '@/types';
import { DAILY_EMAIL_LIMIT } from '@/utils/constants';

const DEFAULT_TEMPLATE: EmailTemplate = {
  subject: 'Re: [JobTitle] – Quick Introduction',
  bodyHtml: `<p>Hi [ContactFirstName],</p>
<p>I noticed you've been looking for a <strong>[JobTitle]</strong> for <strong>[CompanyName]</strong> in [City]. Finding the right candidate can be challenging — I'd love to help.</p>
<p>At our agency, we specialise in sourcing top-tier [ContactRole] talent across Australia. We have a number of strong candidates who could be a great fit.</p>
<p>Would you be open to a quick 10-minute call to discuss?</p>
<p>Best regards,<br/>Charlie</p>`,
};

export function useEmail() {
  const qc = useQueryClient();
  const [template, setTemplate] = useState<EmailTemplate>(DEFAULT_TEMPLATE);
  const [isSending, setIsSending] = useState(false);

  const queueQuery = useQuery({
    queryKey: ['email-queue'],
    queryFn: fetchEmailQueue,
  });

  const sentTodayQuery = useQuery({
    queryKey: ['emails-sent-today'],
    queryFn: getEmailsSentToday,
  });

  const queue = queueQuery.data ?? [];
  const sentToday = sentTodayQuery.data ?? 0;

  const dueQuery = useQuery({
    queryKey: ['leads-due-follow-up'],
    queryFn: getLeadsDueForFollowUp,
  });

  const leadsDue = dueQuery.data ?? [];

  const stats = {
    sentToday,
    dailyLimit: DAILY_EMAIL_LIMIT,
    queued: queue.filter((q) => q.status === 'queued').length,
    failed: queue.filter((q) => q.status === 'failed').length,
  };

  const addLead = useCallback(async (lead: Lead) => {
    await addToEmailQueue(lead, template);
    qc.invalidateQueries({ queryKey: ['email-queue'] });
  }, [template, qc]);

  const sendSingle = useCallback(async (item: EmailQueueItem) => {
    setIsSending(true);
    try {
      await sendQueuedEmail(item);
      qc.invalidateQueries({ queryKey: ['email-queue'] });
      qc.invalidateQueries({ queryKey: ['emails-sent-today'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    } finally {
      setIsSending(false);
    }
  }, [qc]);

  const sendAll = useCallback(async () => {
    setIsSending(true);
    try {
      const result = await sendAllQueued();
      qc.invalidateQueries({ queryKey: ['email-queue'] });
      qc.invalidateQueries({ queryKey: ['emails-sent-today'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      return result;
    } finally {
      setIsSending(false);
    }
  }, [qc]);

  return {
    queue,
    stats,
    template,
    leadsDue,
    setTemplate,
    addToQueue: addLead,
    sendSingle,
    sendAll,
    isLoading: queueQuery.isLoading || isSending || dueQuery.isLoading,
  };
}
