import { cn } from '@/utils/cn';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: {
    container: 'border-l-4 border-l-success',
    icon: 'text-success bg-success/10',
  },
  error: {
    container: 'border-l-4 border-l-destructive',
    icon: 'text-destructive bg-destructive/10',
  },
  warning: {
    container: 'border-l-4 border-l-warning',
    icon: 'text-warning bg-warning/10',
  },
  info: {
    container: 'border-l-4 border-l-primary',
    icon: 'text-primary bg-primary/10',
  },
};

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-md w-full sm:w-auto">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        const style = styles[t.type];
        
        return (
          <div 
            key={t.id} 
            className={cn(
              'animate-toast-slide-in flex items-center gap-4 rounded-xl bg-background/80 backdrop-blur-md border border-border/50 p-4 shadow-2xl ring-1 ring-black/5 dark:ring-white/10',
              style.container
            )}
          >
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors', style.icon)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground capitalize">{t.type}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{t.message}</p>
            </div>
            <button 
              onClick={() => onDismiss(t.id)} 
              className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
