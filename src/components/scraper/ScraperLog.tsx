import type { ScrapeProgress } from '@/types';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

interface ScraperLogProps {
  entries: ScrapeProgress[];
}

const levelColors: Record<string, string> = {
  info: 'text-muted-foreground',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
};

export function ScraperLog({ entries }: ScraperLogProps) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b px-5 py-3">
        <h3 className="font-semibold text-card-foreground">Scrape Log</h3>
      </div>
      <div className="max-h-64 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {entries.map((entry, i) => (
          <div key={i} className={cn('flex gap-2', levelColors[entry.level])}>
            <span className="text-muted-foreground shrink-0">
              [{format(new Date(entry.timestamp), 'HH:mm:ss')}]
            </span>
            <span className="uppercase font-semibold w-16 shrink-0">[{entry.level}]</span>
            <span>{entry.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
