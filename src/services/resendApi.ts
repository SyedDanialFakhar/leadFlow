import { getSetting } from '@/services/settingsService';
import { SETTING_KEYS } from '@/utils/constants';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  fromEmail?: string;
}

export async function sendEmailViaResend(params: SendEmailParams): Promise<{ id: string }> {
  const apiKey = await getSetting(SETTING_KEYS.RESEND_API_KEY);
  if (!apiKey) throw new Error('Resend API key not configured. Go to Settings.');

  const senderEmail = params.fromEmail ?? (await getSetting(SETTING_KEYS.SENDER_EMAIL)) ?? 'onboarding@resend.dev';
  const senderName = params.fromName ?? (await getSetting(SETTING_KEYS.SENDER_NAME)) ?? 'LeadFlow';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: `${senderName} <${senderEmail}>`,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Resend API error: ${(err as Record<string, string>).message ?? response.statusText}`);
  }

  return response.json();
}
