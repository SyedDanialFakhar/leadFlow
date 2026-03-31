import { useLeads } from '@/hooks/useLeads';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentLeadsTable } from '@/components/dashboard/RecentLeadsTable';
import { Spinner } from '@/components/ui/Spinner';
import { Users, UserPlus, Sparkles, PhoneCall, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const { leads, stats, isLoading } = useLeads();

  if (isLoading) return <Layout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></Layout>;

  return (
    <Layout>
      <PageHeader title="Dashboard" description="Overview of your lead generation pipeline" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
        <StatsCard label="Total Leads" value={stats.total} icon={Users} />
        <StatsCard label="New Today" value={stats.newToday} icon={UserPlus} color="text-primary" />
        <StatsCard label="Awaiting Enrichment" value={stats.awaitingEnrichment} icon={Sparkles} color="text-warning" />
        <StatsCard label="Follow-Up Needed" value={stats.followUpNeeded} icon={Clock} color="text-warning" />
        <StatsCard label="Converted" value={stats.converted} icon={CheckCircle} color="text-success" />
        <StatsCard label="Called" value={stats.called} icon={PhoneCall} color="text-primary" />
      </div>
      <RecentLeadsTable leads={leads} />
    </Layout>
  );
}
