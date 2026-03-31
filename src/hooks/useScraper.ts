import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { runApifyScrape, filterScrapeResults } from '@/services/apify';
import { scrapeLinkedInJobs } from '@/services/linkedinScraper';
import { insertScrapedLeads } from '@/services/leadsService';
import type { ScrapeConfig, ScrapeResult, ScrapeProgress, ScrapeRun } from '@/types';
import { dbRowToScrapeRun } from '@/utils/mappers';
import { MIN_AD_AGE_DAYS } from '@/utils/constants';

export function useScraper() {
  const qc = useQueryClient();
  const [config, setConfig] = useState<ScrapeConfig>({
    platform: 'seek',
    city: 'Melbourne',
    roleQuery: 'Business Development Manager',
    minAgeDays: MIN_AD_AGE_DAYS,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ScrapeProgress[]>([]);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [filteredCount, setFilteredCount] = useState(0);

  const historyQuery = useQuery({
    queryKey: ['scrape-runs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scrape_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []).map((r) => dbRowToScrapeRun(r as Record<string, unknown>));
    },
  });

  const addLog = useCallback((message: string, level: ScrapeProgress['level'] = 'info') => {
    setProgress((prev) => [...prev, { message, level, timestamp: new Date().toISOString() }]);
  }, []);

  const startScrape = useCallback(async () => {
    setIsRunning(true);
    setProgress([]);
    setResults([]);
    setFilteredCount(0);

    const { data: runRow } = await supabase.from('scrape_runs').insert({
      platform: config.platform,
      city: config.city,
      job_title_query: config.roleQuery,
      status: 'running',
    }).select().single();

    const runId = runRow?.id;

    try {
      addLog(`Starting ${config.platform} scrape for "${config.roleQuery}" in ${config.city}...`);

      let rawResults: ScrapeResult[];
      if (config.platform === 'seek') {
        addLog('Connecting to Apify...');
        rawResults = await runApifyScrape(config);
      } else {
        addLog('Scraping LinkedIn jobs...');
        rawResults = await scrapeLinkedInJobs(config);
      }

      addLog(`Found ${rawResults.length} raw job ads`, 'success');

      const { passed, filtered } = filterScrapeResults(rawResults, config.minAgeDays);
      setFilteredCount(filtered.length);

      addLog(`Filtered out ${filtered.length} ads (agency/age/size)`, 'warning');
      addLog(`${passed.length} leads ready for review`, 'success');

      setResults(passed);

      if (runId) {
        await supabase.from('scrape_runs').update({
          leads_found: rawResults.length,
          leads_filtered_out: filtered.length,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }).eq('id', runId);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Scrape failed';
      addLog(msg, 'error');
      if (runId) {
        await supabase.from('scrape_runs').update({
          status: 'failed',
          error_message: msg,
          completed_at: new Date().toISOString(),
        }).eq('id', runId);
      }
    } finally {
      setIsRunning(false);
      qc.invalidateQueries({ queryKey: ['scrape-runs'] });
    }
  }, [config, addLog, qc]);

  const confirmSave = useCallback(async () => {
    try {
      addLog('Saving leads to database...');
      const leadsToInsert = results.map((r) => ({
        datePosted: r.datePosted,
        jobAdUrl: r.jobAdUrl,
        platform: r.platform as 'seek' | 'linkedin',
        city: r.city as 'Melbourne' | 'Sydney' | 'Brisbane',
        companyName: r.companyName,
        jobTitle: r.jobTitle,
        contactName: r.contactName ?? null,
        contactJobTitle: r.contactJobTitle ?? null,
        applicantCount: r.applicantCount ?? null,
        adDescription: r.adDescription ?? null,
        companyEmployeeCount: r.companyEmployeeCount ?? null,
        isRecruitmentAgency: r.isRecruitmentAgency,
        noAgencyDisclaimer: r.noAgencyDisclaimer,
        reportingTo: r.reportingTo ?? null,
        rawScrapeData: r.rawData,
      }));

      const added = await insertScrapedLeads(leadsToInsert);
      addLog(`Successfully added ${added} new leads!`, 'success');
      setResults([]);
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['lead-stats'] });
      return added;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      addLog(msg, 'error');
      throw err;
    }
  }, [results, addLog, qc]);

  const discard = useCallback(() => {
    setResults([]);
    setProgress([]);
    setFilteredCount(0);
  }, []);

  return {
    config,
    setConfig,
    startScrape,
    isRunning,
    progress,
    results,
    filteredCount,
    confirmSave,
    discard,
    history: historyQuery.data ?? [],
    historyLoading: historyQuery.isLoading,
  };
}
