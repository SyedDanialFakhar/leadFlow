import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { useToastContext } from '@/components/ui/ToastProvider';
import { cn } from '@/utils/cn';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { toasts, dismissToast } = useToastContext();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={cn('min-h-screen transition-all duration-200 p-6', collapsed ? 'ml-16' : 'ml-60')}>
        {children}
      </main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
