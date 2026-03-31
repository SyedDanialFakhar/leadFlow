// src/components/layout/TopNav.tsx
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

export function TopNav() {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard': return 'Dashboard';
      case '/leads': return 'Leads';
      case '/scraper': return 'Scraper';
      case '/enrichment': return 'Enrichment';
      case '/emails': return 'Emails';
      case '/settings': return 'Settings';
      default: return 'LeadFlow';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white dark:bg-slate-900 px-6">
      <h1 className="text-lg font-semibold text-foreground">
        {getPageTitle(location.pathname)}
      </h1>
      
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <p className="text-sm font-medium text-foreground">{user?.user_metadata?.full_name ?? 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {user?.email?.[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}
