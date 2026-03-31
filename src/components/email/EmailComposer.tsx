import { useState } from 'react';
import type { EmailTemplate, EmailQueueItem, EmailStats } from '@/types';
import { StatusBadge } from '@/components/leads/LeadStatusBadge';
import { formatDateTime } from '@/utils/dateUtils';
import { Spinner } from '@/components/ui/Spinner';
import { Send, Eye } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface EmailComposerProps {
  template: EmailTemplate;
  onTemplateChange: (t: EmailTemplate) => void;
  queue: EmailQueueItem[];
  stats: EmailStats;
  onSendAll: () => Promise<{ sent: number; failed: number } | undefined>;
  onSendSingle: (item: EmailQueueItem) => Promise<void>;
  isLoading: boolean;
}

export function EmailComposer({
  template, onTemplateChange, queue, stats,
  onSendAll, onSendSingle, isLoading,
}: EmailComposerProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'template' | 'queue' | 'log'>('template');

  const inputCls = 'w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-4">
        <div className="rounded-xl border bg-card px-5 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Sent Today</p>
          <p className="text-lg font-bold text-card-foreground">{stats.sentToday}/{stats.dailyLimit}</p>
        </div>
        <div className="rounded-xl border bg-card px-5 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Queued</p>
          <p className="text-lg font-bold text-card-foreground">{stats.queued}</p>
        </div>
        <div className="rounded-xl border bg-card px-5 py-3 shadow-sm">
          <p className="text-xs text-muted-foreground">Failed</p>
          <p className="text-lg font-bold text-destructive">{stats.failed}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['template', 'queue', 'log'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'template' && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
            <input
              className={inputCls}
              value={template.subject}
              onChange={(e) => onTemplateChange({ ...template, subject: e.target.value })}
              placeholder="Email subject line..."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Variables: [ContactFirstName] [CompanyName] [JobTitle] [City] [ContactRole]
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Body (HTML)</label>
            <textarea
              className={`${inputCls} min-h-[200px] font-mono`}
              value={template.bodyHtml}
              onChange={(e) => onTemplateChange({ ...template, bodyHtml: e.target.value })}
            />
          </div>
          <button onClick={() => setPreviewOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
            <Eye className="h-4 w-4" /> Preview
          </button>
          <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Email Preview" size="lg">
            <div className="rounded-lg border bg-card p-4">
              <p className="mb-2 text-sm font-semibold">{template.subject.replace(/\[.*?\]/g, 'Sample')}</p>
              <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: template.bodyHtml.replace(/\[.*?\]/g, 'Sample') }} />
            </div>
          </Modal>
        </div>
      )}

      {activeTab === 'queue' && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <h3 className="font-semibold text-card-foreground">Email Queue</h3>
            <button
              onClick={onSendAll}
              disabled={isLoading || stats.queued === 0 || stats.sentToday >= stats.dailyLimit}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? <Spinner size="sm" className="text-primary-foreground" /> : <Send className="h-4 w-4" />}
              Send All Queued
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">To</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.filter((q) => q.status === 'queued').map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <p className="font-medium text-card-foreground">{item.toName}</p>
                      <p className="text-xs text-muted-foreground">{item.toEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{item.subject}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => onSendSingle(item)}
                        disabled={isLoading}
                        className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'log' && (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b px-5 py-3">
            <h3 className="font-semibold text-card-foreground">Email Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                  <th className="px-5 py-3">To</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Sent At</th>
                  <th className="px-5 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {queue.filter((q) => q.status !== 'queued').map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-5 py-3 text-card-foreground">{item.toName}</td>
                    <td className="px-5 py-3 text-muted-foreground">{item.subject}</td>
                    <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{item.sentAt ? formatDateTime(item.sentAt) : '—'}</td>
                    <td className="px-5 py-3 text-xs text-destructive">{item.errorMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
