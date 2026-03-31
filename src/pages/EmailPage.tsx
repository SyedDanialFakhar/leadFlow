import { useEmail } from '@/hooks/useEmail';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmailComposer } from '@/components/email/EmailComposer';
import { useToastContext } from '@/components/ui/ToastProvider';

export default function EmailPage() {
  const { queue, stats, template, setTemplate, sendAll, sendSingle, isLoading } = useEmail();
  const { showToast } = useToastContext();

  return (
    <Layout>
      <PageHeader title="Emails" description="Manage email templates and send follow-ups" />
      <EmailComposer
        template={template}
        onTemplateChange={setTemplate}
        queue={queue}
        stats={stats}
        onSendAll={async () => { try { const r = await sendAll(); showToast(`Sent ${r.sent}, failed ${r.failed}`, r.failed ? 'warning' : 'success'); return r; } catch { showToast('Send failed', 'error'); return undefined; } }}
        onSendSingle={async (item) => { try { await sendSingle(item); showToast('Email sent!', 'success'); } catch { showToast('Send failed', 'error'); } }}
        isLoading={isLoading}
      />
    </Layout>
  );
}
