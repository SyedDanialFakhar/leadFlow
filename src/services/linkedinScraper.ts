import type { ScrapeResult, ScrapeConfig } from '@/types';
import { isAgencyCompany, hasNoAgencyDisclaimer } from '@/services/apify';

export async function scrapeLinkedInJobs(config: ScrapeConfig): Promise<ScrapeResult[]> {
  // LinkedIn Guest API — no auth needed for public job listings
  const query = encodeURIComponent(config.roleQuery);
  const locationMap: Record<string, string> = {
    Melbourne: '103116110',
    Sydney: '104769905',
    Brisbane: '101628105',
  };
  const geoId = locationMap[config.city] ?? '';

  try {
    const response = await fetch(
      `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${query}&location=${config.city}%2C+Australia&geoId=${geoId}&sortBy=DD&start=0`
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API returned ${response.status}`);
    }

    const html = await response.text();
    return parseLinkedInHtml(html, config);
  } catch (error) {
    throw new Error(`LinkedIn scraping failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseLinkedInHtml(html: string, config: ScrapeConfig): ScrapeResult[] {
  const results: ScrapeResult[] = [];

  // Parse job cards from LinkedIn guest API HTML response
  const jobCardRegex = /<li>[\s\S]*?<\/li>/g;
  const cards = html.match(jobCardRegex) ?? [];

  for (const card of cards) {
    const titleMatch = card.match(/class="base-search-card__title[^"]*"[^>]*>([^<]+)/);
    const companyMatch = card.match(/class="base-search-card__subtitle[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)/);
    const urlMatch = card.match(/href="(https:\/\/www\.linkedin\.com\/jobs\/view\/[^"?]+)/);
    const dateMatch = card.match(/<time[^>]*datetime="([^"]+)"/);

    const title = titleMatch?.[1]?.trim() ?? '';
    const company = companyMatch?.[1]?.trim() ?? '';
    const url = urlMatch?.[1] ?? '';

    if (!title || !company || !url) continue;

    results.push({
      jobAdUrl: url,
      companyName: company,
      jobTitle: title,
      datePosted: dateMatch?.[1] ?? new Date().toISOString(),
      city: config.city,
      platform: 'linkedin',
      isRecruitmentAgency: isAgencyCompany(company, ''),
      noAgencyDisclaimer: false,
      isPromoted: false,
      rawData: { html: card },
    });
  }

  return results;
}

export function buildLinkedInSearchUrl(companyName: string, role: string): string {
  const query = encodeURIComponent(`${role} ${companyName}`);
  return `https://www.linkedin.com/search/results/people/?keywords=${query}`;
}

export function buildGoogleSearchUrl(companyName: string, role: string, city: string): string {
  const query = encodeURIComponent(`${role} "${companyName}" ${city} site:linkedin.com/in`);
  return `https://www.google.com/search?q=${query}`;
}
