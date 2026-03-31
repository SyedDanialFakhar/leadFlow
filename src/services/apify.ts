import { getSetting } from '@/services/settingsService';
import { SETTING_KEYS, AGENCY_KEYWORDS, NO_AGENCY_PHRASES, MAX_EMPLOYEE_COUNT } from '@/utils/constants';
import type { ScrapeResult, ScrapeConfig } from '@/types';
import { parseEmployeeCount } from '@/utils/contactPicker';
import { differenceInDays } from 'date-fns';

export async function runApifyScrape(config: ScrapeConfig): Promise<ScrapeResult[]> {
  const token = await getSetting(SETTING_KEYS.APIFY_TOKEN);
  if (!token) throw new Error('Apify token not configured. Go to Settings to add it.');

  const actorId = 'apify~web-scraper';
  const startUrl = buildSeekUrl(config);

  const response = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls: [{ url: startUrl }],
        pageFunction: getSeekPageFunction(),
        proxyConfiguration: { useApifyProxy: true },
        maxPagesPerCrawl: 10,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Apify API error: ${errText}`);
  }

  const runData = await response.json();
  const runId = runData.data?.id;
  if (!runId) throw new Error('Failed to start Apify run');

  // Poll for completion
  let status = 'RUNNING';
  while (status === 'RUNNING' || status === 'READY') {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.apify.com/v2/acts/${actorId}/runs/${runId}?token=${token}`);
    const statusData = await statusRes.json();
    status = statusData.data?.status ?? 'FAILED';
  }

  if (status !== 'SUCCEEDED') throw new Error(`Apify run failed with status: ${status}`);

  // Fetch results
  const datasetRes = await fetch(
    `https://api.apify.com/v2/acts/${actorId}/runs/${runId}/dataset/items?token=${token}`
  );
  const items = await datasetRes.json();

  return (items as Record<string, unknown>[]).map((item) => mapApifyItemToResult(item, config));
}

function buildSeekUrl(config: ScrapeConfig): string {
  const cityMap: Record<string, string> = {
    Melbourne: 'Melbourne+VIC',
    Sydney: 'Sydney+NSW',
    Brisbane: 'Brisbane+QLD',
  };
  const query = encodeURIComponent(config.roleQuery);
  const location = cityMap[config.city] ?? config.city;
  return `https://www.seek.com.au/${query}-jobs/in-${location}?sortmode=ListedDate`;
}

function getSeekPageFunction(): string {
  return `async function pageFunction(context) {
    const { page, request } = context;
    const results = [];
    const jobs = await page.$$eval('.job-card', cards => cards.map(c => ({
      title: c.querySelector('[data-automation="jobTitle"]')?.textContent?.trim(),
      company: c.querySelector('[data-automation="jobCompany"]')?.textContent?.trim(),
      url: c.querySelector('a')?.href,
      posted: c.querySelector('[data-automation="jobListingDate"]')?.textContent?.trim(),
      location: c.querySelector('[data-automation="jobLocation"]')?.textContent?.trim(),
    })));
    return jobs;
  }`;
}

function mapApifyItemToResult(item: Record<string, unknown>, config: ScrapeConfig): ScrapeResult {
  const title = (item.title as string) ?? '';
  const company = (item.company as string) ?? '';
  const description = (item.description as string) ?? '';

  return {
    jobAdUrl: (item.url as string) ?? '',
    companyName: company,
    jobTitle: title,
    datePosted: (item.posted as string) ?? new Date().toISOString(),
    city: config.city,
    platform: 'seek',
    applicantCount: (item.applicantCount as number) ?? undefined,
    adDescription: description || undefined,
    companyEmployeeCount: (item.employeeCount as string) ?? undefined,
    isRecruitmentAgency: isAgencyCompany(company, description),
    noAgencyDisclaimer: hasNoAgencyDisclaimer(description),
    isPromoted: (item.isPromoted as boolean) ?? false,
    rawData: item,
  };
}

export function isAgencyCompany(companyName: string, description: string): boolean {
  const text = `${companyName} ${description}`.toLowerCase();
  return AGENCY_KEYWORDS.some((kw) => text.includes(kw));
}

export function hasNoAgencyDisclaimer(description: string): boolean {
  const lower = description.toLowerCase();
  return NO_AGENCY_PHRASES.some((phrase) => lower.includes(phrase));
}

export function filterScrapeResults(results: ScrapeResult[], minAgeDays: number): {
  passed: ScrapeResult[];
  filtered: ScrapeResult[];
} {
  const passed: ScrapeResult[] = [];
  const filtered: ScrapeResult[] = [];

  for (const result of results) {
    const age = differenceInDays(new Date(), new Date(result.datePosted));
    const empCount = result.companyEmployeeCount ? parseEmployeeCount(result.companyEmployeeCount) : 0;

    if (age < minAgeDays) { filtered.push(result); continue; }
    if (result.isRecruitmentAgency) { filtered.push(result); continue; }
    if (empCount > MAX_EMPLOYEE_COUNT) { filtered.push(result); continue; }

    passed.push(result);
  }

  return { passed, filtered };
}
