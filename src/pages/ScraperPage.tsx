import { useScraper } from '@/hooks/useScraper';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { ScraperLog } from '@/components/scraper/ScraperLog';
import { ScraperHistory } from '@/components/scraper/ScraperHistory';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { PLATFORMS, CITIES, ROLE_QUERIES } from '@/utils/constants';
import { Play, Save, X } from 'lucide-react';

export default function ScraperPage() {
  const { config, setConfig, startScrape, isRunning, progress, results, filteredCount, confirmSave, discard, history, historyLoading } = useScraper();
  const { showToast } = useToastContext();

  const selectCls = 'rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <Layout>
      <PageHeader title="Scraper" description="Scrape job ads from Seek and LinkedIn" />
      <div className="space-y-6">
        {/* Config */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-card-foreground">Scrape Configuration</h3>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Platform</label>
              <select disabled className={`${selectCls} opacity-50`} value={config.platform} onChange={(e) => setConfig({ ...config, platform: e.target.value as 'seek' | 'linkedin' })}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
              <select disabled className={`${selectCls} opacity-50`} value={config.city} onChange={(e) => setConfig({ ...config, city: e.target.value as 'Melbourne' | 'Sydney' | 'Brisbane' })}>
                <option value={config.city}>Australia (Nationwide)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Job Title / Keywords</label>
              <input 
                type="text"
                className={selectCls} 
                value={config.roleQuery} 
                onChange={(e) => setConfig({ ...config, roleQuery: e.target.value })}
                placeholder="e.g. Sales Manager"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Search Coverage</label>
              <div className="flex h-[38px] items-center gap-2">
                <input 
                  type="checkbox" 
                  id="bypass"
                  disabled
                  checked={config.bypassFilters} 
                />
                <label htmlFor="bypass" className="text-xs text-muted-foreground opacity-50">Show all Australian results</label>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Min Age (Frozen)</label>
              <input disabled type="number" className={`${selectCls} opacity-50`} value={config.minAgeDays} />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={startScrape}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isRunning ? <Spinner size="sm" className="text-primary-foreground" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Scraping...' : 'Start Scraping'}
            </button>
          </div>
        </div>

        <ScraperLog entries={progress} />

        {/* Results preview */}
        {results.length > 0 && (
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
              <div>
                <h3 className="font-semibold text-card-foreground">Results Preview</h3>
                <p className="text-xs text-muted-foreground">
                  {config.bypassFilters 
                    ? `Showing all ${results.length} results (unfiltered)` 
                    : `${results.length} passed filters, ${filteredCount} filtered out`}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={discard} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" /> Discard
                </button>
                <button
                  onClick={async () => { try { await confirmSave(); showToast('Leads saved!', 'success'); } catch { showToast('Save failed', 'error'); } }}
                  className="inline-flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-sm font-medium text-success-foreground hover:opacity-90"
                >
                  <Save className="h-4 w-4" /> Save to Database
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">Company</th><th className="px-5 py-3">Job Title</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">City</th>
                </tr></thead>
                <tbody>
                  {results.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b last:border-0"><td className="px-5 py-3 font-medium">{r.companyName}</td><td className="px-5 py-3 text-muted-foreground">{r.jobTitle}</td><td className="px-5 py-3 text-muted-foreground">{r.datePosted}</td><td className="px-5 py-3">{r.city}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ScraperHistory runs={history} loading={historyLoading} />
      </div>
    </Layout>
  );
}
