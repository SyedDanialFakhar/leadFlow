import { supabase } from '@/lib/supabaseClient';
import { sendEmailViaResend } from '@/services/resendApi';
import type { EmailQueueItem, Lead, EmailTemplate } from '@/types';
import { dbRowToEmailQueue, dbRowToLead } from '@/utils/mappers';
import { DAILY_EMAIL_LIMIT } from '@/utils/constants';
import { todayISO } from '@/utils/dateUtils';

export async function fetchEmailQueue(): Promise<EmailQueueItem[]> {
  const { data, error } = await supabase
    .from('email_queue')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch email queue: ${error.message}`);
  return (data ?? []).map((r) => dbRowToEmailQueue(r as Record<string, unknown>));
}

export async function getEmailsSentToday(): Promise<number> {
  const today = todayISO();
  const { count, error } = await supabase
    .from('email_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', `${today}T00:00:00`);

  if (error) return 0;
  return count ?? 0;
}

export async function addToEmailQueue(
  lead: Lead,
  template: EmailTemplate
): Promise<void> {
  if (!lead.contactEmail) throw new Error('Lead has no email address');
  if (lead.noAgencyDisclaimer) throw new Error('Lead has no-agency disclaimer');
  if (lead.status === 'rejected' || lead.status === 'accepted') {
    throw new Error('Cannot email rejected or already accepted leads');
  }

  const step = lead.followUpCount + 1;
  if (step > 3) throw new Error('Maximum follow-ups reached (3)');

  const firstName = lead.contactName?.split(' ')[0] ?? 'there';
  let subject = renderTemplate(template.subject, lead, firstName);
  let bodyHtml = renderTemplate(template.bodyHtml, lead, firstName);

  // Add sequence indicators to subject if follow-up
  if (step > 1) {
    subject = `Re: ${subject} (Follow-up #${step - 1})`;
  }

  const { error } = await supabase.from('email_queue').insert({
    lead_id: lead.id,
    to_email: lead.contactEmail,
    to_name: lead.contactName ?? lead.companyName,
    subject,
    body_html: bodyHtml,
    status: 'queued',
    metadata: { sequence_step: step }
  });

  if (error) throw new Error(`Failed to queue email: ${error.message}`);
  
  // Update lead follow-up count
  await supabase.from('leads').update({ 
    follow_up_count: step,
    last_follow_up_at: new Date().toISOString()
  }).eq('id', lead.id);
}

export async function sendQueuedEmail(item: EmailQueueItem): Promise<void> {
  const sentToday = await getEmailsSentToday();
  if (sentToday >= DAILY_EMAIL_LIMIT) {
    throw new Error(`Daily email limit reached (${DAILY_EMAIL_LIMIT})`);
  }

  try {
    await sendEmailViaResend({
      to: item.toEmail,
      subject: item.subject,
      html: item.bodyHtml,
    });

    await supabase
      .from('email_queue')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', item.id);

    await supabase
      .from('leads')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('id', item.leadId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    await supabase
      .from('email_queue')
      .update({
        status: 'failed',
        error_message: message,
        retry_count: item.retryCount + 1,
      })
      .eq('id', item.id);
    throw err;
  }
}

export async function sendAllQueued(): Promise<{ sent: number; failed: number }> {
  const queue = await fetchEmailQueue();
  const queued = queue.filter((q) => q.status === 'queued');
  let sent = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      await sendQueuedEmail(item);
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

export async function getLeadsDueForFollowUp(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .not('contact_email', 'is', null)
    .not('last_follow_up_at', 'is', null)
    .lt('follow_up_count', 3)
    .is('email_sent', true)
    .in('status', ['called', 'assessed', 'new']);

  if (error) return [];

  const leads = (data ?? []).map((r) => dbRowToLead(r as Record<string, unknown>));
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return leads.filter((l) => {
    if (!l.lastFollowUpAt) return false;
    return new Date(l.lastFollowUpAt) <= oneWeekAgo;
  });
}

function renderTemplate(template: string, lead: Lead, firstName: string): string {
  return template
    .replace(/\[ContactFirstName\]/g, firstName)
    .replace(/\[CompanyName\]/g, lead.companyName)
    .replace(/\[JobTitle\]/g, lead.jobTitle)
    .replace(/\[City\]/g, lead.city)
    .replace(/\[ContactRole\]/g, lead.contactJobTitle ?? 'Hiring Manager');
}
