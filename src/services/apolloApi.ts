import { getSetting } from '@/services/settingsService';
import { SETTING_KEYS } from '@/utils/constants';
import type { ApolloResult } from '@/types';

export async function searchApolloContact(
  companyName: string,
  title: string,
  location?: string
): Promise<ApolloResult | null> {
  const apiKey = await getSetting(SETTING_KEYS.APOLLO_API_KEY);
  if (!apiKey) throw new Error('Apollo.io API key not configured. Go to Settings.');

  const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
    body: JSON.stringify({
      api_key: apiKey,
      q_organization_name: companyName,
      person_titles: [title],
      person_locations: location ? [location] : ['Australia'],
      page: 1,
      per_page: 1,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Apollo API error: ${err}`);
  }

  const json = await response.json();
  const person = json.people?.[0];
  if (!person) return null;

  return {
    email: person.email ?? '',
    firstName: person.first_name ?? '',
    lastName: person.last_name ?? '',
    title: person.title ?? '',
    phone: person.phone_number ?? null,
    linkedinUrl: person.linkedin_url ?? null,
    companyName: person.organization?.name ?? companyName,
    employeeCount: person.organization?.estimated_num_employees ?? null,
  };
}

export async function revealApolloEmail(personId: string): Promise<string | null> {
  const apiKey = await getSetting(SETTING_KEYS.APOLLO_API_KEY);
  if (!apiKey) throw new Error('Apollo.io API key not configured.');

  const response = await fetch('https://api.apollo.io/v1/people/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      id: personId,
      reveal_personal_emails: false,
    }),
  });

  if (!response.ok) throw new Error('Apollo reveal failed');
  const json = await response.json();
  return json.person?.email ?? null;
}
