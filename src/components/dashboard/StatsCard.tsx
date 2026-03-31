import { cn } from '@/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color?: string;
}

export function StatsCard({ label, value, icon: Icon, color = 'text-primary' }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-card-foreground">{value}</p>
        </div>
        <div className={cn('rounded-lg bg-muted p-3', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
