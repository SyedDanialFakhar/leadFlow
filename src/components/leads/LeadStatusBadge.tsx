import { cn } from '@/utils/cn';
import { STATUS_COLORS, ENRICHMENT_COLORS } from '@/utils/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'enrichment';
  className?: string;
}

export function StatusBadge({ status, type = 'status', className }: StatusBadgeProps) {
  const colors = type === 'enrichment' ? ENRICHMENT_COLORS : STATUS_COLORS;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
      colors[status] ?? 'bg-muted text-muted-foreground',
      className,
    )}>
      {status.replace('_', ' ')}
    </span>
  );
}
