import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { Layout } from '@/components/layout/Layout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { useToastContext } from '@/components/ui/ToastProvider';
import { SETTING_KEYS } from '@/utils/constants';
import { Check, X } from 'lucide-react';

const API_KEYS = [
  { key: SETTING_KEYS.APIFY_TOKEN, label: 'Apify Token', placeholder: 'apify_api_...' },
  { key: SETTING_KEYS.HUNTER_API_KEY, label: 'Hunter.io API Key', placeholder: 'hunter_...' },
  { key: SETTING_KEYS.APOLLO_API_KEY, label: 'Apollo.io API Key', placeholder: 'apollo_...' },
  { key: SETTING_KEYS.RESEND_API_KEY, label: 'Resend API Key', placeholder: 're_...' },
];

const SENDER_FIELDS = [
  { key: SETTING_KEYS.SENDER_EMAIL, label: 'Sender Email', placeholder: 'charlie@company.com.au' },
  { key: SETTING_KEYS.SENDER_NAME, label: 'Sender Name', placeholder: 'Charlie' },
];

export default function SettingsPage() {
  const { settings, isLoading, saveSetting, isSaving } = useSettings();
  const { showToast } = useToastContext();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const getValue = (key: string) => edits[key] ?? settings[key] ?? '';
  const isDirty = (key: string) => edits[key] !== undefined && edits[key] !== (settings[key] ?? '');
  const isConfigured = (key: string) => !!(settings[key] && settings[key] !== '' && !settings[key].startsWith('YOUR_'));

  const handleSave = async (key: string) => {
    try {
      await saveSetting({ key, value: edits[key] ?? settings[key] ?? '' });
      setEdits((prev) => { const n = { ...prev }; delete n[key]; return n; });
      showToast('Setting saved', 'success');
    } catch { showToast('Save failed', 'error'); }
  };

  if (isLoading) return <Layout><div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div></Layout>;

  const inputCls = 'w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary';

  return (
    <Layout>
      <PageHeader title="Settings" description="Configure API keys and preferences" />
      <div className="max-w-2xl space-y-6">
        <Section title="API Keys">
          {API_KEYS.map(({ key, label, placeholder }) => (
            <div key={key} className="flex items-end gap-3">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  {isConfigured(key)
                    ? <span className="flex items-center gap-0.5 text-xs text-success"><Check className="h-3 w-3" /> Connected</span>
                    : <span className="flex items-center gap-0.5 text-xs text-destructive"><X className="h-3 w-3" /> Not set</span>
                  }
                </div>
                <input
                  type="password"
                  className={inputCls}
                  value={getValue(key)}
                  onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
              <button
                onClick={() => handleSave(key)}
                disabled={!isDirty(key) || isSaving}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ))}
        </Section>

        <Section title="Sender Configuration">
          {SENDER_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
                <input
                  className={inputCls}
                  value={getValue(key)}
                  onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              </div>
              <button
                onClick={() => handleSave(key)}
                disabled={!isDirty(key) || isSaving}
                className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          ))}
        </Section>

        <Section title="Scraping Preferences">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Default Min Age (Days)</label>
              <input
                type="number"
                className={inputCls}
                value={getValue(SETTING_KEYS.DEFAULT_MIN_AGE)}
                onChange={(e) => setEdits({ ...edits, [SETTING_KEYS.DEFAULT_MIN_AGE]: e.target.value })}
                placeholder="14"
              />
            </div>
            <button
              onClick={() => handleSave(SETTING_KEYS.DEFAULT_MIN_AGE)}
              disabled={!isDirty(SETTING_KEYS.DEFAULT_MIN_AGE) || isSaving}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Default Search Role</label>
              <input
                className={inputCls}
                value={getValue(SETTING_KEYS.DEFAULT_ROLE)}
                onChange={(e) => setEdits({ ...edits, [SETTING_KEYS.DEFAULT_ROLE]: e.target.value })}
                placeholder="Business Development Manager"
              />
            </div>
            <button
              onClick={() => handleSave(SETTING_KEYS.DEFAULT_ROLE)}
              disabled={!isDirty(SETTING_KEYS.DEFAULT_ROLE) || isSaving}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </Section>
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-card-foreground">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
