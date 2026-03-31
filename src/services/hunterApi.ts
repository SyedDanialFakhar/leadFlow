import { getSetting } from '@/services/settingsService';
import { SETTING_KEYS } from '@/utils/constants';
import type { HunterResult } from '@/types';

export async function findEmailByDomain(
  domain: string,
  firstName?: string,
  lastName?: string
): Promise<HunterResult | null> {
  const apiKey = await getSetting(SETTING_KEYS.HUNTER_API_KEY);
  if (!apiKey) throw new Error('Hunter.io API key not configured. Go to Settings.');

  let url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&api_key=${apiKey}`;
  if (firstName) url += `&first_name=${encodeURIComponent(firstName)}`;
  if (lastName) url += `&last_name=${encodeURIComponent(lastName)}`;

  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Hunter API error: ${(err as Record<string, unknown>).message ?? response.statusText}`);
  }

  const json = await response.json();
  const data = json.data;

  if (!data?.email) return null;

  return {
    email: data.email,
    score: data.score ?? 0,
    firstName: data.first_name ?? '',
    lastName: data.last_name ?? '',
    position: data.position ?? '',
    sources: data.sources ?? 0,
  };
}

export async function verifyEmail(email: string): Promise<{ result: string; score: number }> {
  const apiKey = await getSetting(SETTING_KEYS.HUNTER_API_KEY);
  if (!apiKey) throw new Error('Hunter.io API key not configured.');

  const response = await fetch(
    `https://api.hunter.io/v2/email-verifier?email=${encodeURIComponent(email)}&api_key=${apiKey}`
  );

  if (!response.ok) throw new Error('Hunter verification failed');

  const json = await response.json();
  return {
    result: json.data?.result ?? 'unknown',
    score: json.data?.score ?? 0,
  };
}

export async function getHunterUsage(): Promise<{ used: number; limit: number }> {
  const apiKey = await getSetting(SETTING_KEYS.HUNTER_API_KEY);
  if (!apiKey) return { used: 0, limit: 25 };

  try {
    const response = await fetch(`https://api.hunter.io/v2/account?api_key=${apiKey}`);
    const json = await response.json();
    const requests = json.data?.requests ?? {};
    return {
      used: requests.searches?.used ?? 0,
      limit: requests.searches?.available ?? 25,
    };
  } catch {
    return { used: 0, limit: 25 };
  }
}
