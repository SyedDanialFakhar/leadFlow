import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, Search, Sparkles, Mail, Settings,
  LogOut, Zap, ChevronLeft, Sun, Moon,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Leads', icon: Users, path: '/leads' },
  { label: 'Scraper', icon: Search, path: '/scraper' },
  { label: 'Enrichment', icon: Sparkles, path: '/enrichment' },
  { label: 'Emails', icon: Mail, path: '/emails' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-all duration-200',
      collapsed ? 'w-16' : 'w-60',
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <Zap className="h-6 w-6 shrink-0 text-sidebar-primary" />
        {!collapsed && <span className="text-lg font-bold text-sidebar-accent-foreground">LeadFlow</span>}
        <button onClick={onToggle} className="ml-auto rounded p-1 text-sidebar-foreground hover:bg-sidebar-accent">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <button
          onClick={() => setDark(!dark)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
        {!collapsed && user && (
          <p className="truncate px-3 text-xs text-sidebar-foreground">{user.email}</p>
        )}
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
