import { format, formatDistanceToNow, parseISO, differenceInDays } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy HH:mm');
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function daysSincePosted(dateStr: string): number {
  try {
    return differenceInDays(new Date(), parseISO(dateStr));
  } catch {
    return 0;
  }
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
